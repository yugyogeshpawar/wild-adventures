"use client";

import * as React from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { Category } from "@/lib/types";

interface FilterSidebarProps {
  categories: Category[];
  selectedCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  maxPrice: number;
  onMaxPriceChange: (val: number) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  onResetFilters: () => void;
  highestPrice?: number;
}

export function FilterSidebar({
  categories,
  selectedCategorySlug = "all",
  onSelectCategory,
  inStockOnly,
  onToggleInStock,
  maxPrice,
  onMaxPriceChange,
  sortBy,
  onSortChange,
  onResetFilters,
  highestPrice = 600,
}: FilterSidebarProps) {
  return (
    <div className="space-y-8 bg-white p-6 border border-stone-200">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-stone-800" />
          <h3 className="text-xs uppercase tracking-widest font-semibold text-stone-900">
            Refine & Sort
          </h3>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-[11px] text-stone-400 hover:text-stone-900 flex items-center gap-1 transition-colors uppercase tracking-wider"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Sort Section */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs py-2.5 px-3 focus:outline-none focus:border-stone-900"
        >
          <option value="featured">Featured & Curated</option>
          <option value="newest">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Categories Section */}
      {onSelectCategory && (
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-wider font-semibold text-stone-700 block">
            Category
          </label>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              className={`w-full text-left text-xs py-1.5 px-2.5 transition-colors flex justify-between ${
                selectedCategorySlug === "all"
                  ? "bg-stone-900 text-white font-medium"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <span>All Silhouettes</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.slug)}
                className={`w-full text-left text-xs py-1.5 px-2.5 transition-colors flex justify-between ${
                  selectedCategorySlug === cat.slug
                    ? "bg-stone-900 text-white font-medium"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span>{cat.name}</span>
                {cat.slug === "hand-bag" && (
                  <span className="text-[10px] text-amber-600 font-mono tracking-tight font-medium">★</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs uppercase tracking-wider font-semibold text-stone-700">
            Maximum Price
          </label>
          <span className="font-serif text-sm font-medium text-stone-900">
            ${maxPrice}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max={highestPrice}
          step="25"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
          className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[11px] text-stone-400">
          <span>$100</span>
          <span>${highestPrice}</span>
        </div>
      </div>

      {/* Stock Availability */}
      <div className="pt-2 border-t border-stone-100">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 accent-stone-900 rounded border-stone-300"
          />
          <span className="text-xs uppercase tracking-wider text-stone-700 font-medium">
            In Stock Only
          </span>
        </label>
      </div>
    </div>
  );
}
