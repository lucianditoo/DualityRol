import { NextResponse } from "next/server";
import { validateCurrentSession, revokeAllUserSessions } from "@/lib/auth";

// Endpoint de verificación de sesión y revocación remota
export async function GET() {
  const session = await validateCurrentSession();

  if (!session.valid || !session.user) {
    return NextResponse.json(
      { authenticated: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: session.user,
    sessionId: session.sessionId,
  });
}

export async function DELETE(request: Request) {
  // Verificación de Origin / Referer frente al Host para mitigar solicitudes Cross-Origin
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json(
          { error: "Solicitud de origen cruzado no permitida (Cross-Origin Forbidden)" },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Cabecera Origin inválida" },
        { status: 400 }
      );
    }
  }

  const session = await validateCurrentSession();

  if (!session.valid || !session.user) {
    return NextResponse.json(
      { authenticated: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  // Revocar todas las sesiones del usuario actual
  const count = await revokeAllUserSessions(session.user.id);

  return NextResponse.json({
    success: true,
    message: `Se revocaron ${count} sesiones activas del usuario.`,
  });
}
