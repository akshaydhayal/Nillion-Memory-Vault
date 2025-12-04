import { NextResponse } from 'next/server';
import { nillionConfig } from '@/lib/config';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      hasBuilderKey: !!nillionConfig.BUILDER_PRIVATE_KEY,
      hasNilAIKey: !!nillionConfig.NILAI_API_KEY,
      nildbNodes: nillionConfig.NILDB_NODES.length,
    },
  };

  return NextResponse.json(health);
}

