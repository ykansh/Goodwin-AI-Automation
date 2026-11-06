import Link from "next/link";
import { ChevronRight, Home, Battery, Search } from "lucide-react";
import { GOODWIN_CONFIG } from "@/config/goodwin";

export default function NotFound() {
  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      <section className="bg-surface py-20 border-b border-border relative overflow-hidden flex-1 flex flex-col items-center justify-center">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-brand/10 blur-[100px] pointer-events-none" />
        <div className="container relative z-10 text-center max-w-2xl">
          <h1 className="text-8xl md:text-9xl font-heading font-bold text-foreground mb-6">
            4<span className="text-brand">0</span>4
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-lg mx-auto">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="w-full sm:w-auto bg-brand text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand/20">
              <Home size={18} /> Back to Home
            </Link>
            <Link href="/products" className="w-full sm:w-auto bg-surface border border-border text-foreground px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:border-brand transition-all flex items-center justify-center gap-2">
              <Battery size={18} /> Browse Products
            </Link>
            <Link href="/battery-finder" className="w-full sm:w-auto bg-surface border border-border text-foreground px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:border-brand transition-all flex items-center justify-center gap-2">
              <Search size={18} /> Battery Finder
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
