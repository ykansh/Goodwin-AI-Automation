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
    <div className="absolute inset-0 z-50 flex flex-col bg-[#f8faf8] dark:bg-[#121412] h-full w-full animate-fade-in">
      {/* Full Page Top Actions Header (hidden on print) */}
      <header className="no-print shrink-0 h-16 sm:h-[68px] bg-white dark:bg-[#1a1d1a] border-b border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 shadow-xs flex items-center z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5 text-sm font-bold"
            >
              <span>← Back</span>
            </button>
            <div className="h-5 w-px bg-gray-200 dark:bg-[#2d302d]" />
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#00a631]/10 text-[#00a631] uppercase">
                {invoice.invoice_type || 'GST Tax Invoice'}
              </span>
              <span className="text-sm font-black text-gray-800 dark:text-gray-200 font-mono">#{invoice.invoice_number}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="h-10 px-5 bg-[#00a631] hover:bg-[#008a29] text-white text-sm font-extrabold rounded-xl shadow-md shadow-[#00a631]/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* PRINTABLE INVOICE CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-[1200px] mx-auto bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-6 sm:p-10 shadow-xs space-y-6 text-[#3a3b39] dark:text-gray-200" id="printable-invoice">
          {/* Header Banner */}
          <div className="flex justify-between items-start border-b border-gray-200 dark:border-[#2d302d] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[#00a631] text-white font-extrabold text-lg flex items-center justify-center">
                  G
                </div>
                <h1 className="text-xl font-extrabold tracking-wide text-[#3a3b39] dark:text-white">{settings.name}</h1>
              </div>
              <p className="text-xs text-gray-500 max-w-sm">{settings.address}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                GSTIN: <span className="text-[#3a3b39] dark:text-white font-bold">{settings.gstin}</span> | Tel: {settings.phone}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-[#00a631]/10 text-[#00a631] rounded-lg text-xs font-extrabold uppercase mb-2">
                {invoice.invoice_type || 'GST TAX INVOICE'}
              </div>
              <p className="text-sm font-extrabold text-[#3a3b39] dark:text-white">Inv #: {invoice.invoice_number}</p>
              <p className="text-xs text-gray-500">Date: {invoice.date}</p>
              <p className="text-xs font-bold text-[#00a631] mt-1">
                Status: {invoice.status.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Customer & Billing Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/80 dark:bg-[#202420] p-5 rounded-2xl border border-gray-200 dark:border-[#2d302d]">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Billed To</span>
              <p className="text-sm font-extrabold text-[#3a3b39] dark:text-white">{invoice.customer_name}</p>
              {invoice.customer_uoi && (
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">UOI ID: {invoice.customer_uoi}</p>
              )}
              {invoice.customer_gstin && (
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">GSTIN: {invoice.customer_gstin}</p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">Invoice Summary</span>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Taxable Value: <span className="font-bold">₹{invoice.taxable_amount.toLocaleString('en-IN')}</span>
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
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
              <tr className="border-b-2 border-gray-200 dark:border-[#2d302d] text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5">Item & Battery Specification</th>
                <th className="py-2.5">SKU / HSN</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Rate</th>
                <th className="py-2.5 text-right">GST %</th>
                <th className="py-2.5 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2d302d] text-xs font-medium">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-bold text-[#3a3b39] dark:text-gray-200">{item.product_name}</td>
                  <td className="py-3 text-gray-500 font-mono">{item.sku} {item.hsn ? `/ ${item.hsn}` : ''}</td>
                  <td className="py-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-400">{item.gst_percent}%</td>
                  <td className="py-3 text-right font-extrabold text-[#3a3b39] dark:text-white">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Payment Summary */}
          <div className="border-t border-gray-200 dark:border-[#2d302d] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 text-xs">
              <span className="font-extrabold text-[#00a631] block mb-1">Company Bank Details</span>
              <p className="text-gray-700 dark:text-gray-300">Bank: <span className="font-semibold">{settings.bank_details.bank_name}</span></p>
              <p className="text-gray-700 dark:text-gray-300">A/C #: <span className="font-semibold">{settings.bank_details.account_number}</span></p>
              <p className="text-gray-700 dark:text-gray-300">IFSC: <span className="font-semibold">{settings.bank_details.ifsc_code}</span></p>
              <p className="text-gray-700 dark:text-gray-300">Branch: <span className="font-semibold">{settings.bank_details.branch}</span></p>
            </div>

            <div className="text-right space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-[#2d302d]">
                <span className="text-gray-500">Taxable Amount:</span>
                <span className="font-bold">₹{invoice.taxable_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-[#2d302d]">
                <span className="text-gray-500">Total GST:</span>
                <span className="font-bold">₹{invoice.gst_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b-2 border-gray-200 dark:border-[#2d302d] text-sm font-extrabold text-[#3a3b39] dark:text-white">
                <span>Grand Total:</span>
                <span>₹{invoice.grand_total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 text-xs font-bold text-red-600 dark:text-red-400">
                <span>Outstanding Balance:</span>
                <span>₹{invoice.outstanding.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-8 border-t border-gray-200 dark:border-[#2d302d] flex justify-between items-end text-xs">
            <div className="text-gray-400">
              <p>Thank you for choosing Goodwin Batteries!</p>
              <p className="text-[10px]">Subject to Indore Jurisdiction. Computer generated invoice.</p>
            </div>
            <div className="text-center">
              <div className="w-36 h-10 border-b border-gray-400 mb-1" />
              <p className="font-bold text-[#3a3b39] dark:text-white">Authorized Signatory</p>
              <p className="text-[10px] text-gray-500">For Goodwin Batteries & Power Solutions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
