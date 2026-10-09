import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { WhatsAppButton } from "@/components/storefront/WhatsAppButton";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] w-full max-w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
      <CartDrawer />
      <WhatsAppButton />
      <Footer />
    </div>
  );
}
