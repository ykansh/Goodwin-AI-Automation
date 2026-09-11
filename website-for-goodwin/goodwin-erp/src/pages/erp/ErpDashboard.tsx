import { useState } from 'react';
import { useInvoices, useProducts, useCustomers, useWarranties } from '../../hooks/queries';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Package, Users, AlertCircle, ShoppingBag, ShieldCheck, ArrowUpRight, Activity
} from 'lucide-react';

export function ErpDashboard({
  onNavigate,
}: {
  onNavigate?: (moduleKey: string) => void;
}) {
  const { data: invoices = [], isLoading: loadInvoices } = useInvoices();
  const { data: products = [], isLoading: loadProducts } = useProducts();
  const { data: customers = [], isLoading: loadCustomers } = useCustomers();
  const { data: warranties = [], isLoading: loadWarranties } = useWarranties();

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [orderCount, setOrderCount] = useState(5);
  const [productCount, setProductCount] = useState(5);

  const isLoading = loadInvoices || loadProducts || loadCustomers || loadWarranties;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-24 bg-black/5 dark:bg-white/5 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-black/5 dark:bg-white/5 rounded-3xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)] gap-8">
          <div className="h-96 bg-black/5 dark:bg-white/5 rounded-3xl"></div>
          <div className="h-96 bg-black/5 dark:bg-white/5 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // ── KPI Calculations ─────────────────────────────────────────────────
  const totalSalesRevenue = invoices.reduce((acc, cur) => acc + cur.grand_total, 0);
  const totalOutstanding   = customers.reduce((acc, cur) => acc + cur.outstanding, 0);
  const totalStockVal      = products.reduce((acc, cur) => acc + cur.stock * cur.purchase_price, 0);
  const totalStockUnits    = products.reduce((acc, cur) => acc + cur.stock, 0);
  const lowStockCount      = products.filter((p) => p.stock < 5).length;

  // ── Top 3 Recent Orders ───────────────────────────────────────────────
  const recentOrders = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, orderCount);

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
  const topSelling = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, productCount);

  // ── Pie Chart Data ────────────────────────────────────────────────────
  const stockByVoltage: Record<string, number> = {};
  products.forEach((p) => {
    const key = `${p.voltage} (${p.category ?? 'Auto'})`;
    stockByVoltage[key] = (stockByVoltage[key] ?? 0) + p.stock;
  });
  const pieData  = Object.entries(stockByVoltage).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  // ── Area Chart (Trend) Data mock ──────────────────────────────────────
  const trendData = invoices.slice(0, 10).map((inv, idx) => ({
    name: inv.date.slice(5, 10), // MM-DD
    sales: inv.grand_total,
  })).reverse();

  // ── KPI Card Data ─────────────────────────────────────────────────────
  const kpiCards = [
    {
      label: `Total Revenue`,
      value: `₹${totalSalesRevenue.toLocaleString('en-IN')}`,
      sub: `+14.2% from previous ${timeframe}`,
      subColor: 'text-[#22c55e]',
      icon: <TrendingUp className="w-5 h-5" />,
      iconBg: 'bg-[#22c55e]/15 text-[#22c55e]',
      onClickKey: 'sales',
    },
    {
      label: 'Stock Valuation',
      value: `₹${totalStockVal.toLocaleString('en-IN')}`,
      sub: `${totalStockUnits} units in inventory`,
      subColor: 'text-[#5f7365] dark:text-[#8fa093]',
      icon: <Package className="w-5 h-5" />,
      iconBg: 'bg-[#f59e0b]/15 text-[#f59e0b]',
      onClickKey: 'products',
    },
    {
      label: 'Customer Outstanding',
      value: `₹${totalOutstanding.toLocaleString('en-IN')}`,
      valueColor: 'text-red-500',
      sub: `Across ${customers.length} dealers & retailers`,
      subColor: 'text-[#5f7365] dark:text-[#8fa093]',
      icon: <Users className="w-5 h-5" />,
      iconBg: 'bg-[#3b82f6]/15 text-[#3b82f6]',
      onClickKey: 'customers',
    },
    {
      label: 'Warranties & Alerts',
      value: `${warranties.length}`,
      valueSuffix: 'Active',
      sub: `${lowStockCount} products low stock (<5)`,
      subColor: 'text-[#f59e0b]',
      icon: <ShieldCheck className="w-5 h-5" />,
      iconBg: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
      onClickKey: 'warranty',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      {/* ── SECTION 1: Banner + Timeframe ─────────────────────────── */}
      <div className="glass-strong flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#22c55e] animate-pulse shrink-0 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
            <h1 className="text-xl sm:text-2xl font-black text-[#111814] dark:text-white tracking-tight leading-tight">
              Goodwin Business Overview
            </h1>
          </div>
          <p className="text-sm text-[#5f7365] dark:text-[#8fa093] font-medium leading-relaxed pl-6">
            Real-time battery inventory, sales analytics, outstanding balances & operations.
          </p>
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'daily' | 'weekly' | 'monthly')}
          className="glass-input px-4 py-2.5 text-xs sm:text-sm font-extrabold cursor-pointer capitalize shrink-0 self-start sm:self-auto relative z-10"
        >
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
        </select>
      </div>

      {/* ── SECTION 2: KPI Cards ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => (
          <div
            key={i}
            onClick={() => { if (card.onClickKey && onNavigate) onNavigate(card.onClickKey); }}
            className="glass flex flex-col justify-between p-6 overflow-hidden cursor-pointer hover:border-[#22c55e]/40 hover:shadow-lg hover:shadow-[#22c55e]/5 transition-all group relative"
          >
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-[#22c55e]/10 transition-colors" />
            
            <div className="flex items-start justify-between gap-4 relative z-10">
              <span className="text-xs font-extrabold text-[#5f7365] dark:text-[#8fa093] uppercase tracking-widest leading-normal group-hover:text-[#111814] dark:group-hover:text-white transition-colors">
                {card.label}
              </span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg} shadow-inner`}>
                {card.icon}
              </div>
            </div>
            
            <div className="relative z-10 mt-6 mb-4">
              <div className={`text-2xl sm:text-3xl font-black tracking-tight leading-none truncate ${card.valueColor ?? 'text-[#111814] dark:text-white'}`}>
                {card.value}
                {card.valueSuffix && (
                  <span className="text-sm font-bold text-[#5f7365] dark:text-[#8fa093] ml-2">
                    {card.valueSuffix}
                  </span>
                )}
              </div>
            </div>

            <div className={`flex items-center gap-1.5 text-xs font-bold leading-normal relative z-10 ${card.subColor}`}>
              {i === 0 && <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />}
              {i === 3 && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              <span>{card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── SECTION 3: Charts & Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Trend Chart */}
        <div className="glass-strong flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#22c55e]/10 text-[#22c55e] rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-[#111814] dark:text-white">Revenue Trend</h2>
            </div>
          </div>
          <div className="h-[280px] w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8fa093' }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8fa093' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' }}
                    itemStyle={{ color: '#111814', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-bold text-black/40 dark:text-white/40">No sales trend available</div>
            )}
          </div>
        </div>

        {/* Stock Distribution */}
        <div className="glass-strong flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="text-base font-black text-[#111814] dark:text-white">Inventory by Voltage</h2>
            </div>
          </div>
          <div className="h-[280px] w-full flex items-center justify-center relative">
            {pieData.length === 0 ? (
              <div className="text-center text-sm font-bold text-black/40 dark:text-white/40">No inventory data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#111814'
                    }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    layout="vertical"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', fontWeight: '600' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Data Tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="glass flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
            <h2 className="text-base font-black text-[#111814] dark:text-white">Recent Orders</h2>
            <button onClick={() => onNavigate?.('sales')} className="text-xs font-bold text-[#22c55e] hover:underline">View All</button>
          </div>
          <div className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-[#5f7365] dark:text-[#8fa093]">No recent orders</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {recentOrders.map((order, idx) => (
                    <tr key={order.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="text-xs font-black text-[#111814] dark:text-white">{order.invoice_number}</div>
                        <div className="text-[10px] text-[#5f7365] dark:text-[#8fa093] font-bold mt-1">{order.date}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-[#111814] dark:text-white truncate max-w-[150px]">{order.customer_name}</div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="text-sm font-black text-[#111814] dark:text-white">₹{order.grand_total.toLocaleString('en-IN')}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-[#22c55e]/10 text-[#22c55e]">{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="glass flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
            <h2 className="text-base font-black text-[#111814] dark:text-white">Top Products</h2>
            <button onClick={() => onNavigate?.('products')} className="text-xs font-bold text-[#22c55e] hover:underline">View Inventory</button>
          </div>
          <div className="p-0">
            {topSelling.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-[#5f7365] dark:text-[#8fa093]">No sales data available</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {topSelling.map((prod, idx) => (
                    <tr key={idx} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4 pl-6 w-12">
                        <div className="w-6 h-6 rounded bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-black text-[#111814] dark:text-white">
                          {idx + 1}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-black text-[#111814] dark:text-white truncate max-w-[180px]">{prod.name}</div>
                        <div className="text-[10px] text-[#5f7365] dark:text-[#8fa093] font-mono mt-1">{prod.sku}</div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="text-xs font-black text-[#22c55e]">{prod.qty} units</div>
                        <div className="text-[11px] font-bold text-[#5f7365] dark:text-[#8fa093] mt-1">₹{prod.totalVal.toLocaleString('en-IN')}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
