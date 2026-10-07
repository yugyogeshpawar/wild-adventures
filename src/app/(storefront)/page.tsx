import { db } from "@/lib/db";
import { HeroSection } from "@/components/storefront/HeroSection";
import { StorefrontCatalog } from "@/components/storefront/StorefrontCatalog";
import Link from "next/link";
import Image from "next/image";
import { Shield, Sparkles, Feather, Clock } from "lucide-react";

export const revalidate = 0; // Ensure fresh data on every request

export default async function HomePage() {
  const categories = await db.getCategories();
  const products = await db.getProducts();

  // Highlight handbag category
  const handbagCategory = categories.find((c) => c.slug === "hand-bag");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <HeroSection />

      {/* Brand Value Pillars */}
      <section className="bg-white border-y border-stone-200/90 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-stone-100 rounded-full text-stone-800">
                <Feather className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                  Full-Grain Leather
                </h4>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed font-sans">
                  Sourced from certified tanneries in Tuscany, dyed naturally without harsh synthetics.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-stone-100 rounded-full text-stone-800">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                  Hand-Stitched Finish
                </h4>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed font-sans">
                  Beveled edges hand-burnished with natural beeswax for a silky tactile edge.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-stone-100 rounded-full text-stone-800">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                  Solid Brass Fittings
                </h4>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed font-sans">
                  Custom alloy hardware sand-cast to resist corrosion across decades of travel.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-stone-100 rounded-full text-stone-800">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-900">
                  Atelier Guarantee
                </h4>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed font-sans">
                  Free annual conditioning and stitch maintenance for all authenticated owners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hand Bag Spotlight Banner */}
      {handbagCategory && (
        <section className="bg-[#2A2219] text-[#F5F2EC] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="relative aspect-[16/10] sm:aspect-[4/3] overflow-hidden border border-[#4D3E2F]/60">
                <Image
                  src="/images/products/handbags/classic-leather-tote.jpg"
                  alt="Spotlight Hand Bag"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="space-y-6 lg:pl-6">
                <div className="inline-block px-3 py-1 bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] uppercase tracking-[0.2em] font-medium">
                  Atelier Focus • Hand Bag Edition
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl font-light text-white leading-tight">
                  The Archetype of Everyday Luxury
                </h3>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                  Designed specifically around the daily cadence of modern professionals and explorers. Our Hand Bag series unites minimalist structure with unmatched interior organization, crafted to develop a deep golden patina with each passing year.
                </p>

                <div className="pt-2">
                  <Link
                    href="/categories/hand-bag"
                    className="inline-flex items-center text-xs uppercase tracking-widest font-semibold text-amber-200 hover:text-white border-b border-amber-300/60 pb-1 transition-colors"
                  >
                    View All Hand Bags →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Catalog Section (Hand Bags by default, filterable) */}
      <StorefrontCatalog
        categories={categories}
        initialProducts={products}
      />
    </div>
  );
}
