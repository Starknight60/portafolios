import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  company: z.string().min(2).max(120),
  phone: z.string().max(30).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de registro inválidos.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, company, phone } = parsed.data;

    // Verificar si el correo ya existe
    const existing = await sql.query(
      `SELECT "id" FROM chambacerca."User" WHERE "email" = $1 LIMIT 1;`,
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta registrada con este correo electrónico.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await sql.query(
      `
      INSERT INTO chambacerca."User" ("id", "name", "email", "password", "company", "phone", "role", "isVerified")
      VALUES ($1, $2, $3, $4, $5, $6, 'EMPLOYER', true);
      `,
      [userId, name, email.toLowerCase(), passwordHash, company, phone || null]
    );

    const token = await createSessionToken({
      userId,
      email: email.toLowerCase(),
      name,
      role: 'EMPLOYER',
      company,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: userId, name, email: email.toLowerCase(), company },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Error interno al registrar la cuenta de empleador.', details: err.message },
      { status: 500 }
    );
  }
}
