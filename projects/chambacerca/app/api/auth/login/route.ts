import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Credenciales inválidas.' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const users = (await (sql as any).query(
      `
      SELECT "id", "email", "password", "name", "role", "company"
      FROM chambacerca."User"
      WHERE "email" = $1
      LIMIT 1;
      `,
      [email.toLowerCase()]
    )) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
      },
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
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Error interno al iniciar sesión.', details: err.message },
      { status: 500 }
    );
  }
}
