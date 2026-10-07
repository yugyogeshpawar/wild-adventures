import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // If visiting /admin/login
  if (pathname === "/admin/login") {
    // If already authenticated, redirect to /admin/dashboard
    if (session) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl") || "/admin/dashboard";
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.next();
  }

  // All other /admin routes require authentication
  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    const fullCallbackPath = pathname + search;
    loginUrl.searchParams.set("callbackUrl", fullCallbackPath);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
