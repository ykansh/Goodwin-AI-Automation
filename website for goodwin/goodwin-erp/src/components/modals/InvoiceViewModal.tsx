import type { SalesInvoice } from '../../types';
import { useData } from '../../store/DataContext';
import { Printer, X } from 'lucide-react';

interface InvoiceViewModalProps {
  invoice: SalesInvoice | null;
  onClose: () => void;
}

export function InvoiceViewModal({ invoice, onClose }: InvoiceViewModalProps) {
  const { settings } = useData();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl glass-strong rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-8 animate-scale-in">
        {/* Modal Top Actions Header (hidden on print) */}
        <div className="no-print p-4 bg-white/80 border-b border-gray-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#00a631]/10 text-[#00a631] uppercase">
              {invoice.invoice_type || 'GST Tax Invoice'}
            </span>
            <span className="text-xs font-bold text-gray-500">#{invoice.invoice_number}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00a631] text-white text-xs font-bold rounded-xl shadow hover:bg-[#008a29] transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Invoice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CONTENT */}
        <div className="p-8 bg-white text-[#3a3b39] space-y-6" id="printable-invoice">
          {/* Header Banner */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[#00a631] text-white font-extrabold text-lg flex items-center justify-center">
                  G
                </div>
                <h1 className="text-xl font-extrabold tracking-wide text-[#3a3b39]">{settings.name}</h1>
              </div>
              <p className="text-xs text-gray-500 max-w-sm">{settings.address}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                GSTIN: <span className="text-[#3a3b39] font-bold">{settings.gstin}</span> | Tel: {settings.phone}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-[#00a631]/10 text-[#00a631] rounded-lg text-xs font-extrabold uppercase mb-2">
                {invoice.invoice_type || 'GST TAX INVOICE'}
              </div>
              <p className="text-sm font-extrabold text-[#3a3b39]">Inv #: {invoice.invoice_number}</p>
              <p className="text-xs text-gray-500">Date: {invoice.date}</p>
              <p className="text-xs font-bold text-[#00a631] mt-1">
                Status: {invoice.status.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Customer & Billing Info */}
          <div className="grid grid-cols-2 gap-4 bg-[#f5f4f0] p-4 rounded-2xl border border-gray-200/60">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Billed To</span>
              <p className="text-sm font-extrabold text-[#3a3b39]">{invoice.customer_name}</p>
              {invoice.customer_uoi && (
                <p className="text-xs font-semibold text-gray-600">UOI ID: {invoice.customer_uoi}</p>
              )}
              {invoice.customer_gstin && (
                <p className="text-xs font-semibold text-gray-600">GSTIN: {invoice.customer_gstin}</p>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Invoice Summary</span>
              <p className="text-xs text-gray-600">
                Taxable Value: <span className="font-bold">₹{invoice.taxable_amount.toLocaleString('en-IN')}</span>
              </p>
              <p className="text-xs text-gray-600">
                GST (CGST+SGST): <span className="font-bold">₹{invoice.gst_amount.toLocaleString('en-IN')}</span>
              </p>
              <p className="text-sm font-extrabold text-[#00a631] mt-1">
                Grand Total: ₹{invoice.grand_total.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5">Item & Battery Specification</th>
                <th className="py-2.5">SKU / HSN</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Rate</th>
                <th className="py-2.5 text-right">GST %</th>
                <th className="py-2.5 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-bold text-[#3a3b39]">{item.product_name}</td>
                  <td className="py-3 text-gray-500 font-mono">{item.sku} {item.hsn ? `/ ${item.hsn}` : ''}</td>
                  <td className="py-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right text-gray-600">{item.gst_percent}%</td>
                  <td className="py-3 text-right font-extrabold text-[#3a3b39]">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Payment Summary */}
          <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-xs">
              <span className="font-extrabold text-[#00a631] block mb-1">Company Bank Details</span>
              <p className="text-gray-700">Bank: <span className="font-semibold">{settings.bank_details.bank_name}</span></p>
              <p className="text-gray-700">A/C #: <span className="font-semibold">{settings.bank_details.account_number}</span></p>
              <p className="text-gray-700">IFSC: <span className="font-semibold">{settings.bank_details.ifsc_code}</span></p>
              <p className="text-gray-700">Branch: <span className="font-semibold">{settings.bank_details.branch}</span></p>
            </div>

            <div className="text-right space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Taxable Amount:</span>
                <span className="font-bold">₹{invoice.taxable_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Total GST:</span>
                <span className="font-bold">₹{invoice.gst_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b-2 border-gray-200 text-sm font-extrabold text-[#3a3b39]">
                <span>Grand Total:</span>
                <span>₹{invoice.grand_total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 text-xs font-bold text-red-600">
                <span>Outstanding Balance:</span>
                <span>₹{invoice.outstanding.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-8 border-t border-gray-200 flex justify-between items-end text-xs">
            <div className="text-gray-400">
              <p>Thank you for choosing Goodwin Batteries!</p>
              <p className="text-[10px]">Subject to Indore Jurisdiction. Computer generated invoice.</p>
            </div>
            <div className="text-center">
              <div className="w-36 h-10 border-b border-gray-400 mb-1" />
              <p className="font-bold text-[#3a3b39]">Authorized Signatory</p>
              <p className="text-[10px] text-gray-500">For Goodwin Batteries & Power Solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
