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
  ChevronRight,
  Menu,
  X,
  Sparkles,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";

type AdminSection = "dashboard" | "products" | "inventory" | "orders" | "audit";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Productos", icon: Package, badge: "Fase 3" },
  { id: "inventory", label: "Inventario", icon: Boxes, badge: "Fase 3" },
  { id: "orders", label: "Pedidos & Retiros", icon: ShoppingBag, badge: "Fase 3" },
  { id: "audit", label: "Auditoría", icon: ShieldCheck, badge: "Fase 3" },
];

export default function AdminShellPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-obsidian-900 text-celestial-ivory">
      {/* ==================================================================== */}
      {/* OVERLAY PARA MÓVIL CUANDO EL SIDEBAR ESTÁ ABIERTO */}
      {/* ==================================================================== */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-obsidian-950/80 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* ==================================================================== */}
      {/* BARRA LATERAL (SIDEBAR) */}
      {/* ==================================================================== */}
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

          {/* Estado de red y entorno */}
          <div className="p-3 mx-3 my-3 rounded-lg bg-obsidian-900/90 border border-obsidian-800 text-[11px] flex items-center gap-2 text-celestial-silver">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="font-mono truncate">127.0.0.1:3001 (Aislado)</span>
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

        {/* Footer del Sidebar con aviso de seguridad */}
        <div className="p-4 border-t border-obsidian-800 bg-obsidian-950/60">
          <div className="flex items-start gap-2 text-[11px] text-celestial-muted leading-tight">
            <Lock className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" />
            <span>
              Entorno administrativo seguro. Autenticación de servidor requerida para operaciones.
            </span>
          </div>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ==================================================================== */}
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
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Paso 1: Shell & Layout</span>
            </div>
          </div>
        </header>

        {/* Área scrolleable de trabajo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* VISTA 1: DASHBOARD / SHELL BASE */}
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                {/* Banner de Bienvenida y Estado de la Fase */}
                <div className="relative rounded-2xl bg-gradient-to-r from-obsidian-850 via-obsidian-800 to-obsidian-850 border border-gold-500/30 p-6 sm:p-8 overflow-hidden shadow-gold-glow">
                  <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-3">
                      <Sparkles className="w-3 h-3 text-gold-400" />
                      Fase 3 · Paso 1 Inicializado
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif tracking-wide text-celestial-ivory">
                      Bienvenido al Shell Administrativo de Duality Rol
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-celestial-silver font-light leading-relaxed">
                      Estructura modular del panel comercial lista. Este entorno opera exclusivamente en localhost (`127.0.0.1:3001`), aislado de la tienda pública y preparado para la integración de autenticación por servidor.
                    </p>
                  </div>
                </div>

                {/* Métricas de demostración del Shell (Sin exponer datos sensibles) */}
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
                        Aislado
                      </span>
                      <span className="block text-[10px] text-celestial-muted mt-1">
                        Sin datos privados expuestos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hoja de Ruta de la Fase 3 */}
                <div className="rounded-xl bg-obsidian-850 border border-obsidian-700 p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-obsidian-750 mb-4">
                    <h3 className="font-serif text-base tracking-wider uppercase text-celestial-ivory">
                      Hoja de Ruta: Implementación del Administrador
                    </h3>
                    <span className="text-xs font-mono text-gold-400">Fase 3</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-900 border border-gold-500/40">
                      <span className="w-5 h-5 rounded-full bg-gold-500 text-obsidian-950 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        ✓
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-celestial-ivory">
                          Paso 1: Configuración de Layout, Shell y Navegación
                        </h4>
                        <p className="text-xs text-celestial-silver mt-0.5 font-light">
                          Estructura modular con Next.js App Router, Tailwind CSS, barra lateral y diseño responsive.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-900/60 border border-obsidian-800">
                      <span className="w-5 h-5 rounded-full bg-obsidian-800 text-celestial-silver text-xs font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-celestial-ivory">
                          Paso 2: Autenticación por Servidor & Sesiones Revocables
                        </h4>
                        <p className="text-xs text-celestial-silver mt-0.5 font-light">
                          Login con cookies HTTP-only, tokens JWT (`jose`), hash seguro `bcrypt` y protección de rutas.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-900/60 border border-obsidian-800">
                      <span className="w-5 h-5 rounded-full bg-obsidian-800 text-celestial-silver text-xs font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-celestial-ivory">
                          Paso 3: Gestión de Productos y Variantes (CRUD)
                        </h4>
                        <p className="text-xs text-celestial-silver mt-0.5 font-light">
                          Formularios validados con Zod para alta/edición de piezas, precios en ARS y trazabilidad con AuditLog.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-900/60 border border-obsidian-800">
                      <span className="w-5 h-5 rounded-full bg-obsidian-800 text-celestial-silver text-xs font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                        4
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-celestial-ivory">
                          Paso 4: Carga y Procesamiento Local de Imágenes (Sharp)
                        </h4>
                        <p className="text-xs text-celestial-silver mt-0.5 font-light">
                          Subida a volumen persistente (`media_data`), límite estricto de 5 MB y conversión a WebP optimizado.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-900/60 border border-obsidian-800">
                      <span className="w-5 h-5 rounded-full bg-obsidian-800 text-celestial-silver text-xs font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                        5
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-celestial-ivory">
                          Paso 5: Vista de Inventario & Control de Stock
                        </h4>
                        <p className="text-xs text-celestial-silver mt-0.5 font-light">
                          Alertas de stock crítico y ajuste atómico con registro de motivo de auditoría.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-900/60 border border-obsidian-800">
                      <span className="w-5 h-5 rounded-full bg-obsidian-800 text-celestial-silver text-xs font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
                        6
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-celestial-ivory">
                          Paso 6: Gestión de Pedidos & Retiros Acordados
                        </h4>
                        <p className="text-xs text-celestial-silver mt-0.5 font-light">
                          Seguimiento de estados de retiro presencial, verificación por código de seguridad y contacto directo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VISTAS MODULARES EN ESPERA DE IMPLEMENTACIÓN EN PASOS 2 A 6 */}
            {activeSection !== "dashboard" && (
              <div className="rounded-xl bg-obsidian-850 border border-obsidian-700 p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-14 h-14 rounded-full bg-obsidian-800 border border-gold-500/30 flex items-center justify-center mb-4 text-gold-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-serif tracking-wider uppercase text-celestial-ivory">
                  Sección en Preparación ({NAV_ITEMS.find((n) => n.id === activeSection)?.label})
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-celestial-silver max-w-md font-light leading-relaxed">
                  Esta vista se implementará en los pasos siguientes de la Fase 3, tras habilitar la autenticación de operadores verificada por el servidor.
                </p>
                <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-750 text-xs font-mono text-celestial-muted">
                  <Lock className="w-3.5 h-3.5 text-gold-400" />
                  <span>Protección estricta: Ningún dato comercial real es expuesto sin sesión</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
