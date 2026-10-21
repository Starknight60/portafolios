import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyAId = searchParams.get("companyA");
    const companyBId = searchParams.get("companyB");

    if (!companyAId || !companyBId) {
      return NextResponse.json({ error: "Debes seleccionar dos empresas para comparar" }, { status: 400 });
    }

    const [compA, compB] = await Promise.all([
      prisma.company.findUnique({
        where: { id: companyAId },
        include: { ads: true },
      }),
      prisma.company.findUnique({
        where: { id: companyBId },
        include: { ads: true },
      }),
    ]);

    if (!compA || !compB) {
      return NextResponse.json({ error: "Una de las empresas no fue encontrada" }, { status: 404 });
    }

    // Cálculo de métricas comparativas
    const totalReachA = compA.ads.reduce((acc, ad) => acc + ad.estimatedReach, 0);
    const totalReachB = compB.ads.reduce((acc, ad) => acc + ad.estimatedReach, 0);

    const offersA: Record<string, number> = {};
    for (const ad of compA.ads) {
      offersA[ad.offerType] = (offersA[ad.offerType] || 0) + 1;
    }

    const offersB: Record<string, number> = {};
    for (const ad of compB.ads) {
      offersB[ad.offerType] = (offersB[ad.offerType] || 0) + 1;
    }

    const platformsA: Record<string, number> = {};
    for (const ad of compA.ads) {
      platformsA[ad.platform] = (platformsA[ad.platform] || 0) + 1;
    }

    const platformsB: Record<string, number> = {};
    for (const ad of compB.ads) {
      platformsB[ad.platform] = (platformsB[ad.platform] || 0) + 1;
    }

    // Buscar si existe un insight predefinido entre el par
    const pair = await prisma.competitorPair.findFirst({
      where: {
        OR: [
          { companyAId: compA.id, companyBId: compB.id },
          { companyAId: compB.id, companyBId: compA.id },
        ],
      },
    });

    return NextResponse.json({
      companyA: {
        ...compA,
        totalReach: totalReachA,
        offerDistribution: offersA,
        platformDistribution: platformsA,
      },
      companyB: {
        ...compB,
        totalReach: totalReachB,
        offerDistribution: offersB,
        platformDistribution: platformsB,
      },
      pairInsight: pair?.insightNote || null,
    });
  } catch (error: any) {
    console.error("Error comparing companies:", error);
    return NextResponse.json({ error: error.message || "Error al generar comparativa" }, { status: 500 });
  }
}
