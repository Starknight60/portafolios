import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'chambacerca_secure_salt_key_default_2026';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = 'chamba_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  company?: string | null;
}

/**
 * Crea un token JWT firmado de sesión
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

/**
 * Verifica un token JWT
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      company: (payload.company as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Obtiene la sesión actual desde las cookies en Server Components o Route Handlers
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
