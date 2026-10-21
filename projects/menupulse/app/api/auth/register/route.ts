import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

const AVATAR_COLORS = ["#059669", "#D97706", "#2563EB", "#7C3AED", "#DC2626", "#047857"];

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rate = checkRateLimit(`register_${ip}`, 5, 60000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Límite de solicitudes alcanzado. Intente en un minuto." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password, company } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo corporativo." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        company: company ? String(company).trim() : "Restaurante Independiente",
        avatarColor: randomColor,
        role: "ANALYST",
      },
    });

    // Crear Watchlist por defecto para el nuevo usuario
    await prisma.watchlist.create({
      data: {
        userId: user.id,
        title: "Monitoreo Principal",
        notes: "Lista inicial para auditar sobreprecios y promociones en delivery.",
      },
    });

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        avatarColor: user.avatarColor,
      },
    });

    response.cookies.set("menupulse_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en register:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al crear la cuenta." },
      { status: 500 }
    );
  }
}
