import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, savedIds: [] });
  }

  try {
    const rows = (await (sql as any).query(
      `
      SELECT "vacancyId"
      FROM chambacerca."SavedVacancy"
      WHERE "userId" = $1
      ORDER BY "createdAt" DESC;
      `,
      [session.userId]
    )) as any[];

    const savedIds = rows.map((r: any) => r.vacancyId);
    return NextResponse.json({ authenticated: true, savedIds });
  } catch (err: any) {
    console.error('Error fetching saved vacancies:', err);
    return NextResponse.json({ error: 'Error al obtener vacantes guardadas', savedIds: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Debes iniciar sesión para guardar oportunidades.' }, { status: 401 });
  }

  try {
    const { vacancyId } = await request.json();
    if (!vacancyId) {
      return NextResponse.json({ error: 'ID de vacante requerido.' }, { status: 400 });
    }

    // Verificar si ya está guardada
    const existing = (await (sql as any).query(
      `
      SELECT "id" FROM chambacerca."SavedVacancy"
      WHERE "userId" = $1 AND "vacancyId" = $2
      LIMIT 1;
      `,
      [session.userId, vacancyId]
    )) as any[];

    if (existing && existing.length > 0) {
      // Eliminar (toggle off)
      await (sql as any).query(
        `DELETE FROM chambacerca."SavedVacancy" WHERE "userId" = $1 AND "vacancyId" = $2;`,
        [session.userId, vacancyId]
      );
      return NextResponse.json({ saved: false, message: 'Vacante removida de tus guardados.' });
    } else {
      // Guardar (toggle on)
      const saveId = `sv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await (sql as any).query(
        `
        INSERT INTO chambacerca."SavedVacancy" ("id", "userId", "vacancyId")
        VALUES ($1, $2, $3);
        `,
        [saveId, session.userId, vacancyId]
      );
      return NextResponse.json({ saved: true, message: '¡Oportunidad guardada en tu perfil!' });
    }
  } catch (err: any) {
    console.error('Error toggling saved vacancy:', err);
    return NextResponse.json({ error: 'Error al actualizar guardados.' }, { status: 500 });
  }
}
