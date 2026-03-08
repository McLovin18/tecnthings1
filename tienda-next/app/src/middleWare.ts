
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "../lib/firebase-admin";

const protectedRoutes = ["/home", "/admin"];

export async function middleware(req: NextRequest) {
  const session = req.cookies.get("session");

  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      // Decodifica el token para obtener el rol
      const decoded = await adminAuth.verifySessionCookie(session.value, true);
      if (req.nextUrl.pathname.startsWith("/admin") && decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/home", req.url));
      }
    } catch (e) {
      // Si el token es inválido, redirige a login
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/admin/:path*"],
};
