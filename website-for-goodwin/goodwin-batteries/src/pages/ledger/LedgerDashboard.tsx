import { useState } from 'react';
import { useData } from '../../store/DataContext';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  BookOpen, Wallet, Building2, ArrowDownLeft, ArrowUpRight,
  ShoppingBag, Package, Plus
} from 'lucide-react';
import { NewPaymentInModal } from '../../components/modals/NewPaymentInModal';
import { NewPaymentOutModal } from '../../components/modals/NewPaymentOutModal';

export function LedgerDashboard() {
  const { invoices, products, customers, suppliers, cashBalance, bankBalance } = useData();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const [showPaymentInModal, setShowPaymentInModal] = useState(false);
  const [showPaymentOutModal, setShowPaymentOutModal] = useState(false);

  // ── Financials ──────────────────────────────────────────────────────
  const totalReceivables = customers.reduce((acc, c) => acc + (c.outstanding || 0), 0);
  const totalPayables = suppliers.reduce((acc, s) => acc + (s.outstanding || 0), 0);

  // ── Top 3 Recent Orders ─────────────────────────────────────────────
  const recentOrders = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // ── Top 3 Selling Products ──────────────────────────────────────────
  const productSalesMap: Record<string, { name: string; sku: string; qty: number; totalVal: number }> = {};
  invoices.forEach((inv) =>
    inv.items.forEach((item) => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = { name: item.product_name, sku: item.sku, qty: 0, totalVal: 0 };
      }
      productSalesMap[item.product_id].qty += item.quantity;
      productSalesMap[item.product_id].totalVal += item.amount;
    })
  );
  const topSelling = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 3);

  // ── Pie Chart Data ──────────────────────────────────────────────────
  const stockByVoltage: Record<string, number> = {};
  products.forEach((p) => {
    const key = `${p.voltage || '12V'} (${p.category ?? 'Auto'})`;
    stockByVoltage[key] = (stockByVoltage[key] ?? 0) + (p.stock || 0);
  });
  const pieData = Object.entries(stockByVoltage).map(([name, value]) => ({ name, value }));
  const COLORS = ['#00a631', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#6b7280'];

  // ── 4 Main Financial KPI Cards ──────────────────────────────────────
  const financialCards = [
    {
      label: 'Cash in Hand',
      value: `₹${cashBalance.toLocaleString('en-IN')}`,
      sub: 'Physical cash available',
      subColor: 'text-[#00a631] dark:text-emerald-400',
      valueColor: 'text-[#00a631] dark:text-emerald-400',
      icon: <Wallet className="w-5 h-5" />,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Bank Balance',
      value: `₹${bankBalance.toLocaleString('en-IN')}`,
      sub: 'HDFC Current A/c',
      subColor: 'text-gray-500 dark:text-gray-400',
      valueColor: 'text-[#3a3b39] dark:text-white',
      icon: <Building2 className="w-5 h-5" />,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Party Receivables',
      value: `₹${totalReceivables.toLocaleString('en-IN')}`,
      sub: `From ${customers.length} registered parties`,
      subColor: 'text-[#00a631] dark:text-emerald-400',
      valueColor: 'text-[#00a631] dark:text-emerald-400',
      icon: <ArrowDownLeft className="w-5 h-5" />,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      subIcon: <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      label: 'Supplier Payables',
      value: `₹${totalPayables.toLocaleString('en-IN')}`,
      sub: `Due to ${suppliers.length} vendors`,
      subColor: 'text-gray-500 dark:text-gray-400',
      valueColor: 'text-red-600 dark:text-red-400',
      icon: <ArrowUpRight className="w-5 h-5" />,
      iconBg: 'bg-red-500/10 text-red-500 dark:text-red-400',
      subIcon: <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* ── SECTION 1: Banner Header + Timeframe ──────────────────────── */}
      <div className="glass-strong p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-[#2d302d] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3a3b39] dark:bg-[#252825] text-[#cde06c] flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#3a3b39] dark:text-white tracking-tight">
                Ledger-Pro Financial Dashboard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                Party balances · Cash flow · Sales orders · Battery stock overview
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe selector + Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#202420] border border-gray-200 dark:border-[#2d302d] rounded-2xl">
            {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white dark:bg-[#2c302c] text-[#3a3b39] dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowPaymentInModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Payment In</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPaymentOutModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#252825] dark:hover:bg-[#2d302d] text-[#3a3b39] dark:text-gray-200 text-xs font-bold rounded-xl border border-gray-200 dark:border-[#2d302d] transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Payment Out</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 2: 4 Financial KPI Cards (Clean Asymmetrical 3-Row Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {financialCards.map((card, i) => (
          <div
            key={i}
            className="glass-card card-padded p-6 rounded-2xl sm:rounded-3xl border border-gray-200/90 dark:border-[#2d302d] flex flex-col justify-between min-h-[160px] overflow-hidden hover:shadow-md transition-all"
          >
            {/* Row 1: Label + Icon */}
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-normal">
                {card.label}
              </span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>

            {/* Row 2: Primary Value */}
            <div className={`text-2xl sm:text-3xl font-black tracking-tight leading-none truncate my-3 ${card.valueColor}`}>
              {card.value}
            </div>

            {/* Row 3: Subtitle */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold leading-normal ${card.subColor}`}>
              {card.subIcon}
              <span>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION 3: Pie Chart + Lists (Shifted Downwards for Spacing) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-start mt-6 sm:mt-8 pt-2">
        {/* LEFT: Pie Chart Card */}
        <div className="glass-strong p-8 sm:p-10 pt-10 sm:pt-12 rounded-3xl border border-gray-200 dark:border-[#2d302d] shadow-sm flex flex-col items-center text-center min-h-[480px]">
          <div className="w-full pb-6 border-b border-gray-100 dark:border-[#2d302d] space-y-1">
            <h2 className="text-sm sm:text-base font-bold text-[#3a3b39] dark:text-white">
              Stock Distribution by Voltage Class
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-normal">
              Inventory breakdown across automotive, tubular & VRLA
            </p>
          </div>

          <div className="flex-1 w-full min-h-[320px] mt-8 flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-gray-400 font-semibold py-12">No inventory stock records available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f221f',
                      borderRadius: '0.75rem',
                      border: '1px solid #374137',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      padding: '8px 12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      paddingTop: '16px',
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RIGHT: Recent Orders + Top Selling */}
        <div className="space-y-8">
          {/* Recent Invoices Card */}
          <div className="glass-strong p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-[#2d302d] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2d302d]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#3a3b39] dark:text-white">
                  Recent Orders (Top 3)
                </h2>
              </div>
              <span className="text-xs text-gray-400 font-normal">Total: {invoices.length}</span>
            </div>

            <div className="space-y-3 pt-1">
              {recentOrders.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center font-normal">No orders logged yet.</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-gray-50/80 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl flex items-center justify-between gap-4 hover:shadow-xs transition-all"
                  >
                    <div className="min-w-0 space-y-0.5 text-left">
                      <span className="font-mono text-xs font-bold text-[#3a3b39] dark:text-white block">
                        {order.invoice_number}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-normal block truncate">
                        {order.customer_name}
                      </span>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <span className="text-xs sm:text-sm font-bold text-[#00a631] dark:text-emerald-400 block font-mono">
                        ₹{order.grand_total.toLocaleString('en-IN')}.00
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal block">{order.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Selling Products Card */}
          <div className="glass-strong p-8 sm:p-10 rounded-3xl border border-gray-200 dark:border-[#2d302d] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2d302d]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#3a3b39] dark:text-white">
                  Top Selling by Quantity (Top 3)
                </h2>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {topSelling.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center font-normal">No sales product data yet.</p>
              ) : (
                topSelling.map((prod, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50/80 dark:bg-[#202420] border border-gray-200/70 dark:border-[#2d302d] rounded-2xl flex items-center justify-between gap-4 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 text-left">
                      <span className="w-7 h-7 rounded-lg bg-[#3a3b39] dark:bg-gray-700 text-[#cde06c] text-xs font-bold flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#3a3b39] dark:text-white block truncate">
                          {prod.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono block truncate">
                          SKU: {prod.sku}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#00a631]/10 text-[#00a631] dark:text-emerald-400 whitespace-nowrap shrink-0">
                      {prod.qty} pcs
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPaymentInModal && <NewPaymentInModal onClose={() => setShowPaymentInModal(false)} />}
      {showPaymentOutModal && <NewPaymentOutModal onClose={() => setShowPaymentOutModal(false)} />}
    </div>
  );
}
