import { Signer } from '@nillion/nuc';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'node:crypto';

// Store user signers per session in a sessions directory
const SESSIONS_DIR = join(process.cwd(), '.sessions');

// Ensure sessions directory exists
if (!existsSync(SESSIONS_DIR)) {
  try {
    mkdirSync(SESSIONS_DIR, { recursive: true });
  } catch (error) {
    console.warn('Could not create sessions directory:', error);
  }
}

/**
 * Get user signer for a specific session
 * Each session has its own unique user identity
 */
export function getUserSignerForSession(sessionId: string): Signer {
  const signerFile = join(SESSIONS_DIR, `${sessionId}.json`);

  try {
    if (existsSync(signerFile)) {
      const data = JSON.parse(readFileSync(signerFile, 'utf-8'));
      if (data.privateKey) {
        return Signer.fromPrivateKey(data.privateKey);
      }
    }
  } catch (error) {
    console.warn(`Could not load user signer for session ${sessionId}, generating new one:`, error);
  }

  // Generate new private key for this session
  const privateKeyBytes = randomBytes(32);
  const privateKey = privateKeyBytes.toString('hex');
  
  // Create signer from the generated private key
  const newSigner = Signer.fromPrivateKey(privateKey);
  
  try {
    // Save the private key for this session
    writeFileSync(
      signerFile,
      JSON.stringify({ privateKey, sessionId, createdAt: new Date().toISOString() }),
      'utf-8'
    );
    console.log(`✅ Generated and saved new user signer for session: ${sessionId.substring(0, 8)}...`);
  } catch (error) {
    console.warn('Could not save user signer:', error);
  }

  return newSigner;
}

/**
 * Clean up old session files (optional - for maintenance)
 */
export function cleanupOldSessions(maxAge: number = 30 * 24 * 60 * 60 * 1000): void {
  // This can be called periodically to clean up old sessions
  // maxAge in milliseconds (default: 30 days)
  try {
    const files = require('fs').readdirSync(SESSIONS_DIR);
    const now = Date.now();
    
    files.forEach((file: string) => {
      if (file.endsWith('.json')) {
        const filePath = join(SESSIONS_DIR, file);
        try {
          const data = JSON.parse(readFileSync(filePath, 'utf-8'));
          const createdAt = new Date(data.createdAt).getTime();
          if (now - createdAt > maxAge) {
            require('fs').unlinkSync(filePath);
            console.log(`Cleaned up old session: ${file}`);
          }
        } catch (error) {
          // Ignore errors
        }
      }
    });
  } catch (error) {
    // Ignore errors
  }
}

