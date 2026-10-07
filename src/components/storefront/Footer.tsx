import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1A150F] text-[#E8E2D6] pt-16 pb-12 border-t border-[#3A2E20] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-stone-800">
          {/* Brand Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-2xl tracking-[0.2em] uppercase text-white font-light">
              Wild Adventures
            </h3>
            <p className="text-xs leading-relaxed text-stone-400 max-w-sm font-sans">
              Founded on the ethos of bespoke leathercraft. Each bag is cut by hand from premium grain hides, stitched with reinforced bonded thread, and finished with jewelry-grade hardware engineered to endure generations of travel.
            </p>
            <div className="pt-2 text-[11px] text-[#B8A88F] tracking-widest uppercase">
              Florentine Tradition • Handcrafted Perfection
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Atelier Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/categories/hand-bag" className="hover:text-amber-200 transition-colors">
                  Hand Bags
                </Link>
              </li>
              <li>
                <Link href="/categories/backpacks" className="hover:text-amber-200 transition-colors">
                  Backpacks
                </Link>
              </li>
              <li>
                <Link href="/categories/clutches" className="hover:text-amber-200 transition-colors">
                  Clutches & Evening
                </Link>
              </li>
              <li>
                <Link href="/categories/wallets" className="hover:text-amber-200 transition-colors">
                  Wallets & Card Cases
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="hover:text-amber-200 cursor-pointer">Bespoke Monogramming</li>
              <li className="hover:text-amber-200 cursor-pointer">Leather Care Guide</li>
              <li className="hover:text-amber-200 cursor-pointer">Complimentary Repairs</li>
              <li className="hover:text-amber-200 cursor-pointer">Global Express Shipping</li>
            </ul>
          </div>

          {/* Flagship Boutiques (Replaced public admin links) */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white mb-4">
              Flagship Boutiques
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="hover:text-amber-200 cursor-pointer">Via della Spada, Florence</li>
              <li className="hover:text-amber-200 cursor-pointer">Rue Saint-Honoré, Paris</li>
              <li className="hover:text-amber-200 cursor-pointer">Madison Avenue, New York</li>
              <li className="hover:text-amber-200 cursor-pointer">Mount Street, London</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Wild Adventures Maroquinerie. All rights reserved.</p>
          <div className="flex space-x-6 text-[11px]">
            <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-400 cursor-pointer">Sustainability Report</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
