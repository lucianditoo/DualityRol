"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Sparkles,
  MapPin,
  ShieldCheck,
  ChevronRight,
  X,
  Info,
  Check,
  Package,
  Layers,
} from "lucide-react";
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DemoProduct,
  DemoVariant,
} from "../lib/demo-products";

interface CartItem {
  product: DemoProduct;
  variant: DemoVariant;
  quantity: number;
}

export default function StoreFrontDemoPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({
    "demo-prod-1": "var-1a",
    "demo-prod-2": "var-2a",
    "demo-prod-3": "var-3a",
    "demo-prod-4": "var-4a",
    "demo-prod-5": "var-5a",
    "demo-prod-6": "var-6a",
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Filtrado de productos de demostración
  const filteredProducts =
    selectedCategory === "all"
      ? DEMO_PRODUCTS
      : DEMO_PRODUCTS.filter((p) => p.categorySlug === selectedCategory);

  // Manejo de selección de variantes
  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  // Agregar al carrito demostrativo
  const handleAddToCart = (product: DemoProduct) => {
    const variantId = selectedVariants[product.id] || product.variants[0].id;
    const variant = product.variants.find((v) => v.id === variantId) || product.variants[0];

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.variant.id === variant.id
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, variant, quantity: 1 }];
    });

    showToast(`"${product.name} (${variant.name})" agregado al carrito demo`);
  };

  const showToast = (message: string) => {
    setActiveToast(message);
    setTimeout(() => {
      setActiveToast((current) => (current === message ? null : current));
    }, 3000);
  };

  // Cálculo de totales
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartAmount = cart.reduce(
    (acc, item) => acc + item.variant.priceArs * item.quantity,
    0
  );

  return (
    <div className="relative min-h-screen bg-obsidian-900 text-celestial-ivory flex flex-col cosmic-radial-bg selection:bg-gold-500 selection:text-obsidian-950">
      {/* ---------------------------------------------------------------------- */}
      {/* BANNER SUPERIOR DE AVISO: MODO DEMOSTRACIÓN */}
      {/* ---------------------------------------------------------------------- */}
      <div className="bg-obsidian-850/90 border-b border-gold-500/25 py-2 px-4 text-center text-xs tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 text-celestial-silver">
          <span className="inline-flex items-center gap-1.5 font-medium text-gold-400 bg-gold-500/10 border border-gold-500/20 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-gold-400" />
            Vista Previa de Diseño
          </span>
          <span>Catálogo y carrito en modo demostración local.</span>
          <span className="hidden sm:inline text-obsidian-600">|</span>
          <span className="text-celestial-ivory/80">
            Entrega exclusiva mediante <strong>Retiro Acordado</strong>.
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* BARRA DE NAVEGACIÓN PRINCIPAL */}
      {/* ---------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-obsidian-900/90 backdrop-blur-md border-b border-obsidian-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* LOGOTIPO ORIGINAL */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-48 sm:w-56 cursor-pointer">
              <Image
                src="/brand/logo_name.png"
                alt="Duality Rol"
                fill
                priority
                sizes="(max-width: 640px) 192px, 224px"
                className="object-contain object-left"
              />
            </div>
          </div>

          {/* BOTÓN DEL CARRITO DEMO */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-4 py-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-600 hover:border-gold-500/40 text-celestial-ivory transition-all group"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs uppercase tracking-widest font-serif text-celestial-silver">
                Carrito
              </span>
              {totalCartCount > 0 ? (
                <span className="bg-gold-500 text-obsidian-950 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {totalCartCount}
                </span>
              ) : (
                <span className="text-xs text-celestial-muted">0</span>
              )}
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN HORIZONTAL DE CATEGORÍAS */}
        <div className="border-t border-obsidian-700/60 bg-obsidian-950/60 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-2.5 text-xs">
            {DEMO_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full border text-xs tracking-wider uppercase font-medium transition-all ${
                    isSelected
                      ? "bg-gold-500/15 border-gold-500 text-gold-300 shadow-gold-glow"
                      : "bg-obsidian-800/60 border-obsidian-600/80 text-celestial-silver hover:border-celestial-silver/40 hover:text-celestial-ivory"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------------- */}
      {/* HERO SECTION DE IDENTIDAD CÓSMICA */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative overflow-hidden py-10 sm:py-16 lg:py-20 border-b border-obsidian-700/60">
        {/* Nebulosas ambientales de fondo que extienden el arte a pantallas ultra-anchas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Resplandor dorado cálido hacia la izquierda */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
          {/* Resplandor plateado/azul hacia la derecha */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-slate-400/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Composición Principal: Emblema Sol-Luna, Logotipo Duality Rol y Eslogan */}
          <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-gold-500/15 bg-obsidian-950">
            {/* Imagen artística con viñeteado suave en los bordes para integración perfecta */}
            <div className="relative w-full aspect-[1024/407]">
              <Image
                src="/brand/hero_banner.png"
                alt="Duality Rol — Forjados bajo la luz celestial, templados en la penumbra"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
                className="object-contain sm:object-cover w-full h-full"
              />
              {/* Sutil gradiente perimetral para fundir bordes con el fondo de la boutique */}
              <div className="absolute inset-0 ring-1 ring-inset ring-gold-500/20 rounded-2xl pointer-events-none" />
            </div>

            {/* Encabezado accesible para lectores de pantalla y SEO (sin duplicar visualmente el texto) */}
            <h1 className="sr-only">
              Duality Rol — Forjados bajo la luz celestial, templados en la penumbra
            </h1>
          </div>

          {/* Subtítulo complementario y propuesta de valor */}
          <p className="mt-6 sm:mt-8 text-xs sm:text-sm md:text-base text-celestial-silver max-w-2xl mx-auto font-light leading-relaxed">
            Accesorios de rol boutique, dados artesanales y piezas singulares impresas en 3D.
            Cada lanzamiento equilibra el día, la noche y el destino en tu mesa.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-celestial-silver">
            <div className="flex items-center gap-2 bg-obsidian-800/80 border border-obsidian-600 px-3.5 py-1.5 rounded-md backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span>Retiro acordado (Argentina)</span>
            </div>
            <div className="flex items-center gap-2 bg-obsidian-800/80 border border-obsidian-600 px-3.5 py-1.5 rounded-md backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Calidad artesanal 3D & Reventa seleccionada</span>
            </div>
            <div className="flex items-center gap-2 bg-obsidian-800/80 border border-obsidian-600 px-3.5 py-1.5 rounded-md backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Precios en Pesos Argentinos (ARS)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* CATÁLOGO DE PRODUCTOS DE DEMOSTRACIÓN */}
      {/* ---------------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-baseline justify-between mb-8 border-b border-obsidian-700/60 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif tracking-wider uppercase text-celestial-ivory">
              Catálogo de Muestra
            </h2>
            <p className="text-xs text-celestial-silver mt-1">
              Visualizando {filteredProducts.length} creaciones (Datos de prueba visual)
            </p>
          </div>
          <span className="text-xs font-mono text-gold-400/90 border border-gold-500/30 bg-gold-500/10 px-2.5 py-1 rounded">
            Fase de Diseño
          </span>
        </div>

        {/* GRILLA RESPONSIVE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const activeVariantId = selectedVariants[product.id] || product.variants[0].id;
            const activeVariant =
              product.variants.find((v) => v.id === activeVariantId) || product.variants[0];

            return (
              <div
                key={product.id}
                className="group relative bg-obsidian-800 rounded-xl border border-obsidian-600 hover:border-gold-500/50 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-gold-glow"
              >
                {/* CABECERA DE IMAGEN / PREVIEW ARTÍSTICO */}
                <div className="relative aspect-[4/3] bg-gradient-to-b from-obsidian-950 to-obsidian-850 p-6 flex flex-col justify-between items-center border-b border-obsidian-700/60 overflow-hidden">
                  {/* Insignia Creación Duality */}
                  <div className="w-full flex items-center justify-between relative z-10">
                    {product.isDualityCreation ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-serif uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 text-gold-400" />
                        Creación Duality
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-obsidian-700/80 text-celestial-silver border border-obsidian-600">
                        <Package className="w-3 h-3" />
                        Reventa
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-celestial-silver">
                      {activeVariant.stock > 0 ? (
                        <span className="text-emerald-400/90 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Stock: {activeVariant.stock}
                        </span>
                      ) : (
                        <span className="text-rose-400">Agotado</span>
                      )}
                    </span>
                  </div>

                  {/* Iconografía central simbólica de la pieza */}
                  <div className="relative my-auto flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <div className="w-20 h-20 rounded-full border border-gold-500/20 bg-obsidian-900/80 flex items-center justify-center p-3 shadow-inner">
                      <Image
                        src="/brand/logo_only.png"
                        alt="Símbolo Duality"
                        width={48}
                        height={48}
                        className="object-contain opacity-75 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <span className="mt-2 text-[10px] uppercase font-mono tracking-widest text-celestial-muted">
                      SKU: {activeVariant.sku}
                    </span>
                  </div>

                  {/* Categoría inferior */}
                  <div className="w-full text-left relative z-10">
                    <span className="text-[11px] uppercase tracking-widest text-gold-400/90 font-serif">
                      {product.categoryName}
                    </span>
                  </div>
                </div>

                {/* CONTENIDO DE FICHA */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-serif tracking-wide text-celestial-ivory group-hover:text-gold-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-xs text-celestial-silver line-clamp-2 font-light leading-relaxed">
                      {product.description}
                    </p>

                    {/* SELECTOR DE VARIANTES */}
                    {product.variants.length > 1 && (
                      <div className="mt-4">
                        <label className="text-[11px] uppercase tracking-wider text-celestial-muted block mb-1.5 font-medium">
                          Variante / Acabado:
                        </label>
                        <div className="grid grid-cols-1 gap-1.5">
                          {product.variants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleVariantChange(product.id, v.id)}
                              className={`text-left px-2.5 py-1.5 rounded text-xs border transition-all flex items-center justify-between ${
                                activeVariant.id === v.id
                                  ? "bg-gold-500/15 border-gold-500/60 text-celestial-ivory"
                                  : "bg-obsidian-850 border-obsidian-700 text-celestial-silver hover:border-obsidian-600"
                              }`}
                            >
                              <span>{v.name}</span>
                              {activeVariant.id === v.id && (
                                <Check className="w-3.5 h-3.5 text-gold-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRECIO Y ACCIÓN */}
                  <div className="mt-5 pt-4 border-t border-obsidian-700/60 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-celestial-muted block">
                        Precio en ARS
                      </span>
                      <span className="text-lg font-serif tracking-wide text-gold-300 font-semibold">
                        ${activeVariant.priceArs.toLocaleString("es-AR")}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3.5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-medium text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-sm hover:shadow-gold-glow"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL / DRAWER DEL CARRITO DEMOSTRATIVO */}
      {/* ---------------------------------------------------------------------- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-obsidian-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-obsidian-900 border-l border-obsidian-600 h-full flex flex-col shadow-2xl">
            {/* Header Carrito */}
            <div className="p-5 border-b border-obsidian-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold-400" />
                <h3 className="font-serif tracking-wider text-base uppercase text-celestial-ivory">
                  Carrito de Prueba
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-md text-celestial-silver hover:text-celestial-ivory hover:bg-obsidian-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Items */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-obsidian-700/60">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-celestial-silver">
                  <div className="w-12 h-12 rounded-full bg-obsidian-800 flex items-center justify-center mb-3 text-gold-400">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="font-serif text-sm uppercase tracking-wider text-celestial-ivory">
                    Tu carrito está vacío
                  </p>
                  <p className="text-xs text-celestial-muted mt-1 max-w-xs">
                    Explorá el catálogo de demostración y agregá accesorios para probar la interfaz.
                  </p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-medium text-celestial-ivory">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gold-400/90 font-mono mt-0.5">
                        Variante: {item.variant.name}
                      </p>
                      <p className="text-xs text-celestial-silver mt-1">
                        Cantidad: {item.quantity} × ${item.variant.priceArs.toLocaleString("es-AR")}
                      </p>
                    </div>
                    <span className="font-serif text-sm text-gold-300 font-semibold">
                      ${(item.variant.priceArs * item.quantity).toLocaleString("es-AR")}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer Carrito con Subtotal y Aviso de Demo */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-obsidian-700 bg-obsidian-850/80">
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-celestial-silver uppercase tracking-wider text-xs">
                    Subtotal estimado
                  </span>
                  <span className="font-serif text-xl text-gold-300 font-bold">
                    ${totalCartAmount.toLocaleString("es-AR")} ARS
                  </span>
                </div>

                <div className="mb-4 bg-obsidian-800/90 border border-gold-500/25 rounded-lg p-3 text-xs text-celestial-silver flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                  <p>
                    El checkout con <strong>Mercado Pago</strong> y la reserva de stock están deshabilitados en esta vista previa. Se integrarán en las fases posteriores.
                  </p>
                </div>

                <button
                  onClick={() => {
                    showToast("Simulación de checkout: No habilitado en fase de preview");
                  }}
                  className="w-full py-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest transition-all shadow-gold-glow flex items-center justify-center gap-2"
                >
                  <span>Finalizar Compra (Demo)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TOAST FLOTANTE DE ACCIONES INTERACTIVAS */}
      {/* ---------------------------------------------------------------------- */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-obsidian-800 border border-gold-500/60 text-celestial-ivory px-4 py-3 rounded-lg shadow-gold-glow-lg flex items-center gap-3 animate-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span className="text-xs">{activeToast}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* FOOTER BOUTIQUE */}
      {/* ---------------------------------------------------------------------- */}
      <footer className="border-t border-obsidian-700/60 bg-obsidian-950 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="relative h-8 w-36">
              <Image
                src="/brand/logo_name.png"
                alt="Duality Rol"
                fill
                sizes="144px"
                className="object-contain object-center md:object-left"
              />
            </div>
            <p className="text-xs text-celestial-muted max-w-sm">
              Accesorios cósmicos para juegos de rol de mesa. Diseño moderno premium e impresión 3D.
            </p>
          </div>

          <div className="text-xs text-celestial-silver flex flex-col gap-1">
            <p>
              Entrega acordada en punto de encuentro presencial · <strong className="text-celestial-ivory">Argentina</strong>
            </p>
            <p className="text-celestial-muted">
              © {new Date().getFullYear()} Duality Rol. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
