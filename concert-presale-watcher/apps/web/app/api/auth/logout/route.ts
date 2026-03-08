import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "../../../../lib/auth";
import { env } from "../../../../lib/env";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
