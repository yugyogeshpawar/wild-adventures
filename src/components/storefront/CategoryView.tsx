"use client";

import * as React from "react";
import { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/storefront/ProductCard";
import { FilterSidebar } from "@/components/storefront/FilterSidebar";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CategoryViewProps {
  category: Category;
  categories: Category[];
  initialProducts: Product[];
}

export function CategoryView({
  category,
  categories,
  initialProducts,
}: CategoryViewProps) {
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [maxPrice, setMaxPrice] = React.useState(500);
  const [sortBy, setSortBy] = React.useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  // Highest price among category products
  const maxProductPrice = React.useMemo(() => {
    return Math.max(...initialProducts.map((p) => p.price), 500);
  }, [initialProducts]);

  const filteredProducts = React.useMemo(() => {
    let list = [...initialProducts];

    // Filter in-stock
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Filter max price
    list = list.filter((p) => p.price <= maxPrice);

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
  }, [initialProducts, inStockOnly, maxPrice, sortBy]);

  const resetFilters = () => {
    setInStockOnly(false);
    setMaxPrice(maxProductPrice);
    setSortBy("featured");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full max-w-full overflow-hidden">
      {/* Breadcrumb & Header */}
      <div className="pb-8 border-b border-stone-200">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Collections</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-amber-700 font-semibold block mb-1">
              Atelier Category
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-light text-stone-900">
              {category.name}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-2xl font-sans leading-relaxed">
              {category.description}
            </p>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs text-stone-500 font-mono">
              {filteredProducts.length} pieces available
            </span>

            {/* Mobile filter toggle button */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 border border-stone-300 bg-white text-xs uppercase tracking-wider text-stone-800"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10 pt-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 sticky top-28">
          <FilterSidebar
            categories={categories}
            selectedCategorySlug={category.slug}
            inStockOnly={inStockOnly}
            onToggleInStock={setInStockOnly}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetFilters={resetFilters}
            highestPrice={maxProductPrice}
          />
        </aside>

        {/* Mobile Filter Drawer / Collapsible */}
        {mobileFiltersOpen && (
          <div className="lg:hidden col-span-1 mb-6">
            <FilterSidebar
              categories={categories}
              selectedCategorySlug={category.slug}
              inStockOnly={inStockOnly}
              onToggleInStock={setInStockOnly}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onResetFilters={resetFilters}
              highestPrice={maxProductPrice}
            />
          </div>
        )}

        {/* Product Grid */}
        <div className="col-span-1 lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 border border-stone-200">
              <h3 className="font-serif text-xl text-stone-900">No silhouettes match your criteria</h3>
              <p className="mt-1 text-xs text-stone-500">
                Try widening your price range or allowing out of stock items.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={idx < 3}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
