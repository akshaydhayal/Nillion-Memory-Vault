import {
  Keypair,
  NilauthClient,
  PayerBuilder,
  NucTokenBuilder,
  Command,
} from '@nillion/nuc';
import {
  SecretVaultBuilderClient,
  SecretVaultUserClient,
} from '@nillion/secretvaults';
import { nillionConfig } from './config';
import { getUserKeypair } from './user-storage';

export interface NillionClients {
  builder: SecretVaultBuilderClient;
  user: SecretVaultUserClient;
  builderKeypair: Keypair;
  userKeypair: Keypair;
  builderDid: string;
  userDid: string;
}

let cachedClients: NillionClients | null = null;

export async function getNillionClients(): Promise<NillionClients> {
  if (cachedClients) {
    return cachedClients;
  }

  if (!nillionConfig.BUILDER_PRIVATE_KEY) {
    throw new Error('BUILDER_PRIVATE_KEY is required. Please set it in your .env file.');
  }

  // Create keypairs
  const builderKeypair = Keypair.from(nillionConfig.BUILDER_PRIVATE_KEY);
  const userKeypair = getUserKeypair(); // Use persistent user keypair

  const builderDid = builderKeypair.toDid().toString();
  const userDid = userKeypair.toDid().toString();

  // Create payer and nilauth client
  const payer = await new PayerBuilder()
    .keypair(builderKeypair)
    .chainUrl(nillionConfig.NILCHAIN_URL)
    .build();

  const nilauth = await NilauthClient.from(nillionConfig.NILAUTH_URL, payer);

  // Create builder client
  const builder = await SecretVaultBuilderClient.from({
    keypair: builderKeypair,
    urls: {
      chain: nillionConfig.NILCHAIN_URL,
      auth: nillionConfig.NILAUTH_URL,
      dbs: nillionConfig.NILDB_NODES,
    },
  });

  // Refresh token using existing subscription
  await builder.refreshRootToken();

  // Register builder if not already registered
  try {
    await builder.readProfile();
  } catch (profileError) {
    try {
      await builder.register({
        did: builderDid,
        name: 'MemoryVault Builder',
      });
    } catch (registerError: any) {
      if (!registerError.message.includes('duplicate key')) {
        throw registerError;
      }
    }
  }

  // Create user client
  const user = await SecretVaultUserClient.from({
    baseUrls: nillionConfig.NILDB_NODES,
    keypair: userKeypair,
    blindfold: {
      operation: 'store',
    },
  });

  cachedClients = {
    builder,
    user,
    builderKeypair,
    userKeypair,
    builderDid,
    userDid,
  };

  return cachedClients;
}

export async function createDelegation(
  builder: SecretVaultBuilderClient,
  builderKeypair: Keypair,
  userDid: string,
  expiresInSeconds: number = 3600
) {
  return NucTokenBuilder.extending(builder.rootToken)
    .command(new Command(['nil', 'db', 'data', 'create']))
    .audience(userDid)
    .expiresAt(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .build(builderKeypair.privateKey());
}

