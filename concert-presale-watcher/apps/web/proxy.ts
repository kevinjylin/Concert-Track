import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isAuthConfigured, verifySessionValue } from "./lib/auth";
import { env } from "./lib/env";

const PUBLIC_PATHS = new Set(["/login", "/api/health", "/api/auth/login", "/api/auth/logout"]);

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

export function proxy(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/api/poll") {
    const header = request.headers.get("x-poll-secret") ?? request.headers.get("authorization");
    const expected = env.pollSecret;

    if (expected && (header === expected || header === `Bearer ${expected}`)) {
      return NextResponse.next();
    }
  }

  const cookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = verifySessionValue(cookie);

  if (isAuthenticated) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

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
