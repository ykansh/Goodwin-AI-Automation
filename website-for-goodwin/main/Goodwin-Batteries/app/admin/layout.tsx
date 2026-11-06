"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Package, MapPin, MessageSquare, ShieldCheck, Settings, LogOut, Car, HelpCircle, Loader2, Printer, FileText, Tag, ShoppingBag } from "lucide-react";
import clsx from "clsx";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>("super_admin");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (session) {
        setAuthenticated(true);
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile?.role) {
          setUserRole(profile.role);
          if (profile.role === "warehouse" && pathname === "/admin") {
            router.push("/admin/serial-generator");
          }
        } else {
          // Default authenticated admin users to super_admin if profile row is not yet created
          setUserRole("super_admin");
        }
      }
      setLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (session) {
        setAuthenticated(true);
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile?.role) {
          setUserRole(profile.role);
          if (profile.role === "warehouse" && pathname === "/admin") {
            router.push("/admin/serial-generator");
          }
        } else {
          setUserRole("super_admin");
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-brand" size={48} />
      </div>
    );
  }

  // If we are on the login page, just render the children without the sidebar
  if (pathname === "/admin/login") {
    return <div className="bg-background min-h-screen">{children}</div>;
  }

  if (!authenticated) {
    return null; // Will redirect via useEffect
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} />, roles: ["super_admin", "admin", "dealer"] },
    { label: "Online Orders", href: "/admin/orders", icon: <ShoppingBag size={20} />, roles: ["super_admin", "admin", "dealer", "warehouse"] },
    { label: "Products", href: "/admin/products", icon: <Package size={20} />, roles: ["super_admin", "admin", "dealer"] },
    { label: "Battery Finder", href: "/admin/battery-finder", icon: <Car size={20} />, roles: ["super_admin", "admin", "dealer"] },
    { label: "Dealers", href: "/admin/dealers", icon: <MapPin size={20} />, roles: ["super_admin", "admin", "dealer"] },
    { label: "Enquiries", href: "/admin/enquiries", icon: <MessageSquare size={20} />, roles: ["super_admin", "admin", "dealer"] },
    { label: "Warranties", href: "/admin/warranties", icon: <ShieldCheck size={20} />, roles: ["super_admin", "admin", "dealer"] },
    { label: "Warranty Plans", href: "/admin/warranty-plans", icon: <Package size={20} />, roles: ["super_admin", "admin", "dealer"] },
    { label: "Factory Stickers", href: "/admin/serial-generator", icon: <Printer size={20} />, roles: ["super_admin", "admin", "warehouse"] },
    { label: "MRP Stickers", href: "/admin/mrp-generator", icon: <Tag size={20} />, roles: ["super_admin", "admin", "warehouse", "dealer"] },
    { label: "Sticker Batches", href: "/admin/sticker-batches", icon: <FileText size={20} />, roles: ["super_admin", "admin", "warehouse"] },
    { label: "Settings", href: "/admin/settings", icon: <Settings size={20} />, roles: ["super_admin", "admin", "dealer"] },
  ].filter(item => item.roles.includes(userRole));

  return (
    <div className="flex min-h-screen bg-background print:bg-white print:block">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col fixed h-full z-20 print:hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Image 
              src="/assets/logo/g-logo.png" 
              alt="Goodwin" 
              width={32} 
              height={32} 
              className="object-contain"
            />
            <span className="font-bold text-foreground tracking-widest text-lg">ADMIN</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                  isActive ? "bg-brand/10 text-brand" : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors w-full text-sm font-bold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 print:ml-0 print:p-0">
        <div className="max-w-7xl mx-auto print:max-w-none print:mx-0">
          {children}
        </div>
      </main>
    </div>
  );
}
