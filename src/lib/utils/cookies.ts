import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from '@/lib/config/constants';

// Only use these functions in server components or API routes that support the cookies API
export async function getAuthCookie() {
  return (await cookies()).get(AUTH_COOKIE_NAME);
}

// Note: This function should not be used in route handlers
// Use NextResponse.cookies instead
export async function getAuthToken() {
  const cookie = await getAuthCookie();
  return cookie?.value;
}