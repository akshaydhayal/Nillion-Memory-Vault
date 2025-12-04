import {
  Signer,
  NilauthClient,
  PayerBuilder,
  Builder,
  Codec,
} from '@nillion/nuc';
import {
  SecretVaultBuilderClient,
  SecretVaultUserClient,
} from '@nillion/secretvaults';
import { nillionConfig } from './config';
import { getUserSignerForSession } from './user-storage-session';
import { getUserSignerForAuthenticatedUser } from './user-storage-auth';
import { getSession } from './session';

export interface NillionClients {
  builder: SecretVaultBuilderClient;
  user: SecretVaultUserClient;
  builderSigner: Signer;
  userSigner: Signer;
  builderDid: string;
  userDid: string;
  userDidObject: any; // DID object for delegation
}

// Note: We don't cache clients globally because each session needs its own user identity
// Clients are created per request based on session

export async function getNillionClients(): Promise<NillionClients> {
  // Get session to identify the user
  const session = await getSession();
  
  // Check if we have cached clients for this session
  // Note: We can't cache across sessions, so we'll always create new clients per session
  // But we can cache within the same request
  
  if (!nillionConfig.BUILDER_PRIVATE_KEY) {
    throw new Error('BUILDER_PRIVATE_KEY is required. Please set it in your .env file.');
  }

  // Create signers
  const builderSigner = Signer.fromPrivateKey(nillionConfig.BUILDER_PRIVATE_KEY);
  
  // Try to get authenticated user signer first, fallback to session-based
  let userSigner: Signer;
  if (session.isAuthenticated && session.userId) {
    console.log(`getNillionClients: User is authenticated, userId: ${session.userId}`);
    const authSigner = await getUserSignerForAuthenticatedUser();
    if (authSigner) {
      console.log('getNillionClients: Using authenticated user signer');
      userSigner = authSigner;
    } else {
      console.warn('getNillionClients: Auth signer not found, falling back to session-based');
      // Fallback to session-based if auth signer not found
      userSigner = getUserSignerForSession(session.sessionId);
    }
  } else {
    console.log('getNillionClients: User not authenticated, using session-based signer');
    // Not authenticated, use session-based signer
    userSigner = getUserSignerForSession(session.sessionId);
  }

  const builderDid = await builderSigner.getDid();
  const userDid = await userSigner.getDid();

  const builderDidString = builderDid.didString;
  const userDidString = userDid.didString;

  // Create payer and nilauth client
  const payer = await PayerBuilder.fromPrivateKey(nillionConfig.BUILDER_PRIVATE_KEY)
    .chainUrl(nillionConfig.NILCHAIN_URL)
    .build();

  const nilauth = await NilauthClient.create({
    baseUrl: nillionConfig.NILAUTH_URL,
    payer: payer,
  });

  // Create builder client
  // Use type assertion to handle version conflict between @nillion/nuc and @nillion/secretvaults
  const builder = await SecretVaultBuilderClient.from({
    signer: builderSigner,
    nilauthClient: nilauth as any,
    dbs: nillionConfig.NILDB_NODES,
  });

  // Refresh token using existing subscription
  await builder.refreshRootToken();

  // Register builder if not already registered
  try {
    const existingProfile = await builder.readProfile();
    console.log('✅ Builder already registered:', existingProfile.data.name);
  } catch (profileError) {
    try {
      await builder.register({
        did: builderDidString,
        name: 'MemoryVault Builder',
      });
      console.log('✅ Builder registered successfully');
    } catch (registerError: any) {
      // Handle duplicate key errors gracefully
      if (registerError.message?.includes('duplicate key')) {
        console.log('✅ Builder already registered (duplicate key)');
      } else {
        throw registerError;
      }
    }
  }

  // Create user client
  const user = await SecretVaultUserClient.from({
    signer: userSigner,
    baseUrls: nillionConfig.NILDB_NODES,
    blindfold: {
      operation: 'store',
    },
  });

  // Don't cache clients across different sessions
  // Each session needs its own user identity
  const clients: NillionClients = {
    builder,
    user,
    builderSigner,
    userSigner,
    builderDid: builderDidString,
    userDid: userDidString,
    userDidObject: userDid,
  };

  return clients;
}

export async function createDelegation(
  builder: SecretVaultBuilderClient,
  builderSigner: Signer,
  userDid: any,
  expiresInSeconds: number = 3600
): Promise<string> {
  const delegation = await Builder.delegationFrom(builder.rootToken)
    .command('/nil/db/data/create')
    .audience(userDid)
    .expiresAt(Date.now() + expiresInSeconds * 1000) // milliseconds
    .sign(builderSigner);

  return Codec.serializeBase64Url(delegation);
}

