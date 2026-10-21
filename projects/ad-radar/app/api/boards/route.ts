import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

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
      take: 20,
    });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error("Error al obtener tableros:", error);
    return NextResponse.json({ error: "Error al obtener tableros" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rateCheck = checkRateLimit(`board_action_${ip}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Demasiadas acciones. Por favor espera." }, { status: 429 });
    }

    const body = await request.json();
    const { action, title, description, colorTag, boardId, adId, userNote } = body;

    // Acción 1: Crear nuevo tablero
    if (action === "create_board") {
      if (!title || typeof title !== "string") {
        return NextResponse.json({ error: "Título requerido" }, { status: 400 });
      }

      const newBoard = await prisma.board.create({
        data: {
          title: title.trim().slice(0, 100),
          description: description ? String(description).trim().slice(0, 300) : null,
          colorTag: colorTag ? String(colorTag).slice(0, 20) : "#6366f1",
        },
      });
      return NextResponse.json({ board: newBoard }, { status: 201 });
    }

    // Acción 2: Guardar anuncio en tablero
    if (action === "save_ad") {
      if (!boardId || typeof boardId !== "string" || !adId || typeof adId !== "string") {
        return NextResponse.json({ error: "boardId y adId requeridos" }, { status: 400 });
      }

      const item = await prisma.boardItem.upsert({
        where: {
          boardId_adId: {
            boardId,
            adId,
          },
        },
        update: {
          userNote: userNote ? String(userNote).trim().slice(0, 500) : undefined,
        },
        create: {
          boardId,
          adId,
          userNote: userNote ? String(userNote).trim().slice(0, 500) : null,
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
      if (!boardId || !adId) {
        return NextResponse.json({ error: "boardId y adId requeridos" }, { status: 400 });
      }
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
  } catch (error) {
    console.error("Error en operación de tablero:", error);
    return NextResponse.json({ error: "Error al procesar tablero" }, { status: 500 });
  }
}
