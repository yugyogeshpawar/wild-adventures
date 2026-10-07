import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WILD ADVENTURES | Luxury Handcrafted Leather Goods",
  description: "Exquisite artisanal handbags, travel silhouettes, and leather accessories designed for timeless journeys.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
