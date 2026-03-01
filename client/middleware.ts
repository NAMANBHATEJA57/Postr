import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Extract token from cookies
    const token = request.cookies.get("token")?.value;

    const { pathname } = request.nextUrl;

    // Define protected routes that require authentication
    const isProtectedRoute =
        pathname === "/dashboard" ||
        pathname.startsWith("/conversation/");

    // Define authentication routes that logged-in users shouldn't access
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    if (isProtectedRoute && !token) {
        // Redirect unauthenticated users to login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthRoute && token) {
        // Redirect authenticated users trying to access login/register to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard",
        "/conversation/:path*",
        "/login",
        "/register",
    ],
};
