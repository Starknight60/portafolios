import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "adradar_super_secret_jwt_key_2026_enterprise_production_token";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string | null;
}): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload || !payload.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        avatarColor: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return null;
  }
}
