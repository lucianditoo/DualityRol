import { redirect } from "next/navigation";
import { prisma } from "@duality/database";
import { validateCurrentSession } from "../../../lib/auth";
import AdminLayoutShell from "../../../components/AdminLayoutShell";
import ProductFormClient from "../../../components/products/ProductFormClient";

export default async function NewProductPage() {
  const session = await validateCurrentSession();

  if (!session.valid || !session.user) {
    redirect("/login");
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <AdminLayoutShell
      user={session.user}
      title="Alta de Nuevo Producto"
      subtitle="Registrá un producto comercial real y sus variantes iniciales en PostgreSQL"
    >
      <ProductFormClient
        mode="create"
        categories={categories}
        userRole={session.user.role}
      />
    </AdminLayoutShell>
  );
}
