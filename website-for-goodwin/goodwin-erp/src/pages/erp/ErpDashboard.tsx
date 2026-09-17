import { useState } from 'react';
import { useInvoices, useProducts, useCustomers, useWarranties } from '../../hooks/queries';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Package, Users, AlertCircle, ShieldCheck, ArrowUpRight, Activity,
  RotateCcw, Calendar, ArrowRight
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
  const [orderCount] = useState(5);
  const [productCount] = useState(5);

  const isLoading = loadInvoices || loadProducts || loadCustomers || loadWarranties;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-24 bg-black/5 dark:bg-white/5 rounded-lg w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-black/5 dark:bg-white/5 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)] gap-8">
          <div className="h-96 bg-black/5 dark:bg-white/5 rounded-lg"></div>
          <div className="h-96 bg-black/5 dark:bg-white/5 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // ── KPI Calculations ─────────────────────────────────────────────────
  const validInvoices = invoices.filter(inv => inv.lifecycle_status !== 'Quotation' && inv.lifecycle_status !== 'Cancelled');
  const totalSalesRevenue = validInvoices.reduce((acc, cur) => acc + cur.grand_total, 0);
  const totalOutstanding   = customers.reduce((acc, cur) => acc + cur.outstanding, 0);
  const totalStockVal      = products.reduce((acc, cur) => acc + cur.stock * cur.purchase_price, 0);
  const totalStockUnits    = products.reduce((acc, cur) => acc + cur.stock, 0);
  const lowStockCount      = products.filter((p) => p.stock < 5).length;

  // ── Top 3 Recent Orders ───────────────────────────────────────────────
  const recentOrders = [...validInvoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, orderCount);

  // ── Top 3 Selling Products ────────────────────────────────────────────
  const productSalesMap: Record<string, { name: string; sku: string; qty: number; totalVal: number }> = {};
  validInvoices.forEach((inv) =>
    inv.items.forEach((item) => {
      if (!productSalesMap[item.product_id]) {
        productSalesMap[item.product_id] = { name: item.product_name, sku: item.sku, qty: 0, totalVal: 0 };
      }
      productSalesMap[item.product_id].qty      += item.quantity;
      productSalesMap[item.product_id].totalVal += item.amount;
    })
  );
  const topSelling = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, productCount);

  // ── Repeat Customers / Frequent Orders ──────────────────────────────────
  interface RepeatCustomerItem {
    customerId: string;
    name: string;
    type?: string;
    uoi?: string;
    count: number;
    totalAmount: number;
    lastOrderDate: string;
    lastInvoiceNumber: string;
  }

  const customerOrdersMap: Record<string, RepeatCustomerItem> = {};
  validInvoices.forEach(inv => {
    const custKey = inv.customer_name?.trim() || inv.customer_id;
    if (custKey) {
      if (!customerOrdersMap[custKey]) {
        const custMeta = customers.find(
          c => (inv.customer_id && c.id === inv.customer_id) || 
               c.name.trim().toLowerCase() === (inv.customer_name || '').trim().toLowerCase()
        );
        customerOrdersMap[custKey] = {
          customerId: inv.customer_id || custMeta?.id || '',
          name: inv.customer_name || custMeta?.name || 'Unknown Customer',
          type: custMeta?.type,
          uoi: custMeta?.uoi || inv.customer_uoi,
          count: 0,
          totalAmount: 0,
          lastOrderDate: inv.date || '',
          lastInvoiceNumber: inv.invoice_number || '',
        };
      }
      customerOrdersMap[custKey].count += 1;
      customerOrdersMap[custKey].totalAmount += (inv.grand_total || 0);
      if (inv.date && (!customerOrdersMap[custKey].lastOrderDate || new Date(inv.date) >= new Date(customerOrdersMap[custKey].lastOrderDate))) {
        customerOrdersMap[custKey].lastOrderDate = inv.date;
        customerOrdersMap[custKey].lastInvoiceNumber = inv.invoice_number;
      }
    }
  });

  const repeatCustomers = Object.values(customerOrdersMap)
    .filter(c => c.count > 1)
    .sort((a, b) => b.count - a.count || b.totalAmount - a.totalAmount);

  const repeatRevenueTotal = repeatCustomers.reduce((acc, c) => acc + c.totalAmount, 0);
  const repeatRevenuePercent = totalSalesRevenue > 0 
    ? Math.round((repeatRevenueTotal / totalSalesRevenue) * 100) 
    : 0;

  // ── Pie Chart Data ────────────────────────────────────────────────────
  const stockByVoltage: Record<string, number> = {};
  products.forEach((p) => {
    const key = `${p.voltage} (${p.category ?? 'Auto'})`;
    stockByVoltage[key] = (stockByVoltage[key] ?? 0) + p.stock;
  });
  const pieData  = Object.entries(stockByVoltage).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  // ── Area Chart (Trend) Data mock ──────────────────────────────────────
  const trendData = validInvoices.slice(0, 10).map((inv) => ({
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
      <div className="glass-strong flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 sm:p-8 relative overflow-hidden">
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
            className="glass flex flex-col justify-between p-4 overflow-hidden cursor-pointer hover:border-[#22c55e]/40 hover:shadow-lg hover:shadow-[#22c55e]/5 transition-all group relative"
          >
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-full blur-2xl group-hover:bg-[#22c55e]/10 transition-colors" />
            
            <div className="flex items-start justify-between gap-4 relative z-10">
              <span className="text-xs font-extrabold text-[#5f7365] dark:text-[#8fa093] uppercase tracking-widest leading-normal group-hover:text-[#111814] dark:group-hover:text-white transition-colors">
                {card.label}
              </span>
              <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${card.iconBg} shadow-inner`}>
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
        <div className="glass-strong flex flex-col p-4 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#22c55e]/10 text-[#22c55e] rounded-md">
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
        <div className="glass-strong flex flex-col p-4 sm:p-8">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md">
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
          <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
            <h2 className="text-base font-black text-[#111814] dark:text-white">Recent Orders</h2>
            <button onClick={() => onNavigate?.('sales')} className="text-xs font-bold text-[#22c55e] hover:underline">View All</button>
          </div>
          <div className="p-0">
            {recentOrders.length === 0 ? (
              <div className="p-5 text-center text-sm font-bold text-[#5f7365] dark:text-[#8fa093]">No recent orders</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {recentOrders.map((order) => (
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
          <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
            <h2 className="text-base font-black text-[#111814] dark:text-white">Top Products</h2>
            <button onClick={() => onNavigate?.('products')} className="text-xs font-bold text-[#22c55e] hover:underline">View Inventory</button>
          </div>
          <div className="p-0">
            {topSelling.length === 0 ? (
              <div className="p-5 text-center text-sm font-bold text-[#5f7365] dark:text-[#8fa093]">No sales data available</div>
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

      {/* ── SECTION 5: Customer Loyalty & Repeat Orders ── */}
      <div className="grid grid-cols-1 gap-8 mt-8">
        <div className="glass flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-black/5 dark:border-white/5 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#22c55e]/10 text-[#22c55e] rounded-md">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-[#111814] dark:text-white">Repeat Orders & Loyalty</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#22c55e]/10 text-[#22c55e]">
                    {repeatCustomers.length} Frequent Accounts
                  </span>
                </div>
                <p className="text-xs text-[#5f7365] dark:text-[#8fa093] font-medium mt-0.5">
                  Customers who have placed multiple orders across their lifetime.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-start sm:self-auto">
              <div className="text-left sm:text-right">
                <div className="text-[11px] font-bold text-[#5f7365] dark:text-[#8fa093]">Repeat Order Revenue</div>
                <div className="text-sm font-black text-[#22c55e]">
                  ₹{repeatRevenueTotal.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] text-[#5f7365] dark:text-[#8fa093] font-bold">({repeatRevenuePercent}% of sales)</span>
                </div>
              </div>
              <button 
                onClick={() => onNavigate?.('sales')} 
                className="text-xs font-bold text-[#22c55e] hover:underline flex items-center gap-1 shrink-0 ml-2"
              >
                <span>All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            {repeatCustomers.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center space-y-2">
                <RotateCcw className="w-8 h-8 text-black/20 dark:text-white/20 animate-spin-slow" />
                <div className="text-sm font-black text-[#111814] dark:text-white">No repeat customer orders detected yet</div>
                <p className="text-xs text-[#5f7365] dark:text-[#8fa093] max-w-sm">
                  When customers confirm 2 or more orders, they will automatically appear here with their loyalty frequency, average basket size, and lifetime spend.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-[11px] text-[#5f7365] dark:text-[#8fa093] font-extrabold uppercase tracking-wider bg-black/[0.02] dark:bg-white/[0.02]">
                    <th className="py-3 px-4 pl-6">Customer / Account</th>
                    <th className="py-3 px-4 text-center">Frequency</th>
                    <th className="py-3 px-4">Latest Order</th>
                    <th className="py-3 px-4 text-right">Avg. Order Value</th>
                    <th className="py-3 px-4 pr-6 text-right">Total Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-black/5 dark:divide-white/5">
                  {repeatCustomers.map((cust, idx) => {
                    const avgValue = Math.round(cust.totalAmount / cust.count);
                    return (
                      <tr 
                        key={idx} 
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={() => onNavigate?.('sales')}
                        title="Click to view sales orders"
                      >
                        <td className="py-3.5 px-4 pl-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-[#111814] dark:text-white group-hover:text-[#22c55e] transition-colors">
                              {cust.name}
                            </span>
                            {cust.type && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-black/5 dark:bg-white/10 text-[#5f7365] dark:text-[#8fa093]">
                                {cust.type}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#5f7365] dark:text-[#8fa093] font-mono mt-0.5">
                            {cust.uoi ? cust.uoi : `Account #${idx + 1}`}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-500/10 text-blue-500">
                            <RotateCcw className="w-3 h-3" />
                            <span>{cust.count} Orders</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#111814] dark:text-white">
                            <Calendar className="w-3.5 h-3.5 text-[#5f7365] dark:text-[#8fa093]" />
                            <span>{cust.lastOrderDate || '—'}</span>
                          </div>
                          {cust.lastInvoiceNumber && (
                            <div className="text-[10px] font-mono text-[#5f7365] dark:text-[#8fa093] mt-0.5">
                              {cust.lastInvoiceNumber}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="text-xs font-black text-[#111814] dark:text-white">
                            ₹{avgValue.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-[#5f7365] dark:text-[#8fa093]">per order</span>
                        </td>

                        <td className="py-3.5 px-4 pr-6 text-right">
                          <div className="text-sm font-black text-[#22c55e]">
                            ₹{cust.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] font-bold text-[#5f7365] dark:text-[#8fa093] group-hover:text-[#22c55e] inline-flex items-center gap-0.5">
                            View <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
