import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const watchlists = await prisma.watchlist.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            dish: {
              include: { restaurant: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ watchlists });
  } catch (error) {
    console.error("Error al obtener watchlists:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { action, watchlistId, title, notes, dishId, userNote } = body;

    // Crear nueva watchlist
    if (action === "create_watchlist") {
      if (!title) {
        return NextResponse.json({ error: "Título requerido" }, { status: 400 });
      }

      const newWatchlist = await prisma.watchlist.create({
        data: {
          userId: user.id,
          title: String(title).trim(),
          notes: notes ? String(notes).trim() : null,
        },
      });

      return NextResponse.json({ success: true, watchlist: newWatchlist });
    }

    // Agregar plato a watchlist
    if (action === "add_item") {
      if (!watchlistId || !dishId) {
        return NextResponse.json({ error: "WatchlistId y DishId requeridos" }, { status: 400 });
      }

      const existingItem = await prisma.watchlistItem.findFirst({
        where: { watchlistId, dishId },
      });

      if (existingItem) {
        return NextResponse.json(
          { error: "Este plato ya está guardado en esta watchlist" },
          { status: 400 }
        );
      }

      const item = await prisma.watchlistItem.create({
        data: {
          watchlistId,
          dishId,
          userNote: userNote || "Monitoreo de sobreprecio activo",
        },
        include: {
          dish: { include: { restaurant: true } },
        },
      });

      return NextResponse.json({ success: true, item });
    }

    // Eliminar item de watchlist
    if (action === "remove_item") {
      const { itemId } = body;
      if (!itemId) {
        return NextResponse.json({ error: "itemId requerido" }, { status: 400 });
      }

      await prisma.watchlistItem.delete({
        where: { id: itemId },
      });

      return NextResponse.json({ success: true, message: "Elemento eliminado de la watchlist" });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error en watchlists:", error);
    return NextResponse.json({ error: "Error interno al gestionar watchlist" }, { status: 500 });
  }
}
