import { redirect } from "next/navigation";
import { prisma, Prisma } from "@duality/database";
import { validateCurrentSession } from "../../lib/auth";
import AdminLayoutShell from "../../components/AdminLayoutShell";
import ProductsTableClient, {
  SerializedProduct,
} from "../../components/products/ProductsTableClient";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    selfMade?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 10;

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await validateCurrentSession();

  if (!session.valid || !session.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const searchQuery = (params.q || "").trim();
  const categoryFilter = params.category || "all";
  const statusFilter = params.status || "all";
  const selfMadeFilter = params.selfMade || "all";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // Construir filtro Prisma resuelto 100% en Servidor
  const where: Prisma.ProductWhereInput = {};

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { slug: { contains: searchQuery, mode: "insensitive" } },
      {
        variants: {
          some: {
            sku: { contains: searchQuery, mode: "insensitive" },
          },
        },
      },
    ];
  }

  if (categoryFilter && categoryFilter !== "all") {
    where.categoryId = categoryFilter;
  }

  if (statusFilter === "active") {
    where.isActive = true;
  } else if (statusFilter === "inactive") {
    where.isActive = false;
  }

  if (selfMadeFilter === "true") {
    where.isSelfMade = true;
  } else if (selfMadeFilter === "false") {
    where.isSelfMade = false;
  }

  const [totalCount, productsRaw, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          where: { isThumbnail: true },
          take: 1,
        },
        _count: {
          select: { orderItems: true, images: true },
        },
        variants: {
          orderBy: { createdAt: "asc" },
          include: {
            _count: {
              select: { orderItems: true, stockReservations: true },
            },
          },
        },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Serializar objetos Decimal a números planos seguros para el Client Component
  const serializedProducts: SerializedProduct[] = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePriceArs: Number(p.basePriceArs),
    isSelfMade: p.isSelfMade,
    isDualityCreation: p.isDualityCreation,
    isActive: p.isActive,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    thumbnailUrl: p.images[0]?.url || null,
    hasOrderReferences:
      p._count.orderItems > 0 ||
      p._count.images > 0 ||
      p.variants.some(
        (v) => v._count.orderItems > 0 || v._count.stockReservations > 0
      ),
    createdAt: p.createdAt.toISOString(),
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      priceAdjustmentArs: Number(v.priceAdjustmentArs),
      stock: v.stock,
      isActive: v.isActive,
      hasReferences:
        v._count.orderItems > 0 || v._count.stockReservations > 0,
    })),
  }));

  return (
    <AdminLayoutShell
      user={session.user}
      title="Catálogo de Productos"
      subtitle="Administración soberana de productos, variantes, SKUs y stock en ARS"
    >
      <ProductsTableClient
        products={serializedProducts}
        categories={categories}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        currentSearch={searchQuery}
        currentCategory={categoryFilter}
        currentStatus={statusFilter}
        currentSelfMade={selfMadeFilter}
        userRole={session.user.role}
      />
    </AdminLayoutShell>
  );
}
