"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Menu,
  X,
  LogOut,
  Plus,
} from "lucide-react";
import { AdminRole } from "@duality/database";
import { logoutAction } from "../lib/actions";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
  { id: "products", label: "Productos", href: "/products", icon: Package, badge: "Activo" },
  { id: "inventory", label: "Inventario", href: "/?section=inventory", icon: Boxes, badge: "Paso 5" },
  { id: "orders", label: "Pedidos & Retiros", href: "/?section=orders", icon: ShoppingBag, badge: "Paso 6" },
  { id: "audit", label: "Auditoría", href: "/?section=audit", icon: ShieldCheck, badge: "Activo" },
];

export interface AdminLayoutShellProps {
  user: {
    id: string;
    email: string;
    role: AdminRole;
  };
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminLayoutShell({
  user,
  title,
  subtitle,
  actionButton,
  children,
}: AdminLayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isNavItemActive = (item: NavItem) => {
    if (item.id === "products") {
      return pathname.startsWith("/products");
    }
    if (item.id === "dashboard") {
      return pathname === "/";
    }
    return false;
  };

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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-8 w-8 flex-shrink-0">
                <Image
                  src="/brand/dualidad_emblema.webp"
                  alt="Duality Rol Emblema"
                  fill
                  sizes="32px"
                  className="object-contain group-hover:scale-105 transition-transform"
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
            </Link>

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

          {/* Acceso Rápido: Nuevo Producto */}
          <div className="px-3 mb-3">
            <Link
              href="/products/new"
              onClick={() => setIsSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs uppercase tracking-wider transition-all shadow-gold-glow"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Producto</span>
            </Link>
          </div>

          {/* Menú de Navegación */}
          <nav className="px-3 space-y-1" aria-label="Navegación administrativa">
            {NAV_ITEMS.filter(
              (item) => item.id !== "audit" || user.role === "SUPERADMIN"
            ).map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gold-500/15 text-gold-300 border border-gold-500/40 shadow-sm"
                      : "text-celestial-silver hover:bg-obsidian-900 hover:text-celestial-ivory border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-gold-400" : "text-celestial-muted"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                        item.badge === "Activo"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                          : "bg-obsidian-800 text-gold-400/80 border-obsidian-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
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
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg text-celestial-silver hover:text-celestial-ivory hover:bg-obsidian-850 border border-obsidian-700 lg:hidden flex-shrink-0"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h1 className="text-base sm:text-lg font-serif tracking-wider uppercase text-celestial-ivory truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[11px] text-celestial-muted truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {actionButton}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-800/80 border border-obsidian-700 text-xs text-celestial-silver">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protegido</span>
            </div>
          </div>
        </header>

        {/* Área scrolleable de trabajo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
