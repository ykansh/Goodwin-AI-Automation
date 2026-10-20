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
  Trash2,
  Sparkles,
  Truck,
  Edit,
  Loader2,
} from 'lucide-react';
import { MockInvoice } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/utils';
import { GST_STATES } from '@/lib/constants';
import { downloadInvoicePdf, shareInvoicePdfWithWhatsApp } from '@/lib/pdfUtils';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: MockInvoice | null;
  onEdit?: (invoice: MockInvoice) => void;
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  onEdit,
}: InvoiceDetailModalProps) {
  const { business, deleteInvoice, convertQuotationToInvoice, isAdmin } = useApp();
  const [printFormat, setPrintFormat] = useState<'A4' | 'THERMAL'>('A4');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatusMessage, setPdfStatusMessage] = useState<string | null>(null);

  if (!isOpen || !invoice) return null;

  const isGB2Invoice =
    invoice.companyCode === 'goodwin-2' ||
    invoice.invoiceNumber.startsWith('GB2') ||
    invoice.taxTotal === 0;
  const isInterState = invoice.partyStateCode !== business.stateCode;
  const stateObj = GST_STATES.find((s) => s.code === invoice.partyStateCode);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfStatusMessage('Generating PDF...');
      await downloadInvoicePdf('printable-invoice', invoice.invoiceNumber);
      setPdfStatusMessage(`PDF downloaded: ${invoice.invoiceNumber}.pdf`);
      setTimeout(() => setPdfStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to generate PDF automatically. You can use Print > Save as PDF.');
      setPdfStatusMessage(null);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppWithPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setPdfStatusMessage('Attaching PDF & preparing WhatsApp message...');
      const result = await shareInvoicePdfWithWhatsApp({
        elementId: 'printable-invoice',
        invoiceNumber: invoice.invoiceNumber,
        partyName: invoice.partyName,
        partyPhone: invoice.partyPhone,
        totalAmount: invoice.totalAmount,
        businessName: business.businessName,
        upiId: business.upiId,
      });

      if (result.sharedVia === 'whatsapp-with-download') {
        setPdfStatusMessage(
          `📄 PDF downloaded! Attach "${invoice.invoiceNumber}.pdf" in the WhatsApp chat that opened.`
        );
        setTimeout(() => setPdfStatusMessage(null), 8000);
      } else {
        setPdfStatusMessage('Shared invoice with attached PDF successfully!');
        setTimeout(() => setPdfStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to share PDF:', err);
      // Fallback: standard WhatsApp
      handleWhatsAppFallback();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleWhatsAppFallback = () => {
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
            {invoice.invoiceType === 'QUOTATION' && (
              <button
                onClick={async () => {
                  if (
                    confirm(
                      `Convert quotation ${invoice.invoiceNumber} to an active Sale Tax Invoice? Stock and Khata will be updated.`
                    )
                  ) {
                    await convertQuotationToInvoice(invoice.id);
                    alert('Quotation converted to Tax Invoice successfully!');
                    onClose();
                  }
                }}
                className="h-8 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Sparkles size={13} />
                <span>Convert to Invoice</span>
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(invoice);
                }}
                className="h-8 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
                title="Edit this invoice"
              >
                <Edit size={13} className="text-amber-600" />
                <span>Edit</span>
              </button>
            )}

            {/* Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="h-8 px-3 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-[#4c3cce] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Download PDF directly to your device"
            >
              {isGeneratingPdf ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>Download PDF</span>
            </button>

            {/* WhatsApp Share with PDF */}
            <button
              onClick={handleWhatsAppWithPdf}
              disabled={isGeneratingPdf}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
              title="Share invoice on WhatsApp with PDF attached"
            >
              {isGeneratingPdf ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
              <span>WhatsApp + PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="h-8 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Printer size={13} />
              <span>
                Print {invoice.invoiceType === 'QUOTATION' ? 'Quotation' : printFormat === 'A4' ? 'Invoice' : 'Receipt'}
              </span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  if (confirm(`Permanently delete invoice ${invoice.invoiceNumber} from Supabase?`)) {
                    deleteInvoice(invoice.id);
                    onClose();
                  }
                }}
                title="Delete from Supabase"
                className="h-8 px-2.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PDF / Share Notification Banner */}
        {pdfStatusMessage && (
          <div className="no-print bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">{pdfStatusMessage}</span>
            </div>
            <button
              onClick={() => setPdfStatusMessage(null)}
              className="p-1 rounded text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Printable Invoice Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          {printFormat === 'A4' ? (
            /* A4 Standard Invoice Template */
            <div
              id="printable-invoice"
              className="w-full max-w-[800px] bg-white border border-slate-300 p-8 shadow-sm space-y-5 text-slate-800"
            >
              {/* Header: Company & Tax Invoice Badge */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-4 gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Company Logo in Both Portals */}
                  <img
                    src="/goodwin-logo.svg"
                    alt="Goodwin Batteries Logo"
                    className="h-14 w-auto max-w-[170px] object-contain shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                      Goodwin Batteries Pvt. Ltd.
                    </h1>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012, Indore, Madhya Pradesh - 452012
                    </p>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5 whitespace-nowrap">
                      <strong className="text-slate-800">GSTIN:</strong> 23AABCG1234F1Z5 |{' '}
                      <strong className="text-slate-800">Phone:</strong> +91 9667724411
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1.5 shrink-0 min-w-[260px] pl-2">
                  <div className="flex justify-end">
                    <span
                      className={`inline-block px-3 py-1 rounded text-white font-extrabold text-xs tracking-wider uppercase ${
                        invoice.invoiceType === 'QUOTATION'
                          ? 'bg-amber-600'
                          : invoice.invoiceType === 'BILL_OF_SUPPLY'
                          ? 'bg-slate-800'
                          : isGB2Invoice
                          ? 'bg-slate-800'
                          : 'bg-[#4c3cce]'
                      }`}
                    >
                      {invoice.invoiceType === 'QUOTATION'
                        ? 'Quotation / Estimate'
                        : invoice.invoiceType === 'BILL_OF_SUPPLY'
                        ? 'Bill of Supply'
                        : isGB2Invoice
                        ? 'Sales Invoice (Without GST)'
                        : 'Tax Invoice'}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-xs pt-0.5">
                    <p className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      Invoice Number: {invoice.invoiceNumber}
                    </p>
                    <p className="text-[11px] text-slate-700 whitespace-nowrap">
                      <strong>Invoice Date:</strong> {invoice.invoiceDate}
                    </p>
                    <p className="text-[11px] text-slate-700 font-mono whitespace-nowrap">
                      <strong>Order Number:</strong> {invoice.orderNumber || '—'}
                    </p>
                    <p className="text-[11px] text-slate-700 whitespace-nowrap">
                      <strong>Order Date:</strong> {invoice.orderDate || invoice.invoiceDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bill To & Dispatch & Transport Details (Matches Image 2 Specification) */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                {/* Column 1: Billed To Details */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1 border-b border-slate-200">
                    Customer &amp; Billing Details
                  </span>
                  <p className="text-[11px] text-slate-800">
                    <strong className="text-slate-900">Customer Name:</strong> {invoice.partyName}
                  </p>
                  <p className="text-[11px] text-slate-800 font-mono">
                    <strong className="text-slate-900">Customer Phone Number:</strong> +91 {invoice.partyPhone}
                  </p>
                  <p className="text-[11px] text-slate-800">
                    <strong className="text-slate-900">Billing Name:</strong> {invoice.billingName || invoice.partyName}
                  </p>
                  <p className="text-[11px] text-slate-800 font-mono">
                    <strong className="text-slate-900">Customer GSTIN:</strong>{' '}
                    <span className="font-bold text-slate-950 px-1 py-0.2 bg-slate-200/70 rounded">
                      {invoice.partyGstin || 'URP / Not Registered'}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-800 leading-snug">
                    <strong className="text-slate-900">Billing Address:</strong> {invoice.billingAddress || '—'}
                  </p>
                  <p className="text-[11px] text-slate-800">
                    <strong className="text-slate-900">State/UT:</strong> {invoice.billingState || stateObj?.name || 'Madhya Pradesh'}
                  </p>
                  <p className="text-[11px] text-slate-800">
                    <strong className="text-slate-900">Place of Supply:</strong> {invoice.placeOfSupply || stateObj?.name || 'MADHYA PRADESH'}
                  </p>
                </div>

                {/* Column 2: Shipped To & Transport Details */}
                <div className="space-y-1.5 border-l border-slate-200 pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1 border-b border-slate-200">
                    Shipping &amp; Transport Logistics
                  </span>
                  <p className="text-[11px] text-slate-800 leading-snug">
                    <strong className="text-slate-900">Shipping Address:</strong> {invoice.shippingAddress || invoice.billingAddress || '—'}
                  </p>
                  <p className="text-[11px] text-slate-800">
                    <strong className="text-slate-900">State/UT:</strong> {invoice.shippingState || invoice.billingState || stateObj?.name || 'Madhya Pradesh'}
                  </p>
                  <p className="text-[11px] text-slate-800">
                    <strong className="text-slate-900">Transport Address:</strong> {invoice.transportAddress || '—'}
                  </p>
                  <p className="text-[11px] text-slate-800 font-mono">
                    <strong className="text-slate-900">Transport Contact Number:</strong> {invoice.transportContactNumber || '—'}
                  </p>
                  <p className="text-[11px] text-slate-800 font-mono">
                    <strong className="text-slate-900">Transport GSTIN:</strong>{' '}
                    <span className="font-bold text-slate-950 px-1 py-0.2 bg-slate-200/70 rounded">
                      {invoice.transportGstin || '—'}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-800">
                    <strong className="text-slate-900">Place of Delivery:</strong> {invoice.placeOfDelivery || 'MADHYA PRADESH'}
                  </p>
                  <p className="text-[11px] text-slate-800">
                    <strong className="text-slate-900">Reference Name:</strong> {invoice.referenceName || '—'}
                  </p>
                  <p className="text-[11px] text-slate-800">
                    <strong className="text-slate-900">Pvt Marka:</strong> {invoice.pvtMarka || '—'}
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
                {/* Left: Dynamic UPI QR & Bank Info (Only for GST invoices) */}
                <div className="space-y-3">
                  {!isGB2Invoice && invoice.upiQrUrl && (
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                      <img
                        src={invoice.upiQrUrl}
                        alt="UPI Payment QR"
                        className="w-20 h-20 rounded border border-slate-300"
                      />
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
                  )}

                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-700 uppercase">Terms &amp; Conditions:</p>
                    <p>1. Goods once sold will not be taken back without warranty card.</p>
                    <p>2. Subject to Indore Jurisdiction only.</p>
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

                  {!isGB2Invoice ? (
                    !isInterState ? (
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
                    )
                  ) : (
                    <div className="flex justify-between text-amber-800 font-semibold text-[11px] bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <span>GST Tax (0%):</span>
                      <span>Without GST Bill</span>
                    </div>
                  )}

                  {invoice.roundOff !== 0 && (
                    <div className="flex justify-between text-slate-500 text-[10px]">
                      <span>Round Off:</span>
                      <span>{invoice.roundOff}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">
                      {invoice.invoiceType === 'QUOTATION' ? 'Quotation Total:' : 'Invoice Total:'}
                    </span>
                    <span className="font-black text-lg text-[#4c3cce]">
                      {formatINR(invoice.totalAmount)}
                    </span>
                  </div>

                  {invoice.invoiceType !== 'QUOTATION' ? (
                    <>
                      <div className="pt-1 flex justify-between text-slate-700 font-semibold text-[11px]">
                        <span>Settlement Status:</span>
                        <span
                          className={`uppercase font-bold px-1.5 py-0.2 rounded ${
                            invoice.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : invoice.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {invoice.paymentStatus === 'PAID'
                            ? `Paid (${invoice.paymentMode || 'UPI'})`
                            : invoice.paymentStatus === 'PARTIAL'
                            ? `Partial (${invoice.paymentMode || 'UPI'})`
                            : 'Unpaid / Khata'}
                        </span>
                      </div>

                      <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                        <span>Amount Paid:</span>
                        <span>{formatINR(invoice.paidAmount)}</span>
                      </div>

                      {invoice.balanceAmount > 0 && (
                        <div className="flex justify-between text-rose-600 font-bold text-[11px]">
                          <span>Balance Due:</span>
                          <span>{formatINR(invoice.balanceAmount)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="pt-1 flex justify-between text-amber-700 font-semibold text-[11px]">
                      <span>Document Status:</span>
                      <span className="uppercase font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                        Estimate / Quotation
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatory Footer */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                <p>Generated via Goodwin Batteries Cloud ERP</p>
                <div className="text-right">
                  <p className="font-bold text-slate-800 mb-8">For Goodwin Batteries Pvt. Ltd.</p>
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
                <img
                  src="/goodwin-logo.svg"
                  alt="Goodwin Batteries"
                  className="h-8 w-auto mx-auto mb-1.5 object-contain"
                />
                <p className="font-bold text-xs uppercase">Goodwin Batteries Pvt. Ltd.</p>
                <p className="text-[9px]">202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012, Indore, Madhya Pradesh - 452012</p>
                <p className="text-[9px]">GSTIN: 23AABCG1234F1Z5 | Phone: +91 9667724411</p>
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

              {/* QR Code (Only for GST invoices) */}
              {!isGB2Invoice && invoice.upiQrUrl && (
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
