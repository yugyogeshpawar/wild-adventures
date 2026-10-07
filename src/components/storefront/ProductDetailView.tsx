"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Truck,
  RotateCcw,
  Check,
  ChevronDown,
  ShoppingBag,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Product, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/useCartStore";
import { ProductCard } from "./ProductCard";

interface ProductDetailViewProps {
  product: Product;
  category?: Category | null;
  relatedProducts: Product[];
}

export function ProductDetailView({
  product,
  category,
  relatedProducts,
}: ProductDetailViewProps) {
  const { addItem } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [isAdded, setIsAdded] = React.useState(false);
  const [openAccordion, setOpenAccordion] = React.useState<string | null>("materials");
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  const images = product.images.length > 0 ? product.images : ["/images/products/handbags/classic-leather-tote.jpg"];
  const currentImage = images[selectedImageIndex] || images[0];

  const isSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  // Keyboard navigation & body scroll lock for lightbox
  React.useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, images.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 pb-28 lg:pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-stone-500 mb-6 sm:mb-8 font-sans overflow-x-auto no-scrollbar">
        <Link href="/" className="hover:text-stone-900 transition-colors whitespace-nowrap">
          Atelier
        </Link>
        <span>/</span>
        {category ? (
          <Link href={`/categories/${category.slug}`} className="hover:text-stone-900 transition-colors whitespace-nowrap">
            {category.name}
          </Link>
        ) : (
          <span className="whitespace-nowrap">Collection</span>
        )}
        <span>/</span>
        <span className="text-stone-900 truncate font-medium">{product.name}</span>
      </nav>

      {/* Main PDP Grid: Gallery on top for mobile (< lg), 2 columns on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          {/* Main Hero Photo with Zoom */}
          <div
            className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 border border-stone-200 cursor-zoom-in group"
            onClick={() => setIsLightboxOpen(true)}
          >
            <Image
              src={currentImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition-all duration-700 group-hover:scale-105"
            />
            {product.isFeatured && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                <Badge variant="gold">Bestseller Silhouette</Badge>
              </div>
            )}
            {isSale && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <Badge variant="danger">
                  Sale -{Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)}%
                </Badge>
              </div>
            )}

            {/* Hover/Tap Zoom Trigger Overlay */}
            <div className="absolute bottom-3 right-3 bg-stone-900/80 hover:bg-stone-900 text-white p-2 backdrop-blur-sm transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium">
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Enlarge View</span>
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-square overflow-hidden bg-stone-100 border min-h-[44px] transition-all ${
                    selectedImageIndex === idx
                      ? "border-stone-900 ring-2 ring-stone-900/10"
                      : "border-stone-200 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Purchasing Details */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="space-y-4 sm:space-y-6 pb-6 border-b border-stone-200">
            {/* SKU and Rating */}
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="uppercase tracking-widest font-mono text-[10px] sm:text-[11px]">
                SKU: {product.sku}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-stone-800 font-semibold text-xs">
                  {product.rating?.toFixed(1) || "4.9"}
                </span>
                <span className="text-stone-400">({product.reviewCount || 24})</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-stone-900 font-light tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                {formatCurrency(product.price)}
              </span>
              {isSale && (
                <span className="text-base text-stone-400 line-through font-serif">
                  {formatCurrency(product.compareAtPrice!)}
                </span>
              )}
              {isSale && (
                <span className="text-xs text-rose-700 font-medium tracking-wide">
                  Save {formatCurrency(product.compareAtPrice! - product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
              {product.description}
            </p>

            {/* Stock Indicator */}
            <div className="flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-rose-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-600" />
                  Currently Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  Only {product.stock} pieces remaining in atelier stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-stone-100 text-stone-600 border border-stone-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Row: Quantity + Add to Cart with minimum 44px tap targets */}
          <div className="py-6 space-y-4 border-b border-stone-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Quantity selector */}
              <div className="flex items-center justify-between sm:justify-start border border-stone-300 bg-white h-12 px-2 min-w-[120px]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-700 hover:text-stone-900 disabled:opacity-30 text-base"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-semibold text-stone-900 font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-700 hover:text-stone-900 disabled:opacity-30 text-base"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart CTA */}
              <Button
                variant="primary"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 h-12 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group transition-all min-h-[48px]"
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Out of Stock</span>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Bag • {formatCurrency(product.price * quantity)}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 text-stone-600 text-[11px]">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-stone-800 flex-shrink-0" />
                <span>Complimentary Express Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-stone-800 flex-shrink-0" />
                <span>30-Day Atelier Returns</span>
              </div>
            </div>
          </div>

          {/* Accordion Sections with touch-friendly header height */}
          <div className="divide-y divide-stone-200 pt-2">
            {/* Section 1: Materials */}
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleAccordion("materials")}
                className="w-full min-h-[44px] flex justify-between items-center text-left text-xs uppercase tracking-wider font-semibold text-stone-900 hover:text-stone-700"
              >
                <span>Materials & Craftsmanship</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openAccordion === "materials" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "materials" && (
                <div className="pb-3 text-xs text-stone-600 font-sans leading-relaxed space-y-2 animate-fade-in">
                  <p>
                    {product.materials || "100% Full-grain Tuscan Calf Leather. Edge-burnished by hand using natural beeswax and bonded linen cord."}
                  </p>
                  <p>
                    Hardware: Custom hand-polished brass alloy engineered with anti-tarnish protective coating.
                  </p>
                </div>
              )}
            </div>

            {/* Section 2: Dimensions */}
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleAccordion("dimensions")}
                className="w-full min-h-[44px] flex justify-between items-center text-left text-xs uppercase tracking-wider font-semibold text-stone-900 hover:text-stone-700"
              >
                <span>Dimensions & Fit</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openAccordion === "dimensions" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "dimensions" && (
                <div className="pb-3 text-xs text-stone-600 font-sans leading-relaxed space-y-1 animate-fade-in">
                  <p>
                    <span className="font-semibold text-stone-800">Dimensions: </span>
                    {product.dimensions || '12.5" W x 9.0" H x 4.5" D'}
                  </p>
                  <p>
                    <span className="font-semibold text-stone-800">Interior: </span>
                    Main zippered pocket, 2 quick-access slip sleeves, key clip.
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Care & Maintenance */}
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleAccordion("care")}
                className="w-full min-h-[44px] flex justify-between items-center text-left text-xs uppercase tracking-wider font-semibold text-stone-900 hover:text-stone-700"
              >
                <span>Atelier Care & Longevity</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openAccordion === "care" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "care" && (
                <div className="pb-3 text-xs text-stone-600 font-sans leading-relaxed space-y-2 animate-fade-in">
                  {product.categoryId === "cat_lunch_bags" || product.slug.includes("lunch") ? (
                    <>
                      <p>
                        <span className="font-semibold text-stone-800">Thermal Insulation: </span>
                        Wipe food-grade insulated interior with a soft damp cloth and gentle soap. Do not submerge or machine wash.
                      </p>
                      <p>
                        Allow interior to dry completely after daily use before folding flat.
                      </p>
                    </>
                  ) : product.categoryId === "cat_travel_duffels" ||
                    product.categoryId === "cat_round_bags" ||
                    product.slug.includes("duffel") ||
                    product.slug.includes("travel") ? (
                    <>
                      <p>
                        <span className="font-semibold text-stone-800">Luggage Maintenance: </span>
                        Heavy-duty weather-resistant construction. Spot clean exterior with warm water and a clean microfiber cloth.
                      </p>
                      <p>
                        All metal zippers and hardware are corrosion-resistant. Air dry thoroughly before long-term storage.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Avoid prolonged direct heat and water exposure. If dampened, gently wipe dry with an untreated cotton cloth.
                      </p>
                      <p>
                        Includes an archival breathable dust bag for protected seasonal storage.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sticky "Add to Bag" bar (visible only on screens < lg) */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-2xl lg:hidden flex items-center justify-between gap-3 animate-slide-up">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-10 w-10 flex-shrink-0 bg-stone-100 border border-stone-200 overflow-hidden">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-serif text-stone-900 truncate font-medium">
              {product.name}
            </div>
            <div className="text-xs font-semibold text-stone-900">
              {formatCurrency(product.price)}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="h-11 px-4 text-xs uppercase tracking-wider whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
        >
          {isAdded ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : isOutOfStock ? (
            <span>Sold Out</span>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Add to Bag</span>
            </>
          )}
        </Button>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-stone-200">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-amber-700 font-semibold block mb-1">
              Curated Complements
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-light">
              You May Also Admire
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}

      {/* High-Resolution Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="High-resolution image gallery view"
          className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Topbar */}
          <div
            className="flex items-center justify-between text-white max-w-6xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-stone-400 font-mono">
                {product.name}
              </span>
              <div className="text-[11px] text-stone-500 font-mono">
                {selectedImageIndex + 1} of {images.length}
              </div>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-stone-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
              aria-label="Close Lightbox (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Lightbox Main Image Display */}
          <div
            className="relative flex-1 w-full max-w-5xl mx-auto my-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-h-[75vh] flex items-center justify-center">
              <Image
                src={currentImage}
                alt={`${product.name} enlarged preview`}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
              />
            </div>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev > 0 ? prev - 1 : images.length - 1
                  )
                }
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full border border-white/10 backdrop-blur-sm transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedImageIndex((prev) =>
                    prev < images.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full border border-white/10 backdrop-blur-sm transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Lightbox Thumbnails Strip */}
          {images.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 max-w-3xl mx-auto overflow-x-auto py-2 no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-12 h-14 border overflow-hidden flex-shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? "border-amber-400 ring-2 ring-amber-400/40 opacity-100 scale-105"
                      : "border-stone-700 opacity-50 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
