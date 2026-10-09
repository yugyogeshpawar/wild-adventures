"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag, Check, Eye } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/useCartStore";
import { QuickViewModal } from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCartStore();
  const [added, setAdded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const primaryImage = product.images[0] || "/images/products/handbags/classic-leather-tote.jpg";
  const secondaryImage = product.images[1] || primaryImage;
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stock <= 0;

  return (
    <>
      <div
        className="group flex flex-col bg-white border border-[#E7E2D9] overflow-hidden hover:border-[#B8A88F] transition-all duration-300 hover:shadow-md relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image container with 4:5 aspect ratio */}
        <Link
          href={`/products/${product.slug}`}
          className="relative aspect-[4/5] w-full overflow-hidden bg-[#F7F5F0] block"
        >
          {/* Main Image with smooth zoom transition */}
          <Image
            src={isHovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Luxury Status Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isFeatured && (
              <Badge variant="gold">Bestseller</Badge>
            )}
            {product.tags && product.tags.includes("New In") && (
              <Badge variant="secondary" className="bg-stone-900 text-stone-100">
                New In
              </Badge>
            )}
            {isSale && (
              <Badge variant="danger">
                Sale -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
              </Badge>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <Badge variant="warning">Only {product.stock} left</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="bg-stone-900 text-white">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick View Button on top-right hover */}
          <button
            type="button"
            onClick={handleOpenQuickView}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-sm text-stone-700 hover:text-stone-950 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hidden sm:flex items-center justify-center"
            title="Quick Preview"
            aria-label="Quick Preview"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Quick Add Overlay on hover */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10 hidden sm:block">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleQuickAdd}
              className={`w-full py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 ${
                added
                  ? "bg-emerald-700 text-white"
                  : isOutOfStock
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : "bg-stone-900/95 text-stone-50 hover:bg-stone-900 backdrop-blur-sm"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Added to Bag</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>
        </Link>

        {/* Details Container */}
        <div className="p-4 flex flex-col flex-1 justify-between bg-white">
          <div>
            {/* Star rating & SKU */}
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-stone-800 text-[11px]">
                  {product.rating ? product.rating.toFixed(1) : "4.9"}
                </span>
                <span className="text-[10px] text-stone-400">
                  ({product.reviewCount || 16})
                </span>
              </div>
              <span className="text-[10px] tracking-wider text-stone-400 font-mono">
                {product.sku}
              </span>
            </div>

            {/* Product Name */}
            <h3 className="font-serif text-base text-stone-900 group-hover:text-stone-700 transition-colors leading-snug">
              <Link href={`/products/${product.slug}`} className="line-clamp-1">
                {product.name}
              </Link>
            </h3>

            {/* Short description */}
            <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed font-sans">
              {product.description}
            </p>
          </div>

          {/* Price & Mobile Actions */}
          <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-normal text-stone-900">
                {formatCurrency(product.price)}
              </span>
              {isSale && (
                <span className="text-xs text-stone-400 line-through">
                  {formatCurrency(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {/* Mobile Action Buttons (Quick View & Quick Add) */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                type="button"
                onClick={handleOpenQuickView}
                className="p-2 text-stone-600 bg-stone-100 rounded-full"
                aria-label="Quick View"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleQuickAdd}
                className="p-2 text-stone-800 bg-stone-100 rounded-full disabled:opacity-30"
                aria-label="Quick Add"
              >
                {added ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <ShoppingBag className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
