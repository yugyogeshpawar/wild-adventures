"use client";

import * as React from "react";
import { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CategoryPills } from "@/components/storefront/CategoryPills";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";

interface StorefrontCatalogProps {
  categories: Category[];
  initialProducts: Product[];
}

export function StorefrontCatalog({
  categories,
  initialProducts,
}: StorefrontCatalogProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("hand-bag"); // Hand Bag highlighted by default
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<string>("featured");

  const filteredProducts = React.useMemo(() => {
    let list = [...initialProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        list = list.filter((p) => p.categoryId === cat.id);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "featured":
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [initialProducts, categories, selectedCategory, searchQuery, sortBy]);

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-stone-200 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Curated Silhouettes</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-light">
            {selectedCategory === "all"
              ? "All Atelier Collections"
              : activeCategoryObj?.name || "Hand Bag Silhouettes"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-xl font-sans leading-relaxed">
            {selectedCategory === "all"
              ? "Hand-stitched leather essentials for discerning travellers and city cosmopolitans."
              : activeCategoryObj?.description || "Architectural silhouettes crafted in supple Italian full-grain leathers."}
          </p>
        </div>

        {/* Search input & Sort selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search silhouettes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-10 text-xs bg-white border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 w-full sm:w-56 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-stone-200 px-3 h-10">
            <SlidersHorizontal className="h-3.5 w-3.5 text-stone-500 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-transparent text-stone-800 focus:outline-none cursor-pointer w-full"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Additions</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="py-6 border-b border-stone-100 flex items-center justify-between">
        <CategoryPills
          categories={categories}
          activeSlug={selectedCategory}
          onSelectCategory={(slug) => setSelectedCategory(slug)}
        />
        <span className="hidden md:block text-xs text-stone-500 font-mono">
          Showing {filteredProducts.length} items
        </span>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 border border-dashed border-stone-200 mt-8">
          <h3 className="font-serif text-xl text-stone-800">No silhouettes found</h3>
          <p className="mt-1 text-xs text-stone-500">
            Try adjusting your search criteria or explore another category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 text-xs uppercase tracking-wider underline font-semibold text-stone-900"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mt-10">
          {filteredProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={idx < 4}
            />
          ))}
        </div>
      )}
    </section>
  );
}
