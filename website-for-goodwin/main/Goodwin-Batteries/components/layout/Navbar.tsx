"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, Search, BatteryCharging, Briefcase, 
  ShieldCheck, Phone, MapPin, Zap, ChevronDown, Sparkles, ShoppingBag, Truck, User 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Image from "next/image";
import { useGlobalSettings } from "@/components/GlobalSettingsProvider";
import { useCart } from "@/context/CartContext";

const productCategories = [
  { name: "Two Wheeler / Bike", href: "/products/category/two-wheeler", icon: "🏍️", desc: "12 Models • 12M, 18M & 48M VRLA AGM" },
  { name: "Inverter & UPS Backup", href: "/products/category/inverter", icon: "⚡", desc: "5 Models • 150Ah–250Ah Tubular (72M) & 8Ah UPS" },
  { name: "VRLA, SMF & Gold Series", href: "/products/category/vrla-smf", icon: "🔋", desc: "13 Models • 4V, 6V & 12V Sealed Batteries" },
  { name: "Agricultural Sprayers", href: "/products/category/agriculture", icon: "🌿", desc: "4 Models • 12V 12Ah–14Ah VRLA & Lithium" },
  { name: "Lithium-Ion (LiFePO4)", href: "/products/category/lithium-ion", icon: "🟢", desc: "2 Models • Smart BMS UPS & Agro Packs" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const pathname = usePathname();
  const settings = useGlobalSettings();
  const { itemCount, openCart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);

  useEffect(() => {
    // Check if customer is authenticated
    const phone = localStorage.getItem("goodwin_customer_phone");
    const name = localStorage.getItem("goodwin_customer_name");
    if (phone) {
      setIsLoggedIn(true);
      if (name) setCustomerName(name);
    } else {
      setIsLoggedIn(false);
      setCustomerName(null);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top Utility Bar (Amaron / Exide benchmark) */}
      <div className="hidden lg:block bg-[#00843D] text-white text-xs py-2 relative z-50 shadow-sm">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a 
              href="tel:9220404411" 
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors text-white font-medium"
            >
              <Phone size={13} className="text-white" />
              <span>Customer Care: <strong className="text-white font-black">9220404411</strong></span>
            </a>
            <span className="text-white/40">•</span>
            <div className="flex items-center gap-1.5 text-white/90">
              <Zap size={13} className="text-amber-300" />
              <span>OEM Grade High Cranking Power</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-medium">
            <Link 
              href={isLoggedIn ? "/account/orders" : "/account/login"} 
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full text-white font-bold transition-all border border-white/25 shadow-xs"
            >
              <User size={12} className="text-amber-300" />
              <span>{isLoggedIn ? (customerName ? `Hi, ${customerName.split(" ")[0]}` : "My Account") : "Customer Login"}</span>
            </Link>
            <span className="text-white/40">•</span>
            <Link 
              href="/warranty" 
              className="flex items-center gap-1 hover:text-amber-200 transition-colors text-white"
            >
              <ShieldCheck size={13} className="text-white" />
              <span>Instant Warranty Check</span>
            </Link>
            <span className="text-white/40">•</span>
            <Link 
              href="/dealers" 
              className="flex items-center gap-1 hover:text-amber-200 transition-colors text-white"
            >
              <MapPin size={13} className="text-amber-300" />
              <span>Find Nearest Dealer</span>
            </Link>
            <span className="text-white/40">•</span>
            <Link 
              href="/dealer/login" 
              className="text-amber-300 hover:text-white font-bold transition-colors"
            >
              Dealer Portal &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={clsx(
          "sticky top-0 left-0 w-full z-40 transition-all duration-300 ease-in-out border-b backdrop-blur-xl",
          {
            "bg-white/95 border-gray-200/80 shadow-md py-3": isScrolled,
            "bg-white/98 border-gray-100 py-4": !isScrolled,
          }
        )}
      >
        <div className="container flex items-center justify-between">
          {/* Original Logo (No white background wrapper, no invert) */}
          <Link href="/" className="flex items-center gap-3 z-50 group">
            <Image 
              src="/assets/logo/g-logo.png" 
              alt="Goodwin" 
              width={38} 
              height={38} 
              className="object-contain transition-transform group-hover:scale-105" 
              priority
            />
            <Image 
              src="/assets/logo/Goodwin.png" 
              alt={settings?.company_name || "Goodwin Batteries"} 
              width={140} 
              height={44} 
              className="object-contain" 
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-7 shrink-0">
            <ul className="flex items-center gap-5 2xl:gap-7">
              <li>
                <Link
                  href="/"
                  className={clsx(
                    "text-xs 2xl:text-sm font-semibold tracking-wide transition-colors relative py-1",
                    pathname === "/" ? "text-[#00843D] font-bold" : "text-slate-700 hover:text-[#00843D]"
                  )}
                >
                  Home
                  {pathname === "/" && (
                    <motion.div layoutId="navIndicator" className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#00843D] rounded-full" />
                  )}
                </Link>
              </li>

              {/* Products Dropdown */}
              <li 
                className="relative"
                onMouseEnter={() => setProductsDropdownOpen(true)}
                onMouseLeave={() => setProductsDropdownOpen(false)}
              >
                <Link
                  href="/products"
                  className={clsx(
                    "text-xs 2xl:text-sm font-semibold tracking-wide transition-colors flex items-center gap-1 py-1",
                    pathname.startsWith("/products") ? "text-[#00843D] font-bold" : "text-slate-700 hover:text-[#00843D]"
                  )}
                >
                  Products
                  <ChevronDown size={13} className={clsx("transition-transform duration-200 text-slate-500", productsDropdownOpen && "rotate-180 text-[#00843D]")} />
                </Link>

                <AnimatePresence>
                  {productsDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-84 pt-3 z-50"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-3">
                        <div className="text-[11px] font-black uppercase tracking-widest text-[#00843D] px-3 py-1.5">
                          Battery Categories
                        </div>
                        {productCategories.map((cat) => (
                          <Link
                            key={cat.name}
                            href={cat.href}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors group"
                            onClick={() => setProductsDropdownOpen(false)}
                          >
                            <span className="text-2xl mt-0.5">{cat.icon}</span>
                            <div>
                              <div className="text-sm font-bold text-slate-900 group-hover:text-[#00843D] transition-colors">
                                {cat.name}
                              </div>
                              <div className="text-xs text-slate-500 leading-tight">
                                {cat.desc}
                              </div>
                            </div>
                          </Link>
                        ))}
                        <div className="mt-2 pt-2 border-t border-gray-100 px-3 py-1 flex justify-between items-center text-xs">
                          <Link 
                            href="/products" 
                            className="font-bold text-[#00843D] hover:underline"
                            onClick={() => setProductsDropdownOpen(false)}
                          >
                            All Batteries &rarr;
                          </Link>
                          <Link 
                            href="/upcoming-products" 
                            className="font-black text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1"
                            onClick={() => setProductsDropdownOpen(false)}
                          >
                            <Sparkles size={11} /> Upcoming R&D &rarr;
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              <li>
                <Link
                  href="/battery-finder"
                  className={clsx(
                    "text-xs 2xl:text-sm font-semibold tracking-wide transition-colors flex items-center gap-1.5 py-1",
                    pathname === "/battery-finder" ? "text-[#00843D] font-bold" : "text-slate-700 hover:text-[#00843D]"
                  )}
                >
                  <Sparkles size={13} className="text-amber-500 animate-pulse" />
                  Battery Finder
                </Link>
              </li>

              <li>
                <Link
                  href="/dealers"
                  className={clsx(
                    "text-xs 2xl:text-sm font-semibold tracking-wide transition-colors py-1",
                    pathname === "/dealers" ? "text-[#00843D] font-bold" : "text-slate-700 hover:text-[#00843D]"
                  )}
                >
                  Dealers
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className={clsx(
                    "text-xs 2xl:text-sm font-semibold tracking-wide transition-colors py-1",
                    pathname === "/about" ? "text-[#00843D] font-bold" : "text-slate-700 hover:text-[#00843D]"
                  )}
                >
                  About
                </Link>
              </li>

              {/* More Dropdown (Blogs, Gallery, Vision, Upcoming) */}
              <li 
                className="relative"
                onMouseEnter={() => setMoreDropdownOpen(true)}
                onMouseLeave={() => setMoreDropdownOpen(false)}
              >
                <button
                  type="button"
                  className={clsx(
                    "text-xs 2xl:text-sm font-semibold tracking-wide transition-colors flex items-center gap-1 py-1 cursor-pointer",
                    (pathname.startsWith("/blogs") || pathname === "/gallery" || pathname === "/vision" || pathname === "/why-goodwin") 
                      ? "text-[#00843D] font-bold" 
                      : "text-slate-700 hover:text-[#00843D]"
                  )}
                >
                  More
                  <ChevronDown size={13} className={clsx("transition-transform duration-200 text-slate-500", moreDropdownOpen && "rotate-180 text-[#00843D]")} />
                </button>

                <AnimatePresence>
                  {moreDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 w-64 pt-3 z-50"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-2.5">
                        <Link
                          href="/blogs"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs font-bold text-slate-800 hover:text-[#00843D] transition-colors"
                          onClick={() => setMoreDropdownOpen(false)}
                        >
                          <span>📰</span>
                          <span>Blogs & Battery Care</span>
                        </Link>
                        <Link
                          href="/gallery"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs font-bold text-slate-800 hover:text-[#00843D] transition-colors"
                          onClick={() => setMoreDropdownOpen(false)}
                        >
                          <span>🏭</span>
                          <span>Manufacturing Gallery</span>
                        </Link>
                        <Link
                          href="/vision"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs font-bold text-slate-800 hover:text-[#00843D] transition-colors"
                          onClick={() => setMoreDropdownOpen(false)}
                        >
                          <span>🚀</span>
                          <span>Vision 2030</span>
                        </Link>
                        <Link
                          href="/why-goodwin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs font-bold text-slate-800 hover:text-[#00843D] transition-colors"
                          onClick={() => setMoreDropdownOpen(false)}
                        >
                          <span>⭐</span>
                          <span>Why Goodwin?</span>
                        </Link>
                        <div className="mt-1 pt-1 border-t border-gray-100">
                          <Link
                            href="/dealer-distributor"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 text-xs font-bold text-[#00843D] transition-colors"
                            onClick={() => setMoreDropdownOpen(false)}
                          >
                            <span>💼</span>
                            <span>Become a Dealer</span>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            </ul>
          </nav>

          {/* Desktop Actions (Strictly xl:flex to match nav breakpoint) */}
          <div className="hidden xl:flex items-center gap-2.5 2xl:gap-3 shrink-0">
            {/* Customer Login / My Account */}
            <Link
              href={isLoggedIn ? "/account/orders" : "/account/login"}
              className={clsx(
                "flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full transition-all border shadow-xs shrink-0",
                isLoggedIn 
                  ? "bg-emerald-50 text-[#00843D] border-emerald-300 hover:bg-emerald-100" 
                  : "bg-white text-slate-800 border-slate-300 hover:border-[#00843D] hover:text-[#00843D]"
              )}
              title={isLoggedIn ? "View My Orders & Account" : "Customer Login with Mobile OTP"}
            >
              <User size={14} className={isLoggedIn ? "text-[#00843D]" : "text-slate-600"} />
              <span>{isLoggedIn ? (customerName ? `Hi, ${customerName.split(" ")[0]}` : "My Account") : "Login / Account"}</span>
            </Link>

            {/* My Orders / Tracking */}
            <Link
              href="/account/orders"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#00843D] border border-gray-300 hover:border-[#00843D] px-3 py-2 rounded-full transition-all bg-white shadow-xs shrink-0"
              title="Track live orders & download GST invoice"
            >
              <Truck size={14} className="text-[#00843D]" />
              <span>Orders</span>
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-[#00843D] transition-colors border border-slate-200 hover:border-emerald-300 flex items-center justify-center group shrink-0"
              aria-label="View Cart"
            >
              <ShoppingBag size={18} className="transition-transform group-hover:scale-110" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00843D] text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Become a dealer - on extra wide screens */}
            <Link
              href="/dealer-distributor"
              className="hidden 2xl:flex text-xs font-bold text-slate-700 hover:text-[#00843D] border border-gray-300 hover:border-[#00843D] px-3.5 py-2 rounded-full items-center gap-1.5 transition-all bg-white shadow-xs shrink-0"
            >
              <Briefcase size={14} className="text-[#00843D]" />
              <span>Dealer Partner</span>
            </Link>

            <Link
              href="/battery-finder"
              className="text-xs font-black uppercase tracking-wider bg-[#00843D] hover:bg-[#006830] text-white px-4 2xl:px-5 py-2 rounded-full flex items-center gap-1.5 shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all active:scale-[0.98] shrink-0"
            >
              <BatteryCharging size={15} />
              <span>Find Battery</span>
            </Link>
          </div>

          {/* Mobile & Tablet Right Controls */}
          <div className="flex items-center gap-2 xl:hidden shrink-0">
            {/* Customer Login direct icon/button on mobile header */}
            <Link
              href={isLoggedIn ? "/account/orders" : "/account/login"}
              className={clsx(
                "flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-colors",
                isLoggedIn
                  ? "bg-emerald-50 text-[#00843D] border-emerald-300"
                  : "bg-slate-50 text-slate-800 hover:text-[#00843D] border-slate-200"
              )}
              title="Customer Login / Account"
            >
              <User size={14} className="text-[#00843D]" />
              <span>{isLoggedIn ? "Account" : "Login"}</span>
            </Link>

            <button
              onClick={openCart}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-[#00843D] transition-colors border border-slate-200"
              aria-label="View Cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00843D] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              className="z-50 text-slate-800 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors focus-visible:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Light Theme) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-30 bg-white text-slate-900 xl:hidden flex flex-col pt-24 pb-8 px-6 overflow-y-auto"
          >
            {/* Customer Login & Order Banner in Mobile Drawer */}
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00843D] text-white flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 uppercase">
                    {isLoggedIn ? (customerName || "Customer Account") : "Customer Account"}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {isLoggedIn ? "View Orders & Invoices" : "OTP Login / Track Orders"}
                  </div>
                </div>
              </div>
              <Link 
                href={isLoggedIn ? "/account/orders" : "/account/login"} 
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#00843D] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm hover:bg-[#006830] transition-colors"
              >
                {isLoggedIn ? "Orders →" : "Login →"}
              </Link>
            </div>

            {/* Quick Helpline Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#00843D] font-bold uppercase tracking-wider">Helpline</div>
                <a href="tel:9220404411" className="text-lg font-black text-slate-900 hover:text-[#00843D]">9220404411</a>
              </div>
              <Link 
                href="/warranty" 
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#00843D] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <ShieldCheck size={14} /> Warranty
              </Link>
            </div>

            <nav className="flex flex-col gap-3 flex-1">
              {[
                { name: "Home", href: "/" },
                { name: "👤 Customer Login & Orders", href: "/account/login" },
                { name: "Products & Catalogue", href: "/products" },
                { name: "Upcoming Innovations", href: "/upcoming-products" },
                { name: "Vehicle Battery Finder", href: "/battery-finder" },
                { name: "Manufacturing Gallery", href: "/gallery" },
                { name: "Blogs & Technical Care", href: "/blogs" },
                { name: "Our Vision & Mission", href: "/vision" },
                { name: "Why Goodwin", href: "/why-goodwin" },
                { name: "Locate Dealer", href: "/dealers" },
                { name: "Check Warranty Status", href: "/warranty" },
                { name: "About Goodwin", href: "/about" },
                { name: "Support & Contact", href: "/support" },
                { name: "Dealer Portal", href: "/dealer/login" },
              ].map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    className={clsx(
                      "text-lg font-heading font-bold transition-colors py-1.5 block border-b border-gray-100",
                      pathname === link.href ? "text-[#00843D]" : "text-slate-700 hover:text-[#00843D]"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
            
            <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-200">
              <Link
                href="/battery-finder"
                className="w-full py-3.5 bg-[#00843D] text-white text-center rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-transform"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BatteryCharging size={18} />
                Find Your Battery
              </Link>
              <Link
                href="/dealer-distributor"
                className="w-full py-3 border border-gray-300 text-slate-800 text-center rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Briefcase size={16} className="text-[#00843D]" />
                Become a Dealer / Partner
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
