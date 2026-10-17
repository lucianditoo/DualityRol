"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Eye,
  Power,
  Layers,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Sparkles,
  Hammer,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  X,
  Save,
  Trash2,
  Loader2,
} from "lucide-react";
import { AdminRole } from "@duality/database";
import {
  toggleProductStatusAction,
  toggleVariantStatusAction,
  updateSingleVariantAction,
  deleteProductAction,
  deleteVariantAction,
} from "../../lib/product-actions";

export interface SerializedVariant {
  id: string;
  name: string;
  sku: string;
  priceAdjustmentArs: number;
  stock: number;
  isActive: boolean;
  hasReferences: boolean;
}

export interface SerializedProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePriceArs: number;
  isSelfMade: boolean;
  isDualityCreation: boolean;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  thumbnailUrl: string | null;
  variants: SerializedVariant[];
  hasOrderReferences: boolean;
  createdAt: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductsTableClientProps {
  products: SerializedProduct[];
  categories: CategoryOption[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentCategory: string;
  currentStatus: string;
  currentSelfMade: string;
  userRole: AdminRole;
}

export default function ProductsTableClient({
  products,
  categories,
  totalCount,
  currentPage,
  totalPages,
  currentSearch,
  currentCategory,
  currentStatus,
  currentSelfMade,
  userRole,
}: ProductsTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Estado local de barra de búsqueda
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Modal de Vista Rápida / Gestión de Variantes
  const [selectedProductForModal, setSelectedProductForModal] =
    useState<SerializedProduct | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "variants">("view");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Estado de edición rápida de una variante en el modal
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editVarForm, setEditVarForm] = useState({
    name: "",
    sku: "",
    priceAdjustmentArs: 0,
    stock: 0,
    isActive: true,
  });

  // Navegar actualizando parámetros de búsqueda en URL (resueltos en Servidor)
  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = {
      q: currentSearch,
      category: currentCategory,
      status: currentStatus,
      selfMade: currentSelfMade,
      page: "1",
      ...updates,
    };

    if (merged.q) params.set("q", merged.q);
    if (merged.category && merged.category !== "all")
      params.set("category", merged.category);
    if (merged.status && merged.status !== "all")
      params.set("status", merged.status);
    if (merged.selfMade && merged.selfMade !== "all")
      params.set("selfMade", merged.selfMade);
    if (merged.page && merged.page !== "1") params.set("page", merged.page);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q: searchInput.trim(), page: "1" });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const handleToggleProductStatus = (product: SerializedProduct) => {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    startTransition(async () => {
      const res = await toggleProductStatusAction(product.id, !product.isActive);
      if (!res.success) {
        setFeedbackError(res.error || "Error al actualizar estado del producto.");
      } else {
        setFeedbackSuccess(
          `Producto "${product.name}" ${
            !product.isActive ? "reactivado" : "pausado"
          } correctamente.`
        );
        router.refresh();
      }
    });
  };

  const handleDeleteProduct = (product: SerializedProduct) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseás eliminar físicamente "${product.name}"? Esta acción es irreversible.`
      )
    ) {
      return;
    }
    setFeedbackError(null);
    setFeedbackSuccess(null);
    startTransition(async () => {
      const res = await deleteProductAction(product.id);
      if (!res.success) {
        setFeedbackError(res.error || "No se pudo eliminar el producto.");
      } else {
        setFeedbackSuccess(`Producto "${product.name}" eliminado físicamente.`);
        setSelectedProductForModal(null);
        router.refresh();
      }
    });
  };

  const startEditVariant = (v: SerializedVariant) => {
    setEditingVariantId(v.id);
    setEditVarForm({
      name: v.name,
      sku: v.sku,
      priceAdjustmentArs: v.priceAdjustmentArs,
      stock: v.stock,
      isActive: v.isActive,
    });
  };

  const handleSaveVariantQuick = (variantId: string) => {
    setFeedbackError(null);
    startTransition(async () => {
      const res = await updateSingleVariantAction(variantId, {
        id: variantId,
        name: editVarForm.name,
        sku: editVarForm.sku,
        priceAdjustmentArs: Number(editVarForm.priceAdjustmentArs),
        stock: Number(editVarForm.stock),
        isActive: editVarForm.isActive,
      });

      if (!res.success) {
        setFeedbackError(res.error || "Error al guardar la variante.");
      } else {
        setEditingVariantId(null);
        setFeedbackSuccess("Variante actualizada correctamente.");
        router.refresh();
        // Actualizar también el estado local del modal para reflejar al instante
        if (selectedProductForModal) {
          setSelectedProductForModal({
            ...selectedProductForModal,
            variants: selectedProductForModal.variants.map((v) =>
              v.id === variantId
                ? {
                    ...v,
                    name: editVarForm.name,
                    sku: editVarForm.sku.toUpperCase(),
                    priceAdjustmentArs: Number(editVarForm.priceAdjustmentArs),
                    stock: Number(editVarForm.stock),
                    isActive: editVarForm.isActive,
                  }
                : v
            ),
          });
        }
      }
    });
  };

  const handleToggleVariantQuick = (v: SerializedVariant) => {
    setFeedbackError(null);
    startTransition(async () => {
      const res = await toggleVariantStatusAction(v.id, !v.isActive);
      if (!res.success) {
        setFeedbackError(res.error || "Error al cambiar estado de la variante.");
      } else {
        router.refresh();
        if (selectedProductForModal) {
          setSelectedProductForModal({
            ...selectedProductForModal,
            variants: selectedProductForModal.variants.map((item) =>
              item.id === v.id ? { ...item, isActive: !v.isActive } : item
            ),
          });
        }
      }
    });
  };

  const handleDeleteVariantQuick = (v: SerializedVariant) => {
    if (
      !window.confirm(
        `¿Eliminar físicamente la variante "${v.name}" (${v.sku})?`
      )
    ) {
      return;
    }
    setFeedbackError(null);
    startTransition(async () => {
      const res = await deleteVariantAction(v.id);
      if (!res.success) {
        setFeedbackError(res.error || "No se pudo eliminar la variante.");
      } else {
        router.refresh();
        if (selectedProductForModal) {
          setSelectedProductForModal({
            ...selectedProductForModal,
            variants: selectedProductForModal.variants.filter(
              (item) => item.id !== v.id
            ),
          });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Mensajes de estado y retroalimentación */}
      {feedbackError && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{feedbackError}</span>
          </div>
          <button
            onClick={() => setFeedbackError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {feedbackSuccess && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BARRA DE BÚSQUEDA Y FILTROS SERVER-SIDE */}
      <div className="p-4 sm:p-5 rounded-xl bg-obsidian-850 border border-obsidian-700 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Buscador por nombre, SKU o slug */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-celestial-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre de producto, SKU de variante o slug..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs text-celestial-ivory placeholder-celestial-muted focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-300 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Buscar</span>
            </button>
          </form>

          {/* Botón de alta principal */}
          <Link
            href="/products/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs uppercase tracking-wider transition-all shadow-gold-glow flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Crear Producto</span>
          </Link>
        </div>

        {/* Filtros desplegables */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-obsidian-800">
          {/* Categoría */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-celestial-muted mb-1">
              Categoría
            </label>
            <select
              value={currentCategory}
              onChange={(e) => applyFilters({ category: e.target.value, page: "1" })}
              className="w-full px-3 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs text-celestial-ivory focus:outline-none focus:border-gold-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Activo / Inactivo */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-celestial-muted mb-1">
              Estado de Publicación
            </label>
            <select
              value={currentStatus}
              onChange={(e) => applyFilters({ status: e.target.value, page: "1" })}
              className="w-full px-3 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs text-celestial-ivory focus:outline-none focus:border-gold-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos (Visibles)</option>
              <option value="inactive">Inactivos / Pausados</option>
            </select>
          </div>

          {/* Fabricación Propia vs Reventa */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-celestial-muted mb-1">
              Origen / Fabricación
            </label>
            <select
              value={currentSelfMade}
              onChange={(e) => applyFilters({ selfMade: e.target.value, page: "1" })}
              className="w-full px-3 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs text-celestial-ivory focus:outline-none focus:border-gold-500"
            >
              <option value="all">Todos los orígenes</option>
              <option value="true">Fabricación Propia 3D</option>
              <option value="false">Mercadería / Reventa</option>
            </select>
          </div>

          {/* Resumen y limpieza de filtros */}
          <div className="flex items-end justify-between sm:justify-end gap-2">
            {(currentSearch ||
              currentCategory !== "all" ||
              currentStatus !== "all" ||
              currentSelfMade !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-700 text-[11px] text-celestial-silver hover:text-celestial-ivory transition-colors"
              >
                Limpiar filtros
              </button>
            )}
            <span className="text-[11px] font-mono text-celestial-muted py-1.5">
              Total: <strong className="text-celestial-ivory">{totalCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="rounded-xl bg-obsidian-850 border border-obsidian-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-obsidian-750 bg-obsidian-900/80 text-[10px] uppercase font-mono tracking-wider text-celestial-muted">
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Precio Base (ARS)</th>
                <th className="py-3.5 px-4">Variantes</th>
                <th className="py-3.5 px-4">Stock Total</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800 text-xs">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-gold-400 mb-3">
                        <Filter className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-serif uppercase tracking-wider text-celestial-ivory">
                        No se encontraron productos
                      </p>
                      <p className="text-xs text-celestial-muted mt-1 leading-relaxed">
                        No hay productos registrados en PostgreSQL que coincidan con los criterios actuales, o el catálogo comercial aún está vacío.
                      </p>
                      <Link
                        href="/products/new"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs uppercase tracking-wider transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Crear Primer Producto</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock = product.variants.reduce(
                    (acc, v) => acc + (v.isActive ? v.stock : 0),
                    0
                  );
                  const activeVariantsCount = product.variants.filter(
                    (v) => v.isActive
                  ).length;
                  const isOutOfStock = totalStock === 0;
                  const isLowStock = totalStock > 0 && totalStock <= 3;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-obsidian-800/40 transition-colors"
                    >
                      {/* Producto + Miniatura / Placeholder */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-obsidian-900 border border-obsidian-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {product.thumbnailUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.thumbnailUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon
                                className="w-4 h-4 text-celestial-muted"
                                aria-label="Sin fotografía asignada (Paso 4)"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-celestial-ivory truncate max-w-[220px] sm:max-w-xs">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-celestial-muted truncate max-w-[160px]">
                                /{product.slug}
                              </span>
                              {product.isDualityCreation && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-gold-500/15 text-gold-300 border border-gold-500/30">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Autor
                                </span>
                              )}
                              {product.isSelfMade && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-obsidian-800 text-celestial-silver border border-obsidian-700">
                                  <Hammer className="w-2.5 h-2.5" />
                                  3D Propia
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3.5 px-4 text-celestial-silver whitespace-nowrap">
                        {product.categoryName}
                      </td>

                      {/* Precio Base ARS */}
                      <td className="py-3.5 px-4 font-mono text-gold-300 font-medium whitespace-nowrap">
                        ARS $ {product.basePriceArs.toLocaleString("es-AR")}
                      </td>

                      {/* Cantidad de variantes */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductForModal(product);
                            setModalMode("variants");
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-700 text-[11px] text-celestial-ivory transition-colors"
                        >
                          <Layers className="w-3 h-3 text-gold-400" />
                          <span>
                            {product.variants.length}{" "}
                            {product.variants.length === 1
                              ? "variante"
                              : "variantes"}
                          </span>
                          <span className="text-[10px] text-celestial-muted">
                            ({activeVariantsCount} act.)
                          </span>
                        </button>
                      </td>

                      {/* Stock Total e Indicador */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25 text-[11px] font-medium">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Agotado (0)</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Stock Bajo ({totalStock} u.)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{totalStock} unidades</span>
                          </span>
                        )}
                      </td>

                      {/* Estado Activo / Inactivo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-obsidian-800 text-celestial-muted border border-obsidian-700">
                            Pausado
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductForModal(product);
                              setModalMode("view");
                            }}
                            title="Ver ficha y detalles"
                            className="p-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-750 border border-obsidian-700 text-celestial-silver hover:text-celestial-ivory transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProductForModal(product);
                              setModalMode("variants");
                            }}
                            title="Gestionar variantes y stock"
                            className="p-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-750 border border-obsidian-700 text-gold-400 hover:text-gold-300 transition-colors"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/products/${product.id}/edit`}
                            title="Editar producto y variantes"
                            className="p-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-750 border border-obsidian-700 text-celestial-silver hover:text-celestial-ivory transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleToggleProductStatus(product)}
                            title={
                              product.isActive
                                ? "Pausar / Archivar producto"
                                : "Reactivar producto"
                            }
                            className={`p-1.5 rounded-lg border transition-colors ${
                              product.isActive
                                ? "bg-obsidian-900 hover:bg-amber-950/50 border-obsidian-700 hover:border-amber-500/40 text-celestial-silver hover:text-amber-300"
                                : "bg-obsidian-900 hover:bg-emerald-950/50 border-obsidian-700 hover:border-emerald-500/40 text-celestial-muted hover:text-emerald-300"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN SERVER-SIDE */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-obsidian-800 bg-obsidian-900/50 flex items-center justify-between text-xs">
            <span className="text-celestial-muted">
              Página <strong className="text-celestial-ivory">{currentPage}</strong> de{" "}
              <strong className="text-celestial-ivory">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isPending}
                onClick={() =>
                  applyFilters({ page: String(currentPage - 1) })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-700 text-celestial-silver disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || isPending}
                onClick={() =>
                  applyFilters({ page: String(currentPage + 1) })
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-700 text-celestial-silver disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE INSPECCIÓN Y GESTIÓN RÁPIDA DE VARIANTES */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 bg-obsidian-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Cabecera del Modal */}
            <div className="px-6 py-4 border-b border-obsidian-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20">
                    {selectedProductForModal.categoryName}
                  </span>
                  <span className="text-xs font-mono text-celestial-muted">
                    /{selectedProductForModal.slug}
                  </span>
                </div>
                <h3 className="text-lg font-serif text-celestial-ivory mt-1">
                  {selectedProductForModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProductForModal(null);
                  setEditingVariantId(null);
                }}
                className="p-1.5 rounded-lg text-celestial-muted hover:text-celestial-ivory hover:bg-obsidian-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas del Modal */}
            <div className="px-6 pt-3 border-b border-obsidian-800 flex items-center gap-4 bg-obsidian-950/40 text-xs">
              <button
                type="button"
                onClick={() => setModalMode("view")}
                className={`pb-2.5 font-medium border-b-2 transition-colors ${
                  modalMode === "view"
                    ? "border-gold-400 text-gold-300"
                    : "border-transparent text-celestial-muted hover:text-celestial-silver"
                }`}
              >
                Ficha General e Imágenes
              </button>
              <button
                type="button"
                onClick={() => setModalMode("variants")}
                className={`pb-2.5 font-medium border-b-2 transition-colors ${
                  modalMode === "variants"
                    ? "border-gold-400 text-gold-300"
                    : "border-transparent text-celestial-muted hover:text-celestial-silver"
                }`}
              >
                Gestión de Variantes y Stock ({selectedProductForModal.variants.length})
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {modalMode === "view" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-xl bg-obsidian-850 border border-obsidian-750">
                      <span className="text-[10px] font-mono uppercase text-celestial-muted block">
                        Precio Base Soberano
                      </span>
                      <span className="text-base font-mono text-gold-300 font-semibold mt-1 block">
                        ARS $ {selectedProductForModal.basePriceArs.toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-obsidian-850 border border-obsidian-750">
                      <span className="text-[10px] font-mono uppercase text-celestial-muted block">
                        Modalidad de Producción
                      </span>
                      <span className="text-xs text-celestial-ivory font-medium mt-1 block">
                        {selectedProductForModal.isSelfMade
                          ? "Fabricación Propia (Impresión 3D)"
                          : "Producto de Reventa / Distribución"}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-obsidian-850 border border-obsidian-750">
                      <span className="text-[10px] font-mono uppercase text-celestial-muted block">
                        Sello Especial
                      </span>
                      <span className="text-xs text-celestial-ivory font-medium mt-1 block">
                        {selectedProductForModal.isDualityCreation
                          ? "✨ Creación Exclusiva Duality Rol"
                          : "Catálogo General"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-celestial-muted mb-1.5">
                      Descripción Comercial
                    </h4>
                    <p className="p-4 rounded-xl bg-obsidian-850 border border-obsidian-750 text-celestial-silver leading-relaxed whitespace-pre-line">
                      {selectedProductForModal.description}
                    </p>
                  </div>

                  {/* Estado de Galería (Preparado para Paso 4) */}
                  <div className="p-4 rounded-xl bg-obsidian-850/70 border border-dashed border-obsidian-700 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-obsidian-900 border border-obsidian-700 flex items-center justify-center text-gold-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-celestial-ivory block">
                          Galería Multimedia del Producto
                        </span>
                        <span className="text-[11px] text-celestial-muted">
                          La subida local y optimización WebP de fotografías se habilitará en el Paso 4.
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-obsidian-900 text-celestial-muted border border-obsidian-750">
                      Paso 4
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-celestial-silver">
                      Cada variante calcula su precio final como{" "}
                      <code className="text-gold-300 font-mono">
                        Precio Base ($ {selectedProductForModal.basePriceArs.toLocaleString("es-AR")}) + Ajuste
                      </code>
                      .
                    </p>
                    <Link
                      href={`/products/${selectedProductForModal.id}/edit`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar nueva variante</span>
                    </Link>
                  </div>

                  <div className="border border-obsidian-750 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-obsidian-950/70 border-b border-obsidian-800 text-[10px] font-mono uppercase text-celestial-muted">
                          <th className="py-2.5 px-3">Variante / Acabado</th>
                          <th className="py-2.5 px-3">SKU Único</th>
                          <th className="py-2.5 px-3">Ajuste ARS</th>
                          <th className="py-2.5 px-3">Precio Final</th>
                          <th className="py-2.5 px-3">Stock</th>
                          <th className="py-2.5 px-3">Estado</th>
                          <th className="py-2.5 px-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-obsidian-800">
                        {selectedProductForModal.variants.map((v) => {
                          const isEditing = editingVariantId === v.id;
                          const finalPrice =
                            selectedProductForModal.basePriceArs +
                            (isEditing
                              ? Number(editVarForm.priceAdjustmentArs || 0)
                              : v.priceAdjustmentArs);

                          return (
                            <tr key={v.id} className="bg-obsidian-850/60">
                              <td className="py-2.5 px-3">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editVarForm.name}
                                    onChange={(e) =>
                                      setEditVarForm({
                                        ...editVarForm,
                                        name: e.target.value,
                                      })
                                    }
                                    className="w-full px-2 py-1 rounded bg-obsidian-900 border border-gold-500/50 text-xs text-celestial-ivory"
                                  />
                                ) : (
                                  <span className="font-medium text-celestial-ivory">
                                    {v.name}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editVarForm.sku}
                                    onChange={(e) =>
                                      setEditVarForm({
                                        ...editVarForm,
                                        sku: e.target.value.toUpperCase(),
                                      })
                                    }
                                    className="w-28 px-2 py-1 rounded bg-obsidian-900 border border-gold-500/50 text-xs font-mono uppercase text-celestial-ivory"
                                  />
                                ) : (
                                  <span className="text-celestial-silver">{v.sku}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={editVarForm.priceAdjustmentArs}
                                    onChange={(e) =>
                                      setEditVarForm({
                                        ...editVarForm,
                                        priceAdjustmentArs: Number(e.target.value),
                                      })
                                    }
                                    className="w-24 px-2 py-1 rounded bg-obsidian-900 border border-gold-500/50 text-xs font-mono text-celestial-ivory"
                                  />
                                ) : (
                                  <span className="text-celestial-silver">
                                    {v.priceAdjustmentArs >= 0
                                      ? `+ $ ${v.priceAdjustmentArs.toLocaleString("es-AR")}`
                                      : `- $ ${Math.abs(v.priceAdjustmentArs).toLocaleString("es-AR")}`}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-semibold text-gold-300">
                                $ {finalPrice.toLocaleString("es-AR")}
                              </td>
                              <td className="py-2.5 px-3 font-mono">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={editVarForm.stock}
                                    onChange={(e) =>
                                      setEditVarForm({
                                        ...editVarForm,
                                        stock: parseInt(e.target.value || "0", 10),
                                      })
                                    }
                                    className="w-20 px-2 py-1 rounded bg-obsidian-900 border border-gold-500/50 text-xs font-mono text-celestial-ivory"
                                  />
                                ) : (
                                  <span
                                    className={
                                      v.stock === 0
                                        ? "text-rose-400 font-semibold"
                                        : v.stock <= 3
                                        ? "text-amber-300 font-semibold"
                                        : "text-emerald-400"
                                    }
                                  >
                                    {v.stock} u.
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                {v.isActive ? (
                                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                                    Activa
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-obsidian-800 text-celestial-muted">
                                    Inactiva
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {isEditing ? (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={isPending}
                                      onClick={() => handleSaveVariantQuick(v.id)}
                                      className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                                      title="Guardar cambios"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingVariantId(null)}
                                      className="p-1 rounded bg-obsidian-800 text-celestial-muted hover:text-celestial-ivory"
                                      title="Cancelar"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => startEditVariant(v)}
                                      className="p-1 rounded bg-obsidian-900 hover:bg-obsidian-750 border border-obsidian-700 text-celestial-silver hover:text-celestial-ivory"
                                      title="Edición rápida de stock / precio"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isPending}
                                      onClick={() => handleToggleVariantQuick(v)}
                                      className="p-1 rounded bg-obsidian-900 hover:bg-obsidian-750 border border-obsidian-700 text-celestial-silver hover:text-amber-300"
                                      title={
                                        v.isActive
                                          ? "Desactivar variante"
                                          : "Reactivar variante"
                                      }
                                    >
                                      <Power className="w-3.5 h-3.5" />
                                    </button>
                                    {userRole === "SUPERADMIN" &&
                                      !v.hasReferences &&
                                      selectedProductForModal.variants.length > 1 && (
                                        <button
                                          type="button"
                                          disabled={isPending}
                                          onClick={() => handleDeleteVariantQuick(v)}
                                          className="p-1 rounded bg-obsidian-900 hover:bg-rose-950/60 border border-obsidian-700 hover:border-rose-500/40 text-celestial-muted hover:text-rose-300"
                                          title="Eliminar variante sin historial (Solo SUPERADMIN)"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Pie del Modal */}
            <div className="px-6 py-3.5 border-t border-obsidian-800 bg-obsidian-950/60 flex items-center justify-between">
              <div>
                {userRole === "SUPERADMIN" &&
                  !selectedProductForModal.hasOrderReferences && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteProduct(selectedProductForModal)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Borrador (SUPERADMIN)</span>
                    </button>
                  )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/products/${selectedProductForModal.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs uppercase tracking-wider"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Completo</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedProductForModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-celestial-silver text-xs"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
