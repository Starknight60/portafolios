import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
    const session = await getCurrentUser();
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const member = await prisma.organizationMember.findFirst({
        where: { userId: session.userId },
        include: {
            organization: {
                include: {
                    members: { include: { user: true } },
                    projects: { include: { tasks: true } },
                },
            },
        },
    });

    if (!member) {
        return NextResponse.json({ error: "Organización no encontrada" }, { status: 404 });
    }

    // Traer los últimos 6 logs de auditoría de PostgreSQL
    const auditLogs = await prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { user: true },
    });

    const totalTasks = member.organization.projects.reduce((acc, p) => acc + p.tasks.length, 0);

    return NextResponse.json({
        user: { name: session.name, email: session.email, role: session.role },
        organization: {
            name: member.organization.name,
            plan: member.organization.plan,
            memberCount: member.organization.members.length,
            projectCount: member.organization.projects.length,
            taskCount: totalTasks,
        },
        projects: member.organization.projects,
        auditLogs,
    });
}