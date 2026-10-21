import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "nexus-enterprise-secret-key-super-secure-2026"
);

export const COOKIE_NAME = "nexus_session";

// 1. Encriptación de Contraseñas
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
}

// 2. Manejo de Tokens JWT con expiración de 7 días
export async function createSessionToken(payload: {
    userId: string;
    email: string;
    name: string;
    role: string;
}): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as {
            userId: string;
            email: string;
            name: string;
            role: string;
        };
    } catch {
        return null;
    }
}

// 3. Obtener el usuario actual desde las Cookies de Next.js
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}