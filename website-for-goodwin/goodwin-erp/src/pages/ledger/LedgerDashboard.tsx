import { useState } from 'react';
import { useData } from '../../store/DataContext';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  BookOpen, Wallet, Building, ArrowDownLeft, ArrowUpRight, ShoppingBag, Package
} from 'lucide-react';

// ─── 8px Grid Token Reference ──────────────────────────────────────────
//  8px  = 0.5rem  = gap-2  / p-2
// 16px  = 1rem    = gap-4  / p-4   (minimum card/button padding)
// 24px  = 1.5rem  = gap-6  / p-6
// 32px  = 2rem    = gap-8  / p-8
// ─────────────────────────────────────────────────────────────────────

export function LedgerDashboard() {
  const { invoices, products, customers, suppliers, cashBalance, bankBalance } = useData();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // ── Financials ──────────────────────────────────────────────────────
  const totalReceivables = customers.reduce((acc, c) => acc + c.outstanding, 0);
  const totalPayables    = suppliers.reduce((acc, s) => acc + s.outstanding, 0);

  // ── Top 3 Recent Orders ─────────────────────────────────────────────
  const recentOrders = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // ── Top 3 Selling Products ──────────────────────────────────────────
  const productSalesMap: Record<string, { name: string; sku: string; qty: number }> = {};
  invoices.forEach((inv) =>
    inv.items.forEach((item) => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = { name: item.product_name, sku: item.sku, qty: 0 };
      }
      productSalesMap[item.product_id].qty += item.quantity;
    })
  );
  const topSelling = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 3);

  // ── Pie Chart Data ──────────────────────────────────────────────────
  const stockByVoltage: Record<string, number> = {};
  products.forEach((p) => {
    const key = `${p.voltage} (${p.category ?? 'Auto'})`;
    stockByVoltage[key] = (stockByVoltage[key] ?? 0) + p.stock;
  });
  const pieData = Object.entries(stockByVoltage).map(([name, value]) => ({ name, value }));
  const COLORS  = ['#00a631', '#3a3b39', '#cde06c', '#008a29', '#6b7280'];

  // ── Gauge Cards ─────────────────────────────────────────────────────
  const gaugeCards = [
    {
      label: 'Cash in Hand',
      value: `₹${cashBalance.toLocaleString('en-IN')}`,
      valueColor: 'text-[#00a631]',
      icon: <Wallet className="w-5 h-5" />,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Bank Balance',
      value: `₹${bankBalance.toLocaleString('en-IN')}`,
      valueColor: 'text-[#3a3b39] dark:text-white',
      icon: <Building className="w-5 h-5" />,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Party Receivables',
      value: `₹${totalReceivables.toLocaleString('en-IN')}`,
      valueColor: 'text-emerald-700 dark:text-emerald-400',
      icon: <ArrowDownLeft className="w-5 h-5" />,
      iconBg: 'bg-[#00a631]/10 text-[#00a631]',
    },
    {
      label: 'Supplier Payables',
      value: `₹${totalPayables.toLocaleString('en-IN')}`,
      valueColor: 'text-red-600 dark:text-red-400',
      icon: <ArrowUpRight className="w-5 h-5" />,
      iconBg: 'bg-red-500/10 text-red-500 dark:text-red-400',
    },
  ];

  return (
    /* Root — space-y-8 = 32px between major sections (8px × 4) */
    <div className="space-y-8 animate-fade-in">

      {/* ── SECTION 1: Banner + Timeframe ─────────────────────────── */}
      <div className="glass-strong rounded-3xl border border-gray-200 dark:border-[#2d302d] shadow-sm
                      flex flex-col sm:flex-row sm:items-center justify-between
                      gap-6 p-6 sm:p-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[#3a3b39] dark:text-[#cde06c] shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black text-[#3a3b39] dark:text-white tracking-tight leading-tight">
              Ledger-Pro Financial Dashboard
            </h1>
          </div>
          {/* Subtitle — leading-relaxed ≥ 1.5× */}
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed pl-9">
            Party balances · Cash flow · Sales orders · Battery stock overview
          </p>
        </div>

        {/* Timeframe switcher — buttons have px-4 py-2.5 = 16px × 10px */}
        <div className="flex items-center gap-2 p-2 bg-black/5 dark:bg-gray-800 rounded-2xl
                        border border-white/50 dark:border-[#2d302d] shrink-0 self-start sm:self-auto">
          {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold capitalize
                          transition-all cursor-pointer leading-none whitespace-nowrap
                          ${timeframe === tf
                            ? 'bg-[#3a3b39] text-[#cde06c] shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:text-[#3a3b39] dark:hover:text-white'
                          }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: Gauge Cards — gap-6 = 24px (8px × 3) ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {gaugeCards.map((card, i) => (
          <div
            key={i}
            /* Card — p-6 = 24px min padding, space-y-3 = 12px inner gap */
            className="glass-card p-6 space-y-3 overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400
                               uppercase tracking-widest leading-normal">
                {card.label}
              </span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight leading-none ${card.valueColor}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION 3: Pie Chart + Lists — gap-8 = 32px (8px × 4) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* LEFT: Pie Chart Card */}
        <div className="glass-strong rounded-3xl border border-gray-200 dark:border-[#2d302d] shadow-sm
                        flex flex-col p-6 sm:p-8">
          {/* Card Header */}
          <h2 className="text-base font-black text-[#3a3b39] dark:text-white leading-snug
                         pb-4 border-b border-gray-200/60 dark:border-[#2d302d]">
            Stock Distribution by Voltage Class
          </h2>

          {/* Chart — explicit fixed height so legend never overlaps slices */}
          <div className="flex-1 min-h-[300px] mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="44%"
                  innerRadius={72}
                  outerRadius={112}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.97)',
                    borderRadius: '0.875rem',
                    border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    padding: '12px 16px',     /* ≥ 16px horizontal */
                    lineHeight: '1.6',         /* ≥ 1.5× */
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={9}
                  wrapperStyle={{
                    fontSize: '0.6875rem',
                    fontWeight: '700',
                    paddingTop: '16px',        /* 16px = 8px × 2 */
                    lineHeight: '1.6',
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Recent Orders + Top Selling */}
        <div className="flex flex-col gap-8">

          {/* Recent Orders Card */}
          <div className="glass-strong rounded-3xl border border-gray-200 dark:border-[#2d302d] shadow-sm
                          flex flex-col p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200/60 dark:border-[#2d302d]">
              <ShoppingBag className="w-5 h-5 text-[#00a631] shrink-0" />
              <h2 className="text-base font-black text-[#3a3b39] dark:text-white leading-snug">
                Recent Orders (Top 3)
              </h2>
            </div>
            <div className="space-y-3 mt-4">
              {recentOrders.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center leading-relaxed">No orders yet.</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    /* Row — p-4 = 16px min padding, gap-4 = 16px between left/right */
                    className="glass-card p-4 flex items-center justify-between gap-4
                               hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all"
                  >
                    <div className="min-w-0 space-y-1">
                      <span className="font-mono text-xs font-black text-[#3a3b39] dark:text-white block">
                        {order.invoice_number}
                      </span>
                      {/* leading-normal = 1.5× */}
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold
                                       leading-normal block truncate">
                        {order.customer_name}
                      </span>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <span className="text-sm font-black text-[#00a631] block leading-tight">
                        ₹{order.grand_total.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold">{order.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Selling Products Card */}
          <div className="glass-strong rounded-3xl border border-gray-200 dark:border-[#2d302d] shadow-sm
                          flex flex-col p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200/60 dark:border-[#2d302d]">
              <Package className="w-5 h-5 text-[#3a3b39] dark:text-gray-300 shrink-0" />
              <h2 className="text-base font-black text-[#3a3b39] dark:text-white leading-snug">
                Top Selling by Piece (Top 3)
              </h2>
            </div>
            <div className="space-y-3 mt-4">
              {topSelling.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center leading-relaxed">No sales data yet.</p>
              ) : (
                topSelling.map((prod, idx) => (
                  <div
                    key={idx}
                    /* Row — p-4 = 16px min padding, gap-4 = 16px */
                    className="glass-card p-4 flex items-center justify-between gap-4
                               hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-[#3a3b39] dark:bg-gray-700
                                       text-[#cde06c] text-xs font-black flex items-center
                                       justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      {/* leading-normal = 1.5× */}
                      <span className="text-xs sm:text-sm font-black text-[#3a3b39] dark:text-white
                                       leading-normal truncate">
                        {prod.name}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black
                                     bg-[#00a631]/10 text-[#00a631] whitespace-nowrap shrink-0">
                      {prod.qty} pcs
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>{/* end right column */}
      </div>{/* end section 3 grid */}

    </div>
  );
}
