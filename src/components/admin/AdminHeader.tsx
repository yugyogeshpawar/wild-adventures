"use client";

import Link from "next/link";
import { User, Bell, ShieldCheck } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminHeader({ title, description, action }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-stone-200 px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-xs text-stone-500 font-sans">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {action && <div>{action}</div>}

        <div className="h-6 w-[1px] bg-stone-200 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden sm:block text-left text-xs">
            <div className="font-medium text-stone-900 leading-tight">Maison Admin</div>
            <div className="text-[10px] text-stone-400">Head of Atelier</div>
          </div>
        </div>
      </div>
    </header>
  );
}
