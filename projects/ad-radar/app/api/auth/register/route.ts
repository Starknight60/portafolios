import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

const AVATAR_COLORS = [
  "#00D2EF", // Cyan
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Violet
];

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "client";
    const rateCheck = checkRateLimit(`register_${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos de registro. Por favor espera un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password, company } = body;

    // Validación básica de entrada
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "El nombre debe tener al menos 2 caracteres" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Introduce un correo electrónico válido" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim().slice(0, 60);
    const cleanCompany = company ? String(company).trim().slice(0, 80) : "Equipo de Marketing";

    // Verificar si el correo ya existe
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta registrada con este correo" }, { status: 409 });
    }

    // Hashear contraseña con bcrypt
    const hashedPassword = await hashPassword(password);
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    // Crear usuario en base de datos
    const newUser = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        company: cleanCompany,
        avatarColor: randomColor,
        role: "ANALYST",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        avatarColor: true,
      },
    });

    // Crear tablero privado por defecto para el usuario
    await prisma.board.create({
      data: {
        title: `Swipe File de ${cleanName.split(" ")[0]}`,
        description: "Mis anuncios y ganchos publicitarios guardados para análisis",
        colorTag: randomColor,
        userId: newUser.id,
      },
    });

    // Generar JWT
    const token = await createSessionToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      company: newUser.company,
    });

    const response = NextResponse.json(
      {
        message: "Cuenta creada exitosamente",
        user: newUser,
      },
      { status: 201 }
    );

    // Inyectar cookie HttpOnly segura
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    return response;
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error interno al procesar el registro" }, { status: 500 });
  }
}
