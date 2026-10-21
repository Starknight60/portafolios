import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

const ALLOWED_PLATFORMS = ["INSTAGRAM", "TIKTOK", "FACEBOOK", "GOOGLE_ADS", "YOUTUBE", "LINKEDIN"];
const ALLOWED_OFFER_TYPES = ["COMBO", "DISCOUNT", "TWO_FOR_ONE", "FREE_DELIVERY", "NEW_LAUNCH", "BUNDLE"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry")?.slice(0, 50);
    const companySlug = searchParams.get("company")?.slice(0, 50);
    const platform = searchParams.get("platform")?.slice(0, 30);
    const offerType = searchParams.get("offerType")?.slice(0, 30);
    const search = searchParams.get("search")?.slice(0, 100);

    const where: any = { isActive: true };

    if (industry && industry !== "all") {
      where.company = { industry };
    }

    if (companySlug && companySlug !== "all") {
      where.company = { ...where.company, slug: companySlug };
    }

    if (platform && platform !== "all" && ALLOWED_PLATFORMS.includes(platform)) {
      where.platform = platform;
    }

    if (offerType && offerType !== "all" && ALLOWED_OFFER_TYPES.includes(offerType)) {
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
      take: 50, // Limite de resultados por seguridad y rendimiento
    });

    return NextResponse.json({ ads, count: ads.length });
  } catch (error) {
    console.error("Error en consulta segura de anuncios:", error);
    return NextResponse.json({ error: "Error interno al consultar anuncios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting por IP / Cliente
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rateCheck = checkRateLimit(`ad_create_${ip}`, 15, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Demasiadas peticiones. Por favor espera un momento antes de registrar más anuncios." },
        { status: 429 }
      );
    }

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

    // 2. Validación estricta de campos obligatorios
    if (!companyId || typeof companyId !== "string" || !headline || typeof headline !== "string" || !bodyText || typeof bodyText !== "string") {
      return NextResponse.json({ error: "Campos requeridos inválidos o incompletos" }, { status: 400 });
    }

    // 3. Sanitización y límites de longitud
    const cleanHeadline = headline.trim().slice(0, 160);
    const cleanBodyText = bodyText.trim().slice(0, 1500);
    const cleanOfferBadge = offerBadge ? String(offerBadge).trim().slice(0, 40) : null;
    const cleanTargetAudience = String(targetAudience).trim().slice(0, 100);

    const safePlatform = ALLOWED_PLATFORMS.includes(platform) ? platform : "INSTAGRAM";
    const safeOfferType = ALLOWED_OFFER_TYPES.includes(offerType) ? offerType : "DISCOUNT";
    const safeReach = Math.min(Math.max(0, Number(estimatedReach) || 0), 10000000);
    const safeDays = Math.min(Math.max(1, Number(daysActive) || 1), 365);

    // 4. Verificar existencia de la empresa
    const companyExists = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!companyExists) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    }

    const newAd = await prisma.ad.create({
      data: {
        companyId,
        headline: cleanHeadline,
        bodyText: cleanBodyText,
        callToAction: String(callToAction).slice(0, 30),
        platform: safePlatform,
        format: String(format).slice(0, 30),
        offerType: safeOfferType,
        offerBadge: cleanOfferBadge,
        accentGradient: String(accentGradient).slice(0, 100),
        estimatedReach: safeReach,
        daysActive: safeDays,
        targetAudience: cleanTargetAudience,
      },
      include: {
        company: true,
      },
    });

    // Actualizar contador de anuncios
    await prisma.company.update({
      where: { id: companyId },
      data: { activeAdsCount: { increment: 1 } },
    });

    return NextResponse.json({ ad: newAd }, { status: 201 });
  } catch (error) {
    console.error("Error en creación segura de anuncio:", error);
    return NextResponse.json({ error: "No se pudo registrar el anuncio" }, { status: 500 });
  }
}
