// ==============================================================================
// DUALITY ROL — DATOS DE DEMOSTRACIÓN (SOLO VISTA PREVIA)
// Estos productos son ficticios para maquetación y NO tocan la base de datos comercial.
// ==============================================================================

export interface DemoProductImage {
  id: string;
  url: string;
  alt: string;
  label: string;
  variantId?: string;
}

export interface DemoVariant {
  id: string;
  name: string;
  sku: string;
  priceArs: number;
  stock: number;
  image?: string;
  imageAlt?: string;
}

export interface DemoProduct {
  id: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  description: string;
  basePriceArs: number;
  isSelfMade: boolean; // Impresión 3D propia
  isDualityCreation: boolean; // Insignia dorada «Creación Duality»
  symbolIcon: "sun" | "moon" | "eclipse" | "d20" | "orbit";
  mainImage: string;
  mainImageAlt: string;
  gallery: DemoProductImage[];
  variants: DemoVariant[];
  features: string[];
}

export const DEMO_CATEGORIES = [
  { id: "all", name: "Todo el Catálogo", slug: "all" },
  { id: "torres", name: "Torres de dados", slug: "torres-de-dados" },
  { id: "dados", name: "Dados", slug: "dados" },
  { id: "bandejas", name: "Bandejas de dados", slug: "bandejas-de-dados" },
  { id: "dm", name: "Accesorios DM", slug: "accesorios-dm" },
  { id: "miniaturas", name: "Miniaturas", slug: "miniaturas" },
  { id: "organizadores", name: "Organizadores", slug: "organizadores-almacenamiento" },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "demo-prod-1",
    name: "Torre de Dados Eclipse Celestial",
    categorySlug: "torres-de-dados",
    categoryName: "Torres de dados",
    description:
      "Torre de dados modular impresa en resina de alta densidad con bajorrelieves astronómicos del Sol y la Luna. Diseñada para una rodadura suave y silenciosa con bandeja receptora imantada.",
    basePriceArs: 18500,
    isSelfMade: true,
    isDualityCreation: true,
    symbolIcon: "eclipse",
    mainImage: "/products/demo/torre-eclipse/obsidiana-oro-solar.webp",
    mainImageAlt:
      "Torre de Dados Eclipse Celestial en acabado Obsidiana y Oro Solar con relieve de eclipse",
    gallery: [
      {
        id: "img-1a",
        url: "/products/demo/torre-eclipse/obsidiana-oro-solar.webp",
        alt: "Torre de Dados Eclipse Celestial — Acabado Obsidiana & Oro Solar con detalles astronómicos dorados",
        label: "Obsidiana & Oro Solar",
        variantId: "var-1a",
      },
      {
        id: "img-1b",
        url: "/products/demo/torre-eclipse/marfil-plata-lunar.webp",
        alt: "Torre de Dados Eclipse Celestial — Acabado Marfil & Plata Lunar con detalles plateados",
        label: "Marfil & Plata Lunar",
        variantId: "var-1b",
      },
    ],
    variants: [
      {
        id: "var-1a",
        name: "Obsidiana & Oro Solar",
        sku: "TWR-ECL-OBS-GLD",
        priceArs: 18500,
        stock: 3,
        image: "/products/demo/torre-eclipse/obsidiana-oro-solar.webp",
        imageAlt:
          "Torre de Dados Eclipse Celestial — Acabado Obsidiana & Oro Solar con detalles astronómicos dorados",
      },
      {
        id: "var-1b",
        name: "Marfil & Plata Lunar",
        sku: "TWR-ECL-IVR-SLV",
        priceArs: 18500,
        stock: 2,
        image: "/products/demo/torre-eclipse/marfil-plata-lunar.webp",
        imageAlt:
          "Torre de Dados Eclipse Celestial — Acabado Marfil & Plata Lunar con detalles plateados",
      },
    ],
    features: ["Fabricación propia 3D", "Bandeja imantada", "Compatible con dados de 16mm a 25mm"],
  },
  {
    id: "demo-prod-2",
    name: "Set de Dados Vacío Estelar (7-Die)",
    categorySlug: "dados",
    categoryName: "Dados",
    description:
      "Colección completa de 7 dados poliédricos (d4, d6, d8, d10, d%, d12, d20). Resina translúcida oscura con microescamas doradas que evocan una nebulosa en miniatura.",
    basePriceArs: 12000,
    isSelfMade: false,
    isDualityCreation: false,
    symbolIcon: "d20",
    mainImage: "/products/demo/dados-vacio-estelar/nebulosa-dorada.webp",
    mainImageAlt:
      "Set de 7 dados poliédricos Vacío Estelar en acabado Nebulosa Dorada con números en oro",
    gallery: [
      {
        id: "img-2a",
        url: "/products/demo/dados-vacio-estelar/nebulosa-dorada.webp",
        alt: "Set de Dados Vacío Estelar (7-Die) — Acabado Nebulosa Dorada con números en oro y estuche astral",
        label: "Nebulosa Dorada (Números Oro)",
        variantId: "var-2a",
      },
      {
        id: "img-2b",
        url: "/products/demo/dados-vacio-estelar/aurora-esmeralda.webp",
        alt: "Set de Dados Vacío Estelar (7-Die) — Acabado Aurora Esmeralda en resina verde cósmica y numeración plateada",
        label: "Aurora Esmeralda",
        variantId: "var-2b",
      },
    ],
    variants: [
      {
        id: "var-2a",
        name: "Nebulosa Dorada (Números Oro)",
        sku: "DICE-VAC-GLD",
        priceArs: 12000,
        stock: 8,
        image: "/products/demo/dados-vacio-estelar/nebulosa-dorada.webp",
        imageAlt:
          "Set de Dados Vacío Estelar (7-Die) — Acabado Nebulosa Dorada con números en oro y estuche astral",
      },
      {
        id: "var-2b",
        name: "Aurora Esmeralda",
        sku: "DICE-VAC-ESM",
        priceArs: 12500,
        stock: 4,
        image: "/products/demo/dados-vacio-estelar/aurora-esmeralda.webp",
        imageAlt:
          "Set de Dados Vacío Estelar (7-Die) — Acabado Aurora Esmeralda en resina verde cósmica y numeración plateada",
      },
    ],
    features: ["Bordes afilados pulidos a mano", "Excelente balance", "Incluye estuche de terciopelo"],
  },
  {
    id: "demo-prod-3",
    name: "Bandeja de Dados Solsticio Nocturno",
    categorySlug: "bandejas-de-dados",
    categoryName: "Bandejas de dados",
    description:
      "Bandeja octogonal plegable con botones a presión. Exterior de ecocuero negro texturado e interior de pana ultra suave con grabado láser de constelaciones y fases lunares.",
    basePriceArs: 15200,
    isSelfMade: false,
    isDualityCreation: false,
    symbolIcon: "moon",
    mainImage: "/products/demo/bandeja-solsticio/pana-negra-oro.webp",
    mainImageAlt:
      "Bandeja de Dados Solsticio Nocturno octogonal con interior de pana negra y grabado dorado",
    gallery: [
      {
        id: "img-3a",
        url: "/products/demo/bandeja-solsticio/pana-negra-oro.webp",
        alt: "Bandeja de Dados Solsticio Nocturno — Acabado Pana Negra con grabado láser dorado del Sol y la Luna",
        label: "Pana Negra / Grabado Oro",
        variantId: "var-3a",
      },
      {
        id: "img-3b",
        url: "/products/demo/bandeja-solsticio/pana-borgona.webp",
        alt: "Bandeja de Dados Solsticio Nocturno — Acabado Pana Borgoña Profundo con emblema celestial",
        label: "Pana Borgoña Profundo",
        variantId: "var-3b",
      },
    ],
    variants: [
      {
        id: "var-3a",
        name: "Pana Negra / Grabado Oro",
        sku: "TR-SLS-BLK",
        priceArs: 15200,
        stock: 5,
        image: "/products/demo/bandeja-solsticio/pana-negra-oro.webp",
        imageAlt:
          "Bandeja de Dados Solsticio Nocturno — Acabado Pana Negra con grabado láser dorado del Sol y la Luna",
      },
      {
        id: "var-3b",
        name: "Pana Borgoña Profundo",
        sku: "TR-SLS-BUR",
        priceArs: 15200,
        stock: 2,
        image: "/products/demo/bandeja-solsticio/pana-borgona.webp",
        imageAlt:
          "Bandeja de Dados Solsticio Nocturno — Acabado Pana Borgoña Profundo con emblema celestial",
      },
    ],
    features: ["Plegable plana para transporte", "Superficie de absorción acústica", "Diámetro 22cm"],
  },
  {
    id: "demo-prod-4",
    name: "Pantalla del Dungeon Master Horizonte Astral",
    categorySlug: "accesorios-dm",
    categoryName: "Accesorios para Dungeon Masters",
    description:
      "Pantalla de 4 paneles con bisagras magnéticas ocultas. En el lado del jugador luce un relieve celestino del sol naciente; en el lado del máster incluye soportes magnéticos para tablas de referencia y notas.",
    basePriceArs: 28000,
    isSelfMade: true,
    isDualityCreation: true,
    symbolIcon: "sun",
    mainImage: "/products/demo/pantalla-horizonte-astral/roble-negro-laton.webp",
    mainImageAlt:
      "Pantalla del Dungeon Master Horizonte Astral de 4 paneles en acabado Roble Negro y Latón Satinado",
    gallery: [
      {
        id: "img-4a",
        url: "/products/demo/pantalla-horizonte-astral/roble-negro-laton.webp",
        alt: "Pantalla del Dungeon Master Horizonte Astral — Acabado Roble Negro & Latón Satinado con grabados astronómicos",
        label: "Roble Negro & Latón Satinado",
        variantId: "var-4a",
      },
      {
        id: "img-4b",
        url: "/products/demo/pantalla-horizonte-astral/gris-estelar.webp",
        alt: "Pantalla del Dungeon Master Horizonte Astral — Acabado Gris Estelar con relieves plateados",
        label: "Gris Estelar",
        variantId: "var-4b",
      },
    ],
    variants: [
      {
        id: "var-4a",
        name: "Roble Negro & Latón Satinado",
        sku: "SCRN-DM-OBS",
        priceArs: 28000,
        stock: 1,
        image: "/products/demo/pantalla-horizonte-astral/roble-negro-laton.webp",
        imageAlt:
          "Pantalla del Dungeon Master Horizonte Astral — Acabado Roble Negro & Latón Satinado con grabados astronómicos",
      },
      {
        id: "var-4b",
        name: "Gris Estelar",
        sku: "SCRN-DM-GRY",
        priceArs: 28000,
        stock: 2,
        image: "/products/demo/pantalla-horizonte-astral/gris-estelar.webp",
        imageAlt:
          "Pantalla del Dungeon Master Horizonte Astral — Acabado Gris Estelar con relieves plateados",
      },
    ],
    features: ["Creación Duality", "Imanes de neodimio integrados", "Incluye clips para tablas de 5e/OSR"],
  },
  {
    id: "demo-prod-5",
    name: "Miniatura Dragón de la Penumbra (Escala 32mm)",
    categorySlug: "miniaturas",
    categoryName: "Miniaturas",
    description:
      "Miniatura de colección impresa en resina fotopolímera 8K con acabado curado de máxima definición. Base escénica celestial incluida sin pintar, lista para imprimación.",
    basePriceArs: 9500,
    isSelfMade: true,
    isDualityCreation: true,
    symbolIcon: "orbit",
    mainImage: "/products/demo/dragon-penumbra/vista-frontal.webp",
    mainImageAlt:
      "Miniatura Dragón de la Penumbra en escala 32mm — Vista frontal de tres cuartos sobre base escénica",
    gallery: [
      {
        id: "img-5-front",
        url: "/products/demo/dragon-penumbra/vista-frontal.webp",
        alt: "Miniatura Dragón de la Penumbra (32 mm) — Vista frontal de tres cuartos mostrando alas desplegadas y base celestial",
        label: "Vista Frontal (3/4)",
      },
      {
        id: "img-5-back",
        url: "/products/demo/dragon-penumbra/vista-posterior.webp",
        alt: "Miniatura Dragón de la Penumbra (32 mm) — Vista posterior mostrando texturas de escamas, cola y ruinas en la base",
        label: "Vista Posterior",
      },
    ],
    variants: [
      {
        id: "var-5a",
        name: "Resina Gris Antracita 8K",
        sku: "MINI-DRG-8K",
        priceArs: 9500,
        stock: 6,
        image: "/products/demo/dragon-penumbra/vista-frontal.webp",
        imageAlt:
          "Miniatura Dragón de la Penumbra (32 mm) — Vista frontal de tres cuartos en Resina Gris Antracita 8K",
      },
    ],
    features: ["Resina ABS-Like de alta resistencia", "Base de 50mm incluida", "Detalles microscópicos de escamas"],
  },
  {
    id: "demo-prod-6",
    name: "Caja de Dados Modular Órbita",
    categorySlug: "organizadores-almacenamiento",
    categoryName: "Organizadores y almacenamiento",
    description:
      "Contenedor cilíndrico de 2 niveles con tapa giratoria de cierre celestial. Permite resguardar hasta dos sets completos de dados protegidos individualmente.",
    basePriceArs: 11000,
    isSelfMade: true,
    isDualityCreation: true,
    symbolIcon: "eclipse",
    mainImage: "/products/demo/caja-orbita/obsidiana-anillo-dorado.webp",
    mainImageAlt:
      "Caja de Dados Modular Órbita cilíndrica en acabado Obsidiana y Anillo Dorado con bandejas abiertas",
    gallery: [
      {
        id: "img-6a",
        url: "/products/demo/caja-orbita/obsidiana-anillo-dorado.webp",
        alt: "Caja de Dados Modular Órbita — Acabado Obsidiana & Anillo Dorado con compartimentos giratorios",
        label: "Obsidiana & Anillo Dorado",
        variantId: "var-6a",
      },
      {
        id: "img-6b",
        url: "/products/demo/caja-orbita/blanco-cosmico.webp",
        alt: "Caja de Dados Modular Órbita — Acabado Blanco Cósmico marmolado con detalles plateados",
        label: "Blanco Cósmico",
        variantId: "var-6b",
      },
    ],
    variants: [
      {
        id: "var-6a",
        name: "Obsidiana & Anillo Dorado",
        sku: "BOX-ORB-BLK",
        priceArs: 11000,
        stock: 4,
        image: "/products/demo/caja-orbita/obsidiana-anillo-dorado.webp",
        imageAlt:
          "Caja de Dados Modular Órbita — Acabado Obsidiana & Anillo Dorado con compartimentos giratorios",
      },
      {
        id: "var-6b",
        name: "Blanco Cósmico",
        sku: "BOX-ORB-WHT",
        priceArs: 11000,
        stock: 3,
        image: "/products/demo/caja-orbita/blanco-cosmico.webp",
        imageAlt:
          "Caja de Dados Modular Órbita — Acabado Blanco Cósmico marmolado con detalles plateados",
      },
    ],
    features: ["Creación Duality", "Tapa con encastre milimétrico", "Compacto para mochila o bolsillo"],
  },
];
