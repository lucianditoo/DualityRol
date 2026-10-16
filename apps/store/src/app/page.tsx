"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Sparkles,
  MapPin,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  X,
  Info,
  Check,
  Package,
  Eye,
} from "lucide-react";
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DemoProduct,
  DemoVariant,
  DemoProductImage,
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
  // Seguimiento de imagen de galería activa por producto (para productos con múltiples vistas como el Dragón)
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<Record<string, string>>({});
  // Producto abierto en la vista de detalle / galería modal
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  // Registro de imágenes que hayan fallado al cargar para mostrar un fallback elegante
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Filtrado de productos de demostración
  const filteredProducts =
    selectedCategory === "all"
      ? DEMO_PRODUCTS
      : DEMO_PRODUCTS.filter((p) => p.categorySlug === selectedCategory);

  const detailProduct = detailProductId
    ? DEMO_PRODUCTS.find((p) => p.id === detailProductId) || null
    : null;

  // Resolver la imagen activa de un producto según la variante seleccionada o vista de galería elegida
  const resolveActiveProductImage = useCallback(
    (product: DemoProduct, activeVariant: DemoVariant): DemoProductImage => {
      const explicitGalleryId = selectedGalleryImages[product.id];
      if (explicitGalleryId) {
        const found = product.gallery.find((img) => img.id === explicitGalleryId);
        if (found) {
          // Si la imagen explícita pertenece a otra variante diferente de la actual, priorizar la variante activa
          if (!found.variantId || found.variantId === activeVariant.id) {
            return found;
          }
        }
      }

      // Buscar en la galería la imagen asociada a la variante seleccionada o a su URL
      const variantGalleryImg =
        product.gallery.find((img) => img.variantId === activeVariant.id) ||
        (activeVariant.image
          ? product.gallery.find((img) => img.url === activeVariant.image)
          : undefined);
      if (variantGalleryImg) {
        return variantGalleryImg;
      }

      // Si la variante tiene imagen directa no listada en gallery, usarla
      if (activeVariant.image) {
        return {
          id: `${activeVariant.id}-img`,
          url: activeVariant.image,
          alt: activeVariant.imageAlt || `${product.name} — ${activeVariant.name}`,
          label: activeVariant.name,
          variantId: activeVariant.id,
        };
      }

      // Fallback a la primera imagen de galería o mainImage del producto
      return (
        product.gallery[0] || {
          id: `${product.id}-main`,
          url: product.mainImage,
          alt: product.mainImageAlt,
          label: product.name,
        }
      );
    },
    [selectedGalleryImages]
  );

  // Manejo de selección de variantes (sincroniza automáticamente la imagen asociada)
  const handleVariantChange = useCallback((productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
    const product = DEMO_PRODUCTS.find((p) => p.id === productId);
    const matchingGalleryImg = product?.gallery.find((img) => img.variantId === variantId);
    if (matchingGalleryImg) {
      setSelectedGalleryImages((prev) => ({ ...prev, [productId]: matchingGalleryImg.id }));
    }
  }, []);

  // Manejo de selección de miniatura en la galería (sincroniza variante si la imagen corresponde a un acabado)
  const handleGalleryImageSelect = useCallback(
    (product: DemoProduct, image: DemoProductImage) => {
      setSelectedGalleryImages((prev) => ({ ...prev, [product.id]: image.id }));
      if (image.variantId) {
        setSelectedVariants((prev) => ({ ...prev, [product.id]: image.variantId! }));
      }
    },
    []
  );

  // Abrir vista de detalle sincronizada con el estado actual de la tarjeta
  const handleOpenDetail = (product: DemoProduct) => {
    const activeVariantId = selectedVariants[product.id] || product.variants[0].id;
    const activeVariant =
      product.variants.find((v) => v.id === activeVariantId) || product.variants[0];
    const currentImg = resolveActiveProductImage(product, activeVariant);
    setSelectedGalleryImages((prev) => ({ ...prev, [product.id]: currentImg.id }));
    setDetailProductId(product.id);
  };

  // Navegación por teclado (Escape, Flecha Izquierda, Flecha Derecha) dentro de la galería de detalle
  useEffect(() => {
    if (!detailProduct) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDetailProductId(null);
        return;
      }
      if (detailProduct.gallery.length <= 1) return;

      const activeVariantId =
        selectedVariants[detailProduct.id] || detailProduct.variants[0].id;
      const activeVariant =
        detailProduct.variants.find((v) => v.id === activeVariantId) ||
        detailProduct.variants[0];
      const currentImg = resolveActiveProductImage(detailProduct, activeVariant);
      const currentIndex = detailProduct.gallery.findIndex(
        (img) => img.id === currentImg.id
      );

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % detailProduct.gallery.length;
        handleGalleryImageSelect(detailProduct, detailProduct.gallery[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex =
          (currentIndex - 1 + detailProduct.gallery.length) %
          detailProduct.gallery.length;
        handleGalleryImageSelect(detailProduct, detailProduct.gallery[prevIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    detailProduct,
    selectedVariants,
    resolveActiveProductImage,
    handleGalleryImageSelect,
  ]);

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
    <div className="relative min-h-screen bg-obsidian-900 text-celestial-ivory flex flex-col selection:bg-gold-500 selection:text-obsidian-950">
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
      {/* BARRA DE NAVEGACIÓN PRINCIPAL EN FILA ÚNICA HORIZONTAL (ESCRITORIO) */}
      {/* ---------------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-obsidian-900/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 xl:px-8">
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-y-2.5 lg:gap-x-2 xl:gap-x-4 py-2.5 lg:py-0 lg:h-16">
            {/* 1. EMBLEMA DORADO A LA IZQUIERDA */}
            <div className="flex items-center flex-shrink-0 order-1">
              <div className="relative h-11 w-11 sm:h-12 sm:w-12 cursor-pointer flex-shrink-0">
                <Image
                  src="/brand/dualidad_emblema.webp"
                  alt="Duality Rol"
                  fill
                  priority
                  sizes="(max-width: 640px) 44px, 48px"
                  className="object-contain"
                />
              </div>
            </div>

            {/* 2. CATEGORÍAS DISTRIBUIDAS HORIZONTALMENTE EN EL ESPACIO CENTRAL */}
            <nav
              aria-label="Categorías del catálogo"
              className="order-3 lg:order-2 w-full lg:w-auto lg:flex-1 min-w-0 overflow-x-auto lg:overflow-visible scrollbar-none pb-1 lg:pb-0"
            >
              <div className="flex items-center lg:justify-center gap-1.5 lg:gap-1 xl:gap-2">
                {DEMO_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`whitespace-nowrap px-3 lg:px-2 xl:px-3 py-1.5 rounded-full border text-[11px] xl:text-xs tracking-wide xl:tracking-wider uppercase font-medium transition-all flex-shrink-0 ${
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
            </nav>

            {/* 3. BOTÓN DEL CARRITO DEMO ALINEADO A LA DERECHA */}
            <div className="flex items-center flex-shrink-0 order-2 lg:order-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 xl:px-4 py-1.5 sm:py-2 rounded-lg bg-obsidian-800/90 hover:bg-obsidian-700 border border-obsidian-600 hover:border-gold-500/40 text-celestial-ivory transition-all group"
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
        </div>
      </header>

      {/* ---------------------------------------------------------------------- */}
      {/* HERO SECTION Y DESCRIPCIÓN EN COMPOSICIÓN CONTINUA */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative w-full">
        {/* 1. BANNER COMPLETO DIRECTO MEJORADO CON COMFYUI (duality_banner_upscaled_3840.png 3840x1526) */}
        <div className="relative w-full aspect-[3840/1526] overflow-hidden bg-obsidian-900 select-none">
          <Image
            src="/brand/duality_banner_upscaled_3840.png"
            alt="Duality Rol — Forjados bajo la luz celestial, templados en la penumbra"
            width={3840}
            height={1526}
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className="w-full h-auto block pointer-events-none"
          />

          {/* Degradado superior sutil desde el color exacto del encabezado (obsidian-900) hacia transparente */}
          <div className="absolute inset-x-0 top-0 h-8 sm:h-12 md:h-16 lg:h-20 bg-gradient-to-b from-obsidian-900 via-obsidian-900/60 to-transparent pointer-events-none" />

          {/* Degradado inferior progresivo que funde el borde del banner con bg-obsidian-900 sin tapar el eslogan */}
          <div className="absolute inset-x-0 bottom-0 h-14 sm:h-24 md:h-32 lg:h-36 bg-gradient-to-t from-obsidian-900 via-obsidian-900/70 to-transparent pointer-events-none" />

          {/* Encabezado semántico para accesibilidad/SEO sin duplicar texto en pantalla */}
          <h1 className="sr-only">
            Duality Rol — Forjados bajo la luz celestial, templados en la penumbra
          </h1>
        </div>

        {/*
          IMPLEMENTACIÓN MULTI-CAPA ANTERIOR CONSERVADA PARA REVERSIÓN RÁPIDA:
          <div className="relative w-full aspect-[1024/400] overflow-hidden bg-obsidian-900 select-none">
            <Image src="/brand/hero_bg.webp" alt="Fondo Cósmico Celestial Duality Rol" fill priority sizes="100vw" className="w-full h-full object-cover pointer-events-none" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">
              <div className="flex flex-col items-center justify-center w-[88%] sm:w-[70%] md:w-[54%] lg:w-[46%] xl:w-[41%] translate-y-[1.5%] sm:translate-y-[2%]">
                <div className="relative w-[95%] aspect-[1024/512] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                  <Image src="/brand/hero_logo.webp" alt="Duality Rol — Emblema Sol y Luna" fill priority sizes="(max-width: 640px) 76vw, (max-width: 1024px) 52vw, 40vw" className="w-full h-full object-contain pointer-events-none" />
                </div>
                <h1 className="w-full flex flex-col items-center text-center font-serif leading-tight mt-1 sm:mt-1.5 md:mt-2 lg:mt-2.5">
                  <span className="text-[10px] min-[380px]:text-[12px] min-[480px]:text-[13.5px] sm:text-base md:text-lg lg:text-xl xl:text-2xl tracking-[0.24em] min-[380px]:tracking-[0.26em] sm:tracking-[0.28em] md:tracking-[0.3em] text-celestial-ivory font-semibold uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">Forjados bajo la luz celestial</span>
                  <span className="text-[9px] min-[380px]:text-[10.5px] min-[480px]:text-[12px] sm:text-sm md:text-base lg:text-lg xl:text-xl tracking-[0.26em] min-[380px]:tracking-[0.3em] sm:tracking-[0.32em] md:tracking-[0.35em] text-[#F0C879] font-semibold uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_12px_rgba(0,0,0,0.85)] mt-0.5 sm:mt-1">Templados en la penumbra</span>
                </h1>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-6 sm:h-12 md:h-18 bg-gradient-to-t from-obsidian-900 via-obsidian-900/35 to-transparent pointer-events-none" />
          </div>
        */}

        {/* 2. TEXTO DESCRIPTIVO E INSIGNIAS INFORMATIVAS (INTEGRADOS EN CONTINUIDAD CON EL HERO) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center -mt-1 sm:-mt-3 pt-2 pb-6 sm:pb-8">
          <p className="text-xs sm:text-sm md:text-base text-celestial-silver max-w-2xl mx-auto font-light leading-relaxed">
            Accesorios de rol boutique, dados artesanales y piezas singulares impresas en 3D.
            Cada lanzamiento equilibra el día, la noche y el destino en tu mesa.
          </p>

          <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs text-celestial-silver">
            <div className="flex items-center gap-2 bg-obsidian-800/70 border border-obsidian-700/80 px-3.5 py-1.5 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              <span>Retiro acordado (Argentina)</span>
            </div>
            <div className="flex items-center gap-2 bg-obsidian-800/70 border border-obsidian-700/80 px-3.5 py-1.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>Calidad artesanal 3D & Reventa seleccionada</span>
            </div>
            <div className="flex items-center gap-2 bg-obsidian-800/70 border border-obsidian-700/80 px-3.5 py-1.5 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Precios en Pesos Argentinos (ARS)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* CATÁLOGO DE PRODUCTOS DE DEMOSTRACIÓN */}
      {/* ---------------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 w-full">
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
            const activeImage = resolveActiveProductImage(product, activeVariant);
            const hasImageError = Boolean(failedImages[activeImage.url]);
            const isMultiViewSingleVariant =
              product.variants.length === 1 && product.gallery.length > 1;

            return (
              <div
                key={product.id}
                className="group relative bg-obsidian-800 rounded-xl border border-obsidian-600 hover:border-gold-500/50 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-gold-glow"
              >
                {/* CABECERA DE FOTOGRAFÍA CONCEPTUAL DEL PRODUCTO */}
                <div className="relative aspect-square bg-obsidian-950 border-b border-obsidian-700/60 overflow-hidden select-none">
                  {/* Fotografía principal de la variante / vista activa con fallback elegante */}
                  {!hasImageError ? (
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(product)}
                      className="relative w-full h-full block text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-inset cursor-pointer"
                      aria-label={`Ver galería y detalles de ${product.name} (${activeImage.label})`}
                    >
                      <Image
                        key={activeImage.url}
                        src={activeImage.url}
                        alt={activeImage.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [activeImage.url]: true }))
                        }
                        className="object-contain p-1.5 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(product)}
                      className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-obsidian-950 to-obsidian-850"
                      aria-label={`Ver detalles de ${product.name}`}
                    >
                      <div className="w-20 h-20 rounded-full border border-gold-500/20 bg-obsidian-900/80 flex items-center justify-center p-3 shadow-inner">
                        <Image
                          src="/brand/logo_only.png"
                          alt="Símbolo Duality Rol"
                          width={48}
                          height={48}
                          className="object-contain opacity-75"
                        />
                      </div>
                      <span className="mt-3 text-xs font-serif text-celestial-silver">
                        {activeImage.label}
                      </span>
                    </button>
                  )}

                  {/* Viñetas oscuras superior e inferior sutiles para garantizar legibilidad de insignias */}
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-obsidian-950/85 via-obsidian-950/35 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-obsidian-950/90 via-obsidian-950/45 to-transparent pointer-events-none" />

                  {/* Barra superior: Insignia Creación Duality / Reventa y Stock */}
                  <div className="absolute inset-x-0 top-0 p-3.5 flex items-center justify-between z-10 pointer-events-none">
                    {product.isDualityCreation ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-serif uppercase tracking-widest px-2.5 py-1 rounded-full bg-obsidian-950/85 text-gold-300 border border-gold-500/45 backdrop-blur-md shadow-sm">
                        <Sparkles className="w-3 h-3 text-gold-400" />
                        Creación Duality
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-obsidian-950/85 text-celestial-silver border border-obsidian-600 backdrop-blur-md shadow-sm">
                        <Package className="w-3 h-3" />
                        Reventa
                      </span>
                    )}

                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-obsidian-950/85 border border-obsidian-700/80 backdrop-blur-md">
                      {activeVariant.stock > 0 ? (
                        <span className="text-emerald-400/95 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Stock: {activeVariant.stock}
                        </span>
                      ) : (
                        <span className="text-rose-400">Agotado</span>
                      )}
                    </span>
                  </div>

                  {/* Barra inferior sobre imagen: Categoría, SKU y acceso rápido a Galería */}
                  <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between gap-2 z-10 pointer-events-none">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-gold-400 font-serif drop-shadow">
                        {product.categoryName}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-celestial-silver/90">
                        SKU: {activeVariant.sku}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDetail(product)}
                      className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-900/90 hover:bg-obsidian-800 text-celestial-ivory border border-obsidian-600 hover:border-gold-500/50 text-[11px] font-medium transition-all backdrop-blur-md shadow-sm"
                      aria-label={`Abrir galería de ${product.name}`}
                    >
                      <Eye className="w-3.5 h-3.5 text-gold-400" />
                      <span>Galería ({product.gallery.length})</span>
                    </button>
                  </div>
                </div>

                {/* CONTENIDO DE FICHA */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(product)}
                        className="text-left focus:outline-none focus-visible:underline"
                      >
                        <h3 className="text-base font-serif tracking-wide text-celestial-ivory group-hover:text-gold-300 transition-colors">
                          {product.name}
                        </h3>
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-celestial-silver line-clamp-2 font-light leading-relaxed">
                      {product.description}
                    </p>

                    {/* SELECTOR DE VARIANTES (Productos con múltiples acabados) */}
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

                    {/* SELECTOR DE VISTAS DE GALERÍA (Para producto de variante única con 2 vistas como el Dragón) */}
                    {isMultiViewSingleVariant && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] uppercase tracking-wider text-celestial-muted font-medium">
                            Acabado: {activeVariant.name}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-gold-400/90 font-serif">
                            2 Vistas
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5" role="group" aria-label={`Vistas de ${product.name}`}>
                          {product.gallery.map((img) => {
                            const isCurrentView = activeImage.id === img.id;
                            return (
                              <button
                                key={img.id}
                                type="button"
                                onClick={() => handleGalleryImageSelect(product, img)}
                                className={`px-2.5 py-1.5 rounded text-xs border transition-all flex items-center justify-between ${
                                  isCurrentView
                                    ? "bg-gold-500/15 border-gold-500/60 text-celestial-ivory"
                                    : "bg-obsidian-850 border-obsidian-700 text-celestial-silver hover:border-obsidian-600"
                                }`}
                              >
                                <span className="truncate">{img.label}</span>
                                {isCurrentView && (
                                  <Check className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 ml-1" />
                                )}
                              </button>
                            );
                          })}
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(product)}
                        className="px-2.5 py-2 rounded-lg bg-obsidian-700/80 hover:bg-obsidian-700 text-celestial-silver hover:text-celestial-ivory border border-obsidian-600 text-xs transition-all"
                        aria-label={`Ver detalle de ${product.name}`}
                        title="Ver galería y especificaciones"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="px-3.5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-medium text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shadow-sm hover:shadow-gold-glow"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ---------------------------------------------------------------------- */}
      {/* VISTA DE DETALLE Y GALERÍA DE PRODUCTO (MODAL INTERACTIVO ACCESIBLE) */}
      {/* ---------------------------------------------------------------------- */}
      {detailProduct && (() => {
        const activeVariantId =
          selectedVariants[detailProduct.id] || detailProduct.variants[0].id;
        const activeVariant =
          detailProduct.variants.find((v) => v.id === activeVariantId) ||
          detailProduct.variants[0];
        const activeImage = resolveActiveProductImage(detailProduct, activeVariant);
        const currentImgIndex = detailProduct.gallery.findIndex(
          (img) => img.id === activeImage.id
        );
        const hasDetailImageError = Boolean(failedImages[activeImage.url]);

        const goPrevImage = () => {
          const prevIdx =
            (currentImgIndex - 1 + detailProduct.gallery.length) %
            detailProduct.gallery.length;
          handleGalleryImageSelect(detailProduct, detailProduct.gallery[prevIdx]);
        };

        const goNextImage = () => {
          const nextIdx = (currentImgIndex + 1) % detailProduct.gallery.length;
          handleGalleryImageSelect(detailProduct, detailProduct.gallery[nextIdx]);
        };

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-obsidian-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-product-title"
            onClick={() => setDetailProductId(null)}
          >
            <div
              className="relative w-full max-w-4xl bg-obsidian-900 border border-obsidian-600 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar superior derecho */}
              <button
                type="button"
                onClick={() => setDetailProductId(null)}
                className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-obsidian-950/85 hover:bg-obsidian-800 text-celestial-silver hover:text-celestial-ivory border border-obsidian-600 transition-colors"
                aria-label="Cerrar galería de producto"
              >
                <X className="w-4 h-4" />
              </button>

              {/* COLUMNA IZQUIERDA: GALERÍA VISUAL CON MINIATURAS */}
              <div className="w-full md:w-1/2 bg-obsidian-950 border-b md:border-b-0 md:border-r border-obsidian-700/70 p-4 sm:p-6 flex flex-col justify-between select-none">
                {/* Visor de imagen principal */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-obsidian-900/60 border border-obsidian-800 flex items-center justify-center">
                  {!hasDetailImageError ? (
                    <Image
                      key={activeImage.url}
                      src={activeImage.url}
                      alt={activeImage.alt}
                      fill
                      sizes="(max-width: 768px) 92vw, 440px"
                      priority
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [activeImage.url]: true,
                        }))
                      }
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Image
                        src="/brand/logo_only.png"
                        alt="Símbolo Duality Rol"
                        width={64}
                        height={64}
                        className="object-contain opacity-75"
                      />
                      <span className="mt-3 text-xs font-serif text-celestial-silver">
                        {activeImage.label}
                      </span>
                    </div>
                  )}

                  {/* Controles Anterior / Siguiente para navegar cómodamente en móvil y escritorio */}
                  {detailProduct.gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goPrevImage}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-obsidian-950/85 hover:bg-obsidian-800 text-celestial-ivory border border-obsidian-600 hover:border-gold-500/50 transition-all shadow-md"
                        aria-label="Imagen anterior"
                      >
                        <ChevronLeft className="w-4 h-4 text-gold-400" />
                      </button>
                      <button
                        type="button"
                        onClick={goNextImage}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-obsidian-950/85 hover:bg-obsidian-800 text-celestial-ivory border border-obsidian-600 hover:border-gold-500/50 transition-all shadow-md"
                        aria-label="Siguiente imagen"
                      >
                        <ChevronRight className="w-4 h-4 text-gold-400" />
                      </button>
                    </>
                  )}

                  {/* Etiqueta de la vista o acabado actualmente visible */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between px-3 py-1.5 rounded-lg bg-obsidian-950/85 border border-obsidian-700/80 backdrop-blur-md text-[11px]">
                    <span className="text-celestial-ivory font-medium truncate">
                      {activeImage.label}
                    </span>
                    <span className="text-gold-400 font-mono text-[10px] ml-2 flex-shrink-0">
                      {currentImgIndex + 1} / {detailProduct.gallery.length}
                    </span>
                  </div>
                </div>

                {/* Tira de miniaturas seleccionables */}
                <div className="mt-4">
                  <span className="text-[10px] uppercase tracking-widest text-celestial-muted block mb-2">
                    {detailProduct.variants.length > 1
                      ? "Miniaturas por variante (clic o flechas ← →):"
                      : "Vistas del artículo (clic o flechas ← →):"}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {detailProduct.gallery.map((img) => {
                      const isSelectedImg = activeImage.id === img.id;
                      const thumbError = Boolean(failedImages[img.url]);
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => handleGalleryImageSelect(detailProduct, img)}
                          className={`group/thumb relative flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                            isSelectedImg
                              ? "bg-gold-500/15 border-gold-500 text-celestial-ivory shadow-gold-glow"
                              : "bg-obsidian-900 border-obsidian-700 text-celestial-silver hover:border-obsidian-500"
                          }`}
                          aria-label={`Seleccionar imagen: ${img.label}`}
                          aria-pressed={isSelectedImg}
                        >
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-obsidian-950 border border-obsidian-700 flex-shrink-0">
                            {!thumbError ? (
                              <Image
                                src={img.url}
                                alt={img.alt}
                                fill
                                sizes="48px"
                                onError={() =>
                                  setFailedImages((prev) => ({
                                    ...prev,
                                    [img.url]: true,
                                  }))
                                }
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-gold-400/60" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-[11px] font-medium leading-tight truncate">
                              {img.label}
                            </span>
                            <span className="block text-[10px] text-celestial-muted mt-0.5">
                              {img.variantId ? "Acabado" : "Vista de galería"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: INFORMACIÓN COMERCIAL, SELECTOR DE VARIANTES Y COMPRA */}
              <div className="w-full md:w-1/2 p-5 sm:p-7 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3 pr-8">
                    <span className="text-[11px] uppercase tracking-widest text-gold-400 font-serif">
                      {detailProduct.categoryName}
                    </span>
                    <span className="text-obsidian-600">•</span>
                    <span className="text-[11px] font-mono text-celestial-silver">
                      SKU: {activeVariant.sku}
                    </span>
                  </div>

                  <h2
                    id="detail-product-title"
                    className="text-xl sm:text-2xl font-serif tracking-wide text-celestial-ivory"
                  >
                    {detailProduct.name}
                  </h2>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-2xl font-serif text-gold-300 font-semibold">
                      ${activeVariant.priceArs.toLocaleString("es-AR")} ARS
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-obsidian-800 border border-obsidian-600">
                      {activeVariant.stock > 0 ? (
                        <span className="text-emerald-400">
                          Disponible ({activeVariant.stock} u.)
                        </span>
                      ) : (
                        <span className="text-rose-400">Agotado</span>
                      )}
                    </span>
                  </div>

                  <p className="mt-4 text-xs sm:text-sm text-celestial-silver font-light leading-relaxed">
                    {detailProduct.description}
                  </p>

                  {/* Selector de variantes sincronizado con la galería */}
                  <div className="mt-5">
                    <label className="text-[11px] uppercase tracking-wider text-celestial-muted block mb-2 font-medium">
                      {detailProduct.variants.length > 1
                        ? "Seleccionar Variante / Acabado:"
                        : "Especificación de Pieza (Única variante):"}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {detailProduct.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleVariantChange(detailProduct.id, v.id)}
                          className={`text-left px-3.5 py-2.5 rounded-lg text-xs border transition-all flex items-center justify-between ${
                            activeVariant.id === v.id
                              ? "bg-gold-500/15 border-gold-500 text-celestial-ivory shadow-gold-glow"
                              : "bg-obsidian-850 border-obsidian-700 text-celestial-silver hover:border-obsidian-500"
                          }`}
                        >
                          <div>
                            <span className="font-medium block">{v.name}</span>
                            <span className="text-[10px] font-mono text-celestial-muted">
                              SKU: {v.sku} · Stock: {v.stock}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-gold-300 font-semibold">
                              ${v.priceArs.toLocaleString("es-AR")}
                            </span>
                            {activeVariant.id === v.id && (
                              <Check className="w-4 h-4 text-gold-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Características destacadas */}
                  <div className="mt-5 pt-4 border-t border-obsidian-700/60">
                    <span className="text-[11px] uppercase tracking-wider text-celestial-muted block mb-2 font-medium">
                      Características de la pieza:
                    </span>
                    <ul className="space-y-1.5 text-xs text-celestial-silver">
                      {detailProduct.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-gold-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Botón de compra en modal */}
                <div className="mt-6 pt-4 border-t border-obsidian-700 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(detailProduct)}
                    className="w-full py-3 px-4 rounded-lg bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-gold-glow"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      Agregar al Carrito — ${activeVariant.priceArs.toLocaleString("es-AR")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
                aria-label="Cerrar carrito"
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
                cart.map((item, index) => {
                  const itemImage = item.variant.image || item.product.mainImage;
                  return (
                    <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-obsidian-950 border border-obsidian-700 flex-shrink-0">
                          <Image
                            src={itemImage}
                            alt={`${item.product.name} — ${item.variant.name}`}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
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
                      </div>
                      <span className="font-serif text-sm text-gold-300 font-semibold flex-shrink-0">
                        ${(item.variant.priceArs * item.quantity).toLocaleString("es-AR")}
                      </span>
                    </div>
                  );
                })
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
