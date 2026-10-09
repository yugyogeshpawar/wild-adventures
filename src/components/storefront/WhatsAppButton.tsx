"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { X, Send, Clock, Sparkles } from "lucide-react";

export function WhatsAppButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [productName, setProductName] = React.useState<string>("");
  const [currentUrl, setCurrentUrl] = React.useState<string>("");
  const popupRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Read environment variable with fallback & cleaning
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const whatsappNumber = rawNumber.replace(/\D/g, "");

  // Development warning if environment variable is missing
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && !whatsappNumber) {
      console.warn(
        "[WhatsAppSupport] NEXT_PUBLIC_WHATSAPP_NUMBER is missing or empty in .env.local. Please configure a phone number (e.g., 919876543210)."
      );
    }
  }, [whatsappNumber]);

  // Sync current URL and product title on route changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }

    const isPDP = pathname?.startsWith("/products/") && pathname !== "/products";

    if (isPDP) {
      const updateTitle = () => {
        const h1 = document.querySelector("h1");
        if (h1 && h1.textContent?.trim()) {
          setProductName(h1.textContent.trim());
        } else {
          // Fallback: derive title from slug
          const slug = pathname.split("/").filter(Boolean)[1];
          if (slug) {
            const formatted = slug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
            setProductName(formatted);
          }
        }
      };

      updateTitle();
      const timer = setTimeout(updateTitle, 250);
      return () => clearTimeout(timer);
    } else {
      setProductName("");
    }
  }, [pathname]);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Visibility rule: strictly hide on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Construct context-aware pre-filled message
  const isPDP = Boolean(pathname?.startsWith("/products/") && pathname !== "/products" && productName);
  const prefilledMessage = isPDP
    ? `Hello! I'm interested in the "${productName}" (${currentUrl}). Can you help me with more details?`
    : `Hello! I have an inquiry about your collection.`;

  const encodedMessage = encodeURIComponent(prefilledMessage);
  const targetNumber = whatsappNumber || "917974197845"; // fallback number if not set
  const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;

  const togglePopup = () => {
    setHasInteracted(true);
    setIsOpen((prev) => !prev);
  };

  return (
    <aside aria-label="Customer Support" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      {/* Interactive Popup Card */}
      {isOpen && (
        <div
          ref={popupRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="whatsapp-support-title"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[350px] max-w-[360px] bg-white rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Card Header */}
          <div className="bg-[#1E1914] text-white p-4 flex items-center justify-between border-b border-[#352B23]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                {/* Active online dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1E1914] rounded-full" />
              </div>
              <div>
                <h3 id="whatsapp-support-title" className="font-serif text-sm tracking-wide font-normal text-stone-100">
                  Atelier Concierge
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Typically replies in minutes</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close support card"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Card Body */}
          <div className="p-4 bg-[#FAF8F5] space-y-3.5">
            {/* Support Greeting Bubble */}
            <div className="flex gap-2.5 items-start">
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-stone-200 shadow-sm max-w-[88%] text-xs text-stone-800 leading-relaxed font-sans">
                <p>Hi there! How can we help you today with our collection?</p>
                <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-stone-400">
                  <Clock className="h-2.5 w-2.5" />
                  <span>Just now</span>
                </div>
              </div>
            </div>

            {/* Context Notice for PDP */}
            {isPDP && (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-tight">
                <div className="font-medium text-amber-950 uppercase tracking-wider text-[10px] mb-0.5">
                  Inquiring About:
                </div>
                <p className="truncate text-stone-700 italic font-serif text-xs">
                  &ldquo;{productName}&rdquo;
                </p>
              </div>
            )}

            {/* CTA Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-medium text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <WhatsAppIcon className="h-4 w-4 fill-white" />
              <span>Start Chat</span>
              <Send className="h-3.5 w-3.5 ml-0.5" />
            </a>

            {/* Security Note */}
            <p className="text-[10px] text-center text-stone-400 font-sans">
              End-to-end encrypted direct connection to our concierge.
            </p>
          </div>
        </div>
      )}

      {/* Floating Trigger Bubble */}
      <button
        ref={triggerRef}
        onClick={togglePopup}
        type="button"
        aria-label="Chat with us on WhatsApp"
        aria-expanded={isOpen}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_4px_20px_rgba(37,211,102,0.38)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.55)] transition-all duration-300 transform active:scale-95"
      >
        {/* Subtle Pulse Ping on initial load */}
        {!hasInteracted && !isOpen && (
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
        )}

        {/* Floating Tooltip Label (Desktop Hover) */}
        <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E1914] text-white text-[11px] uppercase tracking-wider font-medium rounded-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap shadow-md hidden sm:block">
          WhatsApp Concierge
        </span>

        {isOpen ? (
          <X className="h-6 w-6 text-white transition-transform duration-200" />
        ) : (
          <WhatsAppIcon className="h-7 w-7 fill-white transition-transform duration-200 group-hover:scale-110" />
        )}
      </button>
    </aside>
  );
}

function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>WhatsApp</title>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
