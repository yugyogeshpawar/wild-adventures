import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Layers,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const stats = await db.getDashboardStats();
  const products = await db.getProducts();
  const categories = await db.getCategories();

  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const handbagCount = products.filter((p) => {
    const cat = categories.find((c) => c.id === p.categoryId);
    return cat?.slug === "hand-bag";
  }).length;

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Atelier Overview"
        description="Real-time catalogue telemetry, inventory health, and category composition."
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/products">
              <Button size="sm" variant="primary" className="text-xs uppercase tracking-wider">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Product
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Products */}
          <div className="bg-white p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs uppercase tracking-widest font-semibold">Total Products</span>
              <div className="p-2 bg-stone-100 rounded text-stone-700">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="font-serif text-3xl font-light text-stone-900">
                {stats.totalProducts}
              </div>
              <p className="mt-1 text-xs text-stone-500">
                <span className="font-semibold text-stone-700">{handbagCount} Hand Bags</span> active
              </p>
            </div>
          </div>

          {/* Card 2: Active Categories */}
          <div className="bg-white p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs uppercase tracking-widest font-semibold">Active Categories</span>
              <div className="p-2 bg-stone-100 rounded text-stone-700">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="font-serif text-3xl font-light text-stone-900">
                {stats.activeCategories}
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {categories.length} total taxonomy groups
              </p>
            </div>
          </div>

          {/* Card 3: Low Stock Alerts */}
          <div className="bg-white p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs uppercase tracking-widest font-semibold">Low Stock Alerts</span>
              <div className={`p-2 rounded ${stats.lowStockCount > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="font-serif text-3xl font-light text-stone-900">
                {stats.lowStockCount}
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {stats.outOfStockCount > 0 ? (
                  <span className="text-rose-600 font-semibold">{stats.outOfStockCount} out of stock</span>
                ) : (
                  <span className="text-emerald-600">Inventory levels healthy</span>
                )}
              </p>
            </div>
          </div>

          {/* Card 4: Inventory Valuation */}
          <div className="bg-white p-6 border border-stone-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs uppercase tracking-widest font-semibold">Inventory Valuation</span>
              <div className="p-2 bg-stone-100 rounded text-stone-700">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="font-serif text-3xl font-light text-stone-900">
                {formatCurrency(stats.totalInventoryValue)}
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Across {stats.totalInventoryCount} units in stock
              </p>
            </div>
          </div>
        </div>

        {/* Section: Category Distribution & Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category distribution */}
          <div className="bg-white p-6 border border-stone-200 shadow-sm lg:col-span-1">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="font-serif text-lg font-light text-stone-900">
                Taxonomy Breakdown
              </h3>
              <Link
                href="/admin/categories"
                className="text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900"
              >
                Manage →
              </Link>
            </div>

            <div className="divide-y divide-stone-100 mt-2">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                const pct = stats.totalProducts > 0 ? Math.round((count / stats.totalProducts) * 100) : 0;
                return (
                  <div key={cat.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-stone-900 flex items-center gap-1.5">
                        <span>{cat.name}</span>
                        {cat.slug === "hand-bag" && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                            Focus
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-400">/{cat.slug}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-stone-800 font-mono">
                        {count} SKUs
                      </div>
                      <div className="text-[10px] text-stone-400">{pct}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low Stock Alerts Table */}
          <div className="bg-white p-6 border border-stone-200 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="font-serif text-lg font-light text-stone-900 flex items-center gap-2">
                  <span>Inventory Replenishment Alerts</span>
                  {lowStockProducts.length > 0 && (
                    <Badge variant="warning">{lowStockProducts.length} Attention</Badge>
                  )}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Products with 5 or fewer items remaining in atelier storage.
                </p>
              </div>
              <Link
                href="/admin/products"
                className="text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900"
              >
                All Products →
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-12 text-center text-stone-500 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-xs">All inventory lines are currently above reserve levels.</p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs min-w-[560px]">
                  <thead className="bg-stone-50 text-stone-600 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Remaining Stock</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {lowStockProducts.map((p) => {
                      const cat = categories.find((c) => c.id === p.categoryId);
                      return (
                        <tr key={p.id} className="hover:bg-stone-50/80">
                          <td className="py-3 px-3 flex items-center gap-3">
                            <div className="relative h-10 w-10 flex-shrink-0 bg-stone-100 border border-stone-200">
                              <Image
                                src={p.images[0] || "/images/products/handbags/classic-leather-tote.jpg"}
                                alt={p.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <span className="font-medium text-stone-900 truncate max-w-[160px]">
                              {p.name}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-stone-500">
                            {p.sku}
                          </td>
                          <td className="py-3 px-3 text-stone-600">
                            {cat?.name || "General"}
                          </td>
                          <td className="py-3 px-3 font-medium text-stone-900">
                            {formatCurrency(p.price)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                              p.stock === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {p.stock === 0 ? "0 (Out)" : `${p.stock} units left`}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/admin/products?search=${encodeURIComponent(p.name)}`}
                              className="text-stone-700 hover:text-stone-950 underline font-medium"
                            >
                              Edit Stock
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Help & Architecture Banner */}
        <div className="bg-[#2A2219] text-[#F5F2EC] p-6 sm:p-8 border border-[#4D3E2F]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <h4 className="font-serif text-xl font-light text-white">
              Enterprise Decoupled Data Layer
            </h4>
            <p className="text-xs text-stone-300 font-sans leading-relaxed">
              This system implements the Repository Pattern via <code className="text-amber-300 bg-black/40 px-1 py-0.5 font-mono">IDataStore</code>. All storefront pages, server actions, and REST APIs interact with the database abstraction layer, allowing a single-line drop-in migration to PostgreSQL, Supabase, or SQLite.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 bg-[#F5F2EC] text-[#2A2219] hover:bg-white px-5 py-2.5 text-xs uppercase tracking-wider font-semibold shadow-md whitespace-nowrap transition-colors"
          >
            <span>Preview Storefront</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
