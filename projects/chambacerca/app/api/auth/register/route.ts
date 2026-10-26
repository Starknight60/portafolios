import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp, sanitizeString } from '@/lib/security';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['SEEKER', 'EMPLOYER']).default('SEEKER'),
  company: z.string().max(120).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verificación de Rate Limiting (Protección contra registros masivos / bots)
    const clientIp = getClientIp(request.headers);
    const rate = checkRateLimit(clientIp, 6, 60 * 1000); // máx 6 registros por minuto por IP
    if (!rate.allowed) {
      return NextResponse.json(
        { 
          error: `Has realizado demasiados registros en poco tiempo. Por favor espera ${rate.retryAfterSeconds} segundos.` 
        },
        { 
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSeconds) }
        }
      );
    }

    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de registro inválidos. La contraseña debe tener al menos 6 caracteres.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, role, company, phone } = parsed.data;

    // Sanitización de entradas contra inyecciones XSS
    const cleanName = sanitizeString(name);
    const cleanCompany = company ? sanitizeString(company) : null;
    const cleanPhone = phone ? sanitizeString(phone) : null;
    const cleanEmail = email.toLowerCase().trim();

    // Verificar si el correo ya existe
    const existing = (await (sql as any).query(
      `SELECT "id" FROM chambacerca."User" WHERE "email" = $1 LIMIT 1;`,
      [cleanEmail]
    )) as any[];

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta registrada con este correo electrónico.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await (sql as any).query(
      `
      INSERT INTO chambacerca."User" ("id", "name", "email", "password", "role", "company", "phone", "isVerified")
      VALUES ($1, $2, $3, $4, $5, $6, $7, true);
      `,
      [userId, cleanName, cleanEmail, passwordHash, role, cleanCompany, cleanPhone]
    );

    const token = await createSessionToken({
      userId,
      email: cleanEmail,
      name: cleanName,
      role,
      company: cleanCompany,
    });

    const response = NextResponse.json({
      success: true,
      message: role === 'SEEKER' ? '¡Bienvenido a ChambaCerca!' : '¡Cuenta de comercio registrada con éxito!',
      user: { id: userId, name: cleanName, email: cleanEmail, role, company: cleanCompany },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 14 * 24 * 60 * 60, // 14 días
    });

    return response;
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Error interno al registrar la cuenta.', details: err.message },
      { status: 500 }
    );
  }
}
