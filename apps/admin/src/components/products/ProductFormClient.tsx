"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Hammer,
  Layers,
  Image as ImageIcon,
  Loader2,
  Info,
} from "lucide-react";
import { AdminRole } from "@duality/database";
import { ProductSchema, type ProductInput } from "@duality/config-contracts";
import {
  createProductAction,
  updateProductAction,
  deleteVariantAction,
} from "../../lib/product-actions";
import type { CategoryOption } from "./ProductsTableClient";

export interface VariantFormItem {
  id?: string;
  name: string;
  sku: string;
  priceAdjustmentArs: number;
  stock: number;
  isActive: boolean;
  hasReferences?: boolean;
}

export interface ProductFormInitialData {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePriceArs: number;
  categoryId: string;
  isSelfMade: boolean;
  isDualityCreation: boolean;
  isActive: boolean;
  variants: VariantFormItem[];
}

interface ProductFormClientProps {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initialData?: ProductFormInitialData;
  userRole: AdminRole;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export default function ProductFormClient({
  mode,
  categories,
  initialData,
  userRole,
}: ProductFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estado del formulario de producto
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    mode === "edit"
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || categories[0]?.id || ""
  );
  const [basePriceArs, setBasePriceArs] = useState<number>(
    initialData?.basePriceArs ?? 25000
  );
  const [isSelfMade, setIsSelfMade] = useState<boolean>(
    initialData?.isSelfMade ?? true
  );
  const [isDualityCreation, setIsDualityCreation] = useState<boolean>(
    initialData?.isDualityCreation ?? true
  );
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.isActive ?? true
  );

  // Estado de variantes
  const [variants, setVariants] = useState<VariantFormItem[]>(
    initialData?.variants && initialData.variants.length > 0
      ? initialData.variants
      : [
          {
            name: "Acabado Estándar",
            sku: "",
            priceAdjustmentArs: 0,
            stock: 5,
            isActive: true,
          },
        ]
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(newName));
    }
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: "",
        sku: "",
        priceAdjustmentArs: 0,
        stock: 1,
        isActive: true,
      },
    ]);
  };

  const handleUpdateVariantField = <K extends keyof VariantFormItem>(
    index: number,
    field: K,
    value: VariantFormItem[K]
  ) => {
    setVariants((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variants.length <= 1) {
      setErrorMessage("El producto debe contar con al menos una variante.");
      return;
    }

    const target = variants[index];
    if (target.id) {
      if (target.hasReferences) {
        setErrorMessage(
          "No podés eliminar una variante con historial de pedidos. Desactivala usando el selector de estado."
        );
        return;
      }
      if (userRole !== "SUPERADMIN") {
        setErrorMessage(
          "Solo un SUPERADMIN puede eliminar físicamente variantes ya guardadas. Podés desactivarla."
        );
        return;
      }
      if (
        !window.confirm(
          `¿Eliminar físicamente de la base de datos la variante "${target.name}" (${target.sku})?`
        )
      ) {
        return;
      }

      const variantIdToDelete = target.id;
      startTransition(async () => {
        const res = await deleteVariantAction(variantIdToDelete);
        if (!res.success) {
          setErrorMessage(res.error || "No se pudo eliminar la variante.");
        } else {
          setVariants((prev) => prev.filter((_, idx) => idx !== index));
          setSuccessMessage("Variante eliminada físicamente.");
          router.refresh();
        }
      });
      return;
    }

    // Si es una fila nueva no persistida aún, quitar del arreglo local
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: ProductInput = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      basePriceArs: Number(basePriceArs),
      categoryId,
      isSelfMade,
      isDualityCreation,
      isActive,
      variants: variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        name: v.name.trim(),
        sku: v.sku.trim().toUpperCase(),
        priceAdjustmentArs: Number(v.priceAdjustmentArs),
        stock: Number(v.stock),
        isActive: v.isActive,
      })),
    };

    // Validación con Zod en Cliente antes de enviar al Servidor
    const validation = ProductSchema.safeParse(payload);
    if (!validation.success) {
      setErrorMessage(
        validation.error.issues[0]?.message ||
          "Revisá los campos del formulario antes de guardar."
      );
      return;
    }

    startTransition(async () => {
      if (mode === "create") {
        const res = await createProductAction(validation.data);
        if (!res.success) {
          setErrorMessage(res.error || "Error al crear el producto.");
        } else {
          router.push("/products");
          router.refresh();
        }
      } else if (initialData?.id) {
        const res = await updateProductAction(initialData.id, validation.data);
        if (!res.success) {
          setErrorMessage(res.error || "Error al guardar los cambios.");
        } else {
          setSuccessMessage(
            "Cambios guardados y auditados correctamente en PostgreSQL."
          );
          router.refresh();
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Barra superior de retorno y estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs text-celestial-silver hover:text-gold-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de productos</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-700 text-xs text-celestial-silver"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs uppercase tracking-wider transition-all shadow-gold-glow disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>
                  {mode === "create" ? "Crear Producto" : "Guardar Cambios"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas de validación o éxito */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{successMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA PRINCIPAL (2/3): DATOS GENERALES E IDENTIDAD */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-obsidian-850 border border-obsidian-700 space-y-5">
            <h2 className="text-sm font-serif uppercase tracking-wider text-gold-300 border-b border-obsidian-750 pb-3">
              1. Información Principal del Producto
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="product-name"
                  className="block text-xs uppercase tracking-wider text-celestial-silver font-medium mb-1.5"
                >
                  Nombre Comercial *
                </label>
                <input
                  id="product-name"
                  type="text"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Torre de Dados Eclipse Astral"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs text-celestial-ivory placeholder-celestial-muted focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="product-slug"
                    className="block text-xs uppercase tracking-wider text-celestial-silver font-medium"
                  >
                    Slug (URL Única) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSlug(generateSlug(name));
                      setIsSlugManuallyEdited(false);
                    }}
                    className="text-[10px] font-mono text-gold-400 hover:underline"
                  >
                    Autogenerar
                  </button>
                </div>
                <input
                  id="product-slug"
                  type="text"
                  required
                  maxLength={130}
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    setIsSlugManuallyEdited(true);
                  }}
                  placeholder="torre-de-dados-eclipse-astral"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs font-mono text-celestial-ivory placeholder-celestial-muted focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Categoría */}
              <div>
                <label
                  htmlFor="product-category"
                  className="block text-xs uppercase tracking-wider text-celestial-silver font-medium mb-1.5"
                >
                  Categoría Oficial *
                </label>
                <select
                  id="product-category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs text-celestial-ivory focus:outline-none focus:border-gold-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label
                htmlFor="product-description"
                className="block text-xs uppercase tracking-wider text-celestial-silver font-medium mb-1.5"
              >
                Descripción Detallada *
              </label>
              <textarea
                id="product-description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describí los materiales, dimensiones, acabados y características para la mesa de rol..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-obsidian-900 border border-obsidian-700 text-xs text-celestial-ivory placeholder-celestial-muted focus:outline-none focus:border-gold-500 leading-relaxed"
              />
            </div>
          </div>

          {/* SECCIÓN DE VARIANTES, SKUs Y PRECIOS SOBERANOS */}
          <div className="p-6 rounded-xl bg-obsidian-850 border border-obsidian-700 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-obsidian-750 pb-3">
              <div>
                <h2 className="text-sm font-serif uppercase tracking-wider text-gold-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gold-400" />
                  <span>2. Variantes, SKUs y Control de Stock</span>
                </h2>
                <p className="text-[11px] text-celestial-muted mt-0.5">
                  Precio Final de cada variante = Precio Base ($ {Number(basePriceArs || 0).toLocaleString("es-AR")}) + Ajuste ARS.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-300 text-xs font-medium transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Variante</span>
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, idx) => {
                const finalPrice =
                  Number(basePriceArs || 0) +
                  Number(variant.priceAdjustmentArs || 0);
                const isPriceInvalid = finalPrice <= 0;

                return (
                  <div
                    key={variant.id || `new-${idx}`}
                    className={`p-4 rounded-xl border transition-colors ${
                      variant.isActive
                        ? "bg-obsidian-900/90 border-obsidian-750"
                        : "bg-obsidian-950/60 border-obsidian-800 opacity-75"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gold-400">
                        Variante #{idx + 1}{" "}
                        {variant.id ? "(Guardada en DB)" : "(Nueva)"}
                      </span>

                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-1.5 text-xs text-celestial-silver cursor-pointer">
                          <input
                            type="checkbox"
                            checked={variant.isActive}
                            onChange={(e) =>
                              handleUpdateVariantField(
                                idx,
                                "isActive",
                                e.target.checked
                              )
                            }
                            className="rounded border-obsidian-700 bg-obsidian-850 text-gold-500 focus:ring-gold-500"
                          />
                          <span>Variante Activa</span>
                        </label>

                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="p-1 rounded text-celestial-muted hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                            title="Quitar variante"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      {/* Nombre de variante */}
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] uppercase font-mono text-celestial-muted mb-1">
                          Nombre / Acabado *
                        </label>
                        <input
                          type="text"
                          required
                          value={variant.name}
                          onChange={(e) =>
                            handleUpdateVariantField(idx, "name", e.target.value)
                          }
                          placeholder="Ej: Resina Obsidiana & Oro"
                          className="w-full px-3 py-2 rounded-lg bg-obsidian-850 border border-obsidian-700 text-xs text-celestial-ivory focus:outline-none focus:border-gold-500"
                        />
                      </div>

                      {/* SKU Único */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] uppercase font-mono text-celestial-muted mb-1">
                          SKU Único *
                        </label>
                        <input
                          type="text"
                          required
                          value={variant.sku}
                          onChange={(e) =>
                            handleUpdateVariantField(
                              idx,
                              "sku",
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="TOR-ECL-001"
                          className="w-full px-3 py-2 rounded-lg bg-obsidian-850 border border-obsidian-700 text-xs font-mono uppercase text-celestial-ivory focus:outline-none focus:border-gold-500"
                        />
                      </div>

                      {/* Ajuste de precio ARS */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] uppercase font-mono text-celestial-muted mb-1">
                          Ajuste ARS
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={variant.priceAdjustmentArs}
                          onChange={(e) =>
                            handleUpdateVariantField(
                              idx,
                              "priceAdjustmentArs",
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg bg-obsidian-850 border border-obsidian-700 text-xs font-mono text-celestial-ivory focus:outline-none focus:border-gold-500"
                        />
                      </div>

                      {/* Stock Inicial / Disponible */}
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] uppercase font-mono text-celestial-muted mb-1">
                          Stock *
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          required
                          value={variant.stock}
                          onChange={(e) =>
                            handleUpdateVariantField(
                              idx,
                              "stock",
                              Math.max(0, parseInt(e.target.value || "0", 10))
                            )
                          }
                          className="w-full px-2.5 py-2 rounded-lg bg-obsidian-850 border border-obsidian-700 text-xs font-mono text-celestial-ivory focus:outline-none focus:border-gold-500"
                        />
                      </div>

                      {/* Precio Final Calculado */}
                      <div className="sm:col-span-2">
                        <span className="block text-[10px] uppercase font-mono text-celestial-muted mb-1">
                          Precio Final
                        </span>
                        <div
                          className={`px-3 py-2 rounded-lg border font-mono text-xs font-semibold truncate ${
                            isPriceInvalid
                              ? "bg-rose-950/40 border-rose-500/50 text-rose-300"
                              : "bg-obsidian-950 border-obsidian-800 text-gold-300"
                          }`}
                        >
                          $ {finalPrice.toLocaleString("es-AR")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMNA LATERAL (1/3): PRECIO BASE, ATRIBUTOS Y MULTIMEDIA */}
        <div className="space-y-6">
          {/* Precio Base Soberano */}
          <div className="p-6 rounded-xl bg-obsidian-850 border border-obsidian-700 space-y-4">
            <h2 className="text-sm font-serif uppercase tracking-wider text-gold-300 border-b border-obsidian-750 pb-3">
              3. Precio Base y Estado
            </h2>

            <div>
              <label
                htmlFor="base-price-ars"
                className="block text-xs uppercase tracking-wider text-celestial-silver font-medium mb-1.5"
              >
                Precio Base en ARS ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gold-400">
                  ARS $
                </span>
                <input
                  id="base-price-ars"
                  type="number"
                  min={1}
                  step="1"
                  required
                  value={basePriceArs}
                  onChange={(e) => setBasePriceArs(Number(e.target.value))}
                  className="w-full pl-14 pr-4 py-2.5 rounded-lg bg-obsidian-900 border border-obsidian-700 text-sm font-mono font-semibold text-gold-300 focus:outline-none focus:border-gold-500"
                />
              </div>
              <p className="text-[11px] text-celestial-muted mt-1.5">
                El servidor utiliza este importe como base soberana para calcular los totales en el checkout.
              </p>
            </div>

            {/* Estado Activo / Inactivo */}
            <div className="pt-2 border-t border-obsidian-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mt-0.5 rounded border-obsidian-700 bg-obsidian-900 text-gold-500 focus:ring-gold-500"
                />
                <div>
                  <span className="text-xs font-medium text-celestial-ivory block">
                    Producto Activo en Catálogo
                  </span>
                  <span className="text-[11px] text-celestial-muted block mt-0.5">
                    Si se desmarca, el producto queda pausado/archivado sin perder su historial.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Atributos Duality Rol */}
          <div className="p-6 rounded-xl bg-obsidian-850 border border-obsidian-700 space-y-4">
            <h2 className="text-sm font-serif uppercase tracking-wider text-gold-300 border-b border-obsidian-750 pb-3">
              4. Distintivos Duality Rol
            </h2>

            <label className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-900/70 border border-obsidian-750 cursor-pointer hover:border-gold-500/30 transition-colors">
              <input
                type="checkbox"
                checked={isSelfMade}
                onChange={(e) => setIsSelfMade(e.target.checked)}
                className="mt-0.5 rounded border-obsidian-700 bg-obsidian-850 text-gold-500 focus:ring-gold-500"
              />
              <div>
                <span className="text-xs font-medium text-celestial-ivory flex items-center gap-1.5">
                  <Hammer className="w-3.5 h-3.5 text-gold-400" />
                  <span>Fabricación Propia (isSelfMade)</span>
                </span>
                <span className="text-[11px] text-celestial-muted block mt-0.5">
                  Pieza impresa en 3D o terminada artesanalmente en nuestro taller.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg bg-obsidian-900/70 border border-obsidian-750 cursor-pointer hover:border-gold-500/30 transition-colors">
              <input
                type="checkbox"
                checked={isDualityCreation}
                onChange={(e) => setIsDualityCreation(e.target.checked)}
                className="mt-0.5 rounded border-obsidian-700 bg-obsidian-850 text-gold-500 focus:ring-gold-500"
              />
              <div>
                <span className="text-xs font-medium text-celestial-ivory flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>Insignia «Creación Duality»</span>
                </span>
                <span className="text-[11px] text-celestial-muted block mt-0.5">
                  Otorga el sello visual dorado de pieza de autor en la tienda pública.
                </span>
              </div>
            </label>
          </div>

          {/* Preparación para Imágenes (Paso 4) */}
          <div className="p-6 rounded-xl bg-obsidian-850 border border-obsidian-700 space-y-3">
            <div className="flex items-center justify-between border-b border-obsidian-750 pb-2.5">
              <h2 className="text-sm font-serif uppercase tracking-wider text-celestial-ivory flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gold-400" />
                <span>5. Fotografías</span>
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-obsidian-900 text-gold-400 border border-obsidian-750">
                Paso 4
              </span>
            </div>

            <div className="p-4 rounded-xl bg-obsidian-900/60 border border-dashed border-obsidian-700 text-center space-y-2">
              <ImageIcon className="w-6 h-6 text-celestial-muted mx-auto" />
              <p className="text-xs text-celestial-silver font-medium">
                Almacenamiento Multimedia Local
              </p>
              <p className="text-[11px] text-celestial-muted leading-relaxed">
                La carga de imágenes WebP/PNG/JPEG (máx. 5 MB) y su vinculación con variantes se activará en el Paso 4.
              </p>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-celestial-muted pt-1">
              <Info className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" />
              <span>
                El listado utiliza un placeholder visual limpio hasta que se carguen las fotografías definitivas.
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
