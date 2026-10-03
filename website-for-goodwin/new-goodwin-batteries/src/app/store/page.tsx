'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { MockItem, MockInvoice } from '@/lib/mockData';
import { formatINR } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Phone,
  MessageCircle,
  ShieldCheck,
  Truck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  X,
  Share2,
  Copy,
  Check,
  Zap,
  Sun,
  BatteryCharging,
  SlidersHorizontal,
  MapPin,
  QrCode,
  Building2,
  Tag,
  Clock,
  Sparkles,
  ArrowLeft,
  Settings,
} from 'lucide-react';

interface CartItem {
  item: MockItem;
  quantity: number;
}

export default function OnlineStorePage() {
  const { business, items, addInvoice } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customer Checkout Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPincode, setCustomerPincode] = useState('400050');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Order Placement Modal
  const [placedOrder, setPlacedOrder] = useState<{
    orderId: string;
    invoiceNumber: string;
    totalAmount: number;
    itemsCount: number;
    phone: string;
  } | null>(null);

  // Copied link toast state
  const [copiedLink, setCopiedLink] = useState(false);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category)));
    return ['ALL', ...cats];
  }, [items]);

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Only show items marked for store (or all if not specified)
        if (item.showInStore === false) return false;

        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'ALL' || item.category === selectedCategory;

        const matchesStock = !onlyInStock || item.stock > 0;

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.salesPrice - b.salesPrice;
        if (sortBy === 'price-desc') return b.salesPrice - a.salesPrice;
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [items, searchQuery, selectedCategory, sortBy, onlyInStock]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, line) => sum + line.item.salesPrice * line.quantity, 0);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, line) => sum + line.quantity, 0);
  }, [cart]);

  const deliveryFee = cartSubtotal >= 5000 || cartSubtotal === 0 ? 0 : 250;
  const grandTotal = cartSubtotal + deliveryFee;

  // Cart Helpers
  const addToCart = (item: MockItem) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.item.id === item.id);
      if (existing) {
        return prev.map((line) =>
          line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.item.id === itemId) {
            const newQty = line.quantity + delta;
            return newQty > 0 ? { ...line, quantity: newQty } : null;
          }
          return line;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((line) => line.item.id !== itemId));
  };

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // WhatsApp Order Submission
  const handlePlaceWhatsAppOrder = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert('Please fill in your Name, Phone Number, and Delivery Address to place the order.');
      return;
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const invoiceNum = `${business.invoicePrefix}ONL-${orderId.slice(-4)}`;

    // Generate formatted WhatsApp message
    const orderItemsSummary = cart
      .map(
        (line, idx) =>
          `${idx + 1}. *${line.item.name}* x ${line.quantity} = ${formatINR(
            line.item.salesPrice * line.quantity
          )}`
      )
      .join('\n');

    const whatsappMessage = `*NEW ONLINE ORDER - ${business.businessName}* 📦
------------------------------------
*Order ID:* #${orderId}
*Customer Name:* ${customerName}
*Phone:* ${customerPhone}
*Delivery Address:* ${customerAddress}, PIN: ${customerPincode}
${deliveryNotes ? `*Notes:* ${deliveryNotes}\n` : ''}
*Items Ordered:*
${orderItemsSummary}

*Subtotal:* ${formatINR(cartSubtotal)}
*Delivery:* ${deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}
*Total Amount Payable:* ${formatINR(grandTotal)} (Incl. GST)
------------------------------------
Please confirm my order and share estimated delivery time!`;

    // Record invoice in system as UNPAID Online Tax Invoice
    const now = new Date().toISOString().split('T')[0];
    const newInvoice: MockInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      invoiceType: 'TAX_INVOICE',
      partyName: customerName,
      partyPhone: customerPhone,
      partyStateCode: business.stateCode,
      invoiceDate: now,
      dueDate: now,
      subtotal: cartSubtotal,
      discountTotal: 0,
      taxTotal: Math.round(cartSubtotal * 0.18),
      cgstTotal: Math.round(cartSubtotal * 0.09),
      sgstTotal: Math.round(cartSubtotal * 0.09),
      igstTotal: 0,
      roundOff: 0,
      totalAmount: grandTotal,
      paidAmount: 0,
      balanceAmount: grandTotal,
      paymentStatus: 'UNPAID',
      items: cart.map((c) => ({
        itemId: c.item.id,
        name: c.item.name,
        hsnCode: c.item.hsnCode,
        quantity: c.quantity,
        unit: c.item.unit,
        unitPrice: c.item.salesPrice,
        discount: 0,
        taxRate: c.item.taxRate,
        cgst: (c.item.salesPrice * c.quantity * (c.item.taxRate / 200)),
        sgst: (c.item.salesPrice * c.quantity * (c.item.taxRate / 200)),
        igst: 0,
        total: c.item.salesPrice * c.quantity,
      })),
    };

    addInvoice(newInvoice);

    // Launch WhatsApp
    const merchantPhoneClean = business.phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${merchantPhoneClean || '919820112345'}?text=${encodeURIComponent(
      whatsappMessage
    )}`;
    window.open(waUrl, '_blank');

    // Open Success Modal & Clear Cart
    setPlacedOrder({
      orderId,
      invoiceNumber: invoiceNum,
      totalAmount: grandTotal,
      itemsCount: totalItemsCount,
      phone: customerPhone,
    });
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Merchant Admin Switcher Banner */}
      <div className="bg-slate-900 text-white text-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">Merchant Storefront Preview:</span>
          <span className="text-slate-400 font-mono hidden sm:inline">
            goodwinpower.mybillbook.in/store
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyStoreLink}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            {copiedLink ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>Share Store Link</span>
              </>
            )}
          </button>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            <Settings size={13} />
            <span className="hidden sm:inline">Store Settings</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-semibold transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to ERP</span>
          </Link>
        </div>
      </div>

      {/* Main Storefront Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-9 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Brand & GSTIN */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#3a4b8d] to-[#4c3cce] flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-100 shrink-0">
              GB
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {business.businessName}
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  GST Verified
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  {business.city}, {business.state}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline font-mono">
                  GST: {business.gstin}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Cart Button */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-colors"
            >
              <MessageCircle size={15} className="text-emerald-600" />
              <span>WhatsApp Inquiry</span>
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative h-10 px-4 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all active:scale-95"
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">My Cart</span>
              {totalItemsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#db631a] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
              {cartSubtotal > 0 && (
                <span className="hidden md:inline font-bold ml-1 pl-2 border-l border-white/20">
                  {formatINR(cartSubtotal)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-t border-amber-200/50 py-1.5 px-4 text-center">
          <p className="text-xs font-medium text-amber-900 flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span>{business.storeNotice || '⚡ Free same-day delivery across Mumbai on orders above ₹5,000! Genuine warranty & invoice included.'}</span>
          </p>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-[#3a4b8d] to-[#4c3cce] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-100 text-xs font-semibold tracking-wide uppercase">
              Official Digital Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Buy Genuine Batteries & Power Systems Directly
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm max-w-xl">
              {business.storeTagline || 'High-performance tubular inverter batteries, pure sine wave UPS, solar panels & accessories with manufacturer warranty and instant GST invoices.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-xs">
            <div className="text-center px-3 border-r border-white/20">
              <p className="text-lg font-black text-amber-300">100%</p>
              <p className="text-indigo-100 text-[10px] uppercase font-bold">Genuine</p>
            </div>
            <div className="text-center px-3 border-r border-white/20">
              <p className="text-lg font-black text-amber-300">3-5 Yrs</p>
              <p className="text-indigo-100 text-[10px] uppercase font-bold">Warranty</p>
            </div>
            <div className="text-center px-3">
              <p className="text-lg font-black text-amber-300">Fast</p>
              <p className="text-indigo-100 text-[10px] uppercase font-bold">Doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Store Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by battery model, capacity (150Ah), inverter, or solar panel..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce] transition-all"
            />
          </div>

          {/* Filter Pills / Toggles */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mr-1">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>

            <button
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                onlyInStock
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle size={14} className={onlyInStock ? 'text-emerald-600' : 'text-slate-400'} />
              <span>In Stock Only</span>
            </button>
          </div>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#4c3cce] text-white shadow-sm shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All Products' : cat}
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cat === 'ALL'
                  ? items.length
                  : items.filter((i) => i.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search size={22} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No products match your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or switching categories to explore other available power equipment.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setOnlyInStock(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const inCart = cart.find((line) => line.item.id === item.id);
              const discountPercent = Math.round(
                ((item.mrp - item.salesPrice) / item.mrp) * 100
              );

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Header Card */}
                  <div>
                    {/* Visual Placeholder / Badge area */}
                    <div className="bg-gradient-to-tr from-slate-50 to-indigo-50/40 p-5 border-b border-slate-100 relative">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                          {item.category}
                        </span>
                        {discountPercent > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Icon Graphic */}
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-[#4c3cce] group-hover:scale-105 transition-transform">
                        {item.category.toLowerCase().includes('solar') ? (
                          <Sun size={32} className="text-amber-500" />
                        ) : item.category.toLowerCase().includes('inverter') ? (
                          <Zap size={32} className="text-[#4c3cce]" />
                        ) : (
                          <BatteryCharging size={32} className="text-emerald-600" />
                        )}
                      </div>

                      {/* Stock availability badge */}
                      <div className="mt-3 flex items-center justify-center">
                        {item.stock > 10 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            In Stock ({item.stock} available)
                          </span>
                        ) : item.stock > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Low Stock - Only {item.stock} left!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</span>
                        <span className="text-[10px] font-mono text-slate-400">HSN: {item.hsnCode}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#4c3cce] transition-colors leading-snug">
                        {item.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description || 'Heavy-duty industrial grade power equipment engineered for reliable high backup and durability.'}
                      </p>

                      {/* Warranty Pill */}
                      {item.warranty && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                            <ShieldCheck size={12} className="text-indigo-600" />
                            {item.warranty}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Section */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                    <div className="flex items-baseline justify-between pt-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-slate-900">
                            {formatINR(item.salesPrice)}
                          </span>
                          {item.mrp > item.salesPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatINR(item.mrp)}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Incl. {item.taxRate}% GST & Warranty
                        </p>
                      </div>

                      {/* WhatsApp Single Item Inquire */}
                      <a
                        href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${business.businessName}, I am interested in purchasing: ${item.name} (${formatINR(item.salesPrice)}). Please share availability and delivery timeframe.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Inquire on WhatsApp"
                        className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                      >
                        <MessageCircle size={16} />
                      </a>
                    </div>

                    {/* Add to Cart or Stepper */}
                    {inCart ? (
                      <div className="flex items-center justify-between bg-indigo-50/60 border border-indigo-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-bold text-slate-800">
                          {inCart.quantity} in cart
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={inCart.quantity >= item.stock}
                          className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.stock <= 0}
                        className="w-full h-10 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag size={14} />
                        <span>{item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Trust Badges Footer Bar */}
      <section className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#4c3cce] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Genuine Brands</h4>
              <p className="text-[11px] text-slate-500">Official distributor warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Free Express Delivery</h4>
              <p className="text-[11px] text-slate-500">On all orders above ₹5,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <QrCode size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Zero-Contact UPI Pay</h4>
              <p className="text-[11px] text-slate-500">Pay on delivery or online</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Official GST Invoicing</h4>
              <p className="text-[11px] text-slate-500">Claim 18-28% input tax credit</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold">{business.businessName}</p>
            <p className="text-slate-400 text-[11px]">
              {business.address}, {business.city}, {business.state} - {business.pincode}
            </p>
            <p className="text-slate-500 font-mono text-[10px] mt-0.5">
              GSTIN: {business.gstin} | UPI: {business.upiId}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Powered by</span>
            <span className="font-extrabold text-white flex items-center gap-1">
              my<span className="text-indigo-400">Bill</span>Book
            </span>
            <span>Digital Store Engine</span>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Slide-out Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4c3cce]/10 text-[#4c3cce] flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Your Shopping Cart</h3>
                  <p className="text-[11px] text-slate-500">{totalItemsCount} items selected</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <ShoppingBag size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Your cart is empty</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Browse our high-performance batteries and solar hardware to add items.
                  </p>
                </div>
              ) : (
                cart.map((line) => (
                  <div
                    key={line.item.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {line.item.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatINR(line.item.salesPrice)} x {line.quantity} ={' '}
                        <span className="font-bold text-slate-800">
                          {formatINR(line.item.salesPrice * line.quantity)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(line.item.id, -1)}
                        className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center shadow-xs"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(line.item.id, 1)}
                        disabled={line.quantity >= line.item.stock}
                        className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center shadow-xs disabled:opacity-40"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(line.item.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}

              {/* Checkout Form */}
              {cart.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Customer & Delivery Details
                  </h4>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4c3cce]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        WhatsApp Contact Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9820112345"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4c3cce]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                        Delivery Address *
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Flat / Shop No, Building, Landmark, City..."
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4c3cce] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                          Pincode
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 400050"
                          value={customerPincode}
                          onChange={(e) => setCustomerPincode(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4c3cce]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                          Delivery Notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Urgent morning"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4c3cce]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer & Checkout Action */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                {/* Cost Breakdown */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span>{formatINR(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charges:</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="font-bold text-emerald-600 uppercase">FREE</span>
                      ) : (
                        formatINR(deliveryFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="text-[#4c3cce]">{formatINR(grandTotal)}</span>
                  </div>
                </div>

                {/* Primary WhatsApp Order Button */}
                <button
                  onClick={handlePlaceWhatsAppOrder}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                >
                  <MessageCircle size={17} />
                  <span>Order via WhatsApp & Confirm</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Placed Success Modal */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                Order Sent via WhatsApp!
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                Thank You for Your Order!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Order reference <span className="font-mono font-bold text-slate-800">#{placedOrder.orderId}</span> has been dispatched to {business.businessName}. Our team will contact you on <span className="font-bold">{placedOrder.phone}</span>.
              </p>
            </div>

            {/* Bill Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Reference:</span>
                <span className="font-mono font-bold text-slate-800">{placedOrder.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bill Amount:</span>
                <span className="font-bold text-[#4c3cce]">{formatINR(placedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-700">UPI / Cash on Delivery</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[11px] text-slate-500 font-mono">
                  Direct UPI ID: <span className="font-bold text-slate-700">{business.upiId}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setPlacedOrder(null)}
              className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
