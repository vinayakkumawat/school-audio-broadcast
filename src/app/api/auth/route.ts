import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/services/auth.service';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from '@/lib/config/constants';

export async function POST(request: Request) {
  try {
    const credentials = await request.json();
    const { token, success } = await authenticateUser(credentials);

    // Create response with success status
    const response = NextResponse.json({ success });

    // Set the auth cookie in the response
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}