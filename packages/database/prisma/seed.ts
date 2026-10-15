import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_CATEGORIES = [
  {
    name: "Dados",
    slug: "dados",
    description: "Sets de dados poliédricos, resinas exclusivas y metales místicos.",
    displayOrder: 1,
  },
  {
    name: "Miniaturas",
    slug: "miniaturas",
    description: "Criaturas, héroes y monstruos con nivel de detalle artesanal e impresión 3D.",
    displayOrder: 2,
  },
  {
    name: "Torres de dados",
    slug: "torres-de-dados",
    description: "Estructuras cósmicas y celestiales para lanzamientos justos e inmersivos.",
    displayOrder: 3,
  },
  {
    name: "Bandejas de dados",
    slug: "bandejas-de-dados",
    description: "Superficies acolchadas y grabadas para proteger tu mesa y tus dados.",
    displayOrder: 4,
  },
  {
    name: "Accesorios para Dungeon Masters",
    slug: "accesorios-dm",
    description: "Pantallas de DM, contadores de iniciativa, tokens y herramientas de mesa.",
    displayOrder: 5,
  },
  {
    name: "Organizadores y almacenamiento",
    slug: "organizadores-almacenamiento",
    description: "Cajas de dados, estuches de miniaturas y bandejas modulares de transporte.",
    displayOrder: 6,
  },
  {
    name: "Otros accesorios",
    slug: "otros-accesorios",
    description: "Monedas metálicas, pociones, marcadores de estado y creaciones únicas.",
    displayOrder: 7,
  },
];

async function main() {
  console.log("🌌 Iniciando siembra de datos de Duality Rol...");

  for (const cat of INITIAL_CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
    });
    console.log(`✓ Categoría cargada: ${upserted.name} (${upserted.slug})`);
  }

  console.log("✨ Siembra de datos completada exitosamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en la siembra de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
