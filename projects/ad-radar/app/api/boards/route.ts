import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      include: {
        items: {
          include: {
            ad: {
              include: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ boards });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al obtener tableros" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, title, description, colorTag, boardId, adId, userNote } = body;

    // Acción 1: Crear nuevo tablero
    if (action === "create_board") {
      if (!title) return NextResponse.json({ error: "Título requerido" }, { status: 400 });

      const newBoard = await prisma.board.create({
        data: {
          title,
          description,
          colorTag: colorTag || "#6366f1",
        },
      });
      return NextResponse.json({ board: newBoard }, { status: 201 });
    }

    // Acción 2: Guardar anuncio en tablero
    if (action === "save_ad") {
      if (!boardId || !adId) return NextResponse.json({ error: "boardId y adId requeridos" }, { status: 400 });

      const item = await prisma.boardItem.upsert({
        where: {
          boardId_adId: {
            boardId,
            adId,
          },
        },
        update: {
          userNote: userNote || undefined,
        },
        create: {
          boardId,
          adId,
          userNote,
        },
        include: {
          ad: {
            include: { company: true },
          },
        },
      });

      return NextResponse.json({ item }, { status: 201 });
    }

    // Acción 3: Quitar anuncio de tablero
    if (action === "remove_ad") {
      if (!boardId || !adId) return NextResponse.json({ error: "boardId y adId requeridos" }, { status: 400 });
      await prisma.boardItem.delete({
        where: {
          boardId_adId: {
            boardId,
            adId,
          },
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error en tablero" }, { status: 500 });
  }
}
