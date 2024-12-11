import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from './lib/config/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME);

  // Allowlist for unprotected routes
  const unprotectedRoutes = ['/login', '/api/auth'];

  // Check if the current request matches an unprotected route
  const isUnprotectedRoute = unprotectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isUnprotectedRoute) {
    return NextResponse.next();
  }

  // Redirect to login if the token is missing
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};