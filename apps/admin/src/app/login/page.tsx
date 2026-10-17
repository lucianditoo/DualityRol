"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Lock, Mail, KeyRound, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { loginAction, LoginActionState } from "@/lib/actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<LoginActionState, FormData>(
    loginAction,
    {}
  );

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col justify-center items-center p-4 sm:p-6 relative select-none">
      {/* Resplandor astronómico sutil en el fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Cabecera con Emblema Duality Rol */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative h-16 w-16 mb-3">
            <Image
              src="/brand/dualidad_emblema.webp"
              alt="Duality Rol Emblema"
              fill
              priority
              sizes="64px"
              className="object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif tracking-wider uppercase text-celestial-ivory">
            Duality Rol
          </h1>
          <p className="text-xs uppercase font-mono tracking-widest text-gold-400 mt-1">
            Panel de Acceso Operativo
          </p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-obsidian-900 border border-obsidian-750 text-[10px] text-celestial-silver mt-3">
            <ShieldCheck className="w-3 h-3 text-gold-400" />
            Entorno Aislado · 127.0.0.1:3001
          </span>
        </div>

        {/* Tarjeta del Formulario de Login */}
        <div className="bg-obsidian-900 border border-obsidian-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <form action={formAction} className="space-y-5">
            {/* Mensaje de Error Genérico */}
            {state?.error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{state.error}</span>
              </div>
            )}

            {/* Campo: Correo Electrónico */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-wider text-celestial-silver font-medium mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-celestial-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="operador@dualityrol.com"
                  disabled={isPending}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-obsidian-850 border border-obsidian-700 text-celestial-ivory placeholder-celestial-muted text-xs focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-wider text-celestial-silver font-medium mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-celestial-muted">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  disabled={isPending}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-obsidian-850 border border-obsidian-700 text-celestial-ivory placeholder-celestial-muted text-xs focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Botón de Envío con Estado de Carga */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-obsidian-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-gold-glow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-obsidian-950" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ingresar al Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Advertencia de Seguridad */}
          <div className="mt-6 pt-5 border-t border-obsidian-800 text-center">
            <p className="text-[11px] text-celestial-muted leading-relaxed">
              Acceso restringido a operadores comerciales autorizados. Todos los intentos de inicio de sesión son registrados con IP y marca de tiempo con fines de auditoría.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
