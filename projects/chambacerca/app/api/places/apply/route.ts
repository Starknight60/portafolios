import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceHash = searchParams.get('deviceHash') || request.headers.get('x-device-hash') || null;

    let query = `
      SELECT "id", "placeId", "placeName", "channel", "appliedAt", "expiresAt", "deviceHash"
      FROM chambacerca."JobApplication"
      WHERE "expiresAt" > NOW()
    `;
    const params: any[] = [];
    if (deviceHash) {
      query += ` AND "deviceHash" = $1`;
      params.push(deviceHash);
    }
    query += ` ORDER BY "appliedAt" DESC;`;

    const activeApplications = await (sql as any).query(query, params);

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
    const { placeId, placeName, channel = 'WHATSAPP', applicantName, deviceHash } = body;

    if (!placeId) {
      return NextResponse.json(
        { error: 'ID de comercio o vacante obligatorio.' },
        { status: 400 }
      );
    }

    const effectiveDeviceHash = deviceHash || request.headers.get('x-device-hash') || null;

    // 1. Verificar si este postulante / dispositivo en particular ya se postuló a esta vacante en las últimas 24h
    if (effectiveDeviceHash) {
      const existingUserApp = await (sql as any).query(
        `
        SELECT "id", "placeId", "placeName", "appliedAt", "expiresAt"
        FROM chambacerca."JobApplication"
        WHERE "placeId" = $1 AND "deviceHash" = $2 AND "expiresAt" > NOW()
        LIMIT 1;
        `,
        [placeId, effectiveDeviceHash]
      );

      if (existingUserApp && existingUserApp.length > 0) {
        return NextResponse.json({
          success: true,
          alreadyAppliedByUser: true,
          message: 'Ya enviaste tu postulación hoy para este puesto. Está registrado en "Mi Ruta".',
          application: existingUserApp[0],
        });
      }
    }

    // 2. Verificar cuántas postulaciones activas tiene el comercio en las últimas 24h
    const currentApps = await (sql as any).query(
      `
      SELECT COUNT(*)::int as count
      FROM chambacerca."JobApplication"
      WHERE "placeId" = $1 AND "expiresAt" > NOW();
      `,
      [placeId]
    );

    const currentCount = currentApps && currentApps[0] ? Number(currentApps[0].count) : 0;
    // Gran cadena comercial o comercio estándar: cupos inteligentes (5 o 3)
    const isLargeChain = placeName && (
      placeName.toLowerCase().includes('farmatodo') ||
      placeName.toLowerCase().includes('gama') ||
      placeName.toLowerCase().includes('plazas') ||
      placeName.toLowerCase().includes('traki') ||
      placeName.toLowerCase().includes('central madeirense')
    );
    const maxSlots = isLargeChain ? 5 : 3;

    if (currentCount >= maxSlots) {
      return NextResponse.json({
        success: false,
        slotsFull: true,
        message: 'Esta vacante ya completó el cupo de postulaciones de hoy y se encuentra en revisión de RRHH.',
      });
    }

    // 3. Registrar nueva postulación válida por 24 horas
    const id = `app_${randomUUID()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas exactas

    await (sql as any).query(
      `
      INSERT INTO chambacerca."JobApplication" ("id", "placeId", "placeName", "applicantName", "channel", "appliedAt", "expiresAt", "deviceHash")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `,
      [id, placeId, placeName || 'Comercio', applicantName || null, channel, now.toISOString(), expiresAt.toISOString(), effectiveDeviceHash]
    );

    const newCount = currentCount + 1;
    const remainingSlots = Math.max(0, maxSlots - newCount);

    return NextResponse.json({
      success: true,
      alreadyAppliedByUser: false,
      message: '¡Postulación registrada! Agregada automáticamente a tu lista "Mi Ruta".',
      applicantCount: newCount,
      maxSlots,
      remainingSlots,
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
