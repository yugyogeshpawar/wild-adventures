"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Product, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductFormModal } from "./ProductFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { deleteProductAction } from "@/app/actions";
import { useRouter, useSearchParams } from "next/navigation";

interface ProductTableManagerProps {
  products: Product[];
  categories: Category[];
}

export function ProductTableManager({
  products,
  categories,
}: ProductTableManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [stockFilter, setStockFilter] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      // Search
      const matchesSearch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Category
      const matchesCategory =
        selectedCategory === "all" ||
        p.categoryId === selectedCategory ||
        p.categorySlug === selectedCategory;

      // Stock
      let matchesStock = true;
      if (stockFilter === "in_stock") matchesStock = p.stock > 5;
      else if (stockFilter === "low_stock") matchesStock = p.stock > 0 && p.stock <= 5;
      else if (stockFilter === "out_of_stock") matchesStock = p.stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (p: Product) => {
    setDeletingProduct(p);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const res = await deleteProductAction(deletingProduct.id);
      if (res.success) {
        setDeleteModalOpen(false);
        setDeletingProduct(null);
        router.refresh();
      } else {
        alert("Failed to delete product");
      }
    } catch (e) {
      alert("Error deleting product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 border border-stone-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or narrative..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-9 pr-4 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="flex gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 sm:flex-none h-10 px-3 text-xs bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:border-stone-900"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 sm:flex-none h-10 px-3 text-xs bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:border-stone-900"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (&gt; 5)</option>
              <option value="low_stock">Low Stock (1 - 5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>

        {/* Add Product Button */}
        <div>
          <Button
            onClick={handleOpenAdd}
            variant="primary"
            size="md"
            className="w-full md:w-auto h-10 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Silhouette</span>
          </Button>
        </div>
      </div>

      {/* Products Presentation: Mobile Card View (< sm) + Desktop Table (>= sm) */}
      <div className="bg-white border border-stone-200 overflow-hidden shadow-sm">
        {/* Mobile Cards (Phones 320px-639px) */}
        <div className="sm:hidden divide-y divide-stone-100">
          {paginatedProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
              No products match the selected criteria.
            </div>
          ) : (
            paginatedProducts.map((product) => {
              const category = categories.find((c) => c.id === product.categoryId || c.slug === product.categorySlug);
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;

              return (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 flex-shrink-0 bg-stone-100 border border-stone-200 overflow-hidden">
                      <Image
                        src={product.images[0] || "/images/products/handbags/classic-leather-tote.jpg"}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-stone-900 text-sm truncate">
                        {product.name}
                      </div>
                      <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                        {product.sku}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-serif text-sm font-medium text-stone-900">
                          {formatCurrency(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-[11px] text-stone-400 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px]">
                        {category?.name || "General"}
                      </span>
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] rounded font-medium border border-rose-200">
                          <XCircle className="h-3 w-3" />
                          Out
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] rounded font-medium border border-amber-200">
                          <AlertTriangle className="h-3 w-3" />
                          Low ({product.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded font-medium border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          {product.stock} units
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-500 hover:text-stone-900 rounded"
                        title="View storefront"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-600 hover:text-stone-900 rounded"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(product)}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center text-rose-500 hover:text-rose-700 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop / Tablet Table View (>= sm) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Silhouette</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId || c.slug === product.categorySlug);
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= 5;

                  return (
                    <tr key={product.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 bg-stone-100 border border-stone-200 overflow-hidden">
                            <Image
                              src={product.images[0] || "/images/products/handbags/classic-leather-tote.jpg"}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-stone-900 max-w-[200px] truncate">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-stone-400 truncate max-w-[200px]">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                        {product.sku}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-stone-100 text-stone-700">
                          {category?.name || "Uncategorized"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-900">
                          {formatCurrency(product.price)}
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="text-[10px] text-stone-400 line-through">
                            {formatCurrency(product.compareAtPrice)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded">
                            <XCircle className="h-3 w-3" />
                            0 In Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            Low ({product.stock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                            <CheckCircle2 className="h-3 w-3" />
                            {product.stock} Units
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.isFeatured && (
                            <Badge variant="gold">Bestseller</Badge>
                          )}
                          {product.tags && product.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 border border-stone-200">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                            title="View on storefront"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                            title="Edit silhouette"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleOpenDelete(product)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete silhouette"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-stone-800">
              {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-stone-800">
              {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-stone-800">
              {filteredProducts.length}
            </span>{" "}
            silhouettes
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-mono font-medium text-stone-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-600 hover:bg-stone-200 rounded disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={editingProduct}
        categories={categories}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product Silhouette"
        itemName={deletingProduct?.name || "this product"}
        isDeleting={isDeleting}
      />
    </div>
  );
}
