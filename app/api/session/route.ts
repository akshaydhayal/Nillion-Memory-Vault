import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * Get current session information
 * This helps verify that each user has their own session
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    return NextResponse.json({
      sessionId: session.sessionId.substring(0, 8) + '...', // Partial ID for privacy
      userId: session.userId ? session.userId.substring(0, 8) + '...' : 'not set',
      createdAt: new Date(session.createdAt).toISOString(),
      message: 'Each browser session has a unique identity. Your notes are private to this session.',
    });
  } catch (error: any) {
    console.error('Error in GET /api/session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get session' },
      { status: 500 }
    );
  }
}



