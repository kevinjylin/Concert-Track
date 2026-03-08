import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "./lib/env";

const isAuthEnabled = Boolean(
  (env.authUsername && env.authPassword) ||
    (env.googleClientId && env.googleClientSecret),
);

const isStaticAsset = (pathname: string): boolean => {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/vercel.svg") ||
    pathname.startsWith("/next.svg") ||
    pathname.startsWith("/window.svg") ||
    pathname.startsWith("/globe.svg") ||
    pathname.startsWith("/file-text.svg") ||
    pathname.startsWith("/turborepo-")
  );
};

export async function proxy(request: NextRequest) {
  if (!isAuthEnabled) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || pathname.startsWith("/api/auth") || pathname === "/api/health") {
    return NextResponse.next();
  }

  if (pathname === "/api/poll") {
    const header = request.headers.get("x-poll-secret") ?? request.headers.get("authorization");
    const expected = env.pollSecret;

    if (expected && (header === expected || header === `Bearer ${expected}`)) {
      return NextResponse.next();
    }
  }

  const token = await getToken({
    req: request,
    secret: env.authSecret,
  });

  const isAuthenticated = Boolean(token);

  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
