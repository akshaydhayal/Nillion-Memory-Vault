import { Signer } from '@nillion/nuc';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'node:crypto';

const USER_SIGNER_FILE = join(process.cwd(), '.user-signer.json');

export function getUserSigner(): Signer {
  try {
    if (existsSync(USER_SIGNER_FILE)) {
      const data = JSON.parse(readFileSync(USER_SIGNER_FILE, 'utf-8'));
      return Signer.fromPrivateKey(data.privateKey);
    }
  } catch (error) {
    console.warn('Could not load user signer, generating new one:', error);
  }

  // Generate new private key (32 bytes = 64 hex characters)
  // This matches the format expected by Signer.fromPrivateKey
  const privateKeyBytes = randomBytes(32);
  const privateKey = privateKeyBytes.toString('hex');
  
  // Create signer from the generated private key
  const newSigner = Signer.fromPrivateKey(privateKey);
  
  try {
    // Save the private key for future use
    writeFileSync(
      USER_SIGNER_FILE,
      JSON.stringify({ privateKey }),
      'utf-8'
    );
    console.log('✅ Generated and saved new user signer');
  } catch (error) {
    console.warn('Could not save user signer:', error);
  }

  return newSigner;
}

