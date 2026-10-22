import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/login", "/register", "/reset-password", "/set-password"];
const apiPublicRoutes = ["/api/auth"];

// Simple in-memory rate limiter for auth endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export default auth(function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = (request as unknown as { auth: { user?: unknown } | null }).auth;

  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isPublicApiRoute = apiPublicRoutes.some((route) => pathname.startsWith(route));

  // Rate limit auth API endpoints
  if (pathname.startsWith("/api/auth/register") || pathname.startsWith("/api/auth/reset-password")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/|screenshots/).*)"],
};
