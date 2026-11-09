import { NextResponse } from 'next/server';
import { getCurrentSession, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  const isDemo = session.email === 'carlos.perez@ejemplo.com' || session.email === 'rrhh@plazas.com';
  return NextResponse.json({ 
    authenticated: true, 
    user: {
      ...session,
      isDemo,
    } 
  });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada.' });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
