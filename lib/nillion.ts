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
import { getUserSigner } from './user-storage';

export interface NillionClients {
  builder: SecretVaultBuilderClient;
  user: SecretVaultUserClient;
  builderSigner: Signer;
  userSigner: Signer;
  builderDid: string;
  userDid: string;
  userDidObject: any; // DID object for delegation
}

let cachedClients: NillionClients | null = null;

export async function getNillionClients(): Promise<NillionClients> {
  if (cachedClients) {
    return cachedClients;
  }

  if (!nillionConfig.BUILDER_PRIVATE_KEY) {
    throw new Error('BUILDER_PRIVATE_KEY is required. Please set it in your .env file.');
  }

  // Create signers
  const builderSigner = Signer.fromPrivateKey(nillionConfig.BUILDER_PRIVATE_KEY);
  const userSigner = getUserSigner(); // Use persistent user signer

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
  const builder = await SecretVaultBuilderClient.from({
    signer: builderSigner,
    nilauthClient: nilauth,
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

  cachedClients = {
    builder,
    user,
    builderSigner,
    userSigner,
    builderDid: builderDidString,
    userDid: userDidString,
    userDidObject: userDid,
  };

  return cachedClients;
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

