import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const COLLECTION_ID_FILE = join(process.cwd(), '.collection-id.json');

let cachedCollectionId: string | null = null;

export function getCollectionId(): string {
  // Return cached ID if available
  if (cachedCollectionId) {
    return cachedCollectionId;
  }

  try {
    if (existsSync(COLLECTION_ID_FILE)) {
      const data = JSON.parse(readFileSync(COLLECTION_ID_FILE, 'utf-8'));
      if (data.collectionId && typeof data.collectionId === 'string') {
        cachedCollectionId = data.collectionId;
        return data.collectionId;
      }
    }
  } catch (error) {
    console.warn('Could not load collection ID, will generate new one:', error);
  }

  // Generate new collection ID (UUID format)
  const collectionId = randomUUID();
  cachedCollectionId = collectionId;
  
  try {
    writeFileSync(
      COLLECTION_ID_FILE,
      JSON.stringify({ collectionId }),
      'utf-8'
    );
    console.log('✅ Generated and saved new collection ID:', collectionId);
  } catch (error) {
    console.warn('Could not save collection ID:', error);
  }

  return collectionId;
}

