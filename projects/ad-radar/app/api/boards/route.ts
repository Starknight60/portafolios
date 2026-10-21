import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // Si hay usuario logueado, traemos tableros del usuario + tableros globales
    const where: any = currentUser
      ? {
          OR: [{ userId: currentUser.id }, { userId: null }],
        }
      : {};

    const boards = await prisma.board.findMany({
      where,
      include: {
        user: {
          select: { name: true, company: true, avatarColor: true },
        },
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

    const currentUser = await getCurrentUser();
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
          userId: currentUser?.id || null,
        },
      });
      return NextResponse.json({ board: newBoard }, { status: 201 });
    }

    // Acción 2: Guardar anuncio en tablero
    if (action === "save_ad") {
      let targetBoardId = boardId;

      // Si no se proporcionó boardId o si el usuario quiere guardar en su tablero personal
      if (!targetBoardId) {
        if (currentUser) {
          // Buscar tablero del usuario o crear uno
          let userBoard = await prisma.board.findFirst({
            where: { userId: currentUser.id },
          });
          if (!userBoard) {
            userBoard = await prisma.board.create({
              data: {
                title: `Swipe File de ${currentUser.name.split(" ")[0]}`,
                description: "Colección privada de ideas publicitarias",
                userId: currentUser.id,
              },
            });
          }
          targetBoardId = userBoard.id;
        } else {
          // Fallback a primer tablero
          const firstBoard = await prisma.board.findFirst();
          if (firstBoard) targetBoardId = firstBoard.id;
        }
      }

      if (!targetBoardId || !adId || typeof adId !== "string") {
        return NextResponse.json({ error: "Parámetros requeridos inválidos" }, { status: 400 });
      }

      const item = await prisma.boardItem.upsert({
        where: {
          boardId_adId: {
            boardId: targetBoardId,
            adId,
          },
        },
        update: {
          userNote: userNote ? String(userNote).trim().slice(0, 500) : undefined,
        },
        create: {
          boardId: targetBoardId,
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
