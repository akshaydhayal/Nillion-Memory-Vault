import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'memoryvault_session';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Delete session cookie
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Error in POST /api/auth/logout:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to logout' },
      { status: 500 }
    );
  }
}



