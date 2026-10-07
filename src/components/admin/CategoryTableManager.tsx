"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";
import { Category, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryFormModal } from "./CategoryFormModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { deleteCategoryAction } from "@/app/actions";
import { useRouter } from "next/navigation";

interface CategoryTableManagerProps {
  categories: Category[];
  products: Product[];
}

export function CategoryTableManager({
  categories,
  products,
}: CategoryTableManagerProps) {
  const router = useRouter();

  // Modals
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (cat: Category) => {
    setDeletingCategory(cat);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const res = await deleteCategoryAction(deletingCategory.id);
      if (res.success) {
        setDeleteModalOpen(false);
        setDeletingCategory(null);
        router.refresh();
      } else {
        alert("Failed to delete category");
      }
    } catch (e) {
      alert("Error deleting category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Add Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-stone-200">
        <div>
          <h2 className="font-serif text-lg font-light text-stone-900">
            Taxonomy Structure
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Pre-seeded with Hand Bags, Backpacks, Clutches, and Wallets. Extensible to unlimited departments.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          variant="primary"
          size="md"
          className="text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Categories Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const categoryProducts = products.filter((p) => p.categoryId === cat.id);
          const isHandBag = cat.slug === "hand-bag";

          return (
            <div
              key={cat.id}
              className="bg-white border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-stone-400 transition-all"
            >
              <div>
                {/* Banner Thumbnail */}
                <div className="relative h-40 w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={cat.imageUrl || "/images/products/handbags/classic-leather-tote.jpg"}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />

                  <div className="absolute top-3 left-3 flex gap-2">
                    {isHandBag && (
                      <Badge variant="gold">
                        Core Category Focus
                      </Badge>
                    )}
                    {cat.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/80 text-emerald-300 text-[10px] font-medium border border-emerald-500/30 backdrop-blur-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-950/80 text-rose-300 text-[10px] font-medium border border-rose-500/30 backdrop-blur-sm">
                        <XCircle className="h-3 w-3" />
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-serif text-2xl text-white font-light tracking-wide">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] font-mono text-stone-300">
                      /{cat.slug}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-stone-600 line-clamp-2 font-sans leading-relaxed">
                    {cat.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-1.5 font-medium text-stone-800">
                      <Package className="h-3.5 w-3.5 text-stone-500" />
                      <span>{categoryProducts.length} Silhouettes Assigned</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-stone-50/80 px-5 py-3 border-t border-stone-200 flex items-center justify-between">
                <Link
                  href={`/categories/${cat.slug}`}
                  target="_blank"
                  className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium"
                >
                  <span>View on Store</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"
                    title="Edit Category"
                    aria-label="Edit Category"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleOpenDelete(cat)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded transition-colors"
                    title="Delete Category"
                    aria-label="Delete Category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={editingCategory}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        itemName={deletingCategory?.name || "this category"}
        isDeleting={isDeleting}
      />
    </div>
  );
}
