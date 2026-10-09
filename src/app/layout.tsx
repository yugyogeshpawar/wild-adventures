import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WILD ADVENTURES | Luxury Handcrafted Leather Goods",
  description: "Exquisite artisanal handbags, travel silhouettes, and leather accessories designed for timeless journeys.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="w-full max-w-full overflow-x-hidden">
      <body className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
