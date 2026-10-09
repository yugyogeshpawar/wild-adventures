"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, Search, ArrowRight, Sparkles } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleCart, getTotalItems } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = React.useState("");
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const totalItems = isClient ? getTotalItems() : 0;

  const navLinks = [
    { label: "All Silhouettes", href: "/" },
    { label: "Hand Bags", href: "/categories/hand-bag", highlight: true },
    { label: "Travel & Duffels", href: "/categories/travel-duffels" },
    { label: "Special Lunch Bags", href: "/categories/lunch-bags" },
    { label: "Festive Collection", href: "/categories/festive-collection" },
    { label: "Digital Round Bags", href: "/categories/round-bags" },
  ];

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      setMobileMenuOpen(false);
      router.push(`/?search=${encodeURIComponent(mobileSearchQuery.trim())}#products-section`);
    }
  };

  return (
    <>
      {/* Top announcement bar */}
      <div className="bg-[#2A2219] text-[#F5F2EC] text-[10px] sm:text-[11px] font-medium tracking-widest py-2 px-3 text-center uppercase border-b border-[#4D3E2F]/30 flex items-center justify-center gap-2 select-none w-full max-w-full overflow-hidden">
        <span className="truncate">Complimentary Express Shipping on Handcrafted Leather Bags</span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline text-amber-300/90 whitespace-nowrap">Lifetime Atelier Guarantee</span>
      </div>

      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile hamburger menu button with 44x44px touch target */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-800 hover:text-stone-950 transition-colors -ml-2"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex-1 lg:flex-none text-center lg:text-left">
              <Link href="/" className="inline-block group py-1">
                <span className="font-serif text-xl sm:text-2xl lg:text-3xl font-light tracking-[0.18em] uppercase text-stone-900 block group-hover:text-stone-700 transition-colors">
                  Wild Adventures
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.35em] text-stone-500 font-sans block text-center lg:text-left -mt-0.5">
                  Maison de Maroquinerie
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs uppercase tracking-widest font-medium transition-colors relative py-2 ${
                      isActive
                        ? "text-stone-900 font-semibold"
                        : "text-stone-600 hover:text-stone-950"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.highlight && (
                      <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-amber-600 align-middle" />
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-stone-900 animate-fade-in" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions: Cart only (no admin link) */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={toggleCart}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-800 hover:text-stone-950 transition-colors -mr-2"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
                {totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer with slide-out animation */}
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Slide-out Panel */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-[#FAF8F5] border-r border-stone-200 shadow-2xl flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header inside drawer */}
          <div className="flex items-center justify-between p-5 border-b border-stone-200">
            <div>
              <span className="font-serif text-lg tracking-[0.15em] uppercase text-stone-900 block font-light">
                Wild Adventures
              </span>
              <span className="text-[8px] uppercase tracking-[0.25em] text-stone-500 font-sans block">
                Atelier Collections
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-stone-500 hover:text-stone-900 rounded"
              aria-label="Close navigation"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search bar inside drawer */}
          <div className="p-5 border-b border-stone-200/80 bg-white">
            <form onSubmit={handleMobileSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="w-full h-11 pl-9 pr-10 text-xs bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-500 hover:text-stone-900"
                aria-label="Search"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Navigation links */}
          <div className="flex-1 overflow-y-auto p-5 space-y-1">
            <div className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold px-3 mb-2">
              Browse Silhouettes
            </div>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-3 rounded text-sm uppercase tracking-wider font-medium transition-colors min-h-[44px] ${
                    isActive
                      ? "bg-stone-900 text-white font-semibold"
                      : "text-stone-700 hover:bg-stone-200/60 hover:text-stone-950"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{link.label}</span>
                    {link.highlight && !isActive && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                        Signature
                      </span>
                    )}
                  </div>
                  <ArrowRight className={`h-4 w-4 ${isActive ? "text-white" : "text-stone-400"}`} />
                </Link>
              );
            })}
          </div>

          {/* Bottom atelier guarantee footer inside mobile drawer */}
          <div className="p-5 border-t border-stone-200 bg-stone-100/70 space-y-2">
            <div className="flex items-center gap-2 text-xs text-stone-700 font-medium">
              <Sparkles className="h-4 w-4 text-amber-700" />
              <span>Florentine Handcrafted Tradition</span>
            </div>
            <p className="text-[11px] text-stone-500 font-sans leading-relaxed">
              Every leather silhouette is individually hand-cut and finished with edge-burnished beeswax.
            </p>
          </div>
        </div>
      </header>
    </>
  );
}
