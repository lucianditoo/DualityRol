"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginSchema } from "@duality/config-contracts";
import {
  authenticateCredentials,
  createSession,
  revokeCurrentSession,
  getClientIp,
  getUserAgent,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "./auth";

export interface LoginActionState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  _prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  // Validación con esquema Zod
  const validation = AdminLoginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Datos de acceso inválidos.",
    };
  }

  const { email, password } = validation.data;
  const ipAddress = await getClientIp();
  const userAgent = await getUserAgent();

  // Autenticación en servidor con rate limiting y hash bcrypt
  const authResult = await authenticateCredentials(email, password, ipAddress);

  if (!authResult.success || !authResult.user) {
    return {
      error: authResult.error || "Credenciales no válidas o acceso deshabilitado.",
    };
  }

  // Crear sesión opaca en PostgreSQL
  const { token, expiresAt } = await createSession(
    authResult.user.id,
    ipAddress,
    userAgent
  );

  // Establecer cookie HttpOnly, SameSite, Secure
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await revokeCurrentSession();
  redirect("/login");
}
