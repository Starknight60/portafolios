import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const activeApplications = await (sql as any).query(`
      SELECT "id", "placeId", "placeName", "channel", "appliedAt", "expiresAt"
      FROM chambacerca."JobApplication"
      WHERE "expiresAt" > NOW()
      ORDER BY "appliedAt" DESC;
    `);

    return NextResponse.json({
      success: true,
      applications: activeApplications || [],
    });
  } catch (err: any) {
    console.error('Error fetching job applications:', err);
    return NextResponse.json(
      { error: 'Error al consultar postulaciones activas.', details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { placeId, placeName, channel = 'WHATSAPP', applicantName } = body;

    if (!placeId) {
      return NextResponse.json(
        { error: 'ID de comercio o vacante obligatorio.' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una postulación activa en las últimas 24 horas
    const existing = await (sql as any).query(
      `
      SELECT "id", "placeId", "placeName", "appliedAt", "expiresAt"
      FROM chambacerca."JobApplication"
      WHERE "placeId" = $1 AND "expiresAt" > NOW()
      LIMIT 1;
      `,
      [placeId]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyApplied: true,
        message: 'Esta vacante ya recibió una solicitud y se encuentra en evaluación por el reclutador.',
        application: existing[0],
      });
    }

    // Registrar nueva postulación válida por 24 horas
    const id = `app_${randomUUID()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas exactas

    await (sql as any).query(
      `
      INSERT INTO chambacerca."JobApplication" ("id", "placeId", "placeName", "applicantName", "channel", "appliedAt", "expiresAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
      [id, placeId, placeName || 'Comercio', applicantName || null, channel, now.toISOString(), expiresAt.toISOString()]
    );

    return NextResponse.json({
      success: true,
      alreadyApplied: false,
      message: 'Postulación registrada. La vacante queda en proceso de selección durante 24 horas.',
      application: {
        id,
        placeId,
        placeName,
        channel,
        appliedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Error in POST /api/places/apply:', err);
    return NextResponse.json(
      { error: 'Error al registrar postulación de trabajo.', details: err.message },
      { status: 500 }
    );
  }
}
