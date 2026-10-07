import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#1E1914] text-stone-100 py-20 lg:py-32">
      {/* Subtle background glow/overlay */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay">
        <Image
          src="/images/products/handbags/classic-leather-tote.jpg"
          alt="Luxury leather craftsmanship"
          fill
          priority
          className="object-cover object-center filter blur-[1px] scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#140F0A]/95 via-[#1E1914]/85 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs uppercase tracking-[0.2em] font-medium backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Autumn / Winter Handbag Collection</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.15] text-white">
            Sculpted in Leather. <br />
            <span className="italic font-normal text-amber-100/90">Engineered for Adventure.</span>
          </h1>

          <p className="text-xs sm:text-base text-stone-300 font-sans leading-relaxed max-w-xl">
            Introducing our signature handbag collection. Crafted by master artisans from Italian vegetable-tanned full-grain leather, made to soften and enrich with every passage of time.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <Link href="/categories/hand-bag">
              <Button
                variant="luxury"
                size="lg"
                className="w-full sm:w-auto bg-white text-stone-900 hover:bg-stone-100 font-semibold uppercase tracking-wider text-xs px-8 h-12 shadow-lg"
              >
                Explore Hand Bags
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/#products-section">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-stone-400/60 text-stone-200 hover:bg-white/10 text-xs uppercase tracking-wider h-12"
              >
                Browse All Silhouettes
              </Button>
            </Link>
          </div>

          <div className="pt-6 sm:pt-8 grid grid-cols-3 gap-2 sm:gap-6 border-t border-stone-800/80 max-w-lg">
            <div>
              <p className="font-serif text-xl sm:text-2xl text-white font-normal">100%</p>
              <p className="text-[11px] uppercase tracking-wider text-stone-400">Tuscan Full-Grain</p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-2xl text-white font-normal">Hand-Cut</p>
              <p className="text-[11px] uppercase tracking-wider text-stone-400">Artisanal Edges</p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-2xl text-white font-normal">Lifetime</p>
              <p className="text-[11px] uppercase tracking-wider text-stone-400">Atelier Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
