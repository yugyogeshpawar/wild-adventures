"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { Star, Check, ShoppingBag, ArrowRight, Shield, Sparkles } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = React.useState(0);

  React.useEffect(() => {
    setQuantity(1);
    setIsAdded(false);
    setSelectedImageIdx(0);
  }, [product, isOpen]);

  if (!product) return null;

  const images = product.images.length > 0 ? product.images : ["/images/products/handbags/classic-leather-tote.jpg"];
  const currentImage = images[selectedImageIdx] || images[0];
  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-1">
        {/* Left Column: Image Preview */}
        <div className="space-y-3">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 border border-stone-200">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-all duration-300"
            />
            {product.isFeatured && (
              <div className="absolute top-3 left-3">
                <Badge variant="gold">Bestseller</Badge>
              </div>
            )}
            {isSale && (
              <div className="absolute top-3 right-3">
                <Badge variant="danger">
                  Sale -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
                </Badge>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-16 h-16 flex-shrink-0 border overflow-hidden ${
                    selectedImageIdx === idx ? "border-stone-900 ring-2 ring-stone-900/10" : "border-stone-200 opacity-70"
                  }`}
                >
                  <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span>SKU: {product.sku}</span>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-stone-800 font-sans">
                  {product.rating?.toFixed(1) || "4.9"}
                </span>
                <span className="text-stone-400 font-sans">({product.reviewCount || 18})</span>
              </div>
            </div>

            <h3 className="font-serif text-2xl text-stone-900 font-light leading-snug">
              {product.name}
            </h3>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl font-normal text-stone-900">
                {formatCurrency(product.price)}
              </span>
              {isSale && (
                <span className="text-sm text-stone-400 line-through font-serif">
                  {formatCurrency(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="text-xs">
              {isOutOfStock ? (
                <span className="text-rose-600 font-medium">Currently Out of Stock</span>
              ) : isLowStock ? (
                <span className="text-amber-700 font-medium">Only {product.stock} pieces remaining</span>
              ) : (
                <span className="text-emerald-700 font-medium">In Stock ({product.stock} units ready)</span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-stone-600 leading-relaxed font-sans line-clamp-3">
              {product.description}
            </p>

            {/* Materials & Dimensions highlights */}
            <div className="p-3 bg-stone-50 border border-stone-200/80 rounded space-y-1.5 text-[11px] text-stone-600">
              {product.materials && (
                <p>
                  <strong className="text-stone-900 font-semibold">Materials:</strong> {product.materials}
                </p>
              )}
              {product.dimensions && (
                <p>
                  <strong className="text-stone-900 font-semibold">Dimensions:</strong> {product.dimensions}
                </p>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3 items-center">
              {/* Quantity */}
              <div className="flex items-center border border-stone-300 bg-white h-11 px-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-2.5 py-1 text-stone-700 hover:text-stone-900 disabled:opacity-30"
                  aria-label="Decrease"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-semibold text-stone-900 font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="px-2.5 py-1 text-stone-700 hover:text-stone-900 disabled:opacity-30"
                  aria-label="Increase"
                >
                  +
                </button>
              </div>

              {/* Add Button */}
              <Button
                variant="primary"
                size="md"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 h-11 uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Sold Out</span>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Bag • {formatCurrency(product.price * quantity)}</span>
                  </>
                )}
              </Button>
            </div>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="w-full py-2 text-center text-xs uppercase tracking-widest text-stone-600 hover:text-stone-950 flex items-center justify-center gap-1.5 transition-colors border-t border-stone-100"
            >
              <span>View Full Silhouette Specifications</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
