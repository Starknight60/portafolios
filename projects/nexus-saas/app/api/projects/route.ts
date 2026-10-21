import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    const session = await getCurrentUser();
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Buscar la membresía del usuario para obtener su organización
    const member = await prisma.organizationMember.findFirst({
        where: { userId: session.userId },
        include: {
            organization: {
                include: {
                    projects: {
                        include: { tasks: true },
                        orderBy: { createdAt: "desc" },
                    },
                },
            },
        },
    });

    if (!member) {
        return NextResponse.json({ projects: [] });
    }

    return NextResponse.json({ projects: member.organization.projects });
}

export async function POST(req: NextRequest) {
    const session = await getCurrentUser();
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { name, description, key } = await req.json();

    if (!name || !key) {
        return NextResponse.json({ error: "Nombre y clave son obligatorios" }, { status: 400 });
    }

    const member = await prisma.organizationMember.findFirst({
        where: { userId: session.userId },
    });

    if (!member) {
        return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    // Crear proyecto en PostgreSQL y registrar en Auditoría
    const result = await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                name,
                description,
                key: key.toUpperCase(),
                organizationId: member.organizationId,
            },
        });

        await tx.auditLog.create({
            data: {
                action: "PROJECT_CREATED",
                entityType: "PROJECT",
                details: `Proyecto ${project.name} (${project.key}) creado por ${session.email}`,
                userId: session.userId,
            },
        });

        return project;
    });

    return NextResponse.json({ success: true, project: result });
}