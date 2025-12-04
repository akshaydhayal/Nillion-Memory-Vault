import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Register user
    const { userId, userDid } = await registerUser(email, password);

    // Create authenticated session
    const session = await getSession();
    session.isAuthenticated = true;
    session.userId = userId;
    session.userDid = userDid;
    session.email = email.toLowerCase().trim();

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      userId,
    });
    setSessionCookie(session, response);

    return response;
  } catch (error: any) {
    console.error('Error in POST /api/auth/register:');
    
    // Log detailed error information
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((nodeError: any, index: number) => {
        const errorBody = nodeError.error?.body;
        const status = nodeError.error?.status;
        let errorMsg = '';
        if (errorBody) {
          if (errorBody.errors && Array.isArray(errorBody.errors)) {
            errorMsg = errorBody.errors.join(' | ');
          } else if (typeof errorBody === 'object') {
            errorMsg = JSON.stringify(errorBody, null, 2);
          } else {
            errorMsg = String(errorBody);
          }
        } else {
          errorMsg = nodeError.error?.message || 'Unknown error';
        }
        console.error(`  Node ${index + 1} (status ${status}):`, errorMsg);
      });
    } else {
      console.error('  Error:', error.message || JSON.stringify(error, null, 2));
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to register user' },
      { status: 400 }
    );
  }
}

