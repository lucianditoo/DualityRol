// ==============================================================================
// DUALITY ROL — DATOS DE DEMOSTRACIÓN (SOLO VISTA PREVIA)
// Estos productos son ficticios para maquetación y NO tocan la base de datos comercial.
// ==============================================================================

export interface DemoVariant {
  id: string;
  name: string;
  sku: string;
  priceArs: number;
  stock: number;
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
    variants: [
      { id: "var-1a", name: "Obsidiana & Oro Solar", sku: "TWR-ECL-OBS-GLD", priceArs: 18500, stock: 3 },
      { id: "var-1b", name: "Marfil & Plata Lunar", sku: "TWR-ECL-IVR-SLV", priceArs: 18500, stock: 2 },
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
    variants: [
      { id: "var-2a", name: "Nebulosa Dorada (Números Oro)", sku: "DICE-VAC-GLD", priceArs: 12000, stock: 8 },
      { id: "var-2b", name: "Aurora Esmeralda", sku: "DICE-VAC-ESM", priceArs: 12500, stock: 4 },
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
    variants: [
      { id: "var-3a", name: "Pana Negra / Grabado Oro", sku: "TR-SLS-BLK", priceArs: 15200, stock: 5 },
      { id: "var-3b", name: "Pana Borgoña Profundo", sku: "TR-SLS-BUR", priceArs: 15200, stock: 2 },
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
    variants: [
      { id: "var-4a", name: "Roble Negro & Latón Satinado", sku: "SCRN-DM-OBS", priceArs: 28000, stock: 1 },
      { id: "var-4b", name: "Gris Estelar", sku: "SCRN-DM-GRY", priceArs: 28000, stock: 2 },
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
    variants: [
      { id: "var-5a", name: "Resina Gris Antracita 8K", sku: "MINI-DRG-8K", priceArs: 9500, stock: 6 },
    ],
    features: ["Resina ABS-Like de alta resistencia", "Base de 50mm incluida", "Detalles microscópicos de escamas"],
  },
  {
    id: "demo-prod-6",
    name: "Caja de Dados Modular Órbita",
    categorySlug: "organizadores-almacenamiento",
    categoryName: "Organizadores y almacenamiento",
    description:
      "Contenedor cilíndrico cilíndrico de 2 niveles con tapa giratoria de cierre celestial. Permite resguardar hasta dos sets completos de dados protegidos individualmente.",
    basePriceArs: 11000,
    isSelfMade: true,
    isDualityCreation: true,
    symbolIcon: "eclipse",
    variants: [
      { id: "var-6a", name: "Obsidiana & Anillo Dorado", sku: "BOX-ORB-BLK", priceArs: 11000, stock: 4 },
      { id: "var-6b", name: "Blanco Cósmico", sku: "BOX-ORB-WHT", priceArs: 11000, stock: 3 },
    ],
    features: ["Creación Duality", "Tapa con encastre milimétrico", "Compacto para mochila o bolsillo"],
  },
];
