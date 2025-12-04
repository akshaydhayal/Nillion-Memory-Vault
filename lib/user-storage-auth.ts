import { Signer } from '@nillion/nuc';
import { getUserById } from './auth';
import { getSession } from './session';

/**
 * Get user signer for authenticated user
 * Loads the signer from Nillion DB based on the logged-in user's account
 */
export async function getUserSignerForAuthenticatedUser(): Promise<Signer | null> {
  const session = await getSession();
  
  // Check if user is authenticated
  if (!session.isAuthenticated || !session.userId) {
    console.log('getUserSignerForAuthenticatedUser: User not authenticated');
    return null;
  }

  try {
    console.log(`getUserSignerForAuthenticatedUser: Loading signer for userId: ${session.userId}`);
    // Get user account from Nillion DB
    const userAccount = await getUserById(session.userId);
    if (!userAccount || !userAccount.userSignerPrivateKey) {
      console.warn('getUserSignerForAuthenticatedUser: User account not found or missing signer');
      return null;
    }

    console.log('getUserSignerForAuthenticatedUser: Successfully loaded user signer');
    // Create signer from stored private key
    return Signer.fromPrivateKey(userAccount.userSignerPrivateKey);
  } catch (error) {
    console.error('getUserSignerForAuthenticatedUser: Error loading user signer from DB:', error);
    return null;
  }
}



