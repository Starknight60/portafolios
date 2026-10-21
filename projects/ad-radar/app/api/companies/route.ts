import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry")?.slice(0, 50);

    const where: any = {};
    if (industry && industry !== "all") {
      where.industry = industry;
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: { ads: true },
        },
      },
      take: 100,
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error al consultar empresas:", error);
    return NextResponse.json({ error: "Error al consultar empresas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rateCheck = checkRateLimit(`company_create_${ip}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Límite de peticiones alcanzado" }, { status: 429 });
    }

    const body = await request.json();
    const { name, industry, tagline, website, country, logoColor, logoIcon } = body;

    if (!name || typeof name !== "string" || !industry || typeof industry !== "string") {
      return NextResponse.json({ error: "Nombre e industria son requeridos" }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 80);
    const cleanIndustry = industry.trim().slice(0, 40).toLowerCase();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 50);

    // Validar formato de URL para prevenir javascript: o pseudoprotocolos maliciosos
    let safeWebsite = `https://${slug}.com`;
    if (website && typeof website === "string") {
      try {
        const parsed = new URL(website.trim());
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          safeWebsite = parsed.toString().slice(0, 200);
        }
      } catch {
        // Fallback si no es una URL válida
      }
    }

    const newCompany = await prisma.company.create({
      data: {
        name: cleanName,
        slug,
        industry: cleanIndustry,
        tagline: tagline ? String(tagline).trim().slice(0, 150) : `Especialista en ${cleanIndustry}`,
        website: safeWebsite,
        country: country ? String(country).trim().slice(0, 10).toUpperCase() : "LATAM",
        logoColor: logoColor ? String(logoColor).slice(0, 20) : "#6366f1",
        logoIcon: logoIcon ? String(logoIcon).slice(0, 30) : "Briefcase",
      },
    });

    return NextResponse.json({ company: newCompany }, { status: 201 });
  } catch (error) {
    console.error("Error al crear empresa:", error);
    return NextResponse.json({ error: "No se pudo registrar la empresa" }, { status: 500 });
  }
}
