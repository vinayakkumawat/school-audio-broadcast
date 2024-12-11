const JWT_SECRET = process.env.JWT_SECRET || 'MyJWTSecretkeyforthisapp';

export function getJwtSecret() {
  return new TextEncoder().encode(JWT_SECRET);
}