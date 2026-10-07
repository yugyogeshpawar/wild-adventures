"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  LogOut,
  X,
} from "lucide-react";
import { resetDatabaseAction, adminLogoutAction } from "@/app/actions";
import { useState } from "react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: Layers,
    },
  ];

  const handleResetData = async () => {
    if (confirm("Reset database to initial seed data? This will restore all default Hand Bags and categories.")) {
      setResetting(true);
      await resetDatabaseAction();
      setResetting(false);
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await adminLogoutAction();
    router.push("/admin/login");
    router.refresh();
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-[#1C1813] text-[#E8E2D6] flex flex-col border-r border-[#382F24] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#382F24]/80 flex items-center justify-between">
          <Link href="/admin/dashboard" onClick={handleNavClick} className="block group">
            <span className="font-serif text-xl tracking-[0.15em] uppercase text-white font-light group-hover:text-amber-200 transition-colors">
              Wild Adventures
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#B8A88F] uppercase block mt-0.5">
              Admin Studio v1.0
            </span>
          </Link>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-stone-400 hover:text-white rounded hover:bg-[#251E17] transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold px-3 mb-2">
            Catalogue & Store
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider font-medium rounded transition-colors ${
                  isActive
                    ? "bg-[#332A1F] text-amber-200 border-l-2 border-amber-400 pl-2.5"
                    : "text-stone-400 hover:text-white hover:bg-[#251E17]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Utility Actions */}
        <div className="p-4 border-t border-[#382F24]/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-stone-400 hover:text-white hover:bg-[#251E17] rounded transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-amber-400" />
              <span>Preview Storefront</span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-stone-500" />
          </Link>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-400 hover:text-amber-300 hover:bg-[#251E17] rounded transition-colors"
          >
            <RotateCcw className={`h-4 w-4 ${resetting ? "animate-spin" : ""}`} />
            <span>{resetting ? "Resetting..." : "Restore Demo Data"}</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors border border-rose-900/30"
          >
            <LogOut className="h-4 w-4" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
