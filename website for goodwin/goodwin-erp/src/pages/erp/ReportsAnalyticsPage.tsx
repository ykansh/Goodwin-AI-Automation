import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { FileSpreadsheet, Layers } from 'lucide-react';

export function ReportsAnalyticsPage() {
  const { invoices, products } = useData();

  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [activeTab, setActiveTab] = useState<'sales' | 'stock'>('sales');

  // Sales Register Data
  const salesRegister = invoices.map((inv) => ({
    date: inv.date,
    invoice_number: inv.invoice_number,
    customer: inv.customer_name,
    taxable: inv.taxable_amount,
    gst: inv.gst_amount,
    total_amount: inv.grand_total,
  }));

  // Stock Ledger Data
  const stockLedger = products.map((prod) => ({
    product_name: prod.name,
    sku: prod.sku,
    stock: prod.stock,
    purchase_price: prod.purchase_price,
    valuation: prod.stock * prod.purchase_price,
  }));

  const totalSalesTaxable = salesRegister.reduce((acc, curr) => acc + curr.taxable, 0);
  const totalSalesGst = salesRegister.reduce((acc, curr) => acc + curr.gst, 0);
  const totalSalesAmount = salesRegister.reduce((acc, curr) => acc + curr.total_amount, 0);

  const totalStockValuation = stockLedger.reduce((acc, curr) => acc + curr.valuation, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner & Timeframe Switch (Monthly, Weekly, Daily) */}
      <div className="glass-strong p-6 rounded-3xl border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] tracking-tight">
            Reports & Financial Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sales register tax auditing & stock valuation ledger report
          </p>
        </div>

        {/* Timeframe Switcher Options */}
        <div className="flex items-center bg-[#3a3b39]/5 p-1 rounded-2xl border border-white/60">
          {(['monthly', 'weekly', 'daily'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#00a631] text-white shadow-md shadow-[#00a631]/30 font-extrabold'
                  : 'text-gray-600 hover:text-[#3a3b39]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Switcher: Sales Register vs Stock Ledger */}
      <div className="flex items-center gap-2 border-b border-gray-200/60 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-[#00a631] text-white shadow-md shadow-[#00a631]/30'
              : 'glass text-gray-700 hover:bg-white/80'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Sales Register Report
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-[#3a3b39] text-[#cde06c] shadow-md shadow-black/20'
              : 'glass text-gray-700 hover:bg-white/80'
          }`}
        >
          <Layers className="w-4 h-4" /> Stock Valuation Ledger
        </button>
      </div>

      {/* TAB 1: Sales Register */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Total Taxable Amount ({timeframe})</span>
              <p className="text-xl font-extrabold text-[#3a3b39] mt-1">
                ₹{totalSalesTaxable.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="glass-card p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase">GST Tax Collection ({timeframe})</span>
              <p className="text-xl font-extrabold text-[#00a631] mt-1">
                ₹{totalSalesGst.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="glass-card p-4 bg-emerald-50/50 border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Total Invoice Turn-Over</span>
              <p className="text-xl font-extrabold text-[#00a631] mt-1">
                ₹{totalSalesAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="glass-strong rounded-3xl border border-white/60 overflow-hidden shadow-sm">
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>INVOICE #</th>
                  <th>CUSTOMER</th>
                  <th className="text-right">TAXABLE (₹)</th>
                  <th className="text-right">GST (₹)</th>
                  <th className="text-right">TOTAL AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                {salesRegister.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-gray-600">{row.date}</td>
                    <td className="font-mono font-extrabold text-[#00a631]">{row.invoice_number}</td>
                    <td className="font-extrabold text-[#3a3b39]">{row.customer}</td>
                    <td className="text-right font-bold text-gray-700">
                      ₹{row.taxable.toLocaleString('en-IN')}
                    </td>
                    <td className="text-right font-bold text-gray-700">
                      ₹{row.gst.toLocaleString('en-IN')}
                    </td>
                    <td className="text-right font-extrabold text-[#00a631]">
                      ₹{row.total_amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Stock Ledger */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="glass-card p-4 max-w-sm">
            <span className="text-[10px] font-bold text-gray-500 uppercase">Total Inventory Valuation</span>
            <p className="text-xl font-extrabold text-[#00a631] mt-1">
              ₹{totalStockValuation.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="glass-strong rounded-3xl border border-white/60 overflow-hidden shadow-sm">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PRODUCT NAME</th>
                  <th>SKU</th>
                  <th className="text-center">STOCK QTY</th>
                  <th className="text-right">PURCHASE PRICE (₹)</th>
                  <th className="text-right">TOTAL VALUATION (₹)</th>
                </tr>
              </thead>
              <tbody>
                {stockLedger.map((row, idx) => (
                  <tr key={idx}>
                    <td className="font-extrabold text-[#3a3b39]">{row.product_name}</td>
                    <td className="font-mono text-xs font-bold text-gray-600">{row.sku}</td>
                    <td className="text-center font-extrabold text-sm">{row.stock}</td>
                    <td className="text-right font-semibold text-gray-700">
                      ₹{row.purchase_price.toLocaleString('en-IN')}
                    </td>
                    <td className="text-right font-extrabold text-[#00a631]">
                      ₹{row.valuation.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
