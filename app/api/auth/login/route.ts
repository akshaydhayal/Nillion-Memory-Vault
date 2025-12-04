import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { getSession, setSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate user
    const { userId, userDid } = await authenticateUser(email, password);

    // Create authenticated session
    const session = await getSession();
    session.isAuthenticated = true;
    session.userId = userId;
    session.userDid = userDid;
    session.email = email.toLowerCase().trim();

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      userId,
      email: session.email,
    });
    setSessionCookie(session, response);

    return response;
  } catch (error: any) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json(
      { error: error.message || 'Invalid email or password' },
      { status: 401 }
    );
  }
}



