import { Keypair } from '@nillion/nuc';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const USER_KEYPAIR_FILE = join(process.cwd(), '.user-keypair.json');

export function getUserKeypair(): Keypair {
  try {
    if (existsSync(USER_KEYPAIR_FILE)) {
      const data = JSON.parse(readFileSync(USER_KEYPAIR_FILE, 'utf-8'));
      return Keypair.from(data.privateKey);
    }
  } catch (error) {
    console.warn('Could not load user keypair, generating new one:', error);
  }

  // Generate new keypair if file doesn't exist
  const newKeypair = Keypair.generate();
  try {
    writeFileSync(
      USER_KEYPAIR_FILE,
      JSON.stringify({ privateKey: newKeypair.privateKey() }),
      'utf-8'
    );
    console.log('✅ Generated and saved new user keypair');
  } catch (error) {
    console.warn('Could not save user keypair:', error);
  }

  return newKeypair;
}

