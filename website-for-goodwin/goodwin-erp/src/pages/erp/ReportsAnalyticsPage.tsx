import { useState } from 'react';
import { useInvoices, useProducts, useCustomers } from '../../hooks/queries';
import { calculateCustomerPendingBills } from '../../utils/creditTermsStorage';
import { PendingBillsModal } from '../../components/modals/PendingBillsModal';
import type { Customer } from '../../types';
import { FileSpreadsheet, Layers, Loader2, Clock, Receipt, Calendar } from 'lucide-react';

export function ReportsAnalyticsPage() {
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const isLoading = invoicesLoading || productsLoading || customersLoading;

  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [activeTab, setActiveTab] = useState<'sales' | 'stock' | 'credit'>('sales');
  const [selectedBillsCustomer, setSelectedBillsCustomer] = useState<Customer | null>(null);

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
      {/* Header Banner with timeframe dropdown */}
      <div className="glass-strong p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white tracking-tight">
            Reports &amp; Financial Analytics
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sales register tax auditing &amp; stock valuation ledger report
          </p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'monthly' | 'weekly' | 'daily')}
          className="glass-input px-4 py-2.5 text-sm font-bold cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="daily">Daily</option>
        </select>
      </div>

      {/* Tabs Switcher: Sales Register vs Stock Ledger */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-[#2d302d] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-[#00a631] text-white shadow-md shadow-[#00a631]/30'
              : 'bg-gray-100 dark:bg-[#252825] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#2d302d]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Sales Register Report
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-[#3a3b39] text-[#cde06c] shadow-md shadow-black/20'
              : 'bg-gray-100 dark:bg-[#252825] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#2d302d]'
          }`}
        >
          <Layers className="w-4 h-4" /> Stock Valuation Ledger
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credit')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'credit'
              ? 'bg-[#00a631] text-white shadow-md shadow-[#00a631]/30'
              : 'bg-gray-100 dark:bg-[#252825] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#2d302d]'
          }`}
        >
          <Clock className="w-4 h-4" /> Credit Terms &amp; Payment Report
        </button>
      </div>

      {/* TAB 1: Sales Register */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Total Taxable Amount ({timeframe})</span>
              <p className="text-xl font-extrabold text-[#3a3b39] dark:text-white mt-1">
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

          <div className="glass-strong overflow-hidden">
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Loader2 className="w-8 h-8 text-[#00a631] animate-spin mx-auto" />
                      <p className="mt-2 text-sm font-bold text-gray-500">Loading reports...</p>
                    </td>
                  </tr>
                ) : salesRegister.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 font-bold">
                      No sales data available.
                    </td>
                  </tr>
                ) : (
                  salesRegister.map((row, idx) => (
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
                  ))
                )}
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

          <div className="glass-strong overflow-hidden">
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Loader2 className="w-8 h-8 text-[#00a631] animate-spin mx-auto" />
                      <p className="mt-2 text-sm font-bold text-gray-500">Loading stock ledger...</p>
                    </td>
                  </tr>
                ) : stockLedger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400 font-bold">
                      No stock data available.
                    </td>
                  </tr>
                ) : (
                  stockLedger.map((row, idx) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Credit Terms & Payment Details Report */}
      {activeTab === 'credit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Total Receivables</span>
              <p className="text-xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                ₹{customers.reduce((acc, c) => acc + Number(c.outstanding || 0), 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="glass-card p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Total Approved Credit</span>
              <p className="text-xl font-extrabold text-[#3a3b39] dark:text-white mt-1">
                ₹{customers.reduce((acc, c) => acc + Number(c.credit_limit || 0), 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="glass-card p-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Accounts with Balance</span>
              <p className="text-xl font-extrabold text-amber-600 mt-1">
                {customers.filter((c) => Number(c.outstanding || 0) > 0).length} / {customers.length}
              </p>
            </div>
            <div className="glass-card p-4 bg-emerald-50/50 border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Active Credit Terms</span>
              <p className="text-xl font-extrabold text-[#00a631] mt-1">
                {customers.length} Accounts
              </p>
            </div>
          </div>

          <div className="glass-strong overflow-hidden">
            <table className="data-table text-xs">
              <thead>
                <tr>
                  <th>CUSTOMER NAME</th>
                  <th>FIXED CREDIT TERMS</th>
                  <th>CREDIT LIMIT (₹)</th>
                  <th className="text-right">UNPAID / OUTSTANDING (₹)</th>
                  <th className="text-center">PENDING BILLS</th>
                  <th>PAYMENT COMMITMENT</th>
                  <th>MATERIAL RECEIVED TIME</th>
                  <th>PAYMENT CYCLE</th>
                  <th>ORDER CYCLE</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <Loader2 className="w-8 h-8 text-[#00a631] animate-spin mx-auto" />
                      <p className="mt-2 text-sm font-bold text-gray-500">Loading credit report...</p>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400 font-bold">
                      No customer credit data available.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const pendingBills = calculateCustomerPendingBills(c, invoices);
                    const outstanding = Number(c.outstanding || 0);

                    return (
                      <tr key={c.id}>
                        <td>
                          <div className="font-extrabold text-[#3a3b39] dark:text-white">{c.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{c.uoi}</div>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-[#00a631] border border-[#00a631]/20">
                            {c.fixed_credit_terms || '30 Days Net'}
                          </span>
                        </td>
                        <td className="font-bold text-gray-700 dark:text-gray-300">
                          ₹{Number(c.credit_limit || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="text-right font-black text-sm">
                          <span className={outstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}>
                            ₹{outstanding.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedBillsCustomer(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold text-[11px] cursor-pointer hover:bg-amber-200"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>{pendingBills.length} Bills</span>
                          </button>
                        </td>
                        <td>
                          {c.payment_commitment_date ? (
                            <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {c.payment_commitment_date}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">None</span>
                          )}
                        </td>
                        <td className="text-gray-600 dark:text-gray-300 font-medium">
                          {c.material_received_time || 'Within 3-5 Days'}
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {c.payment_cycle || '15/30 Days'}
                          </span>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {c.order_cycle || 'Weekly'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBillsCustomer && (
        <PendingBillsModal
          customer={selectedBillsCustomer}
          invoices={invoices}
          onClose={() => setSelectedBillsCustomer(null)}
        />
      )}
    </div>
  );
}
