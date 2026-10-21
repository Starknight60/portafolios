import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry");

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
    });

    return NextResponse.json({ companies });
  } catch (error: any) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: error.message || "Error al consultar empresas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, industry, tagline, website, country, logoColor, logoIcon } = body;

    if (!name || !industry) {
      return NextResponse.json({ error: "Nombre e industria son obligatorios" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    const newCompany = await prisma.company.create({
      data: {
        name,
        slug,
        industry,
        tagline: tagline || `Especialista en ${industry}`,
        website: website || `https://${slug}.com`,
        country: country || "LATAM",
        logoColor: logoColor || "#6366f1",
        logoIcon: logoIcon || "Briefcase",
      },
    });

    return NextResponse.json({ company: newCompany }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al crear empresa" }, { status: 500 });
  }
}
