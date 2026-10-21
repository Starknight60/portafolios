import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slugA = searchParams.get("slugA") || "mcdonalds";
    const slugB = searchParams.get("slugB") || "burger-king";

    const [restaurantA, restaurantB] = await Promise.all([
      prisma.restaurant.findUnique({
        where: { slug: slugA },
        include: { dishes: true },
      }),
      prisma.restaurant.findUnique({
        where: { slug: slugB },
        include: { dishes: true },
      }),
    ]);

    if (!restaurantA || !restaurantB) {
      return NextResponse.json({ error: "Restaurantes no encontrados" }, { status: 404 });
    }

    // Estadísticas A
    const avgDeliveryA =
      restaurantA.dishes.length > 0
        ? restaurantA.dishes.reduce((acc, d) => acc + (d.pedidosYaPrice + d.uberEatsPrice) / 2, 0) /
          restaurantA.dishes.length
        : 0;
    const avgPhysicalA =
      restaurantA.dishes.length > 0
        ? restaurantA.dishes.reduce((acc, d) => acc + d.physicalPrice, 0) / restaurantA.dishes.length
        : 0;

    // Estadísticas B
    const avgDeliveryB =
      restaurantB.dishes.length > 0
        ? restaurantB.dishes.reduce((acc, d) => acc + (d.pedidosYaPrice + d.uberEatsPrice) / 2, 0) /
          restaurantB.dishes.length
        : 0;
    const avgPhysicalB =
      restaurantB.dishes.length > 0
        ? restaurantB.dishes.reduce((acc, d) => acc + d.physicalPrice, 0) / restaurantB.dishes.length
        : 0;

    return NextResponse.json({
      restaurantA: {
        ...restaurantA,
        avgDeliveryPrice: Number(avgDeliveryA.toFixed(2)),
        avgPhysicalPrice: Number(avgPhysicalA.toFixed(2)),
      },
      restaurantB: {
        ...restaurantB,
        avgDeliveryPrice: Number(avgDeliveryB.toFixed(2)),
        avgPhysicalPrice: Number(avgPhysicalB.toFixed(2)),
      },
      winnerFairPrice:
        restaurantA.avgMarkupPct < restaurantB.avgMarkupPct
          ? restaurantA.name
          : restaurantB.name,
      markupDifference: Number(
        Math.abs(restaurantA.avgMarkupPct - restaurantB.avgMarkupPct).toFixed(1)
      ),
    });
  } catch (error) {
    console.error("Error al comparar restaurantes:", error);
    return NextResponse.json({ error: "Error interno al procesar comparación" }, { status: 500 });
  }
}
