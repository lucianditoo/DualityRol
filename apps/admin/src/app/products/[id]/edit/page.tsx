import { redirect, notFound } from "next/navigation";
import { prisma } from "@duality/database";
import { validateCurrentSession } from "../../../../lib/auth";
import AdminLayoutShell from "../../../../components/AdminLayoutShell";
import ProductFormClient, {
  ProductFormInitialData,
} from "../../../../components/products/ProductFormClient";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await validateCurrentSession();

  if (!session.valid || !session.user) {
    redirect("/login");
  }

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
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

  if (!product) {
    notFound();
  }

  const initialData: ProductFormInitialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePriceArs: Number(product.basePriceArs),
    categoryId: product.categoryId,
    isSelfMade: product.isSelfMade,
    isDualityCreation: product.isDualityCreation,
    isActive: product.isActive,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      priceAdjustmentArs: Number(v.priceAdjustmentArs),
      stock: v.stock,
      isActive: v.isActive,
      hasReferences:
        v._count.orderItems > 0 || v._count.stockReservations > 0,
    })),
  };

  return (
    <AdminLayoutShell
      user={session.user}
      title={`Editar: ${product.name}`}
      subtitle={`Slug: /${product.slug} · ID: ${product.id}`}
    >
      <ProductFormClient
        mode="edit"
        categories={categories}
        initialData={initialData}
        userRole={session.user.role}
      />
    </AdminLayoutShell>
  );
}
