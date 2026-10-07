"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { adminLoginAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [username, setUsername] = React.useState("admin");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter the administrator password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await adminLoginAction(password, username);
      if (res.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(res.error || "Invalid administrator credentials.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#251E17] border border-[#3D3123] p-8 sm:p-10 shadow-2xl relative z-10 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1C1813] border border-[#4D3E2F] text-amber-300 mb-2">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-white font-light tracking-[0.15em] uppercase">
          Wild Adventures
        </h1>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#B8A88F]">
          Atelier Management Portal
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-800/60 rounded text-rose-200 text-xs flex items-start gap-2.5 animate-slide-up">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="block text-[11px] uppercase tracking-wider font-semibold text-[#D5CBB9]"
          >
            Administrator ID
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-11 px-3.5 bg-[#1C1813] border border-[#4D3E2F] text-sm text-[#F5F2EC] placeholder:text-stone-600 focus:outline-none focus:border-amber-400/80 transition-colors"
            placeholder="admin"
            autoComplete="username"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-[11px] uppercase tracking-wider font-semibold text-[#D5CBB9]"
            >
              Access Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 pl-3.5 pr-10 bg-[#1C1813] border border-[#4D3E2F] text-sm text-[#F5F2EC] placeholder:text-stone-600 focus:outline-none focus:border-amber-400/80 transition-colors"
              placeholder="••••••••••••"
              autoComplete="current-password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 p-1 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full h-12 uppercase tracking-[0.15em] text-xs bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold shadow-md mt-6 flex items-center justify-center gap-2 group transition-all"
        >
          <span>Authorize Studio Access</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      {/* Security Notice & Demo Credential Helper */}
      <div className="mt-8 pt-6 border-t border-[#382F24] text-center space-y-2">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Encrypted Session • Route-Level Verification</span>
        </div>
        <p className="text-[10px] text-stone-400 font-mono">
          Default credentials: <span className="text-amber-300">admin</span> / <span className="text-amber-300">admin123</span>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#1A150F] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#4D3E2F]/30 rounded-full blur-3xl pointer-events-none" />

      <React.Suspense fallback={<div className="text-stone-400 text-xs">Loading portal...</div>}>
        <AdminLoginForm />
      </React.Suspense>
    </div>
  );
}
