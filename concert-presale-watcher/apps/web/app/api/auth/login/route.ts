import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isAuthConfigured, verifyPassword } from "../../../../lib/auth";
import { env } from "../../../../lib/env";

export const runtime = "nodejs";

interface LoginRequest {
  password?: string;
}

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Auth is not configured" }, { status: 500 });
  }

  const body = (await request.json()) as LoginRequest;
  if (!body.password || !verifyPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: env.authCookieValue as string,
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
