"use client";

import * as React from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Menu, LogOut, User } from "lucide-react";
import { adminLogoutAction } from "@/app/actions";
import { useRouter } from "next/navigation";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await adminLogoutAction();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-stone-100 text-stone-900 font-sans overflow-x-hidden">
      {/* Mobile Top Header (only visible on screens < lg) */}
      <div className="lg:hidden bg-[#1C1813] text-[#E8E2D6] px-4 py-3 flex items-center justify-between border-b border-[#382F24] sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-1 text-stone-300 hover:text-white rounded hover:bg-[#251E17] transition-colors"
            aria-label="Open admin menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <span className="font-serif text-lg tracking-wider uppercase text-white font-light block leading-none">
              Wild Adventures
            </span>
            <span className="text-[9px] tracking-widest text-[#B8A88F] uppercase block">
              Admin Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 text-stone-400 hover:text-rose-400 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sidebar: persistent on desktop, sliding drawer on mobile */}
      <AdminSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
