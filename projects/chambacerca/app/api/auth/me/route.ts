import { NextResponse } from 'next/server';
import { getCurrentSession, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Sesión cerrada.' });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
