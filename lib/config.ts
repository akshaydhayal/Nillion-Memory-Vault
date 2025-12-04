import { config as loadEnv } from 'dotenv';

loadEnv();

export const nillionConfig = {
  NILCHAIN_URL: process.env.NILCHAIN_URL || 'http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz',
  NILAUTH_URL: process.env.NILAUTH_URL || 'https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz',
  NILDB_NODES: process.env.NILDB_NODES
    ? process.env.NILDB_NODES.split(',')
    : [
        'https://nildb-stg-n1.nillion.network',
        'https://nildb-stg-n2.nillion.network',
        'https://nildb-stg-n3.nillion.network',
      ],
  BUILDER_PRIVATE_KEY: process.env.BUILDER_PRIVATE_KEY || '',
  NILAI_API_KEY: process.env.NILAI_API_KEY || '',
  NILAI_BASE_URL: process.env.NILAI_BASE_URL || 'https://nilai-api.nillion.network',
  NILAI_MODEL: process.env.NILAI_MODEL || 'meta-llama/Llama-3.1-8B-Instruct',
};

if (!nillionConfig.BUILDER_PRIVATE_KEY) {
  console.warn('⚠️ BUILDER_PRIVATE_KEY not set in environment variables');
}

