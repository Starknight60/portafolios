import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/security';
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
    // 1. Verificación de Rate Limiting (Protección contra fuerza bruta)
    const clientIp = getClientIp(request.headers);
    const rate = checkRateLimit(clientIp, 10, 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { 
          error: `Demasiados intentos de acceso fallidos desde tu red. Por favor espera ${rate.retryAfterSeconds} segundos.` 
        },
        { 
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSeconds) }
        }
      );
    }

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo y contraseña válidos.' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const users = (await (sql as any).query(
      `
      SELECT "id", "email", "password", "name", "role", "company", "phone"
      FROM chambacerca."User"
      WHERE "email" = $1
      LIMIT 1;
      `,
      [email.toLowerCase().trim()]
    )) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos. Verifica tus datos o regístrate si aún no tienes cuenta.' },
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
      role: user.role || 'SEEKER',
      company: user.company || null,
    });

    const response = NextResponse.json({
      success: true,
      message: `¡Bienvenido de vuelta, ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'SEEKER',
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
      maxAge: 14 * 24 * 60 * 60,
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
