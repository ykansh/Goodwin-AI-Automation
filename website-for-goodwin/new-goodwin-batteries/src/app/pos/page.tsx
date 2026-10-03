'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ScanBarcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Share2,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MockItem, MockInvoice } from '@/lib/mockData';
import { formatINR, calculateGST } from '@/lib/utils';
import { GST_STATES } from '@/lib/constants';

interface CartLine {
  item: MockItem;
  quantity: number;
  discount: number; // %
}

export default function POSBillingPage() {
  const { items, parties, business, addInvoice } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedPartyId, setSelectedPartyId] = useState<string>('cash');
  const [placeOfSupply, setPlaceOfSupply] = useState(business.stateCode);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD'>('UPI');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');
  const [completedInvoice, setCompletedInvoice] = useState<MockInvoice | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Filter products for quick-pick grid
  const categories = Array.from(new Set(items.map((i) => i.category)));
  const displayedItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add Item to Cart
  const addToCart = (item: MockItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((c) => c.item.id === item.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prev, { item, quantity: 1, discount: 0 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.item.id === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartLine[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  // Calculations
  const isInterState = placeOfSupply !== business.stateCode;

  const cartCalculations = cart.map((line) => {
    const baseAmount = line.quantity * line.item.salesPrice;
    const discAmount = (baseAmount * line.discount) / 100;
    const taxable = baseAmount - discAmount;
    const gst = calculateGST(taxable, line.item.taxRate, isInterState);
    return {
      ...line,
      taxable,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      totalTax: gst.totalTax,
      total: taxable + gst.totalTax,
    };
  });

  const subtotal = cartCalculations.reduce((acc, c) => acc + c.taxable, 0);
  const cgstTotal = cartCalculations.reduce((acc, c) => acc + c.cgst, 0);
  const sgstTotal = cartCalculations.reduce((acc, c) => acc + c.sgst, 0);
  const igstTotal = cartCalculations.reduce((acc, c) => acc + c.igst, 0);
  const taxTotal = cgstTotal + sgstTotal + igstTotal;
  const rawTotal = subtotal + taxTotal;
  const grandTotal = Math.round(rawTotal);
  const roundOff = Number((grandTotal - rawTotal).toFixed(2));
  const changeToReturn = Math.max(0, cashTendered - grandTotal);

  // Generate Real-time UPI QR on the counter
  useEffect(() => {
    if (grandTotal > 0 && business.upiId) {
      const upiUrl = `upi://pay?pa=${business.upiId}&pn=${encodeURIComponent(
        business.businessName
      )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('POS Counter Bill')}`;
      QRCode.toDataURL(upiUrl, { width: 150, margin: 1 })
        .then((url) => setDynamicQrUrl(url))
        .catch(console.error);
    }
  }, [grandTotal, business]);

  // Handle Barcode Scan Enter key
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const matched = items.find(
        (i) => i.barcode === searchQuery || i.sku.toLowerCase() === searchQuery.toLowerCase()
      );
      if (matched) {
        addToCart(matched);
        setSearchQuery('');
      }
    }
  };

  // Keyboard shortcut F2 for checkout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' && cart.length > 0) {
        e.preventDefault();
        handleCompleteBill();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, grandTotal]);

  const handleCompleteBill = () => {
    if (cart.length === 0) return;

    const selectedParty = parties.find((p) => p.id === selectedPartyId);
    const partyName = selectedParty ? selectedParty.name : 'Cash Sale';
    const partyPhone = selectedParty ? selectedParty.phone : '9800000000';
    const partyGstin = selectedParty ? selectedParty.gstin : undefined;

    const invNumber = `${business.invoicePrefix}${business.currentInvoiceNumber + 1}`;
    const newInvoice: MockInvoice = {
      id: `inv-pos-${Date.now()}`,
      invoiceNumber: invNumber,
      invoiceType: 'TAX_INVOICE',
      partyName,
      partyPhone,
      partyGstin,
      partyStateCode: placeOfSupply,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      subtotal,
      discountTotal: 0,
      taxTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      roundOff,
      totalAmount: grandTotal,
      paidAmount: grandTotal,
      balanceAmount: 0,
      paymentStatus: 'PAID',
      items: cartCalculations.map((c) => ({
        itemId: c.item.id,
        name: c.item.name,
        hsnCode: c.item.hsnCode,
        quantity: c.quantity,
        unit: c.item.unit,
        unitPrice: c.item.salesPrice,
        discount: c.discount,
        taxRate: c.item.taxRate,
        cgst: c.cgst,
        sgst: c.sgst,
        igst: c.igst,
        total: c.total,
      })),
      upiQrUrl: dynamicQrUrl,
    };

    addInvoice(newInvoice);
    setCompletedInvoice(newInvoice);
    setCart([]);
  };

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col overflow-hidden select-none">
      {/* POS Top Header */}
      <header className="h-14 bg-slate-800 border-b border-slate-700 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <div className="h-5 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-2">
              <span>POS Fast Billing Counter</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#db631a] text-white font-mono uppercase">
                &lt; 5s Bill
              </span>
            </h1>
          </div>
        </div>

        {/* Store Title */}
        <div className="text-right">
          <p className="text-xs font-bold text-slate-200">{business.businessName}</p>
          <p className="text-[10px] text-slate-400 font-mono">GSTIN: {business.gstin}</p>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Product Selector & Live Scanner (60%) */}
        <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-900 p-4 space-y-4 overflow-hidden">
          {/* Barcode Live Scanner & Search Input */}
          <div className="relative">
            <ScanBarcode
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400"
            />
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="Scan Barcode with USB Scanner or type item name / SKU (Press Enter)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4c3cce] focus:border-transparent font-medium"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs shrink-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-[#4c3cce] text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#4c3cce] text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick-Pick Product Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3 pr-1">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-[#4c3cce] rounded-xl p-3.5 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] font-mono text-slate-400">{item.barcode}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        item.stock <= item.minStockAlert
                          ? 'bg-rose-900/60 text-rose-300'
                          : 'bg-emerald-900/60 text-emerald-300'
                      }`}
                    >
                      {item.stock} {item.unit}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-white line-clamp-2 mt-1">{item.name}</h3>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-700/60 flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-400 line-through">
                    {formatINR(item.mrp || item.salesPrice * 1.15)}
                  </span>
                  <span className="font-black text-sm text-emerald-400">
                    {formatINR(item.salesPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Bill Register Cart & Checkout (40%) */}
        <div className="w-[420px] bg-slate-850 flex flex-col border-l border-slate-800 overflow-hidden shrink-0">
          {/* Customer & Place of Supply Selector */}
          <div className="p-3 bg-slate-800 border-b border-slate-700 space-y-2 text-xs">
            <div className="flex gap-2">
              <select
                value={selectedPartyId}
                onChange={(e) => {
                  setSelectedPartyId(e.target.value);
                  const p = parties.find((party) => party.id === e.target.value);
                  if (p?.stateCode) setPlaceOfSupply(p.stateCode);
                }}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-[#4c3cce]"
              >
                <option value="cash">Walk-in Counter Customer (Cash)</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (+91 {p.phone})
                  </option>
                ))}
              </select>

              <select
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-[#4c3cce]"
              >
                {GST_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
                <ShoppingBag size={40} className="stroke-1 text-slate-600" />
                <p className="text-xs font-semibold">Cart is currently empty</p>
                <p className="text-[11px] text-slate-500">Scan barcode or click any product to add</p>
              </div>
            ) : (
              cartCalculations.map((line) => (
                <div
                  key={line.item.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-white truncate">{line.item.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatINR(line.item.salesPrice)} • {line.item.taxRate}% GST
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Qty Controls */}
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                      <button
                        onClick={() => updateQuantity(line.item.id, -1)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-white px-1">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.item.id, 1)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Total Amount */}
                    <span className="font-bold text-emerald-400 w-16 text-right">
                      {formatINR(line.total)}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromCart(line.item.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout & Tender Strip */}
          <div className="p-4 bg-slate-800 border-t border-slate-700 space-y-3 shrink-0 text-xs">
            {/* Payment Mode */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMode('UPI')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMode === 'UPI'
                    ? 'bg-[#4c3cce] text-white shadow-xs'
                    : 'bg-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                <QrCode size={14} />
                <span>UPI QR</span>
              </button>
              <button
                onClick={() => setPaymentMode('CASH')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMode === 'CASH'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                <Banknote size={14} />
                <span>Cash</span>
              </button>
              <button
                onClick={() => setPaymentMode('CARD')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  paymentMode === 'CARD'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                <CreditCard size={14} />
                <span>Card</span>
              </button>
            </div>

            {/* Dynamic UPI QR display when mode is UPI */}
            {paymentMode === 'UPI' && dynamicQrUrl && grandTotal > 0 && (
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 flex items-center gap-3">
                <img src={dynamicQrUrl} alt="UPI QR" className="w-16 h-16 rounded bg-white p-1" />
                <div>
                  <p className="font-bold text-white text-xs">Counter Dynamic QR</p>
                  <p className="text-[10px] text-slate-400">Customer scans with PhonePe/GPay</p>
                  <p className="font-mono text-[10px] text-[#4c3cce] mt-0.5 font-bold">
                    Amount: {formatINR(grandTotal)}
                  </p>
                </div>
              </div>
            )}

            {/* Cash Tendered & Change when mode is CASH */}
            {paymentMode === 'CASH' && (
              <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Cash Received (₹)</label>
                  <input
                    type="number"
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    placeholder="Enter cash"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Change to Return</label>
                  <p className="text-sm font-black text-emerald-400 pt-1">
                    {formatINR(changeToReturn)}
                  </p>
                </div>
              </div>
            )}

            {/* Financial Totals */}
            <div className="space-y-1 pt-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Taxable Subtotal:</span>
                <span className="font-semibold text-slate-200">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total GST Tax:</span>
                <span className="font-semibold text-slate-200">{formatINR(taxTotal)}</span>
              </div>
              <div className="pt-1 border-t border-slate-700 flex justify-between items-baseline text-sm">
                <span className="font-bold text-white">Grand Total:</span>
                <span className="font-black text-xl text-emerald-400">{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Complete Bill Button */}
            <button
              onClick={handleCompleteBill}
              disabled={cart.length === 0}
              className="w-full py-3.5 rounded-xl bg-[#db631a] hover:bg-[#c45312] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
            >
              <Printer size={16} />
              <span>Complete Bill &amp; Print (F2)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bill Completed Success Modal */}
      {completedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Bill Completed in &lt; 4s!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Invoice <span className="font-bold text-white">{completedInvoice.invoiceNumber}</span> for{' '}
                <span className="text-emerald-400 font-bold">{formatINR(completedInvoice.totalAmount)}</span>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer size={15} />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setCompletedInvoice(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs"
              >
                Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
