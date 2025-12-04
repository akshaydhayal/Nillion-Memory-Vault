import { randomUUID } from 'node:crypto';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';
import { getNillionClients, createDelegation } from './nillion';
import { getCollectionId } from './collection-storage';

// Get collection ID (generated once and stored, or use fixed UUID)
// nilDB requires UUID format for collection _id
export const MEMORY_VAULT_COLLECTION_ID = getCollectionId();

export interface Note {
  _id: string;
  title: string;
  content: {
    '%allot'?: string;
    '%share'?: string;
  } | string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Frontend-friendly note type with decrypted content
export interface NoteDisplay {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Helper to transform encrypted note to display note
// The SDK automatically decrypts data when reading, so content should be a string
function transformNote(note: Note): NoteDisplay {
  let content = '';
  
  if (typeof note.content === 'string') {
    // Already decrypted as string (normal case)
    content = note.content;
  } else if (note.content && typeof note.content === 'object') {
    // Handle edge cases where content might still be an object
    if ('%share' in note.content) {
      // Encrypted field - SDK should decrypt this, but if not, try to extract
      const shareObj = note.content as any;
      content = shareObj.value || shareObj['%share'] || '';
    } else if ('%allot' in note.content) {
      // This shouldn't happen when reading (only when writing), but handle it
      content = note.content['%allot'] || '';
    } else {
      // Fallback: try to stringify or get any value
      content = JSON.stringify(note.content);
    }
  }

  return {
    _id: note._id,
    title: note.title,
    content: content || '',
    tags: note.tags || [],
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export const collectionSchema = {
  _id: MEMORY_VAULT_COLLECTION_ID,
  type: 'owned' as const,
  name: 'Memory Vault Collection',
  schema: {}, // Empty schema for owned collections - allows flexible data structure
};

export async function ensureCollection(): Promise<void> {
  const { builder } = await getNillionClients();

  // Try to read the collection to see if it exists
  try {
    const collection = await builder.readCollection(MEMORY_VAULT_COLLECTION_ID);
    console.log('✅ Memory Vault collection already exists and is accessible');
    return;
  } catch (readError: any) {
    // Collection doesn't exist or read failed - try to create it
    // Don't log this as an error, it's expected if collection doesn't exist
    console.log('Collection not found or not accessible, attempting to create...');
  }

  // Collection doesn't exist, create it
  try {
    console.log('Creating collection:', MEMORY_VAULT_COLLECTION_ID);
    const createResults = await builder.createCollection(collectionSchema);
    console.log(
      '✅ Memory Vault collection created on',
      Object.keys(createResults).length,
      'nodes'
    );
    return; // Success - exit early
  } catch (createError: any) {
    // Handle error - it might be an array directly or have an errors property
    let errorArray: any[] = [];
    
    // Check if error is an array (numeric keys like ['0', '1', '2'])
    if (Array.isArray(createError)) {
      errorArray = createError;
    } else if (createError.errors && Array.isArray(createError.errors)) {
      errorArray = createError.errors;
    } else {
      // Unexpected structure - log and throw
      console.error('Collection creation error (unexpected structure):', createError);
      throw createError;
    }
    
    // Log error details
    console.log(`Collection creation - ${errorArray.length} node(s) responded`);
    
    errorArray.forEach((nodeError: any, index: number) => {
      const errorBody = nodeError.error?.body;
      const status = nodeError.error?.status;
      
      // Extract error message from body
      let errorMsg = '';
      if (errorBody) {
        if (errorBody.errors && Array.isArray(errorBody.errors)) {
          // Error is in body.errors array
          errorMsg = errorBody.errors.join(' | ');
        } else if (typeof errorBody === 'object') {
          errorMsg = JSON.stringify(errorBody, null, 2);
        } else {
          errorMsg = String(errorBody);
        }
      } else {
        errorMsg = nodeError.error?.message || 'Unknown error';
      }
      
      console.log(`  Node ${index + 1} (status ${status}):`, errorMsg.substring(0, 200));
    });

    // Check if all nodes returned same status
    const allSameStatus = errorArray.length > 0 && 
      errorArray.every((e: any) => e.error?.status === errorArray[0].error?.status);
    const status = errorArray[0]?.error?.status;
    
    // Check for duplicate key errors (collection already exists)
    const allDuplicateKey = errorArray.every((nodeError: any) => {
      const errorBody = nodeError.error?.body;
      if (!errorBody) return false;
      
      // Check in body.errors array
      if (errorBody.errors && Array.isArray(errorBody.errors)) {
        const errorStr = errorBody.errors.join(' ').toLowerCase();
        return errorStr.includes('duplicate key') || 
               errorStr.includes('e11000') ||
               errorStr.includes('already exists');
      }
      
      // Check in body.error or body.message
      const errorStr = JSON.stringify(errorBody).toLowerCase();
      return errorStr.includes('duplicate key') || 
             errorStr.includes('e11000') ||
             errorStr.includes('already exists');
    });
    
    // If all nodes report duplicate key error, collection already exists
    if (allDuplicateKey) {
      console.log('✅ Collection already exists (duplicate key error detected)');
      return; // Exit early - collection exists
    }
    
    // Check for validation errors
    const allValidationError = errorArray.every((nodeError: any) => {
      const errorBody = nodeError.error?.body;
      if (!errorBody) return false;
      
      const errorStr = JSON.stringify(errorBody).toLowerCase();
      return errorStr.includes('invalid') || 
             errorStr.includes('validation') ||
             errorStr.includes('invalid_format') ||
             errorStr.includes('required') ||
             errorStr.includes('missing');
    });
    
    if (allValidationError) {
      console.error('❌ Collection creation failed due to validation error');
      throw createError;
    }
    
    // If all nodes returned same status (400 or 500), check error messages
    if (allSameStatus && (status === 400 || status === 500)) {
      // Check if error indicates "already exists" in any form
      const firstError = errorArray[0]?.error?.body;
      let errorStr = '';
      
      if (firstError?.errors && Array.isArray(firstError.errors)) {
        errorStr = firstError.errors.join(' ').toLowerCase();
      } else if (typeof firstError === 'object') {
        errorStr = JSON.stringify(firstError).toLowerCase();
      } else {
        errorStr = String(firstError || '').toLowerCase();
      }
      
      const existsIndicators = [
        'already exists',
        'duplicate',
        'duplicate key',
        'e11000',
        'collection already exists',
        'already present',
        'conflict'
      ];
      
      if (existsIndicators.some(indicator => errorStr.includes(indicator))) {
        console.log('✅ Collection already exists (detected from error message)');
        return;
      }
    }
    
    // If we get here, it's an unexpected error - throw it
    console.error('❌ Collection creation failed with unexpected error');
    throw createError;
  }
}

export async function createNote(
  title: string,
  content: string,
  tags: string[] = []
): Promise<string> {
  const { builder, user, builderSigner, userDid, builderDid, userDidObject } = await getNillionClients();

  // Ensure collection exists (this will handle "already exists" errors gracefully)
  try {
    await ensureCollection();
    
    // Verify collection is actually accessible by trying to read it
    try {
      await builder.readCollection(MEMORY_VAULT_COLLECTION_ID);
      console.log('✅ Verified collection is accessible');
    } catch (verifyError: any) {
      console.warn('⚠️ Collection might not be accessible:', verifyError.message);
      // Continue anyway - might still work
    }
  } catch (error: any) {
    // If ensureCollection throws, it means there's a real error
    // Log the full error details
    console.error('Collection setup failed:');
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((nodeError: any, index: number) => {
        const errorBody = nodeError.error?.body;
        const errorMsg = typeof errorBody === 'object' 
          ? JSON.stringify(errorBody, null, 2) 
          : errorBody || nodeError.error?.message || 'Unknown error';
        console.error(`  Node ${index + 1}:`, errorMsg);
      });
    } else {
      console.error('  Error:', error.message || JSON.stringify(error, null, 2));
    }
    // Don't continue if collection creation failed - we need the collection to exist
    throw new Error(`Collection setup failed: ${error.message || 'Unknown error'}. Please check the error details above.`);
  }

  const noteId = randomUUID();
  const now = new Date().toISOString();

  const note: Note = {
    _id: noteId,
    title,
    content: {
      '%allot': content,
    },
    tags,
    createdAt: now,
    updatedAt: now,
  };

  // Create delegation token
  const delegationToken = await createDelegation(builder, builderSigner, userDidObject);

  // User uploads data with delegation
  try {
    await user.createData({
      owner: userDid,
      acl: {
        grantee: builderDid,
        read: true,
        write: false,
        execute: true,
      },
      collection: MEMORY_VAULT_COLLECTION_ID,
      data: [note as unknown as Record<string, unknown>],
    }, {
      auth: {
        delegation: delegationToken,
      },
    });

    return noteId;
  } catch (error: any) {
    // Log detailed error information
    console.error('Error creating note data:');
    
    // Handle error - it might be an array directly or have an errors property
    let errorArray: any[] = [];
    if (Array.isArray(error)) {
      errorArray = error;
    } else if (error.errors && Array.isArray(error.errors)) {
      errorArray = error.errors;
    }
    
    if (errorArray.length > 0) {
      errorArray.forEach((nodeError: any, index: number) => {
        const errorBody = nodeError.error?.body;
        const status = nodeError.error?.status;
        
        // Extract error message
        let errorMsg = '';
        if (errorBody) {
          if (errorBody.errors && Array.isArray(errorBody.errors)) {
            errorMsg = errorBody.errors.join(' | ');
          } else if (typeof errorBody === 'object') {
            errorMsg = JSON.stringify(errorBody, null, 2);
          } else {
            errorMsg = String(errorBody);
          }
        } else {
          errorMsg = nodeError.error?.message || 'Unknown error';
        }
        
        console.error(`  Node ${index + 1} (status ${status}):`, errorMsg);
      });
      
      // Check if it's a 404 - collection might not exist or not accessible
      const all404 = errorArray.every((e: any) => e.error?.status === 404);
      if (all404) {
        console.error('❌ All nodes returned 404 - collection might not exist or not be accessible');
        console.error('   Collection ID:', MEMORY_VAULT_COLLECTION_ID);
        console.error('   This might mean:');
        console.error('   1. Collection was created by a different builder/user');
        console.error('   2. Collection ID is incorrect');
        console.error('   3. Collection needs to be recreated');
        console.error('   Trying to verify collection exists...');
        
        // Try to verify collection exists
        try {
          const { builder } = await getNillionClients();
          await builder.readCollection(MEMORY_VAULT_COLLECTION_ID);
          console.error('   ✅ Collection exists and is readable by builder');
          console.error('   ⚠️ But user cannot create data in it - might be a permissions issue');
        } catch (verifyError: any) {
          console.error('   ❌ Collection is not accessible:', verifyError.message);
        }
      }
    } else {
      console.error('  Error:', error.message || JSON.stringify(error, null, 2));
    }
    throw error;
  }
}

export async function getNote(noteId: string): Promise<NoteDisplay | null> {
  const { user } = await getNillionClients();

  try {
    const result = await user.readData({
      collection: MEMORY_VAULT_COLLECTION_ID,
      document: noteId,
    });

    const note = result.data as unknown as Note;
    return transformNote(note);
  } catch (error) {
    console.error('Error reading note:', error);
    return null;
  }
}

export async function listNotes(): Promise<NoteDisplay[]> {
  console.log('listNotes: Getting Nillion clients...');
  const { user, userDid } = await getNillionClients();
  console.log(`listNotes: Got user client for DID: ${userDid}`);

  try {
    console.log('listNotes: Starting listDataReferences...');
    
    // Add timeout for listDataReferences (10 seconds)
    const listTimeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.error('listNotes: listDataReferences TIMEOUT after 10 seconds');
        reject(new Error('listDataReferences timeout'));
      }, 10000);
    });

    console.log('listNotes: Calling user.listDataReferences()...');
    const listPromise = user.listDataReferences().then((result) => {
      console.log('listNotes: listDataReferences completed successfully');
      return result;
    }).catch((error) => {
      console.error('listNotes: listDataReferences error:', error);
      throw error;
    });
    
    console.log('listNotes: Racing listDataReferences with timeout...');
    let references;
    try {
      references = await Promise.race([listPromise, listTimeout]);
      console.log(`listNotes: Found ${references.data?.length || 0} data references`);
    } catch (raceError: any) {
      console.error('listNotes: Promise.race error:', raceError);
      if (raceError.message?.includes('timeout')) {
        console.warn('listNotes: Timeout occurred, returning empty array');
        return [];
      }
      throw raceError;
    }
    
    const notes: NoteDisplay[] = [];

    // Process references with individual timeouts
    const notePromises: Promise<NoteDisplay | null>[] = [];
    for (const ref of references.data || []) {
      if (ref.collection === MEMORY_VAULT_COLLECTION_ID) {
        // Add timeout for each note fetch (5 seconds)
        const notePromise: Promise<NoteDisplay | null> = Promise.race([
          getNote(ref.document),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('getNote timeout')), 5000)
          )
        ]).catch((error) => {
          console.error(`Error fetching note ${ref.document}:`, error.message || error);
          return null;
        });
        notePromises.push(notePromise);
      }
    }

    const fetchedNotes = await Promise.all(notePromises);
    for (const note of fetchedNotes) {
      if (note) {
        notes.push(note);
      }
    }

    // Sort by updatedAt descending
    return notes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error: any) {
    console.error('listNotes: Caught error:', error);
    console.error('listNotes: Error message:', error.message);
    console.error('listNotes: Error stack:', error.stack);
    
    // Handle timeout errors gracefully
    if (error.message?.includes('timeout')) {
      console.warn('listNotes: Notes listing timed out, returning empty array');
      return [];
    }

    // Handle 401 Unauthorized - this is normal if no data exists yet
    // Suppress these errors as they're expected when the vault is empty
    if (error.errors && Array.isArray(error.errors)) {
      const allUnauthorized = error.errors.every((e: any) => 
        e.error?.status === 401 || e.error?.body === 'Unauthorized'
      );
      if (allUnauthorized) {
        // All errors are 401 - no data exists yet, return empty array silently
        // Don't log this as it's expected behavior
        return [];
      }
    }
    
    // Log other errors (not 401) - but only if they're unexpected
    // Don't log if it's just "no data" scenarios
    const isExpectedError = error.errors && Array.isArray(error.errors) &&
      error.errors.every((e: any) => 
        e.error?.status === 401 || 
        e.error?.status === 404 ||
        e.error?.body === 'Unauthorized' ||
        e.error?.body === 'Not Found'
      );
    
    if (!isExpectedError) {
      console.error('Error listing notes:', error);
    }
    return [];
  }
}

export async function updateNote(
  noteId: string,
  title: string,
  content: string,
  tags: string[] = []
): Promise<void> {
  const { builder, user, builderSigner, userDid, builderDid, userDidObject } = await getNillionClients();

  const now = new Date().toISOString();
  const existingNote = await getNote(noteId);

  if (!existingNote) {
    throw new Error('Note not found');
  }

  const updatedNote: Note = {
    _id: noteId,
    title,
    content: {
      '%allot': content,
    },
    tags,
    createdAt: existingNote.createdAt,
    updatedAt: now,
  };

  // Delete old note and create new one (update not directly supported)
  await user.deleteData({
    collection: MEMORY_VAULT_COLLECTION_ID,
    document: noteId,
  });

  // Create delegation token
  const delegationToken = await createDelegation(builder, builderSigner, userDidObject);

  await user.createData({
    owner: userDid,
    acl: {
      grantee: builderDid,
      read: true,
      write: false,
      execute: true,
    },
    collection: MEMORY_VAULT_COLLECTION_ID,
    data: [updatedNote as unknown as Record<string, unknown>],
  }, {
    auth: {
      delegation: delegationToken,
    },
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  const { user } = await getNillionClients();

  await user.deleteData({
    collection: MEMORY_VAULT_COLLECTION_ID,
    document: noteId,
  });
}

