import { randomUUID } from 'node:crypto';
import { SecretVaultBuilderClient } from '@nillion/secretvaults';
import { getNillionClients, createDelegation } from './nillion';

export const MEMORY_VAULT_COLLECTION_ID = 'memory-vault-collection';

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
function transformNote(note: Note): NoteDisplay {
  let content = '';
  
  if (typeof note.content === 'string') {
    // Already decrypted as string
    content = note.content;
  } else if (note.content && typeof note.content === 'object') {
    // Handle encrypted content structure
    // The SDK should decrypt automatically, but handle different formats
    if ('%share' in note.content) {
      // Encrypted field - SDK should decrypt this automatically
      // If it's still an object, try to extract the value
      const shareObj = note.content as any;
      content = shareObj.value || shareObj['%share'] || '';
    } else if ('%allot' in note.content) {
      // This shouldn't happen when reading, but handle it
      content = note.content['%allot'] || '';
    } else {
      // Try to get any string value from the object
      content = JSON.stringify(note.content);
    }
  }

  return {
    _id: note._id,
    title: note.title,
    content: content || '',
    tags: note.tags,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export const collectionSchema = {
  _id: MEMORY_VAULT_COLLECTION_ID,
  type: 'owned' as const,
  name: 'Memory Vault Collection',
  schema: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'array',
    uniqueItems: true,
    items: {
      type: 'object',
      properties: {
        _id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        content: {
          type: 'object',
          properties: {
            '%share': {
              type: 'string',
            },
          },
          required: ['%share'],
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
      required: ['_id', 'title', 'content', 'createdAt', 'updatedAt'],
    },
  },
};

export async function ensureCollection(): Promise<void> {
  const { builder } = await getNillionClients();

  try {
    // Try to read the collection to see if it exists
    await builder.readCollection(MEMORY_VAULT_COLLECTION_ID);
  } catch (error) {
    // Collection doesn't exist, create it
    try {
      await builder.createCollection(collectionSchema);
      console.log('✅ Memory Vault collection created');
    } catch (createError: any) {
      if (!createError.message.includes('already exists')) {
        throw createError;
      }
    }
  }
}

export async function createNote(
  title: string,
  content: string,
  tags: string[] = []
): Promise<string> {
  const { builder, user, builderKeypair, userDid, builderDid } = await getNillionClients();

  await ensureCollection();

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

  const delegation = await createDelegation(builder, builderKeypair, userDid);

  await user.createData(delegation, {
    owner: userDid,
    acl: {
      grantee: builderDid,
      read: true,
      write: false,
      execute: true,
    },
    collection: MEMORY_VAULT_COLLECTION_ID,
    data: [note],
  });

  return noteId;
}

export async function getNote(noteId: string): Promise<NoteDisplay | null> {
  const { user } = await getNillionClients();

  try {
    const result = await user.readData({
      collection: MEMORY_VAULT_COLLECTION_ID,
      document: noteId,
    });

    const note = result.data as Note;
    return transformNote(note);
  } catch (error) {
    console.error('Error reading note:', error);
    return null;
  }
}

export async function listNotes(): Promise<NoteDisplay[]> {
  const { user } = await getNillionClients();

  try {
    const references = await user.listDataReferences();
    const notes: NoteDisplay[] = [];

    for (const ref of references.data) {
      if (ref.collection === MEMORY_VAULT_COLLECTION_ID) {
        try {
          const note = await getNote(ref.document);
          if (note) {
            notes.push(note);
          }
        } catch (error) {
          console.error(`Error fetching note ${ref.document}:`, error);
        }
      }
    }

    // Sort by updatedAt descending
    return notes.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error listing notes:', error);
    return [];
  }
}

export async function updateNote(
  noteId: string,
  title: string,
  content: string,
  tags: string[] = []
): Promise<void> {
  const { builder, user, builderKeypair, userDid, builderDid } = await getNillionClients();

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

  const delegation = await createDelegation(builder, builderKeypair, userDid);

  await user.createData(delegation, {
    owner: userDid,
    acl: {
      grantee: builderDid,
      read: true,
      write: false,
      execute: true,
    },
    collection: MEMORY_VAULT_COLLECTION_ID,
    data: [updatedNote],
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  const { user } = await getNillionClients();

  await user.deleteData({
    collection: MEMORY_VAULT_COLLECTION_ID,
    document: noteId,
  });
}

