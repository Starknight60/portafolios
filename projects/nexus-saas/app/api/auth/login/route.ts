import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Ingresa tu correo y contraseña." },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Credenciales inválidas." },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: "Credenciales inválidas." },
                { status: 401 }
            );
        }

        // Token JWT
        const token = await createSessionToken({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        });

        const response = NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email },
        });

        response.cookies.set({
            name: COOKIE_NAME,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("Error en login:", error);
        return NextResponse.json(
            { error: "Error interno al procesar el acceso." },
            { status: 500 }
        );
    }
}