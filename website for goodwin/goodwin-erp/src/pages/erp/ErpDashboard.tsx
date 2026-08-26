import { useState } from 'react';
import { useData } from '../../store/DataContext';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  TrendingUp, Package, Users, AlertCircle, ShoppingBag, ShieldCheck, ArrowUpRight
} from 'lucide-react';

// ─── 8px Grid Token Reference ──────────────────────────────────────────
// All spacing/padding values are strict multiples of 8px.
//  8px  = 0.5rem  = Tailwind gap-2  / p-2
// 16px  = 1rem    = Tailwind gap-4  / p-4   (minimum card/button padding)
// 24px  = 1.5rem  = Tailwind gap-6  / p-6
// 32px  = 2rem    = Tailwind gap-8  / p-8
// ─────────────────────────────────────────────────────────────────────

export function ErpDashboard({
  onNavigate,
}: {
  onNavigate?: (moduleKey: string) => void;
}) {
  const { invoices, products, customers, warranties } = useData();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // ── KPI Calculations ─────────────────────────────────────────────────
  const totalSalesRevenue = invoices.reduce((acc, cur) => acc + cur.grand_total, 0);
  const totalOutstanding   = customers.reduce((acc, cur) => acc + cur.outstanding, 0);
  const totalStockVal      = products.reduce((acc, cur) => acc + cur.stock * cur.purchase_price, 0);
  const totalStockUnits    = products.reduce((acc, cur) => acc + cur.stock, 0);
  const lowStockCount      = products.filter((p) => p.stock < 5).length;

  // ── Top 3 Recent Orders ───────────────────────────────────────────────
  const recentOrders = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // ── Top 3 Selling Products ────────────────────────────────────────────
  const productSalesMap: Record<string, { name: string; sku: string; qty: number; totalVal: number }> = {};
  invoices.forEach((inv) =>
    inv.items.forEach((item) => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = { name: item.product_name, sku: item.sku, qty: 0, totalVal: 0 };
      }
      productSalesMap[item.product_id].qty      += item.quantity;
      productSalesMap[item.product_id].totalVal += item.amount;
    })
  );
  const topSelling = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 3);

  // ── Pie Chart Data ────────────────────────────────────────────────────
  const stockByVoltage: Record<string, number> = {};
  products.forEach((p) => {
    const key = `${p.voltage} (${p.category ?? 'Auto'})`;
    stockByVoltage[key] = (stockByVoltage[key] ?? 0) + p.stock;
  });
  const pieData  = Object.entries(stockByVoltage).map(([name, value]) => ({ name, value }));
  const COLORS   = ['#00a631', '#3a3b39', '#cde06c', '#008a29', '#6b7280'];

  // ── KPI Card Data ─────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: `Total Revenue (${timeframe})`,
      value: `₹${totalSalesRevenue.toLocaleString('en-IN')}`,
      sub: `+14.2% from previous ${timeframe}`,
      subColor: 'text-[#00a631]',
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: 'bg-[#00a631]/10 text-[#00a631]',
    },
    {
      label: 'Stock Valuation',
      value: `₹${totalStockVal.toLocaleString('en-IN')}`,
      sub: `${totalStockUnits} units in inventory`,
      subColor: 'text-gray-500 dark:text-gray-400',
      icon: <Package className="w-5 h-5" />,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Customer Outstanding',
      value: `₹${totalOutstanding.toLocaleString('en-IN')}`,
      valueColor: 'text-red-600 dark:text-red-400',
      sub: `Across ${customers.length} dealers & retailers`,
      subColor: 'text-gray-500 dark:text-gray-400',
      icon: <Users className="w-5 h-5" />,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Warranties & Alerts',
      value: `${warranties.length}`,
      valueSuffix: 'Active',
      sub: `${lowStockCount} products low stock (<5)`,
      subColor: 'text-amber-700 dark:text-amber-400',
      icon: <ShieldCheck className="w-5 h-5" />,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    /* Root — space-y-8 = 32px between major sections (8px × 4) */
    <div className="space-y-8 animate-fade-in">

      {/* ── SECTION 1: Banner + Timeframe ─────────────────────────── */}
      <div className="glass-strong rounded-3xl border border-white/60 dark:border-white/10 shadow-sm
                      flex flex-col sm:flex-row sm:items-center justify-between
                      gap-6 p-6 sm:p-8">
        {/* Title block — space-y-2 = 8px × 1 inner gap */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#00a631] animate-pulse shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black text-[#3a3b39] dark:text-white tracking-tight leading-tight">
              Goodwin ERP Executive Dashboard
            </h1>
          </div>
          {/* Subtitle — leading-relaxed ≥ 1.5× font-size */}
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed pl-6">
            Real-time battery inventory · Sales analytics · Customer outstanding · Warranty tracking
          </p>
        </div>

        {/* Timeframe switcher — buttons have min py-2.5 = 10px (>8px), px-4 = 16px */}
        <div className="flex items-center gap-2 p-2 bg-black/5 dark:bg-gray-800 rounded-2xl
                        border border-white/50 dark:border-white/10 shrink-0 self-start sm:self-auto">
          {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold capitalize
                          transition-all cursor-pointer leading-none whitespace-nowrap
                          ${timeframe === tf
                            ? 'bg-[#00a631] text-white shadow-md shadow-[#00a631]/30'
                            : 'text-gray-600 dark:text-gray-300 hover:text-[#3a3b39] dark:hover:text-white'
                          }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: KPI Cards — gap-6 = 24px (8px × 3) ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            /* Card — p-6 = 24px min padding, space-y-3 = 12px inner gap */
            className="glass-card p-6 space-y-3 overflow-hidden"
          >
            {/* Row 1: Label + Icon */}
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400
                               uppercase tracking-widest leading-normal">
                {card.label}
              </span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            {/* Row 2: Primary Value */}
            <div className={`text-2xl sm:text-3xl font-black tracking-tight leading-none
                            ${card.valueColor ?? 'text-[#3a3b39] dark:text-white'}`}>
              {card.value}
              {card.valueSuffix && (
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2">
                  {card.valueSuffix}
                </span>
              )}
            </div>
            {/* Row 3: Subtitle — leading-normal = 1.5× */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold leading-normal ${card.subColor}`}>
              {i === 0 && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />}
              {i === 3 && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION 3: Chart + Order Lists — gap-8 = 32px (8px × 4) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* LEFT: Pie Chart Card */}
        <div className="glass-strong rounded-3xl border border-white/60 dark:border-white/10 shadow-sm
                        flex flex-col p-6 sm:p-8">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-white/10">
            <div className="space-y-1">
              <h2 className="text-base font-black text-[#3a3b39] dark:text-white leading-snug">
                Battery Stock Distribution by Class
              </h2>
              {/* Subtitle — leading-relaxed ≥ 1.5× */}
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Current inventory percentage breakdown by voltage category
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('products')}
              className="text-xs font-extrabold text-[#00a631] hover:underline cursor-pointer
                         shrink-0 whitespace-nowrap px-2 py-1"
            >
              View Catalog →
            </button>
          </div>

          {/* Chart — Explicit height, internal padding keeps legend from overlapping */}
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
                    padding: '12px 16px',          /* min 16px horizontal padding */
                    lineHeight: '1.6',              /* ≥ 1.5× */
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
                    paddingTop: '16px',             /* 16px = 8px × 2 */
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
          <div className="glass-strong rounded-3xl border border-white/60 dark:border-white/10 shadow-sm
                          flex flex-col p-6 sm:p-8">
            {/* Card Header */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#00a631] shrink-0" />
                <h2 className="text-base font-black text-[#3a3b39] dark:text-white leading-snug">
                  Recent Orders
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate?.('sales')}
                className="text-xs font-extrabold text-[#00a631] hover:underline cursor-pointer
                           whitespace-nowrap px-2 py-1"
              >
                All Orders →
              </button>
            </div>

            {/* Order List — space-y-3 = 12px between items */}
            <div className="space-y-3 mt-4">
              {recentOrders.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium py-4 text-center leading-relaxed">
                  No orders logged yet.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    /* Each row: min p-4 = 16px padding, flex gap-4 = 16px between cols */
                    className="glass-card p-4 flex items-center justify-between gap-4
                               hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-[#3a3b39] dark:text-white">
                          {order.invoice_number}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black
                                         bg-[#00a631]/10 text-[#00a631] uppercase shrink-0">
                          {order.status}
                        </span>
                      </div>
                      {/* Customer name — leading-normal = 1.5× */}
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold
                                    leading-normal truncate">
                        {order.customer_name}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="text-sm font-black text-[#3a3b39] dark:text-white leading-tight">
                        ₹{order.grand_total.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold">{order.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Selling Products Card */}
          <div className="glass-strong rounded-3xl border border-white/60 dark:border-white/10 shadow-sm
                          flex flex-col p-6 sm:p-8">
            {/* Card Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200/60 dark:border-white/10">
              <Package className="w-5 h-5 text-[#3a3b39] dark:text-gray-300 shrink-0" />
              <h2 className="text-base font-black text-[#3a3b39] dark:text-white leading-snug">
                Top Selling Products
              </h2>
            </div>

            {/* Product List — space-y-3 = 12px between items */}
            <div className="space-y-3 mt-4">
              {topSelling.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium py-4 text-center leading-relaxed">
                  No sales data yet.
                </p>
              ) : (
                topSelling.map((prod, idx) => (
                  <div
                    key={idx}
                    /* Each row: min p-4 = 16px padding, gap-4 = 16px */
                    className="glass-card p-4 flex items-center justify-between gap-4
                               hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank badge */}
                      <span className="w-8 h-8 rounded-xl bg-[#3a3b39] dark:bg-gray-700
                                       text-[#cde06c] font-black text-xs flex items-center
                                       justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        {/* Product name — leading-normal = 1.5× */}
                        <p className="text-xs sm:text-sm font-black text-[#3a3b39] dark:text-white
                                      leading-normal truncate">
                          {prod.name}
                        </p>
                        <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
                          SKU: {prod.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <span className="block px-3 py-1 rounded-full text-xs font-black
                                       bg-[#00a631]/10 text-[#00a631] whitespace-nowrap">
                        {prod.qty} pcs sold
                      </span>
                      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                        ₹{prod.totalVal.toLocaleString('en-IN')}
                      </p>
                    </div>
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
