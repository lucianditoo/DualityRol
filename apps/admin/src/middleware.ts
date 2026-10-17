import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "duality_admin_session";

// Rutas públicas que no requieren autenticación previa
const PUBLIC_PATHS = ["/login", "/_next", "/brand", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir activos estáticos y página de login
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Comprobar presencia de la cookie de sesión
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    // Redirigir al login sin exponer contenido protegido
    return NextResponse.redirect(loginUrl);
  }

  // Si tiene token, el middleware permite el paso a la página/API,
  // donde el servidor valida criptográficamente que la sesión siga activa y no haya sido revocada.
  const response = NextResponse.next();
  // Evitar almacenamiento en cachés públicas o compartidas para rutas administrativas
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (si hubiera en el futuro)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
