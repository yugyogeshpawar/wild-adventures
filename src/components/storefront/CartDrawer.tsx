"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isClient) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Slide-out drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out border-l border-stone-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-stone-900" />
            <h2 className="font-serif text-xl tracking-tight text-stone-900">
              Shopping Bag ({getTotalItems()})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="h-16 w-16 rounded-full bg-stone-100 flex items-center justify-center mb-4 text-stone-400">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-lg text-stone-900">Your bag is empty</h3>
              <p className="mt-1 text-xs text-stone-500 max-w-xs">
                Explore our handcrafted leather collections and discover your next signature piece.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-6"
                onClick={closeCart}
              >
                Continue Browsing
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-4 flex gap-4 items-start">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden bg-stone-100 border border-stone-200">
                    <Image
                      src={product.images[0] || "/images/products/handbags/classic-leather-tote.jpg"}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-stone-900 hover:underline truncate block"
                      >
                        {product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-xs text-stone-500 mt-0.5">
                      SKU: {product.sku}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-stone-200 bg-stone-50">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-stone-600 hover:bg-stone-200 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-stone-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-1 text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-medium text-stone-900">
                        {formatCurrency(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 bg-stone-50/70 p-6 space-y-4">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-700 font-medium">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
              <span className="font-serif text-base text-stone-900">Total</span>
              <span className="font-serif text-xl font-medium text-stone-900">
                {formatCurrency(getTotalPrice())}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2 group"
              onClick={() => alert("Checkout simulated: Order submitted for " + formatCurrency(getTotalPrice()))}
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>

            <p className="text-center text-[11px] text-stone-500">
              Complimentary carbon-neutral packaging & 30-day returns.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
