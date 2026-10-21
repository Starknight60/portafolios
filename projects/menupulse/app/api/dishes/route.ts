import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const restaurantId = searchParams.get("restaurantId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "markup_desc";

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }
    if (restaurantId && restaurantId !== "all") {
      where.restaurantId = restaurantId;
    }
    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { phantomMarkupPct: "desc" };
    if (sortBy === "physical_asc") orderBy = { physicalPrice: "asc" };
    if (sortBy === "physical_desc") orderBy = { physicalPrice: "desc" };
    if (sortBy === "delivery_desc") orderBy = { pedidosYaPrice: "desc" };
    if (sortBy === "markup_asc") orderBy = { phantomMarkupPct: "asc" };

    const dishes = await prisma.dish.findMany({
      where,
      include: {
        restaurant: true,
      },
      orderBy,
    });

    return NextResponse.json({ dishes });
  } catch (error) {
    console.error("Error al obtener platos:", error);
    return NextResponse.json({ error: "Error al cargar platos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      restaurantId,
      name,
      category,
      description,
      physicalPrice,
      pedidosYaPrice,
      uberEatsPrice,
      yummyPrice,
      foodCostEst,
    } = body;

    if (!restaurantId || !name || !physicalPrice || !pedidosYaPrice) {
      return NextResponse.json(
        { error: "Restaurante, nombre, precio físico y precio delivery requeridos." },
        { status: 400 }
      );
    }

    const pPhys = Number(physicalPrice);
    const pPy = Number(pedidosYaPrice);
    const pUber = Number(uberEatsPrice || pedidosYaPrice);
    const pYummy = Number(yummyPrice || pedidosYaPrice);
    const avgDelivery = (pPy + pUber + pYummy) / 3;
    const markupPct = Number((((avgDelivery - pPhys) / pPhys) * 100).toFixed(1));

    let badge = null;
    if (markupPct > 35) badge = "🔥 Mayor Sobreprecio";
    else if (markupPct < 20) badge = "📉 Precio Honesto";

    const dish = await prisma.dish.create({
      data: {
        restaurantId,
        name: String(name).trim(),
        category: category || "General",
        description: description || "Sin descripción proporcionada",
        physicalPrice: pPhys,
        pedidosYaPrice: pPy,
        uberEatsPrice: pUber,
        yummyPrice: pYummy,
        phantomMarkupPct: markupPct,
        foodCostEst: Number(foodCostEst || 0),
        badge,
      },
      include: {
        restaurant: true,
      },
    });

    // Actualizar el avgMarkupPct del restaurante
    const allDishes = await prisma.dish.findMany({
      where: { restaurantId },
      select: { phantomMarkupPct: true },
    });
    const avgTotal =
      allDishes.reduce((acc, curr) => acc + curr.phantomMarkupPct, 0) / allDishes.length;

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { avgMarkupPct: Number(avgTotal.toFixed(1)) },
    });

    return NextResponse.json({ success: true, dish });
  } catch (error) {
    console.error("Error al crear plato:", error);
    return NextResponse.json({ error: "Error al registrar plato" }, { status: 500 });
  }
}
