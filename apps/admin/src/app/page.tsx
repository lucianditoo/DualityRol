import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Boxes,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Clock,
  ArrowRight,
  Plus,
  Layers,
} from "lucide-react";
import { prisma } from "@duality/database";
import { validateCurrentSession } from "../lib/auth";
import AdminLayoutShell from "../components/AdminLayoutShell";

interface AdminHomePageProps {
  searchParams: Promise<{ section?: string }>;
}

export default async function AdminHomePage({ searchParams }: AdminHomePageProps) {
  const session = await validateCurrentSession();

  if (!session.valid || !session.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const section = params.section || "dashboard";

  const isSuperAdmin = session.user.role === "SUPERADMIN";

  // Obtener métricas reales desde PostgreSQL (AuditLog solo se consulta si el usuario es SUPERADMIN)
  const [totalCategories, totalProducts, activeProducts, totalVariants, recentAudits] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.count(),
      isSuperAdmin && section === "audit"
        ? prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 15,
            include: {
              adminUser: {
                select: { email: true, role: true },
              },
            },
          })
        : Promise.resolve([]),
    ]);

  const sectionTitle =
    section === "inventory"
      ? "Inventario"
      : section === "orders"
      ? "Pedidos y Retiros"
      : section === "audit"
      ? "Registro de Auditoría"
      : "Dashboard Operativo";

  return (
    <AdminLayoutShell
      user={session.user}
      title={sectionTitle}
      subtitle="Panel de Gestión Comercial Duality Rol"
      actionButton={
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 border border-gold-500/30 text-gold-300 text-xs font-medium transition-all"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Ir a Productos</span>
        </Link>
      }
    >
      {section === "dashboard" && (
        <div className="space-y-6">
          <div className="relative rounded-2xl bg-gradient-to-r from-obsidian-850 via-obsidian-800 to-obsidian-850 border border-gold-500/30 p-6 sm:p-8 overflow-hidden shadow-gold-glow">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Sesión Activa · Paso 3 Habilitado
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif tracking-wide text-celestial-ivory">
                Bienvenido al Panel de Control de Duality Rol
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-celestial-silver font-light leading-relaxed">
                Operador autenticado: <strong>{session.user.email}</strong> ({session.user.role}).
                Desde aquí podés administrar el catálogo de productos reales, variantes, precios soberanos en ARS y control de stock.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs uppercase tracking-wider transition-all shadow-gold-glow"
                >
                  <Package className="w-4 h-4" />
                  <span>Administrar Productos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/products/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-700 text-celestial-ivory text-xs uppercase tracking-wider transition-all"
                >
                  <Plus className="w-4 h-4 text-gold-400" />
                  <span>Crear Producto</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/products"
              className="p-5 rounded-xl bg-obsidian-850 border border-obsidian-700 hover:border-gold-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-xs text-celestial-silver">
                <span>Productos en Catálogo</span>
                <Package className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-serif text-celestial-ivory font-semibold">
                  {totalProducts} Productos
                </span>
                <span className="block text-[10px] text-emerald-400 mt-1">
                  {activeProducts} activos · {totalVariants} variantes
                </span>
              </div>
            </Link>

            <div className="p-5 rounded-xl bg-obsidian-850 border border-obsidian-700 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-celestial-silver">
                <span>Categorías Oficiales</span>
                <Layers className="w-4 h-4 text-gold-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-serif text-celestial-ivory font-semibold">
                  {totalCategories} Categorías
                </span>
                <span className="block text-[10px] text-celestial-muted mt-1">
                  Sincronizadas en PostgreSQL
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
                <span>Seguridad y Auditoría</span>
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-serif text-emerald-400 font-semibold">
                  Protegido
                </span>
                <span className="block text-[10px] text-celestial-muted mt-1">
                  Sesión opaca + Trazabilidad AuditLog
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {section === "audit" && (
        !isSuperAdmin ? (
          <div className="rounded-xl bg-obsidian-850 border border-rose-500/30 p-8 text-center flex flex-col items-center justify-center min-h-[320px]">
            <div className="w-12 h-12 rounded-full bg-rose-950/50 border border-rose-500/40 flex items-center justify-center mb-4 text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif tracking-wider uppercase text-celestial-ivory">
              Acceso Restringido a Superadministradores
            </h3>
            <p className="mt-2 text-xs text-celestial-silver max-w-md leading-relaxed">
              La consulta completa de registros de auditoría (<code className="font-mono text-gold-300">AuditLog</code>) está reservada exclusivamente para cuentas con rol <strong>SUPERADMIN</strong>.
            </p>
          </div>
        ) : (
        <div className="rounded-xl bg-obsidian-850 border border-obsidian-700 overflow-hidden">
          <div className="p-5 border-b border-obsidian-750 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif uppercase tracking-wider text-celestial-ivory">
                Últimos Eventos de Auditoría (AuditLog)
              </h3>
              <p className="text-xs text-celestial-muted mt-0.5">
                Registro inmutable de operaciones de seguridad y catálogo en PostgreSQL.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-obsidian-750 bg-obsidian-900/60 text-[10px] uppercase font-mono tracking-wider text-celestial-muted">
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Acción</th>
                  <th className="py-3 px-4">Entidad</th>
                  <th className="py-3 px-4">Operador</th>
                  <th className="py-3 px-4">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-800">
                {recentAudits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-celestial-muted">
                      No hay registros de auditoría recientes.
                    </td>
                  </tr>
                ) : (
                  recentAudits.map((log) => (
                    <tr key={log.id} className="hover:bg-obsidian-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-celestial-silver whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("es-AR")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-gold-500/10 text-gold-300 border border-gold-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-celestial-ivory">
                        {log.entity}
                        {log.entityId && (
                          <span className="block text-[10px] font-mono text-celestial-muted">
                            ID: {log.entityId.slice(0, 12)}...
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-celestial-silver">
                        {log.adminUser?.email || "Sistema"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-celestial-muted max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )
      )}

      {(section === "inventory" || section === "orders") && (
        <div className="rounded-xl bg-obsidian-850 border border-obsidian-700 p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
          <div className="w-14 h-14 rounded-full bg-obsidian-800 border border-gold-500/30 flex items-center justify-center mb-4 text-gold-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif tracking-wider uppercase text-celestial-ivory">
            Sección en Preparación ({sectionTitle})
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-celestial-silver max-w-md font-light leading-relaxed">
            Esta vista dedicada se implementará en los Pasos 5 y 6 de la Fase 3. Actualmente podés gestionar productos, variantes y su stock desde la sección{" "}
            <Link href="/products" className="text-gold-400 underline hover:text-gold-300">
              Productos
            </Link>
            .
          </p>
        </div>
      )}
    </AdminLayoutShell>
  );
}
