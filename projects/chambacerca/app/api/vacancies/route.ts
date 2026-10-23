import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CreateVacancySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  placeName: z.string().min(2).max(120),
  category: z.string().min(2).max(50),
  address: z.string().min(3).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'WEEKEND', 'TEMPORARY']).default('FULL_TIME'),
  schedule: z.string().max(100).optional().nullable(),
  salaryRange: z.string().max(80).optional().nullable(),
  howToApply: z.enum(['IN_PERSON', 'WHATSAPP', 'PHONE', 'EMAIL']).default('IN_PERSON'),
  contactPhone: z.string().max(40).optional().nullable(),
  contactWhatsapp: z.string().max(40).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  applyInstructions: z.string().max(400).optional().nullable(),
  requirements: z.array(z.string().max(120)).default([]),
  benefits: z.array(z.string().max(120)).default([]),
  daysActive: z.number().int().min(7).max(60).default(30),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await request.json();
    const parsed = CreateVacancySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos de la vacante incompletos o inválidos.', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const vacancyId = `vac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + d.daysActive);

    await sql.query(
      `
      INSERT INTO chambacerca."Vacancy" (
        "id", "title", "description", "placeName", "category", "address",
        "latitude", "longitude", "jobType", "schedule", "salaryRange",
        "howToApply", "contactPhone", "contactWhatsapp", "contactEmail",
        "applyInstructions", "requirements", "benefits", "employerId",
        "expiresAt", "status", "isVerified"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'ACTIVE', true
      );
      `,
      [
        vacancyId,
        d.title,
        d.description,
        d.placeName,
        d.category,
        d.address,
        d.latitude,
        d.longitude,
        d.jobType,
        d.schedule || null,
        d.salaryRange || null,
        d.howToApply,
        d.contactPhone || null,
        d.contactWhatsapp || null,
        d.contactEmail || null,
        d.applyInstructions || null,
        d.requirements,
        d.benefits,
        session ? session.userId : null,
        expiresAt,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Vacante publicada exitosamente en el radar de proximidad.',
      vacancyId,
    });
  } catch (err: any) {
    console.error('Error posting vacancy:', err);
    return NextResponse.json(
      { error: 'No se pudo publicar la vacante.', details: err.message },
      { status: 500 }
    );
  }
}
