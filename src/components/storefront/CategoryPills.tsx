"use client";

import Link from "next/link";
import { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  categories: Category[];
  activeSlug?: string;
  onSelectCategory?: (slug: string) => void;
  showLinks?: boolean;
}

export function CategoryPills({
  categories,
  activeSlug = "all",
  onSelectCategory,
  showLinks = false,
}: CategoryPillsProps) {
  const allOption = { id: "all", name: "All Silhouettes", slug: "all" };
  const allCategories = [allOption, ...categories];

  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1.5 touch-pan-x w-full min-w-0 overscroll-x-contain">
      {allCategories.map((cat) => {
        const isActive = activeSlug === cat.slug;
        const isHandbag = cat.slug === "hand-bag";

        const content = (
          <span
            className={cn(
              "inline-flex items-center px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all whitespace-nowrap cursor-pointer select-none border",
              isActive
                ? "bg-stone-900 text-stone-50 border-stone-900 shadow-sm"
                : "bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:text-stone-900 hover:bg-stone-50",
              isHandbag && !isActive && "ring-1 ring-amber-700/20 bg-amber-50/40 text-amber-900 border-amber-200"
            )}
          >
            {cat.name}
            {isHandbag && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            )}
          </span>
        );

        if (showLinks) {
          const href = cat.slug === "all" ? "/" : `/categories/${cat.slug}`;
          return (
            <Link key={cat.id} href={href}>
              {content}
            </Link>
          );
        }

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
          >
            {content}
          </button>
        );
      })}
      </div>
    </div>
  );
}
