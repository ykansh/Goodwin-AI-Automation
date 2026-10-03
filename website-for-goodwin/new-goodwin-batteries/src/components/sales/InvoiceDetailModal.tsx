'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Download,
  Building,
  CheckCircle,
  QrCode,
  FileText,
  Receipt as ReceiptIcon,
} from 'lucide-react';
import { MockInvoice } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/utils';
import { GST_STATES } from '@/lib/constants';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: MockInvoice | null;
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
}: InvoiceDetailModalProps) {
  const { business } = useApp();
  const [printFormat, setPrintFormat] = useState<'A4' | 'THERMAL'>('A4');

  if (!isOpen || !invoice) return null;

  const isInterState = invoice.partyStateCode !== business.stateCode;
  const stateObj = GST_STATES.find((s) => s.code === invoice.partyStateCode);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = `Hello ${invoice.partyName}, your invoice ${invoice.invoiceNumber} for ${formatINR(
      invoice.totalAmount
    )} from ${business.businessName} is ready. Pay via UPI: ${business.upiId}.`;
    window.open(`https://wa.me/91${invoice.partyPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Modal Top Bar (No Print) */}
        <div className="no-print h-14 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText size={16} className="text-[#4c3cce]" />
              <span>{invoice.invoiceNumber}</span>
            </span>

            {/* Format Toggle */}
            <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
              <button
                onClick={() => setPrintFormat('A4')}
                className={`px-3 py-1 rounded-md transition-all ${
                  printFormat === 'A4'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Standard
              </button>
              <button
                onClick={() => setPrintFormat('THERMAL')}
                className={`px-3 py-1 rounded-md transition-all ${
                  printFormat === 'THERMAL'
                    ? 'bg-white text-[#4c3cce] shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3-Inch Thermal POS
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Share2 size={13} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="h-8 px-3.5 rounded-lg bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Printer size={13} />
              <span>Print {printFormat === 'A4' ? 'Invoice' : 'Receipt'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          {printFormat === 'A4' ? (
            /* A4 Standard Invoice Template */
            <div
              id="printable-invoice"
              className="w-full max-w-[800px] bg-white border border-slate-300 p-8 shadow-sm space-y-6 text-slate-800"
            >
              {/* Header: Company & Tax Invoice Badge */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-5">
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    {business.businessName}
                  </h1>
                  <p className="text-[11px] text-slate-600 max-w-sm mt-0.5">{business.address}, {business.city}, {business.state} - {business.pincode}</p>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    <strong className="text-slate-800">GSTIN:</strong> {business.gstin} | <strong className="text-slate-800">Phone:</strong> {business.phone}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block px-3 py-1 rounded bg-[#4c3cce] text-white font-extrabold text-xs tracking-wider uppercase">
                    Tax Invoice
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm mt-1">
                    #{invoice.invoiceNumber}
                  </p>
                  <p className="text-[11px] text-slate-500">Date: {invoice.invoiceDate}</p>
                  <p className="text-[11px] text-slate-500">Due: {invoice.dueDate}</p>
                </div>
              </div>

              {/* Bill To & Dispatch Details */}
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Billed To (Customer Details)
                  </span>
                  <p className="font-bold text-slate-900 text-sm leading-tight">
                    {invoice.partyName}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    Phone: +91 {invoice.partyPhone}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    GSTIN: {invoice.partyGstin || 'Unregistered Consumer'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Place of Supply
                  </span>
                  <p className="font-bold text-slate-800">
                    {stateObj?.name || 'Maharashtra'} (Code: {invoice.partyStateCode})
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tax Type: {isInterState ? 'IGST (Inter-State)' : 'CGST + SGST (Intra-State)'}
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-300">
                      <th className="py-2 px-3 w-8">#</th>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 w-16 text-center">HSN</th>
                      <th className="py-2 px-3 w-16 text-center">Qty</th>
                      <th className="py-2 px-3 w-20 text-right">Rate (₹)</th>
                      <th className="py-2 px-3 w-16 text-center">GST %</th>
                      <th className="py-2 px-3 w-24 text-right">Taxable</th>
                      <th className="py-2 px-3 w-24 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((line, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{line.name}</td>
                        <td className="py-2.5 px-3 font-mono text-center text-slate-600">
                          {line.hsnCode}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {line.quantity} {line.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {formatINR(line.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{line.taxRate}%</td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {formatINR(line.unitPrice * line.quantity)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatINR(line.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom: Dynamic QR, Terms & Financial Totals */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                {/* Left: Dynamic UPI QR & Bank Info */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                    {invoice.upiQrUrl && (
                      <img
                        src={invoice.upiQrUrl}
                        alt="UPI Payment QR"
                        className="w-20 h-20 rounded border border-slate-300"
                      />
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-[#4c3cce] uppercase block">
                        Instant UPI Payment
                      </span>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Scan with GPay, PhonePe, or Paytm
                      </p>
                      <p className="text-[10px] font-mono font-bold text-slate-800 mt-1">
                        {business.upiId}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-700 uppercase">Terms &amp; Conditions:</p>
                    <p>1. Goods once sold will not be taken back without warranty card.</p>
                    <p>2. Subject to Mumbai Jurisdiction only.</p>
                  </div>
                </div>

                {/* Right: Tax Breakdown & Total */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Amount:</span>
                    <span className="font-semibold text-slate-800">
                      {formatINR(invoice.subtotal)}
                    </span>
                  </div>

                  {!isInterState ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST Total:</span>
                        <span className="font-semibold text-slate-800">
                          {formatINR(invoice.cgstTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST Total:</span>
                        <span className="font-semibold text-slate-800">
                          {formatINR(invoice.sgstTotal)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST Total:</span>
                      <span className="font-semibold text-slate-800">
                        {formatINR(invoice.igstTotal)}
                      </span>
                    </div>
                  )}

                  {invoice.roundOff !== 0 && (
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Round Off:</span>
                      <span>{invoice.roundOff}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">Invoice Total:</span>
                    <span className="font-black text-lg text-[#4c3cce]">
                      {formatINR(invoice.totalAmount)}
                    </span>
                  </div>

                  <div className="pt-1 flex justify-between text-emerald-700 font-semibold text-[11px]">
                    <span>Paid Amount:</span>
                    <span>{formatINR(invoice.paidAmount)}</span>
                  </div>

                  {invoice.balanceAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold text-[11px]">
                      <span>Balance Due:</span>
                      <span>{formatINR(invoice.balanceAmount)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatory Footer */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                <p>Generated via myBillBook GST Cloud</p>
                <div className="text-right">
                  <p className="font-bold text-slate-800 mb-8">For {business.businessName}</p>
                  <p className="border-t border-slate-400 pt-1">Authorized Signatory</p>
                </div>
              </div>
            </div>
          ) : (
            /* 3-Inch Thermal Receipt Template (80mm) */
            <div
              id="printable-invoice"
              className="w-[300px] bg-white border border-slate-400 p-4 shadow-md font-mono text-[11px] text-slate-900 space-y-2"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <p className="font-bold text-sm uppercase">{business.businessName}</p>
                <p className="text-[10px]">{business.address}</p>
                <p className="text-[10px]">GSTIN: {business.gstin}</p>
                <p className="text-[10px]">Tel: {business.phone}</p>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-1 text-[10px]">
                <p>Inv: {invoice.invoiceNumber}</p>
                <p>Date: {invoice.invoiceDate}</p>
                <p>Cust: {invoice.partyName}</p>
                <p>Phone: {invoice.partyPhone}</p>
              </div>

              {/* Item Lines */}
              <div className="border-b border-dashed border-slate-400 pb-1">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th>Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-right">Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((it, i) => (
                      <tr key={i}>
                        <td className="py-0.5 truncate max-w-[120px]">{it.name}</td>
                        <td className="text-center">{it.quantity}</td>
                        <td className="text-right">{formatINR(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-0.5 text-right text-[11px]">
                <p>Taxable: {formatINR(invoice.subtotal)}</p>
                <p>Total Tax: {formatINR(invoice.taxTotal)}</p>
                <p className="font-bold text-xs pt-1 border-t border-slate-300">
                  TOTAL: {formatINR(invoice.totalAmount)}
                </p>
                <p>Paid: {formatINR(invoice.paidAmount)}</p>
                {invoice.balanceAmount > 0 && (
                  <p className="font-bold text-rose-600">Due: {formatINR(invoice.balanceAmount)}</p>
                )}
              </div>

              {/* QR Code */}
              {invoice.upiQrUrl && (
                <div className="flex flex-col items-center pt-2 border-t border-dashed border-slate-400">
                  <img src={invoice.upiQrUrl} alt="UPI" className="w-24 h-24" />
                  <p className="text-[9px] mt-1">UPI: {business.upiId}</p>
                </div>
              )}

              <p className="text-center text-[9px] pt-1">** Thank You, Visit Again! **</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
