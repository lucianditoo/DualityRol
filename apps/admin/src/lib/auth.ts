import { createHash, randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { prisma, AdminRole } from "@duality/database";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE_NAME = "duality_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

/**
 * POLÍTICA DE COOKIES Y DESPLIEGUE SEGURO (HTTPS / TAILSCALE):
 * -------------------------------------------------------------
 * 1. En desarrollo local (localhost / 127.0.0.1:3001), los navegadores rechazan cookies
 *    con el atributo 'Secure' si se sirven mediante HTTP plano. Por eso se evalúa
 *    'secure: process.env.NODE_ENV === "production"'.
 * 2. En producción dentro de la red privada:
 *    Tailscale cifra el túnel de red WireGuard de punto a punto, pero NO genera automáticamente
 *    un contexto HTTPS para el navegador web.
 * 3. En el despliegue final en servidor Linux, el acceso privado al panel administrativo
 *    deberá servirse con certificado TLS/HTTPS válido (por ejemplo mediante 'tailscale serve --https=443'
 *    o reverse proxy Nginx con certificados automáticos de MagicDNS).
 * 4. Al servirse bajo HTTPS, la cookie 'Secure' opera con cifrado estricto en tránsito,
 *    protegiendo la sesión de cualquier manipulación o intercepción.
 */

// Hashear token opaco para almacenamiento persistente
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface SessionValidationResult {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    role: AdminRole;
  };
  sessionId?: string;
}

// Validar credenciales y rate limiting
export async function authenticateCredentials(
  email: string,
  plainPassword: string,
  ipAddress: string
): Promise<{ success: boolean; user?: { id: string; email: string; role: AdminRole }; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Rate limiting contra fuerza bruta por IP (10 fallos) y por Correo (5 fallos) en ventana móvil de 15 minutos
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  const [recentIpFails, recentEmailFails] = await Promise.all([
    prisma.loginAttempt.count({
      where: {
        ipAddress,
        success: false,
        attemptedAt: { gte: fifteenMinutesAgo },
      },
    }),
    prisma.loginAttempt.count({
      where: {
        email: normalizedEmail,
        success: false,
        attemptedAt: { gte: fifteenMinutesAgo },
      },
    }),
  ]);

  if (recentIpFails >= 10 || recentEmailFails >= 5) {
    // Registrar intento bloqueado en base de datos para trazabilidad
    await prisma.loginAttempt.create({
      data: {
        ipAddress,
        email: normalizedEmail,
        success: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "LOGIN_RATE_LIMITED",
        entity: "AdminUser",
        ipAddress,
        details: {
          email: normalizedEmail,
          recentIpFails,
          recentEmailFails,
        },
      },
    });

    // Mensaje genérico uniforme sin revelar si la cuenta existe o si el bloqueo es por IP o usuario
    return {
      success: false,
      error: "Demasiados intentos fallidos. Por favor, esperá unos minutos antes de intentar de nuevo.",
    };
  }

  // 2. Buscar usuario administrador activo
  const user = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.isActive) {
    // Registrar intento fallido genérico
    await prisma.loginAttempt.create({
      data: {
        ipAddress,
        email: normalizedEmail,
        success: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "LOGIN_FAILED",
        entity: "AdminUser",
        ipAddress,
        details: { reason: "User not found or inactive" },
      },
    });

    return {
      success: false,
      error: "Credenciales no válidas o acceso deshabilitado.",
    };
  }

  // 3. Comparar contraseña con bcrypt
  const isMatch = await bcrypt.compare(plainPassword, user.passwordHash);

  if (!isMatch) {
    await prisma.loginAttempt.create({
      data: {
        ipAddress,
        email: normalizedEmail,
        success: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: user.id,
        action: "LOGIN_FAILED",
        entity: "AdminUser",
        entityId: user.id,
        ipAddress,
        details: { reason: "Invalid password" },
      },
    });

    return {
      success: false,
      error: "Credenciales no válidas o acceso deshabilitado.",
    };
  }

  // 4. Registrar intento exitoso
  await prisma.loginAttempt.create({
    data: {
      ipAddress,
      email: normalizedEmail,
      success: true,
    },
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

// Crear sesión opaca persistente
export async function createSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<{ token: string; expiresAt: Date }> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.$transaction([
    prisma.adminSession.create({
      data: {
        tokenHash,
        adminUserId: userId,
        ipAddress,
        userAgent: userAgent.slice(0, 300),
        expiresAt,
      },
    }),
    prisma.adminUser.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        adminUserId: userId,
        action: "LOGIN_SUCCESS",
        entity: "AdminSession",
        ipAddress,
        details: { userAgent: userAgent.slice(0, 100) },
      },
    }),
  ]);

  return { token: rawToken, expiresAt };
}

// Validar sesión actual desde cookies
export async function validateCurrentSession(): Promise<SessionValidationResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return { valid: false };
  }

  const tokenHash = hashToken(token);
  const now = new Date();

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { adminUser: true },
  });

  if (!session) {
    return { valid: false };
  }

  // Comprobar si fue revocada o si expiró
  if (session.revokedAt !== null || session.expiresAt <= now) {
    return { valid: false };
  }

  // Comprobar que el usuario siga activo
  if (!session.adminUser.isActive) {
    return { valid: false };
  }

  return {
    valid: true,
    user: {
      id: session.adminUser.id,
      email: session.adminUser.email,
      role: session.adminUser.role,
    },
    sessionId: session.id,
  };
}

// Revocar sesión actual (Logout)
export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash },
    });

    if (session && !session.revokedAt) {
      await prisma.$transaction([
        prisma.adminSession.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        }),
        prisma.auditLog.create({
          data: {
            adminUserId: session.adminUserId,
            action: "LOGOUT",
            entity: "AdminSession",
            entityId: session.id,
          },
        }),
      ]);
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Invalidar todas las sesiones activas de un usuario (para reseteo de seguridad)
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.adminSession.updateMany({
    where: {
      adminUserId: userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: userId,
      action: "ALL_SESSIONS_REVOKED",
      entity: "AdminUser",
      entityId: userId,
      details: { count: result.count },
    },
  });

  return result.count;
}

// Estrategia segura para obtención de IP:
// En desarrollo local o redes sin reverse proxy validado, confiar ciegamente en x-forwarded-for
// permitiría a un atacante eludir el rate limit enviando cabeceras arbitrarias (IP Spoofing).
// Por defecto, solo se procesan cabeceras proxy si TRUST_PROXY está explícitamente activado ('true' o '1').
// En despliegue local o directo, se asume '127.0.0.1' para evitar elusión de rate limit por falsificación.
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const trustProxy = process.env.TRUST_PROXY === "true" || process.env.TRUST_PROXY === "1";

  if (trustProxy) {
    const forwardedFor = headerStore.get("x-forwarded-for");
    if (forwardedFor) {
      // Tomar la primera IP de la cadena agregada por el proxy de entrada confiable
      const firstIp = forwardedFor.split(",")[0].trim();
      if (isValidIp(firstIp)) {
        return firstIp;
      }
    }
    const realIp = headerStore.get("x-real-ip");
    if (realIp && isValidIp(realIp.trim())) {
      return realIp.trim();
    }
  }

  // Comportamiento seguro por defecto (desarrollo local o sin proxy configurado)
  return "127.0.0.1";
}

function isValidIp(ip: string): boolean {
  // Validación estricta para formato IPv4 o IPv6 básico sin caracteres especiales
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// Obtener User-Agent
export async function getUserAgent(): Promise<string> {
  const headerStore = await headers();
  return headerStore.get("user-agent") || "unknown";
}
