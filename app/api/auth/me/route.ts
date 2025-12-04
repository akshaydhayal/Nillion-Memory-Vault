import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isAuthenticated || !session.userId) {
      return NextResponse.json({
        isAuthenticated: false,
      });
    }

    return NextResponse.json({
      isAuthenticated: true,
      userId: session.userId,
      email: session.email,
      userDid: session.userDid,
    });
  } catch (error: any) {
    console.error('Error in GET /api/auth/me:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user info' },
      { status: 500 }
    );
  }
}



