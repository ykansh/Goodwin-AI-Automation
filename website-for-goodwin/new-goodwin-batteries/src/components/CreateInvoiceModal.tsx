'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  MockItem,
  MockParty,
  MockInvoice,
} from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { formatINR, calculateGST } from '@/lib/utils';
import { GST_STATES, GST_RATES } from '@/lib/constants';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated?: (invoice: MockInvoice) => void;
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
}: CreateInvoiceModalProps) {
  const { items, parties, business, addInvoice } = useApp();
  const defaultParty = parties[0] || null;
  const defaultItem = items[0] || null;

  const [selectedParty, setSelectedParty] = useState<MockParty | null>(defaultParty);
  const [customerName, setCustomerName] = useState(defaultParty?.name || '');
  const [customerPhone, setCustomerPhone] = useState(defaultParty?.phone || '');
  const [customerGstin, setCustomerGstin] = useState(defaultParty?.gstin || '');
  const [placeOfSupply, setPlaceOfSupply] = useState(defaultParty?.stateCode || '27');
  const [invoiceType, setInvoiceType] = useState<'TAX_INVOICE' | 'BILL_OF_SUPPLY'>('TAX_INVOICE');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  // Line items state
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

  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<MockInvoice | null>(null);

  // Determine if Inter-state
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

  // Generate UPI QR Code whenever grandTotal changes
  useEffect(() => {
    if (grandTotal > 0 && business.upiId) {
      const upiUrl = `upi://pay?pa=${business.upiId}&pn=${encodeURIComponent(
        business.businessName
      )}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('Bill Payment')}`;
      QRCode.toDataURL(upiUrl, { width: 140, margin: 1 })
        .then((url) => setUpiQrDataUrl(url))
        .catch(console.error);
    }
  }, [grandTotal, business]);

  const handleSaveInvoice = () => {
    const invNumber = `${business.invoicePrefix}${business.currentInvoiceNumber + 1}`;
    const newInvoice: MockInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      invoiceType,
      partyName: customerName || 'Cash Sale',
      partyPhone: customerPhone,
      partyGstin: customerGstin,
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
      paidAmount: paidAmount > 0 ? paidAmount : grandTotal,
      balanceAmount: Math.max(0, grandTotal - (paidAmount > 0 ? paidAmount : grandTotal)),
      paymentStatus:
        paidAmount >= grandTotal ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'PAID',
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

    setCreatedInvoice(newInvoice);
    setIsSuccess(true);
    if (onInvoiceCreated) {
      onInvoiceCreated(newInvoice);
    } else {
      addInvoice(newInvoice);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Success View */}
        {isSuccess && createdInvoice ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Invoice Generated in &lt; 5s!
            </h2>
            <p className="text-slate-600 text-sm max-w-md">
              Invoice <span className="font-semibold text-slate-900">{createdInvoice.invoiceNumber}</span> for{' '}
              <span className="font-bold text-[#4c3cce]">{formatINR(createdInvoice.totalAmount)}</span> has been saved and inventory deducted.
            </p>

            {/* Dynamic UPI QR Code Preview */}
            {upiQrDataUrl && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center">
                <img src={upiQrDataUrl} alt="UPI QR" className="w-32 h-32 rounded-lg" />
                <p className="text-[11px] font-mono text-slate-500 mt-2">
                  Scan to Pay: {business.upiId}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2"
              >
                <Printer size={16} />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => {
                  const text = `Dear ${createdInvoice.partyName}, your invoice ${createdInvoice.invoiceNumber} for ${formatINR(createdInvoice.totalAmount)} is ready. Pay using UPI: ${business.upiId}`;
                  window.open(`https://wa.me/91${createdInvoice.partyPhone}?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2"
              >
                <Share2 size={16} />
                <span>Share on WhatsApp</span>
              </button>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Billing Form */
          <>
            {/* Modal Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4c3cce] text-white flex items-center justify-center font-bold text-sm">
                  <ScanBarcode size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-800 text-base">Create Sale Bill</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      8-Sec Speed Mode
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">GST-compliant tax invoice &amp; instant stock adjustment</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer & Invoice Meta Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {/* Customer Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Party Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={customerGstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCustomerGstin(val);
                      if (val.length >= 2) {
                        const code = val.slice(0, 2);
                        setPlaceOfSupply(code);
                      }
                    }}
                    placeholder="e.g. 27ABCDE1234F1Z5"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#4c3cce]"
                  />
                </div>

                {/* Place of Supply */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Place of Supply {isInterState ? '(IGST Applicable)' : '(CGST+SGST)'}
                  </label>
                  <select
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                  >
                    {GST_STATES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.code} - {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <span>Items &amp; Products</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-[#4c3cce] font-semibold">
                      Barcode scanning supported
                    </span>
                  </h3>
                  <button
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
                        <th className="py-2.5 px-3">Item / Service</th>
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

              {/* Bottom Summary & Tax Breakdown */}
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
                        Will be printed directly on the invoice for instant counter payment via PhonePe, GPay, or Paytm.
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
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="h-16 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Press `F2` or click to save</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInvoice}
                  className="px-6 py-2.5 rounded-xl bg-[#db631a] hover:bg-[#c45312] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                >
                  <Sparkles size={16} />
                  <span>Save &amp; Generate Bill</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
