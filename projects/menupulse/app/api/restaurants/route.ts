import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: {
          select: { dishes: true },
        },
      },
      orderBy: { avgMarkupPct: "desc" },
    });

    const formatted = restaurants.map((r) => ({
      ...r,
      dishCount: r._count.dishes,
    }));

    return NextResponse.json({ restaurants: formatted });
  } catch (error) {
    console.error("Error al obtener restaurantes:", error);
    return NextResponse.json({ error: "Error al cargar restaurantes" }, { status: 500 });
  }
}
