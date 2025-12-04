import bcrypt from 'bcryptjs';

// Fix for ES modules
const bcryptHash = bcrypt.hash;
const bcryptCompare = bcrypt.compare;
import { randomBytes } from 'node:crypto';
import { SecretVaultBuilderClient, SecretVaultUserClient } from '@nillion/secretvaults';
import { Signer } from '@nillion/nuc';
import { getNillionClients, createDelegation } from './nillion';
import { MEMORY_VAULT_COLLECTION_ID } from './collection';
import { randomUUID } from 'node:crypto';

// Collection for storing user accounts
// Must be a valid UUID for Nillion
export const USERS_COLLECTION_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export interface UserAccount {
  _id: string;
  email: string;
  emailHash?: string; // Email hash for lookup (optional)
  passwordHash: string; // bcrypt hashed password
  userSignerPrivateKey: string; // Encrypted user signer private key
  createdAt: string;
  updatedAt: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      else if (hash) resolve(hash);
      else reject(new Error('Hash generation failed'));
    });
  });
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) reject(err);
      else resolve(!!result);
    });
  });
}

/**
 * Register a new user account
 */
export async function registerUser(email: string, password: string): Promise<{ userId: string; userDid: string }> {
  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Generate new user signer
  const privateKeyBytes = randomBytes(32);
  const privateKey = privateKeyBytes.toString('hex');
  const userSigner = Signer.fromPrivateKey(privateKey);
  const userDid = await userSigner.getDid();
  const userDidString = userDid.didString;

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate a proper UUID for user ID
  // We'll use email hash for lookup, but store with proper UUID
  const userId = randomUUID();
  
  // Create email hash for lookup (stored separately in the account)
  const crypto = await import('node:crypto');
  const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
  
  const now = new Date().toISOString();

  // Get Nillion clients (builder, signer, DID, etc.)
  const { builder, builderSigner, builderDid, userDidObject } = await getNillionClients();

  // Ensure users collection exists
  await ensureUsersCollection(builder);

  // Store user account in standard collection (builder can read/search)
  // Encrypt the private key field
  const userAccountData = {
    _id: userId, // Proper UUID
    email: email.toLowerCase().trim(),
    emailHash, // Store email hash for lookup
    passwordHash, // Password hash is already secure
    userSignerPrivateKey: {
      '%allot': privateKey, // Encrypt the private key
    },
    createdAt: now,
    updatedAt: now,
  };

  // Create a system user client (using builder's identity) to store user accounts
  const { SecretVaultUserClient } = await import('@nillion/secretvaults');
  const systemUser = await SecretVaultUserClient.from({
    signer: builderSigner,
    baseUrls: (await import('./config')).nillionConfig.NILDB_NODES,
    blindfold: {
      operation: 'store',
    },
  });

  // Create delegation token for the builder to create data in the users collection
  // Since we're using builder's signer, the audience should be builder's DID
  const builderDidObject = await builderSigner.getDid();
  const delegationToken = await createDelegation(builder, builderSigner, builderDidObject);

  // Store in owned collection (builder owns the data)
  await systemUser.createData({
    owner: builderDid,
    acl: {
      grantee: builderDid,
      read: true,
      write: true,
      execute: true,
    },
    collection: USERS_COLLECTION_ID,
    data: [userAccountData as unknown as Record<string, unknown>],
  }, {
    auth: {
      delegation: delegationToken,
    },
  });

  console.log(`✅ User registered: ${email} (${userId})`);

  return { userId, userDid: userDidString };
}

/**
 * Authenticate a user and return their user signer
 */
export async function authenticateUser(email: string, password: string): Promise<{ userId: string; userDid: string; userSigner: Signer }> {
  const userAccount = await findUserByEmail(email);
  if (!userAccount) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValid = await verifyPassword(password, userAccount.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Create user signer from stored private key
  const userSigner = Signer.fromPrivateKey(userAccount.userSignerPrivateKey);
  const userDid = await userSigner.getDid();
  const userDidString = userDid.didString;

  return {
    userId: userAccount._id,
    userDid: userDidString,
    userSigner,
  };
}

/**
 * Find user by email
 * Uses email hash as document ID for direct lookup
 */
export async function findUserByEmail(email: string): Promise<UserAccount | null> {
  try {
    const { builder } = await getNillionClients();

    // Ensure users collection exists
    await ensureUsersCollection(builder);

    // Generate email hash for lookup
    const crypto = await import('node:crypto');
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');

    // We can't directly query by email, so we need to list all users and find by email
    const { SecretVaultUserClient } = await import('@nillion/secretvaults');
    const { builderSigner } = await getNillionClients();
    
    const systemUser = await SecretVaultUserClient.from({
      signer: builderSigner,
      baseUrls: (await import('./config')).nillionConfig.NILDB_NODES,
      blindfold: {
        operation: 'store',
      },
    });

    // Create delegation token for listing
    const builderDidObject = await builderSigner.getDid();
    const delegationToken = await createDelegation(builder, builderSigner, builderDidObject);

    // List all user data references
    const references = await systemUser.listDataReferences({
      auth: {
        delegation: delegationToken,
      },
    });

    // Search through all users in the users collection
    for (const ref of references.data || []) {
      if (ref.collection === USERS_COLLECTION_ID) {
        try {
          // Read user by document ID
          const result = await systemUser.readData({
            collection: USERS_COLLECTION_ID,
            document: ref.document,
          }, {
            auth: {
              delegation: delegationToken,
            },
          });

          const account = result.data as unknown as UserAccount & { 
            userSignerPrivateKey?: { '%allot'?: string };
            emailHash?: string;
          };
          
          // Check if this is the user we're looking for
          if (account.email?.toLowerCase() === email.toLowerCase().trim()) {
            // Handle encrypted private key
            let privateKey = '';
            if (account.userSignerPrivateKey) {
              if (typeof account.userSignerPrivateKey === 'object' && '%allot' in account.userSignerPrivateKey) {
                // This should be decrypted by the SDK, but handle both cases
                privateKey = (account.userSignerPrivateKey as any).value || account.userSignerPrivateKey['%allot'] || '';
              } else if (typeof account.userSignerPrivateKey === 'string') {
                privateKey = account.userSignerPrivateKey;
              }
            }

            return {
              _id: account._id,
              email: account.email,
              passwordHash: account.passwordHash,
              userSignerPrivateKey: privateKey,
              createdAt: account.createdAt,
              updatedAt: account.updatedAt,
            };
          }
        } catch (readError: any) {
          // Skip errors for individual documents, continue searching
          continue;
        }
      }
    }

    // User not found
    return null;
  } catch (error: any) {
    // Handle errors gracefully
    if (error.errors && Array.isArray(error.errors)) {
      const allNotFound = error.errors.every((e: any) => 
        e.error?.status === 404 || e.error?.status === 401 || e.error?.body === 'Unauthorized'
      );
      if (allNotFound) {
        return null;
      }
    }
    console.error('Error finding user:', error);
    return null;
  }
}

/**
 * Get user account by user ID
 * Uses standard collection so builder can read
 */
/**
 * Get user account by user ID
 * Uses standard collection so builder can read
 * This function should NOT call getNillionClients() to avoid circular dependencies
 * Instead, it should receive the builder client as a parameter or create it directly
 */
export async function getUserById(userId: string): Promise<UserAccount | null> {
  console.log(`getUserById: Starting for userId: ${userId}`);
  try {
    // Create builder signer directly to avoid circular dependency with getNillionClients()
    // Import from the same modules to avoid type conflicts
    const { Signer, PayerBuilder, NilauthClient, Builder, Codec } = await import('@nillion/nuc');
    const { SecretVaultBuilderClient, SecretVaultUserClient } = await import('@nillion/secretvaults');
    const { nillionConfig } = await import('./config');
    
    if (!nillionConfig.BUILDER_PRIVATE_KEY) {
      throw new Error('BUILDER_PRIVATE_KEY is required');
    }

    console.log('getUserById: Creating builder signer directly...');
    const builderSigner = Signer.fromPrivateKey(nillionConfig.BUILDER_PRIVATE_KEY);
    const builderDidObject = await builderSigner.getDid();
    
    // Create payer and nilauth client
    const payer = await PayerBuilder.fromPrivateKey(nillionConfig.BUILDER_PRIVATE_KEY)
      .chainUrl(nillionConfig.NILCHAIN_URL)
      .build();

    const nilauth = await NilauthClient.create({
      baseUrl: nillionConfig.NILAUTH_URL,
      payer: payer,
    });

    // Create builder client - use type assertion to avoid version conflict
    const builder = await SecretVaultBuilderClient.from({
      signer: builderSigner,
      nilauthClient: nilauth as any, // Type assertion to avoid version conflict
      dbs: nillionConfig.NILDB_NODES,
    });

    await builder.refreshRootToken();
    
    const systemUser = await SecretVaultUserClient.from({
      signer: builderSigner,
      baseUrls: nillionConfig.NILDB_NODES,
      blindfold: {
        operation: 'store',
      },
    });

    // Create delegation token for reading
    console.log('getUserById: Creating delegation token...');
    const delegationToken = await Builder.delegationFrom(builder.rootToken)
      .command('/nil/db/data/read')
      .audience(builderDidObject)
      .expiresAt(Date.now() + 3600 * 1000)
      .sign(builderSigner);
    const delegationTokenString = Codec.serializeBase64Url(delegationToken);
    console.log('getUserById: Delegation token created');

    console.log(`getUserById: Reading user data for document: ${userId}`);
    const result = await systemUser.readData({
      collection: USERS_COLLECTION_ID,
      document: userId,
    }, {
      auth: {
        delegation: delegationTokenString,
      },
    });
    console.log('getUserById: User data read successfully');

    const account = result.data as unknown as UserAccount & { userSignerPrivateKey?: { '%allot'?: string } };
    
    // Handle encrypted private key
    let privateKey = '';
    if (account.userSignerPrivateKey) {
      if (typeof account.userSignerPrivateKey === 'object' && '%allot' in account.userSignerPrivateKey) {
        // This should be decrypted by the SDK
        privateKey = (account.userSignerPrivateKey as any).value || account.userSignerPrivateKey['%allot'] || '';
      } else if (typeof account.userSignerPrivateKey === 'string') {
        privateKey = account.userSignerPrivateKey;
      }
    }

    return {
      _id: account._id,
      email: account.email,
      passwordHash: account.passwordHash,
      userSignerPrivateKey: privateKey,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Ensure users collection exists
 * Uses standard collection (not owned) so builder can query/search users
 */
async function ensureUsersCollection(builder: SecretVaultBuilderClient): Promise<void> {
  try {
    await builder.readCollection(USERS_COLLECTION_ID);
    // Collection exists
    return;
  } catch (error) {
    // Collection doesn't exist, create it
    try {
      // Use owned collection with empty schema (more flexible)
      // We'll use the builder's DID as owner so builder can access all users
      await builder.createCollection({
        _id: USERS_COLLECTION_ID,
        type: 'owned', // Owned collection but builder will own all records
        name: 'Users Collection',
        schema: {}, // Empty schema for flexibility
      });
      console.log('✅ Users collection created');
    } catch (createError: any) {
      // Log detailed error for debugging
      console.error('Error creating users collection:');
      if (createError.errors && Array.isArray(createError.errors)) {
        createError.errors.forEach((nodeError: any, index: number) => {
          const errorBody = nodeError.error?.body;
          const status = nodeError.error?.status;
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
          console.error(`  Node ${index + 1} (status ${status}):`, errorMsg.substring(0, 300));
        });
      }
      
      // Check if it's a duplicate key error (collection already exists)
      if (createError.errors && Array.isArray(createError.errors)) {
        const allDuplicateKey = createError.errors.every((nodeError: any) => {
          const errorBody = nodeError.error?.body;
          if (!errorBody) return false;
          
          // Check in body.errors array
          if (errorBody.errors && Array.isArray(errorBody.errors)) {
            const errorStr = errorBody.errors.join(' ').toLowerCase();
            return errorStr.includes('duplicate key') || errorStr.includes('e11000');
          }
          
          const errorStr = JSON.stringify(errorBody).toLowerCase();
          return errorStr.includes('duplicate key') || errorStr.includes('e11000');
        });
        
        if (allDuplicateKey) {
          // Collection already exists
          console.log('✅ Users collection already exists (duplicate key detected)');
          return;
        }
      }
      throw createError;
    }
  }
}

