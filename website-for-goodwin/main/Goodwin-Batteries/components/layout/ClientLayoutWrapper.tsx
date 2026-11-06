"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <CartProvider>
      {!isAdminPage && <Navbar />}
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <WhatsAppFloat />}
      {!isAdminPage && <CartDrawer />}
    </CartProvider>
  );
}
