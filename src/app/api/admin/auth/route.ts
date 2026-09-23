import { NextResponse } from "next/server";
import { adminCookie, createAdminCookie, validAdminCookie, validPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie")?.split(";").find((item) => item.trim().startsWith(`${adminCookie}=`))?.split("=")[1];
  return NextResponse.json({ authenticated: validAdminCookie(cookie) });
}

export async function POST(request: Request) {
  const body = await request.json() as { password?: string };
  if (!validPassword(body.password || "")) return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(adminCookie, createAdminCookie(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge, path: "/" });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.delete(adminCookie);
  return response;
}

const maxAge = 60 * 60 * 24 * 7;
