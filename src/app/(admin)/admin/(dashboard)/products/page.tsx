import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductTableManager } from "@/components/admin/ProductTableManager";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await db.getProducts();
  const categories = await db.getCategories();

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Silhouettes & Inventory"
        description="Comprehensive catalogue management, pricing control, and live stock tracking."
      />

      <div className="p-6 sm:p-8 max-w-7xl">
        <ProductTableManager
          products={products}
          categories={categories}
        />
      </div>
    </div>
  );
}
