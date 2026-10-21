import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error en me:", error);
    return NextResponse.json({ user: null });
  }
}
