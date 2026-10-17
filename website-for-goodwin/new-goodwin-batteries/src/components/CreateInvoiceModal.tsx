'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Plus,
  Trash2,
  Printer,
  Share2,
  CheckCircle2,
  ScanBarcode,
  Search,
  Sparkles,
  Building,
  Truck,
  CreditCard,
  FileText,
  Check,
  ChevronDown,
  UserCheck,
  DollarSign,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { MockItem, MockParty, MockInvoice } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { formatINR, calculateGST } from '@/lib/utils';
import { GST_STATES, GST_RATES } from '@/lib/constants';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated?: (invoice: MockInvoice) => void;
  initialType?: 'TAX_INVOICE' | 'BILL_OF_SUPPLY' | 'QUOTATION' | 'DELIVERY_CHALLAN';
  defaultParty?: MockParty | null;
}

interface BillLineItem {
  id: string;
  itemId: string;
  name: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number; // %
  taxRate: number; // %
}

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onInvoiceCreated,
  initialType = 'TAX_INVOICE',
  defaultParty,
}: CreateInvoiceModalProps) {
  const { items, parties, business, addInvoice, selectedCompany } = useApp();

  // Invoice Type Switcher: Tax Invoice vs Quotation vs Bill of Supply
  const [invoiceType, setInvoiceType] = useState<'TAX_INVOICE' | 'QUOTATION' | 'BILL_OF_SUPPLY'>(
    initialType === 'QUOTATION' ? 'QUOTATION' : 'TAX_INVOICE'
  );

  const generateNumberForType = (type: 'TAX_INVOICE' | 'QUOTATION' | 'BILL_OF_SUPPLY') => {
    const isGB2 = selectedCompany?.code === 'goodwin-2';
    const randNum = Math.floor(100000 + Math.random() * 900000);
    if (type === 'QUOTATION') {
      return isGB2 ? `GB2-QT-${randNum}` : `GW-QT-${randNum}`;
    }
    return isGB2 ? `GB2-INV-${randNum}` : `GW-INV-${randNum}`;
  };

  // Order Details
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState(generateNumberForType(initialType === 'QUOTATION' ? 'QUOTATION' : 'TAX_INVOICE'));

  // Customer Search & Dropdown State
  const [selectedParty, setSelectedParty] = useState<MockParty | null>(defaultParty || null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Customer Contact & Billing Details
  const [customerName, setCustomerName] = useState(defaultParty?.name || '');
  const [customerPhone, setCustomerPhone] = useState(defaultParty?.phone || '');
  const [customerGstin, setCustomerGstin] = useState(defaultParty?.gstin || '');
  const [billingName, setBillingName] = useState(defaultParty?.name || '');
  const [billingAddress, setBillingAddress] = useState(defaultParty?.address || '');
  const [billingState, setBillingState] = useState(defaultParty?.state || 'Madhya Pradesh');
  const [placeOfSupply, setPlaceOfSupply] = useState(defaultParty?.stateCode || business.stateCode || '23');

  // Shipping & Transport Details
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shippingAddress, setShippingAddress] = useState(defaultParty?.address || '');
  const [shippingState, setShippingState] = useState(defaultParty?.state || 'Madhya Pradesh');
  const [transportAddress, setTransportAddress] = useState('');
  const [transportContactNumber, setTransportContactNumber] = useState('');
  const [transportGstin, setTransportGstin] = useState('');
  const [placeOfDelivery, setPlaceOfDelivery] = useState('Madhya Pradesh');
  const [referenceName, setReferenceName] = useState('');
  const [pvtMarka, setPvtMarka] = useState('');

  // Payment Settlement Options (1. Paid, 2. Partially Paid, 3. Unpaid)
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID'>('PAID');
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CHEQUE'>('UPI');
  const [partialPaidInput, setPartialPaidInput] = useState<number>(0);
  const [paymentReference, setPaymentReference] = useState('');

  // Line items state
  const defaultItem = items[0] || null;
  const [lineItems, setLineItems] = useState<BillLineItem[]>([
    {
      id: '1',
      itemId: defaultItem?.id || '',
      name: defaultItem?.name || '',
      hsnCode: defaultItem?.hsnCode || '8507',
      quantity: 1,
      unit: defaultItem?.unit || 'PCS',
      unitPrice: defaultItem?.salesPrice || 0,
      discount: 0,
      taxRate: defaultItem?.taxRate || 28,
    },
  ]);

  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<MockInvoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync shipping address when sameAsBilling is toggled
  useEffect(() => {
    if (sameAsBilling) {
      setShippingAddress(billingAddress);
      setShippingState(billingState);
    }
  }, [sameAsBilling, billingAddress, billingState]);

  // Reset or regenerate when opened
  useEffect(() => {
    if (isOpen) {
      const type = initialType === 'QUOTATION' ? 'QUOTATION' : 'TAX_INVOICE';
      setInvoiceType(type);
      setInvoiceNumber(generateNumberForType(type));
      setIsSuccess(false);
      setCreatedInvoice(null);
      if (defaultParty) {
        handleSelectParty(defaultParty);
      }
    }
  }, [isOpen, initialType, selectedCompany?.code]);

  // Handle party selection from dropdown
  const handleSelectParty = (party: MockParty) => {
    setSelectedParty(party);
    setCustomerName(party.name);
    setCustomerPhone(party.phone);
    setCustomerGstin(party.gstin || '');
    setBillingName(party.name);
    setBillingAddress(party.address || '');
    setBillingState(party.state || 'Madhya Pradesh');
    setPlaceOfSupply(party.stateCode || '23');
    if (sameAsBilling) {
      setShippingAddress(party.address || '');
      setShippingState(party.state || 'Madhya Pradesh');
    }
    setPlaceOfDelivery(party.state || 'Madhya Pradesh');
    setIsCustomerDropdownOpen(false);
    setCustomerSearchQuery('');
  };

  const handleClearSelectedParty = () => {
    setSelectedParty(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerGstin('');
    setBillingName('');
    setBillingAddress('');
    setBillingState('Madhya Pradesh');
    setShippingAddress('');
    setShippingState('Madhya Pradesh');
  };

  // Filter parties for dropdown search
  const filteredParties = parties.filter((p) => {
    const query = customerSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.name.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      (p.gstin && p.gstin.toLowerCase().includes(query))
    );
  });

  // Switch invoice type
  const handleTypeChange = (newType: 'TAX_INVOICE' | 'QUOTATION' | 'BILL_OF_SUPPLY') => {
    setInvoiceType(newType);
    setInvoiceNumber(generateNumberForType(newType));
    if (newType === 'QUOTATION') {
      setPaymentStatus('UNPAID');
    } else {
      setPaymentStatus('PAID');
    }
  };

  // Inter-state check
  const isInterState = placeOfSupply !== business.stateCode;

  // Add Item Row
  const addItemRow = (item?: MockItem) => {
    const targetItem = item || items[0] || defaultItem;
    if (!targetItem) return;
    setLineItems((prev) => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        itemId: targetItem.id,
        name: targetItem.name,
        hsnCode: targetItem.hsnCode,
        quantity: 1,
        unit: targetItem.unit,
        unitPrice: targetItem.salesPrice,
        discount: 0,
        taxRate: targetItem.taxRate,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: keyof BillLineItem, value: any) => {
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectItem = (index: number, itemId: string) => {
    const found = items.find((i) => i.id === itemId);
    if (!found) return;
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        itemId: found.id,
        name: found.name,
        hsnCode: found.hsnCode,
        unitPrice: found.salesPrice,
        unit: found.unit,
        taxRate: found.taxRate,
      };
      return updated;
    });
  };

  // Calculations
  const calculatedRows = lineItems.map((row) => {
    const baseAmount = row.quantity * row.unitPrice;
    const discountAmount = (baseAmount * row.discount) / 100;
    const taxableAmount = Math.max(0, baseAmount - discountAmount);
    const gst = calculateGST(taxableAmount, row.taxRate, isInterState);
    const total = taxableAmount + gst.totalTax;
    return {
      ...row,
      taxableAmount,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      totalTax: gst.totalTax,
      total,
    };
  });

  const subtotal = calculatedRows.reduce((acc, r) => acc + r.taxableAmount, 0);
  const cgstTotal = calculatedRows.reduce((acc, r) => acc + r.cgst, 0);
  const sgstTotal = calculatedRows.reduce((acc, r) => acc + r.sgst, 0);
  const igstTotal = calculatedRows.reduce((acc, r) => acc + r.igst, 0);
  const taxTotal = cgstTotal + sgstTotal + igstTotal;
  const rawTotal = subtotal + taxTotal;
  const grandTotal = Math.round(rawTotal);
  const roundOff = Number((grandTotal - rawTotal).toFixed(2));

  // Payment amounts based on selected payment status
  const effectivePaidAmount =
    invoiceType === 'QUOTATION'
      ? 0
      : paymentStatus === 'PAID'
      ? grandTotal
      : paymentStatus === 'PARTIAL'
      ? Math.min(grandTotal, Math.max(0, Number(partialPaidInput) || 0))
      : 0;

  const effectiveBalanceAmount =
    invoiceType === 'QUOTATION' ? grandTotal : Math.max(0, grandTotal - effectivePaidAmount);

  // Generate UPI QR Code whenever grandTotal changes
  useEffect(() => {
    if (grandTotal > 0 && business.upiId) {
      const amtToPay = paymentStatus === 'PARTIAL' && effectivePaidAmount > 0 ? effectivePaidAmount : grandTotal;
      const upiUrl = `upi://pay?pa=${business.upiId}&pn=${encodeURIComponent(
        business.businessName
      )}&am=${amtToPay}&cu=INR&tn=${encodeURIComponent(`${invoiceNumber} Payment`)}`;
      QRCode.toDataURL(upiUrl, { width: 140, margin: 1 })
        .then((url) => setUpiQrDataUrl(url))
        .catch(console.error);
    }
  }, [grandTotal, business, effectivePaidAmount, paymentStatus, invoiceNumber]);

  const handleSaveInvoice = async () => {
    if (isSubmitting) return;

    if (!customerName.trim()) {
      alert('Please enter or select a customer name');
      return;
    }

    if (calculatedRows.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    setIsSubmitting(true);
    try {
      const invNumber = invoiceNumber.trim() || generateNumberForType(invoiceType);

      const newInvoice: MockInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invNumber,
        invoiceType,
        orderNumber: orderNumber.trim() || undefined,
        orderDate: orderDate || invoiceDate,
        partyName: customerName.trim(),
        partyPhone: customerPhone.trim(),
        partyGstin: customerGstin.trim() || undefined,
        billingName: billingName.trim() || customerName.trim(),
        billingAddress: billingAddress.trim() || undefined,
        billingState: billingState || 'Madhya Pradesh',
        shippingAddress: sameAsBilling ? billingAddress.trim() : shippingAddress.trim() || undefined,
        shippingState: sameAsBilling ? billingState : shippingState || 'Madhya Pradesh',
        transportAddress: transportAddress.trim() || undefined,
        transportContactNumber: transportContactNumber.trim() || undefined,
        transportGstin: transportGstin.trim() || undefined,
        placeOfSupply,
        placeOfDelivery: placeOfDelivery.trim() || 'Madhya Pradesh',
        referenceName: referenceName.trim() || undefined,
        pvtMarka: pvtMarka.trim() || undefined,
        partyStateCode: placeOfSupply,
        invoiceDate,
        dueDate: invoiceDate,
        subtotal,
        discountTotal: 0,
        taxTotal,
        cgstTotal,
        sgstTotal,
        igstTotal,
        roundOff,
        totalAmount: grandTotal,
        paidAmount: effectivePaidAmount,
        balanceAmount: effectiveBalanceAmount,
        paymentStatus: invoiceType === 'QUOTATION' ? 'UNPAID' : paymentStatus,
        paymentMode: invoiceType === 'QUOTATION' ? undefined : paymentMode,
        paymentReference: paymentReference.trim() || undefined,
        items: calculatedRows.map((r) => ({
          itemId: r.itemId,
          name: r.name,
          hsnCode: r.hsnCode,
          quantity: r.quantity,
          unit: r.unit,
          unitPrice: r.unitPrice,
          discount: r.discount,
          taxRate: r.taxRate,
          cgst: r.cgst,
          sgst: r.sgst,
          igst: r.igst,
          total: r.total,
        })),
        upiQrUrl: upiQrDataUrl,
      };

      const saved = await addInvoice(newInvoice);
      setCreatedInvoice(saved || newInvoice);
      setIsSuccess(true);
      if (onInvoiceCreated) {
        onInvoiceCreated(saved || newInvoice);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Success View */}
        {isSuccess && createdInvoice ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {createdInvoice.invoiceType === 'QUOTATION'
                ? 'Quotation / Estimate Created Successfully!'
                : 'Tax Invoice Generated in < 5s!'}
            </h2>
            <p className="text-slate-600 text-sm max-w-lg leading-relaxed">
              <span className="font-semibold text-slate-800">
                {createdInvoice.invoiceType === 'QUOTATION' ? 'Quotation #' : 'Invoice #'}
              </span>{' '}
              <span className="font-mono font-bold text-[#4c3cce]">{createdInvoice.invoiceNumber}</span> for{' '}
              <span className="font-bold text-slate-900">{createdInvoice.partyName}</span> of{' '}
              <span className="font-black text-emerald-600">{formatINR(createdInvoice.totalAmount)}</span> has been saved.
            </p>

            {/* Payment settlement badge */}
            {createdInvoice.invoiceType !== 'QUOTATION' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-600">Settlement:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    createdInvoice.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : createdInvoice.paymentStatus === 'PARTIAL'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {createdInvoice.paymentStatus === 'PAID'
                    ? `Fully Paid (${createdInvoice.paymentMode})`
                    : createdInvoice.paymentStatus === 'PARTIAL'
                    ? `Partially Paid (${formatINR(createdInvoice.paidAmount)} Paid / ${formatINR(createdInvoice.balanceAmount)} Due)`
                    : 'Unpaid (100% Credit / Khata)'}
                </span>
              </div>
            )}

            {/* Dynamic UPI QR Code Preview */}
            {upiQrDataUrl && createdInvoice.paymentStatus !== 'PAID' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center shadow-2xs">
                <img src={upiQrDataUrl} alt="UPI QR" className="w-32 h-32 rounded-lg" />
                <p className="text-[11px] font-mono text-slate-500 mt-2">
                  Scan to Pay: <span className="font-bold text-slate-800">{business.upiId}</span>
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-3 justify-center">
              <button
                onClick={() => {
                  if (onInvoiceCreated && createdInvoice) {
                    onInvoiceCreated(createdInvoice);
                  }
                  setIsSuccess(false);
                  onClose();
                  setTimeout(() => window.print(), 350);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <Printer size={16} />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => {
                  const docType = createdInvoice.invoiceType === 'QUOTATION' ? 'Quotation' : 'Invoice';
                  const text = `Dear ${createdInvoice.partyName}, your ${docType} ${createdInvoice.invoiceNumber} for ${formatINR(
                    createdInvoice.totalAmount
                  )} from ${business.businessName || 'Goodwin Batteries Pvt. Ltd.'} is ready. Pay using UPI: ${business.upiId}`;
                  window.open(`https://wa.me/91${createdInvoice.partyPhone}?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-2xs transition-colors"
              >
                <Share2 size={16} />
                <span>Share on WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                  if (onInvoiceCreated && createdInvoice) {
                    onInvoiceCreated(createdInvoice);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Billing Form */
          <>
            {/* Modal Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${invoiceType === 'QUOTATION' ? 'bg-amber-600' : 'bg-[#4c3cce]'}`}>
                  {invoiceType === 'QUOTATION' ? <FileText size={18} /> : <ScanBarcode size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-slate-900 text-base">
                      {invoiceType === 'QUOTATION' ? 'Create Quotation / Estimate' : 'Create Sale Tax Invoice'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      ⚡ Fast Billing
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {invoiceType === 'QUOTATION'
                      ? 'Commercial quotation / rate estimate (does not deduct stock)'
                      : 'GST-compliant invoice with automatic ledger settlement & stock adjustment'}
                  </p>
                </div>
              </div>

              {/* Invoice Type Selector Buttons */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('TAX_INVOICE')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      invoiceType === 'TAX_INVOICE'
                        ? 'bg-white text-[#4c3cce] shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📑 Tax Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('QUOTATION')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      invoiceType === 'QUOTATION'
                        ? 'bg-white text-amber-700 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📋 Quotation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('BILL_OF_SUPPLY')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      invoiceType === 'BILL_OF_SUPPLY'
                        ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🚚 Bill of Supply
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Top Banner for Quotation Mode */}
              {invoiceType === 'QUOTATION' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-900 text-xs font-medium">
                  <FileText size={18} className="text-amber-600 shrink-0" />
                  <span>
                    <strong>Quotation / Estimate Mode Active:</strong> This estimate will be recorded without deducting stock or Khata ledger dues. You can convert it into an invoice with 1 click later.
                  </span>
                </div>
              )}

              {/* CARD 1: ORDER & VOUCHER DATES */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <Clock size={15} className="text-[#4c3cce]" />
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    1. Voucher &amp; Order Reference
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {/* Order Number */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Order Number</label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="e.g. ORD-2026"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Order Date */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Order Date</label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Invoice Date */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Invoice Date *</label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Invoice / Quotation Number */}
                  <div className="lg:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      {invoiceType === 'QUOTATION' ? 'Quotation Number *' : 'Invoice Number *'}
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="e.g. GW-2026"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Reference Name */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reference Name</label>
                    <input
                      type="text"
                      value={referenceName}
                      onChange={(e) => setReferenceName(e.target.value)}
                      placeholder="e.g. Rahul Sen"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 2: CUSTOMER SELECTION & BILLING DETAILS */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Building size={15} className="text-[#4c3cce]" />
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      2. Customer &amp; Billing Details
                    </h3>
                  </div>

                  {selectedParty && (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg text-[11px]">
                      <UserCheck size={14} className="text-[#4c3cce]" />
                      <span className="font-semibold text-slate-800">
                        Linked: <strong>{selectedParty.name}</strong> ({selectedParty.currentBalance >= 0 ? `Due: ${formatINR(selectedParty.currentBalance)}` : `Adv: ${formatINR(Math.abs(selectedParty.currentBalance))}`})
                      </span>
                      <button
                        type="button"
                        onClick={handleClearSelectedParty}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                        title="Unlink Customer"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Searchable Customer Dropdown Search Bar */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Customer / Search Khata Party *
                  </label>
                  <div className="relative flex items-center">
                    <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => {
                        setCustomerSearchQuery(e.target.value);
                        setIsCustomerDropdownOpen(true);
                      }}
                      onFocus={() => setIsCustomerDropdownOpen(true)}
                      placeholder="Search registered customer by name, mobile number, or GSTIN..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomerDropdownOpen((prev) => !prev)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {/* Dropdown Menu List */}
                  {isCustomerDropdownOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
                      {filteredParties.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-xs">
                          No matching registered party found. You can type customer details directly below.
                        </div>
                      ) : (
                        filteredParties.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectParty(p)}
                            className="p-3 hover:bg-indigo-50/60 cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-xs">{p.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-100 font-semibold text-slate-600">
                                  {p.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                Mob: +91 {p.phone} {p.gstin ? `• GSTIN: ${p.gstin}` : ''}
                              </p>
                              {p.address && (
                                <p className="text-[10px] text-slate-400 truncate max-w-md">{p.address}</p>
                              )}
                            </div>

                            <div className="text-right">
                              <span
                                className={`font-mono font-bold text-xs ${
                                  p.currentBalance >= 0 ? 'text-rose-600' : 'text-emerald-600'
                                }`}
                              >
                                {p.currentBalance >= 0
                                  ? `Due: ${formatINR(p.currentBalance)}`
                                  : `Adv: ${formatINR(Math.abs(p.currentBalance))}`}
                              </span>
                              <span className="block text-[10px] text-slate-400">Khata Balance</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Detailed Customer & Billing Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                  {/* Customer Contact Name */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Mr. Shubham ji"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Phone Number *</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 7000334245"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Billing Name */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Billing Name (Firm Name)</label>
                    <input
                      type="text"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                      placeholder="e.g. Om Sai Accessories"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Customer GSTIN */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer GSTIN</label>
                    <input
                      type="text"
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 23AABCX9988Z1"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Billing Address */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                    <input
                      type="text"
                      value={billingAddress}
                      onChange={(e) => setBillingAddress(e.target.value)}
                      placeholder="e.g. Old bus stand king road bareli MADHYA PRADESH, 464668"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* State / UT */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State / UT (Billing)</label>
                    <select
                      value={billingState}
                      onChange={(e) => {
                        setBillingState(e.target.value);
                        const match = GST_STATES.find((s) => s.name === e.target.value);
                        if (match) setPlaceOfSupply(match.code);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    >
                      {GST_STATES.map((st) => (
                        <option key={st.code} value={st.name}>
                          {st.name} ({st.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Place of Supply */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Place of Supply {isInterState ? '(IGST)' : '(CGST+SGST)'}
                    </label>
                    <select
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    >
                      {GST_STATES.map((st) => (
                        <option key={st.code} value={st.code}>
                          {st.code} - {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CARD 3: SHIPPING & TRANSPORT DETAILS */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-[#4c3cce]" />
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      3. Shipping &amp; Transport Logistics
                    </h3>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                      className="rounded text-[#4c3cce] focus:ring-0"
                    />
                    <span>Shipping address same as billing</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {/* Shipping Address */}
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Shipping Address</label>
                    <input
                      type="text"
                      disabled={sameAsBilling}
                      value={sameAsBilling ? billingAddress : shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="e.g. Old bus stand king road bareli"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce] disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>

                  {/* Shipping State */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State / UT (Shipping)</label>
                    <select
                      disabled={sameAsBilling}
                      value={sameAsBilling ? billingState : shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce] disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      {GST_STATES.map((st) => (
                        <option key={st.code} value={st.name}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Place of Delivery */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Place of Delivery</label>
                    <input
                      type="text"
                      value={placeOfDelivery}
                      onChange={(e) => setPlaceOfDelivery(e.target.value)}
                      placeholder="e.g. MADHYA PRADESH"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Transport Address / Transporter Name */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Transport Name / Address</label>
                    <input
                      type="text"
                      value={transportAddress}
                      onChange={(e) => setTransportAddress(e.target.value)}
                      placeholder="e.g. Kailash Road Lines"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Transport Contact Number */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Transport Contact Number</label>
                    <input
                      type="text"
                      value={transportContactNumber}
                      onChange={(e) => setTransportContactNumber(e.target.value)}
                      placeholder="e.g. 7312760706"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Transport GSTIN */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Transport GSTIN</label>
                    <input
                      type="text"
                      value={transportGstin}
                      onChange={(e) => setTransportGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 23TRANS1234F1Z1"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>

                  {/* Pvt Marka */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pvt Marka (Packaging Mark)</label>
                    <input
                      type="text"
                      value={pvtMarka}
                      onChange={(e) => setPvtMarka(e.target.value)}
                      placeholder="e.g. BRL-44"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                    />
                  </div>
                </div>
              </div>

              {/* CARD 4: LINE ITEMS TABLE */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <span>Items &amp; Battery Products</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-[#4c3cce] font-semibold">
                      Inventory integrated
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => addItemRow()}
                    className="h-8 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4c3cce] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3">Item / Battery Product</th>
                        <th className="py-2.5 px-3 w-20">HSN</th>
                        <th className="py-2.5 px-3 w-24">Qty</th>
                        <th className="py-2.5 px-3 w-28">Rate (₹)</th>
                        <th className="py-2.5 px-3 w-20">Disc %</th>
                        <th className="py-2.5 px-3 w-24">GST Rate</th>
                        <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                        <th className="py-2.5 px-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {calculatedRows.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Item Select */}
                          <td className="p-2">
                            <select
                              value={row.itemId}
                              onChange={(e) => handleSelectItem(idx, e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                            >
                              {items.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} (Stock: {item.stock} {item.unit})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* HSN */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={row.hsnCode}
                              onChange={(e) => updateItemRow(idx, 'hsnCode', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-mono"
                            />
                          </td>

                          {/* Qty */}
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) => updateItemRow(idx, 'quantity', Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-800"
                            />
                          </td>

                          {/* Unit Price */}
                          <td className="p-2">
                            <input
                              type="number"
                              value={row.unitPrice}
                              onChange={(e) => updateItemRow(idx, 'unitPrice', Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-800"
                            />
                          </td>

                          {/* Disc */}
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={row.discount}
                              onChange={(e) => updateItemRow(idx, 'discount', Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs text-slate-800"
                            />
                          </td>

                          {/* Tax Rate */}
                          <td className="p-2">
                            <select
                              value={row.taxRate}
                              onChange={(e) => updateItemRow(idx, 'taxRate', Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-800"
                            >
                              {GST_RATES.map((rate) => (
                                <option key={rate} value={rate}>
                                  {rate}%
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Total */}
                          <td className="p-2 text-right font-bold text-slate-900">
                            {formatINR(row.total)}
                          </td>

                          {/* Delete */}
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              disabled={lineItems.length === 1}
                              className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD 5: PAYMENT SETTLEMENT (The 3 Options: Paid, Partially Paid, Unpaid) */}
              {invoiceType !== 'QUOTATION' ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <CreditCard size={15} className="text-[#4c3cce]" />
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      4. Customer Payment Mode &amp; Settlement (Required)
                    </h3>
                  </div>

                  {/* 3 Payment Options Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Option 1: Paid */}
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('PAID')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        paymentStatus === 'PAID'
                          ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 size={15} className={paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-slate-400'} />
                          1. Paid (Full Payment)
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {formatINR(grandTotal)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Invoice is fully settled. 0 pending balance.
                      </p>
                    </button>

                    {/* Option 2: Partially Paid */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentStatus('PARTIAL');
                        if (partialPaidInput === 0) {
                          setPartialPaidInput(Math.round(grandTotal / 2));
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        paymentStatus === 'PARTIAL'
                          ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-800 flex items-center gap-1.5">
                          <DollarSign size={15} className={paymentStatus === 'PARTIAL' ? 'text-amber-600' : 'text-slate-400'} />
                          2. Partially Paid
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Custom Advance
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Customer pays part now, rest added to Khata.
                      </p>
                    </button>

                    {/* Option 3: Unpaid */}
                    <button
                      type="button"
                      onClick={() => setPaymentStatus('UNPAID')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        paymentStatus === 'UNPAID'
                          ? 'bg-rose-50 border-rose-500 shadow-sm ring-1 ring-rose-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-rose-800 flex items-center gap-1.5">
                          <AlertCircle size={15} className={paymentStatus === 'UNPAID' ? 'text-rose-600' : 'text-slate-400'} />
                          3. Unpaid (Credit / Udhar)
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                          Due: {formatINR(grandTotal)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        100% added to customer's outstanding ledger.
                      </p>
                    </button>
                  </div>

                  {/* Payment Details Form (for Paid and Partially Paid) */}
                  {paymentStatus !== 'UNPAID' && (
                    <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {paymentStatus === 'PARTIAL' && (
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Amount Received Now (₹) *
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={grandTotal}
                              value={partialPaidInput}
                              onChange={(e) => setPartialPaidInput(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#4c3cce]"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                          <select
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                          >
                            <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                            <option value="CASH">Cash Counter Payment</option>
                            <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                            <option value="CHEQUE">Cheque Payment</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Reference / UTR / Cheque #
                          </label>
                          <input
                            type="text"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="Optional UTR or Transaction ID"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                          />
                        </div>
                      </div>

                      {/* Financial summary banner for partial or unpaid */}
                      {paymentStatus === 'PARTIAL' && (
                        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                          <span>
                            Advance Received: <strong>{formatINR(effectivePaidAmount)}</strong>
                          </span>
                          <span>
                            Remaining Balance Due:{' '}
                            <strong className="text-rose-700">{formatINR(effectiveBalanceAmount)}</strong> (will be added to customer's Khata)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentStatus === 'UNPAID' && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="text-rose-600 shrink-0" />
                      <span>
                        Full invoice amount of <strong>{formatINR(grandTotal)}</strong> will be booked as an outstanding receivable against <strong>{customerName || 'customer'}</strong>.
                      </span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* CARD 6: BOTTOM SUMMARY & TAX BREAKDOWN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Notes & Dynamic UPI QR */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-4">
                    {upiQrDataUrl && (
                      <img src={upiQrDataUrl} alt="UPI QR" className="w-20 h-20 rounded-md border border-slate-300" />
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Dynamic UPI Payment QR</h4>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Printed on invoice/quotation for instant counter payment via PhonePe, GPay, or Paytm.
                      </p>
                      <p className="text-[11px] font-mono text-[#4c3cce] font-semibold mt-1">
                        VPA: {business.upiId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bill Calculation Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
                  </div>

                  {!isInterState ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST:</span>
                        <span className="font-semibold text-slate-800">{formatINR(cgstTotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST:</span>
                        <span className="font-semibold text-slate-800">{formatINR(sgstTotal)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST (Inter-state):</span>
                      <span className="font-semibold text-slate-800">{formatINR(igstTotal)}</span>
                    </div>
                  )}

                  {roundOff !== 0 && (
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Round Off:</span>
                      <span>{roundOff > 0 ? `+${roundOff}` : roundOff}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">Grand Total:</span>
                    <span className="font-black text-xl text-[#4c3cce]">{formatINR(grandTotal)}</span>
                  </div>

                  {invoiceType !== 'QUOTATION' && (
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between text-xs font-semibold">
                      <span className="text-emerald-700">Paid: {formatINR(effectivePaidAmount)}</span>
                      <span className={effectiveBalanceAmount > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                        Balance Due: {formatINR(effectiveBalanceAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="h-16 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">
                  {invoiceType === 'QUOTATION' ? 'Ready to issue commercial quotation' : 'Press Save to confirm tax invoice'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveInvoice}
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 ${
                    invoiceType === 'QUOTATION'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#db631a] hover:bg-[#c45312]'
                  }`}
                >
                  <Sparkles size={16} />
                  <span>
                    {isSubmitting
                      ? 'Saving...'
                      : invoiceType === 'QUOTATION'
                      ? 'Save & Generate Quotation'
                      : 'Save & Generate Bill'}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
