import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SalesInvoice } from '../../types';
import { useSettings, useCustomers } from '../../hooks/queries';
import { useUpdateSalesInvoice } from '../../hooks/mutations';
import { Printer, X } from 'lucide-react';
import logo from '../../assets/logo.png';

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const numStr = num.toString();
  if (numStr.length > 9) return 'Overflow';
  const n = ('000000000' + numStr).substring(numStr.length > 9 ? numStr.length - 9 : 0).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != '00') ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + ' Crore ' : '';
  str += (n[2] != '00') ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + ' Lakh ' : '';
  str += (n[3] != '00') ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + ' Thousand ' : '';
  str += (n[4] != '0') ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + ' Hundred ' : '';
  str += (n[5] != '00') ? (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
  return str.trim();
}

interface InvoiceViewModalProps {
  invoice: SalesInvoice | null;
  onClose: () => void;
}

export function InvoiceViewModal({ invoice, onClose }: InvoiceViewModalProps) {
  const { data: settings } = useSettings();
  const { data: customers = [] } = useCustomers();
  const customer = customers.find(c => c.id === invoice?.customer_id);
  const updateInvoice = useUpdateSalesInvoice();

  const handleConvertToInvoice = () => {
    if (!invoice) return;
    updateInvoice.mutate({
      id: invoice.id,
      data: {
        lifecycle_status: 'Confirmed',
        invoice_type: 'GST Tax Invoice',
      }
    });
    onClose();
  };

  const handleUpdateLifecycle = (status: string) => {
    if (!invoice) return;
    updateInvoice.mutate({
      id: invoice.id,
      data: {
        lifecycle_status: status,
      }
    });
    onClose();
  };

  const handleUpdatePaymentStatus = (paymentStatus: string) => {
    if (!invoice) return;
    updateInvoice.mutate({
      id: invoice.id,
      data: {
        payment_status: paymentStatus,
        status: paymentStatus === 'Paid' ? 'paid' : paymentStatus === 'Partially Paid' ? 'partial' : 'pending',
      }
    });
    onClose();
  };

  useEffect(() => {
    if (!invoice) return;
    document.body.classList.add('invoice-modal-open');
    return () => {
      document.body.classList.remove('invoice-modal-open');
    };
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) return null;

  return createPortal(
    <div id="invoice-modal-portal" className="fixed inset-0 z-50 flex flex-col bg-[#f8faf8] dark:bg-[#121412] h-full w-full animate-fade-in">
      {/* Full Page Top Actions Header (hidden on print) */}
      <header className="no-print shrink-0 h-16 sm:h-[68px] bg-white dark:bg-[#1a1d1a] border-b border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 shadow-xs flex items-center z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5 text-sm font-bold"
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
            {invoice.lifecycle_status === 'Quotation' && (
              <button
                type="button"
                onClick={handleConvertToInvoice}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold rounded-md shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-95 mr-2"
              >
                Convert to Confirmed Invoice
              </button>
            )}
            {invoice.lifecycle_status === 'Confirmed' && (
              <button
                type="button"
                onClick={() => handleUpdateLifecycle('Dispatched')}
                className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-extrabold rounded-md shadow-md transition-all cursor-pointer mr-1"
              >
                Mark Dispatched
              </button>
            )}
            {invoice.lifecycle_status === 'Dispatched' && (
              <button
                type="button"
                onClick={() => handleUpdateLifecycle('Delivered')}
                className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold rounded-md shadow-md transition-all cursor-pointer mr-1"
              >
                Mark Delivered
              </button>
            )}
            {(invoice.lifecycle_status !== 'Cancelled' && invoice.lifecycle_status !== 'Delivered') && (
              <button
                type="button"
                onClick={() => handleUpdateLifecycle('Cancelled')}
                className="h-10 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-extrabold rounded-md shadow-md transition-all cursor-pointer mr-2"
              >
                Cancel Order
              </button>
            )}
            
            <div className="h-5 w-px bg-gray-200 dark:bg-[#2d302d] mx-1" />

            {invoice.payment_status !== 'Paid' ? (
              <button
                type="button"
                onClick={() => handleUpdatePaymentStatus('Paid')}
                className="h-10 px-4 bg-[#00a631] hover:bg-[#008a29] text-white text-sm font-extrabold rounded-md shadow-md transition-all cursor-pointer mr-2"
              >
                Mark as Paid
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleUpdatePaymentStatus('Unpaid')}
                className="h-10 px-4 bg-gray-500 hover:bg-gray-600 text-white text-sm font-extrabold rounded-md shadow-md transition-all cursor-pointer mr-2"
              >
                Mark as Unpaid
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="h-10 px-5 bg-[#00a631] hover:bg-[#008a29] text-white text-sm font-extrabold rounded-md shadow-md shadow-[#00a631]/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* PRINTABLE INVOICE CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gray-200 invoice-print-wrapper">
        <div className="max-w-[850px] mx-auto bg-white p-6 sm:p-10 shadow-sm text-black font-sans text-[12px] border border-gray-200" id="printable-invoice">
          {/* Header Flex */}
          <div className="flex justify-between items-start mb-6">
            {/* Left Logo / Sold By */}
            <div className="w-1/2 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={logo} alt="Goodwin Logo" className="h-20 w-auto max-w-[240px] object-contain" />
              </div>
              <div className="mt-4 leading-snug">
                <p className="font-bold text-[13px]">Sold By :</p>
                <p className="font-bold uppercase text-[13px]">{settings?.company_name || settings?.name || 'GOODWIN BATTERIES PVT. LTD.'}</p>
                <p className="mt-1 text-[11px] text-gray-800 break-words leading-relaxed">
                  {settings?.address || '202, 2nd Floor – Samiksh Landmark, Near Choithram Circle, A.B. Road, Indore – 452012'}
                </p>
                {settings?.gstin && (
                  <p className="text-[11px] text-gray-800 font-mono mt-0.5">GSTIN: {settings.gstin}</p>
                )}
              </div>
            </div>

            {/* Right Details */}
            <div className="w-1/2 pl-4">
              <div className="text-right mb-4">
                <p className="font-bold text-[14px]">Invoice/Bill of Supply/Cash Memo</p>
                <p className="font-semibold text-[12px] text-gray-700">(Original for Recipient)</p>
              </div>
              
              <div className="grid grid-cols-[130px_1fr] gap-x-2 gap-y-0.5 leading-snug text-[11px]">
                <div className="font-bold">Order Number:</div><div></div>
                <div className="font-bold">Order Date:</div><div>{invoice.date}</div>
                <div className="font-bold">Invoice Date:</div><div>{invoice.date}</div>
                <div className="font-bold">Invoice Number :</div><div className="font-mono font-bold">{invoice.invoice_number}</div>
                <div className="font-bold">Customer Name:</div><div className="break-words font-medium">{customer?.name || invoice.customer_name}</div>
                <div className="font-bold">Customer Phone Number:</div><div className="break-words">{customer?.contact || ''}</div>
                <div className="font-bold">Billing Name:</div><div className="break-words font-medium">{invoice.customer_name}</div>
                <div className="font-bold">Billing Address :</div><div className="break-words">{customer?.address || ''}</div>
                <div className="font-bold">State/UT:</div><div>{invoice.billing_state_ut}</div>
                <div className="font-bold">Shipping Address:</div><div className="break-words">{customer?.address || ''}</div>
                <div className="font-bold">State/UT:</div><div>{invoice.shipping_state_ut}</div>
                <div className="font-bold">Transport Address:</div><div className="break-words">{invoice.transport_address}</div>
                <div className="font-bold">Transport Contact Number:</div><div>{invoice.transport_contact_number}</div>
                <div className="font-bold">Place of Supply:</div><div>{invoice.place_of_supply || 'Madhya Pradesh'}</div>
                <div className="font-bold">Place of Delivery:</div><div>{invoice.place_of_delivery}</div>
                <div className="font-bold">Reference Name:</div><div>{invoice.reference_name}</div>
                <div className="font-bold">Pvt Marka:</div><div>{invoice.pvt_marka}</div>
                <div className="font-bold">Customer GSTIN:</div><div className="break-all font-mono">{invoice.customer_gstin || customer?.gstin || ''}</div>
                <div className="font-bold">Transport GSTIN:</div><div className="break-all font-mono">{invoice.transport_gstin}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-center border-collapse border border-black mb-4">
            <thead>
              <tr className="bg-gray-50 print:bg-transparent">
                <th className="py-2 px-2 border border-black font-bold">Model No.</th>
                <th className="py-2 px-2 border border-black font-bold w-24">Warranty<br/>(in<br/>months)</th>
                <th className="py-2 px-2 border border-black font-bold w-20">Quantity</th>
                <th className="py-2 px-2 border border-black font-bold w-28">Unit Price (₹)</th>
                <th className="py-2 px-2 border border-black font-bold w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-1.5 px-2 border border-black text-left">{item.sku || item.product_name}</td>
                  <td className="py-1.5 px-2 border border-black">{item.warranty_months || 18}</td>
                  <td className="py-1.5 px-2 border border-black">{item.quantity}</td>
                  <td className="py-1.5 px-2 border border-black text-right">₹{Number(item.rate).toFixed(2)}</td>
                  <td className="py-1.5 px-2 border border-black text-right font-medium">₹{Number(item.amount).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-1.5 px-2 border border-black font-bold text-center" colSpan={2}>Total Quantity</td>
                <td className="py-1.5 px-2 border border-black font-bold text-center">{invoice.items.reduce((acc, curr) => acc + curr.quantity, 0)}</td>
                <td className="py-1.5 px-2 border border-black font-bold text-right">Taxable Amount:</td>
                <td className="py-1.5 px-2 border border-black font-bold text-right">₹{invoice.taxable_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 border border-black font-bold text-right" colSpan={4}>Total GST:</td>
                <td className="py-1.5 px-2 border border-black font-bold text-right">₹{invoice.gst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 border border-black font-bold text-right" colSpan={4}>Grand Total:</td>
                <td className="py-1.5 px-2 border border-black font-bold text-right">₹{invoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          {/* Footer sections */}
          <div className="border border-black p-3 min-h-[120px] flex flex-col justify-between avoid-break">
            <div>
              <p className="font-bold mb-1 text-[13px]">Amount in Words:</p>
              <p className="font-semibold text-[13px]">{numberToWords(Math.round(invoice.grand_total))} Only.</p>
            </div>

            <div className="self-end text-right mt-6">
              <p className="font-bold mb-8 text-[13px]">For GOODWIN BATTERIES</p>
              <p className="font-bold text-[13px]">Authorized Signatory</p>
            </div>
          </div>
          
          <p className="font-bold mt-3 text-[12px] avoid-break">Note: Freight Extra (May Vary according to Transport)</p>
        </div>
      </div>
    </div>,
    document.body
  );
}
