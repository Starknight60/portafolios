import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "nexus-enterprise-secret-key-super-secure-2026"
);

const COOKIE_NAME = "nexus_session";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const sessionToken = req.cookies.get(COOKIE_NAME)?.value;

    let isValidSession = false;
    if (sessionToken) {
        try {
            await jwtVerify(sessionToken, JWT_SECRET);
            isValidSession = true;
        } catch {
            isValidSession = false;
        }
    }

    // 1. Si intenta entrar a cualquier ruta de /dashboard sin sesión, redirigir a /login
    if (pathname.startsWith("/dashboard")) {
        if (!isValidSession) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 2. Si ya tiene sesión activa e intenta ir a /login o /register, mandarlo directo al /dashboard
    if (pathname === "/login" || pathname === "/register") {
        if (isValidSession) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
}

// Configurar sobre qué rutas se ejecuta este Middleware
export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};