import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'memoryvault_session';
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

export interface Session {
  sessionId: string;
  userId: string;
  createdAt: number;
}

/**
 * Get or create a user session
 * Each session gets a unique user identity
 * This function must be called from API routes or server components
 */
export async function getSession(): Promise<Session> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (sessionCookie?.value) {
      try {
        const session: Session = JSON.parse(sessionCookie.value);
        // Verify session is still valid
        if (session.sessionId && session.userId) {
          return session;
        }
      } catch (error) {
        // Invalid session, create new one
      }
    }

    // Create new session
    const newSession: Session = {
      sessionId: randomUUID(),
      userId: randomUUID(), // Unique user ID for this session
      createdAt: Date.now(),
    };

    // Set cookie
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(newSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    });

    return newSession;
  } catch (error) {
    // If cookies() fails, create a temporary session (shouldn't happen)
    console.warn('Could not access cookies, creating temporary session:', error);
    return {
      sessionId: randomUUID(),
      userId: randomUUID(),
      createdAt: Date.now(),
    };
  }
}

/**
 * Set session cookie in response (for use in API routes)
 */
export function setSessionCookie(session: Session, response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  });
}

