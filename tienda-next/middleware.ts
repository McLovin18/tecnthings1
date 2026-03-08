import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas consideradas "públicas" (landing, blog, carrito, etc.)
const PUBLIC_EXACT: string[] = ["/", "/login"];
const PUBLIC_PREFIXES: string[] = [
  "/blogs",
  "/cart",
  "/product-detail",
  "/products-by-category",
  "/search-results",
  "/order-confirmation",
  "/settings",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session");
  const roleCookie = req.cookies.get("role")?.value;

  const isClientArea = pathname.startsWith("/home");
  const isAdminArea = pathname.startsWith("/admin");
  const publicPath = isPublicPath(pathname);

  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, req.url));

  // Sin sesión: se bloquean zonas protegidas (/home, /admin) y se redirige al landing
  if (!session) {
    if (isClientArea || isAdminArea) {
      return redirectTo("/");
    }
    return NextResponse.next();
  }

  const role = roleCookie as "client" | "admin" | undefined;

  // Usuario autenticado sin rol definido: no puede entrar a /home ni /admin
  if (!role) {
    if (isClientArea || isAdminArea) {
      return redirectTo("/login");
    }
    return NextResponse.next();
  }

  // Cliente autenticado
  if (role === "client") {
    // No puede entrar a admin
    if (isAdminArea) {
      return redirectTo("/home");
    }
    // No puede entrar a páginas públicas (landing, blogs, carrito, etc.) ni login
    if (publicPath) {
      return redirectTo("/home");
    }
  }

  // Admin autenticado
  if (role === "admin") {
    // No puede entrar a zona de cliente
    if (isClientArea) {
      return redirectTo("/admin");
    }
    // También redirigimos admin fuera de páginas públicas/login
    if (publicPath) {
      return redirectTo("/admin");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/admin/:path*",
    "/",
    "/login",
    "/blogs/:path*",
    "/cart/:path*",
    "/product-detail/:path*",
    "/products-by-category/:path*",
    "/search-results/:path*",
    "/order-confirmation/:path*",
    "/settings/:path*",
  ],
};
