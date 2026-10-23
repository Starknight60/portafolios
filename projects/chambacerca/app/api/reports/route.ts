import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { checkRateLimit, anonymizeIdentifier } from '@/lib/rateLimit';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CreateReportSchema = z.object({
  placeOsmId: z.string().min(1).max(100),
  placeName: z.string().min(2).max(120),
  category: z.string().min(2).max(50),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  status: z.enum(['HIRING', 'NOT_HIRING']),
  roleHiring: z.string().max(100).optional().nullable(),
  comment: z.string().max(500).optional().nullable(),
  contactTip: z.string().max(200).optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'browser';
    const deviceFingerprint = `${rawIp}:${userAgent}`;

    // Límite: máximo 5 reportes por hora por dispositivo
    const limit = await checkRateLimit(deviceFingerprint, {
      keyPrefix: 'report_post',
      maxRequests: 5,
      windowSeconds: 3600,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de reportes comunitarios por hora. Gracias por colaborar.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = CreateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos del reporte incompletos o inválidos.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const deviceHash = anonymizeIdentifier(deviceFingerprint);
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Expira a los 30 días para mantener la información siempre fresca
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await sql.query(
      `
      INSERT INTO chambacerca."PlaceReport" (
        "id", "placeOsmId", "placeName", "category", "latitude", "longitude",
        "status", "roleHiring", "comment", "contactTip", "deviceHash", "expiresAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
      `,
      [
        reportId,
        data.placeOsmId,
        data.placeName,
        data.category,
        data.latitude,
        data.longitude,
        data.status,
        data.roleHiring || null,
        data.comment || null,
        data.contactTip || null,
        deviceHash,
        expiresAt,
      ]
    );

    return NextResponse.json({
      success: true,
      message: '¡Gracias por compartir esta información con tu comunidad! Ayudarás a muchos vecinos en su búsqueda.',
      reportId,
    });
  } catch (err: any) {
    console.error('Error creating report:', err);
    return NextResponse.json(
      { error: 'No se pudo guardar el reporte comunitario.', details: err.message },
      { status: 500 }
    );
  }
}
