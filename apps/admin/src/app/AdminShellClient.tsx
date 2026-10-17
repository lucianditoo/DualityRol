"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Menu,
  X,
  Sparkles,
  Clock,
  LogOut,
  User,
} from "lucide-react";
import { AdminRole } from "@duality/database";
import { logoutAction } from "../lib/actions";

type AdminSection = "dashboard" | "products" | "inventory" | "orders" | "audit";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Productos", icon: Package, badge: "Paso 3" },
  { id: "inventory", label: "Inventario", icon: Boxes, badge: "Paso 5" },
  { id: "orders", label: "Pedidos & Retiros", icon: ShoppingBag, badge: "Paso 6" },
  { id: "audit", label: "Auditoría", icon: ShieldCheck, badge: "Paso 2 Activo" },
];

interface AdminShellClientProps {
  user: {
    id: string;
    email: string;
    role: AdminRole;
  };
}

export default function AdminShellClient({ user }: AdminShellClientProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-obsidian-900 text-celestial-ivory">
      {/* OVERLAY PARA MÓVIL CUANDO EL SIDEBAR ESTÁ ABIERTO */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-obsidian-950/80 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* BARRA LATERAL (SIDEBAR) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-obsidian-950 border-r border-obsidian-700/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Encabezado del Sidebar */}
          <div className="h-16 px-5 border-b border-obsidian-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 flex-shrink-0">
                <Image
                  src="/brand/dualidad_emblema.webp"
                  alt="Duality Rol Emblema"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-sm tracking-wider uppercase text-celestial-ivory">
                  Duality Rol
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-gold-400">
                  Panel Comercial
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-md text-celestial-silver hover:text-celestial-ivory hover:bg-obsidian-800 lg:hidden"
              aria-label="Cerrar navegación"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Estado de red y operador */}
          <div className="p-3 mx-3 my-3 rounded-lg bg-obsidian-900/90 border border-obsidian-800 text-[11px] flex items-center justify-between text-celestial-silver">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="font-mono truncate">{user.email}</span>
            </div>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20 flex-shrink-0">
              {user.role}
            </span>
          </div>

          {/* Menú de Navegación */}
          <nav className="px-3 space-y-1" aria-label="Navegación administrativa">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gold-500/15 text-gold-300 border border-gold-500/40 shadow-sm"
                      : "text-celestial-silver hover:bg-obsidian-900 hover:text-celestial-ivory border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-gold-400" : "text-celestial-muted"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-obsidian-800 text-gold-400/80 border border-obsidian-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar con Logout Seguro */}
        <div className="p-4 border-t border-obsidian-800 bg-obsidian-950/60 space-y-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-obsidian-900 hover:bg-rose-950/40 border border-obsidian-750 hover:border-rose-500/40 text-celestial-silver hover:text-rose-300 text-xs font-medium transition-all group"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Cerrar Sesión</span>
            </button>
          </form>

          <div className="flex items-start gap-2 text-[10px] text-celestial-muted leading-tight">
            <Lock className="w-3 h-3 text-gold-400 flex-shrink-0 mt-0.5" />
            <span>Sesión opaca autenticada y revocable en servidor.</span>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Barra superior de la vista */}
        <header className="h-16 bg-obsidian-950/80 backdrop-blur-md border-b border-obsidian-800 px-4 sm:px-6 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-celestial-silver hover:text-celestial-ivory hover:bg-obsidian-850 border border-obsidian-700 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-serif tracking-wider uppercase text-celestial-ivory">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-800/80 border border-obsidian-700 text-xs text-celestial-silver">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Autenticación Verificada (Paso 2)</span>
            </div>
          </div>
        </header>

        {/* Área scrolleable de trabajo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* VISTA 1: DASHBOARD */}
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                <div className="relative rounded-2xl bg-gradient-to-r from-obsidian-850 via-obsidian-800 to-obsidian-850 border border-gold-500/30 p-6 sm:p-8 overflow-hidden shadow-gold-glow">
                  <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Sesión Activa Segura
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif tracking-wide text-celestial-ivory">
                      Bienvenido al Panel de Control de Duality Rol
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-celestial-silver font-light leading-relaxed">
                      Has ingresado como <strong>{user.email}</strong> ({user.role}). La sesión está verificada en tiempo real contra PostgreSQL mediante tokens opacos SHA-256 y cookies HttpOnly.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-xl bg-obsidian-850 border border-obsidian-700 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-celestial-silver">
                      <span>Catálogo Activo</span>
                      <Package className="w-4 h-4 text-gold-400" />
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-serif text-celestial-ivory font-semibold">
                        7 Categorías
                      </span>
                      <span className="block text-[10px] text-celestial-muted mt-1">
                        Persistidas en PostgreSQL local
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-obsidian-850 border border-obsidian-700 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-celestial-silver">
                      <span>Inventario</span>
                      <Boxes className="w-4 h-4 text-gold-400" />
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-serif text-celestial-ivory font-semibold">
                        Paso 3 & 5
                      </span>
                      <span className="block text-[10px] text-celestial-muted mt-1">
                        En espera de formularios de alta
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-obsidian-850 border border-obsidian-700 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-celestial-silver">
                      <span>Pedidos y Retiros</span>
                      <ShoppingBag className="w-4 h-4 text-gold-400" />
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-serif text-celestial-ivory font-semibold">
                        Paso 6
                      </span>
                      <span className="block text-[10px] text-celestial-muted mt-1">
                        Coordinación vía WhatsApp y código
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-obsidian-850 border border-obsidian-700 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs text-celestial-silver">
                      <span>Seguridad</span>
                      <Lock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-serif text-emerald-400 font-semibold">
                        Protegido
                      </span>
                      <span className="block text-[10px] text-celestial-muted mt-1">
                        Sesión revocable individualmente
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OTRAS SECCIONES */}
            {activeSection !== "dashboard" && (
              <div className="rounded-xl bg-obsidian-850 border border-obsidian-700 p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-14 h-14 rounded-full bg-obsidian-800 border border-gold-500/30 flex items-center justify-center mb-4 text-gold-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif tracking-wider uppercase text-celestial-ivory">
                  Sección en Preparación ({NAV_ITEMS.find((n) => n.id === activeSection)?.label})
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-celestial-silver max-w-md font-light leading-relaxed">
                  Esta vista se implementará en los pasos siguientes de la Fase 3 sobre la base de autenticación segura ya activa.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
