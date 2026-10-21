import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");
    const companySlug = searchParams.get("company");
    const platform = searchParams.get("platform");
    const offerType = searchParams.get("offerType");
    const search = searchParams.get("search");

    const where: any = { isActive: true };

    if (industry && industry !== "all") {
      where.company = { industry };
    }

    if (companySlug && companySlug !== "all") {
      where.company = { ...where.company, slug: companySlug };
    }

    if (platform && platform !== "all") {
      where.platform = platform;
    }

    if (offerType && offerType !== "all") {
      where.offerType = offerType;
    }

    if (search && search.trim() !== "") {
      where.OR = [
        { headline: { contains: search, mode: "insensitive" } },
        { bodyText: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const ads = await prisma.ad.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ ads, count: ads.length });
  } catch (error: any) {
    console.error("Error fetching ads:", error);
    return NextResponse.json({ error: error.message || "Error al consultar anuncios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      headline,
      bodyText,
      callToAction = "ORDER_NOW",
      platform = "INSTAGRAM",
      format = "VERTICAL_REEL",
      offerType = "DISCOUNT",
      offerBadge,
      accentGradient = "from-amber-500 to-red-600",
      estimatedReach = 50000,
      daysActive = 3,
      targetAudience = "Público objetivo",
    } = body;

    if (!companyId || !headline || !bodyText) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const newAd = await prisma.ad.create({
      data: {
        companyId,
        headline,
        bodyText,
        callToAction,
        platform,
        format,
        offerType,
        offerBadge,
        accentGradient,
        estimatedReach: Number(estimatedReach),
        daysActive: Number(daysActive),
        targetAudience,
      },
      include: {
        company: true,
      },
    });

    // Actualizar contador de anuncios de la empresa
    await prisma.company.update({
      where: { id: companyId },
      data: { activeAdsCount: { increment: 1 } },
    });

    return NextResponse.json({ ad: newAd }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating ad:", error);
    return NextResponse.json({ error: error.message || "Error al registrar anuncio" }, { status: 500 });
  }
}
