import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CategoryTableManager } from "@/components/admin/CategoryTableManager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const categories = await db.getCategories();
  const products = await db.getProducts();

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Category Director"
        description="Structure and manage product taxonomy, hero photography, and catalogue availability."
      />

      <div className="p-6 sm:p-8 max-w-7xl">
        <CategoryTableManager
          categories={categories}
          products={products}
        />
      </div>
    </div>
  );
}
