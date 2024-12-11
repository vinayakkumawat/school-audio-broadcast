import { SignJWT } from 'jose';
import { getJwtSecret } from '@/lib/utils/jwt';
import { validateCredentials } from '@/lib/utils/credentials';
import { JWT_EXPIRY } from '@/lib/config/constants';
import type { LoginCredentials } from '@/lib/types/auth';

export async function authenticateUser({ email, password }: LoginCredentials) {
  const isValid = await validateCredentials(email, password);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());

  return { token, success: true };
}