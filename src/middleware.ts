import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token'); // Replace 'authToken' with your actual token name
  
  // Allowlist for unprotected routes
  const unprotectedRoutes = ['/login', '/test', '/api/:path*'];

  // Check if the current request matches an unprotected route
  if (unprotectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next(); // Allow the request to proceed
  }

  // Redirect to login if the token is missing
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next(); // Allow the request to proceed if authenticated
}

// Apply middleware to all routes
export const config = {
  matcher: ['/:path*'], // Match all routes
};
