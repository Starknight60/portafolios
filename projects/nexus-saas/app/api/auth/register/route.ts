import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, orgName } = await req.json();

        if (!name || !email || !password || !orgName) {
            return NextResponse.json(
                { error: "Todos los campos son obligatorios." },
                { status: 400 }
            );
        }

        // Verificar si el correo ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Este correo electrónico ya está registrado." },
                { status: 409 }
            );
        }

        // Encriptar contraseña
        const hashedPassword = await hashPassword(password);
        const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(100 + Math.random() * 900);

        // Transacción atómica: Crear Organización, Usuario, Membresía y Log de Auditoría
        const result = await prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name: orgName,
                    slug: orgSlug,
                    plan: "ENTERPRISE",
                },
            });

            const user = await tx.user.create({
                data: {
                    name,
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    role: "ADMIN",
                },
            });

            await tx.organizationMember.create({
                data: {
                    userId: user.id,
                    organizationId: org.id,
                    role: "OWNER",
                },
            });

            await tx.auditLog.create({
                data: {
                    action: "USER_REGISTERED",
                    entityType: "USER",
                    details: `Usuario ${user.email} creó la organización ${org.name}`,
                    userId: user.id,
                },
            });

            return { user, org };
        });

        // Crear token JWT y asignar Cookie HttpOnly
        const token = await createSessionToken({
            userId: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
        });

        const response = NextResponse.json({
            success: true,
            user: { id: result.user.id, name: result.user.name, email: result.user.email },
        });

        response.cookies.set({
            name: COOKIE_NAME,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 días
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("Error en registro:", error);
        return NextResponse.json(
            { error: "Error en el servidor al registrar usuario." },
            { status: 500 }
        );
    }
}