'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import AddItemModal from '@/components/inventory/AddItemModal';
import ImportExportModal from '@/components/ImportExportModal';
import {
  TrendingUp,
  Receipt,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Printer,
  Share2,
  FileCheck2,
  Package,
  Plus,
  Cloud,
  Layers,
  Trash2,
  Landmark,
  FileSpreadsheet,
  ScanBarcode,
  Store,
  ChevronRight,
  Shield,
  Lock,
  Download,
  Upload,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const {
    invoices,
    items,
    parties,
    deleteInvoice,
    business,
    selectedCompany,
    isLoading,
    isAdmin,
    isEmployee,
    isTestMode,
  } = useApp();

  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

  // Metrics
  const totalSales = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const debitParties = parties.filter((p) => p.currentBalance > 0);
  const creditParties = parties.filter((p) => p.currentBalance < 0);
  const totalReceivables = debitParties.reduce((acc, p) => acc + p.currentBalance, 0);
  const totalPayables = Math.abs(creditParties.reduce((acc, p) => acc + p.currentBalance, 0));
  const lowStockItems = items.filter((item) => item.stock <= item.minStockAlert);

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Navigation Sidebar */}
      <Sidebar onOpenQuickBill={() => setIsBillingModalOpen(true)} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onOpenQuickBill={() => setIsBillingModalOpen(true)}
          onOpenAddItem={() => setIsAddModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#3a4b8d] via-[#4c3cce] to-[#5b4be4] rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-md relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Live Business Pulse
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono font-bold">
                  {selectedCompany.shortName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-semibold flex items-center gap-1">
                  <Cloud size={11} /> Supabase Live
                </span>
                {isEmployee && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-100 font-bold flex items-center gap-1">
                    <Shield size={11} /> Employee Role
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight">
                {selectedCompany.displayName} Dashboard
              </h1>
              <p className="text-xs text-indigo-100 max-w-xl">
                Real-time invoicing, stock synchronization, and ledger balances. Click any metric card below to navigate directly to that section.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsImportExportModalOpen(true)}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
              >
                <FileSpreadsheet size={16} />
                <span>Import / Export CSV</span>
              </button>
              <button
                onClick={() => setIsBillingModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#db631a] hover:bg-[#c45312] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Receipt size={17} />
                <span>+ Create Sale Invoice</span>
              </button>
            </div>
          </div>

          {/* Quick Clickable Navigation Modules Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Direct Section Navigation
              </h2>
              <span className="text-[11px] text-slate-400">Click to jump into any module</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Sales Invoices Module */}
              <Link
                href="/sales"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#4c3cce] hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4c3cce] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Receipt size={17} />
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-[#4c3cce] group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Sales Invoices</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{invoices.length} Bills Saved</p>
                </div>
              </Link>

              {/* Items & Stock Module */}
              <Link
                href="/inventory"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package size={17} />
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Items &amp; Stock</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{items.length} Products</p>
                </div>
              </Link>

              {/* Parties Khata Module */}
              <Link
                href="/parties"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users size={17} />
                  </div>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Parties Khata</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{parties.length} Customers</p>
                </div>
              </Link>

              {/* Cash & Banking Module */}
              <Link
                href="/banking"
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-cyan-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Landmark size={17} />
                  </div>
                  {isEmployee ? (
                    <Lock size={12} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Cash &amp; Banking</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isEmployee ? 'Admin Only' : 'Daybook & Liquidity'}
                  </p>
                </div>
              </Link>

              {/* POS Quick Bill (if enabled) */}
              {selectedCompany.hasPos ? (
                <Link
                  href="/pos"
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#db631a] hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#db631a] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ScanBarcode size={17} />
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#db631a] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">POS Quick Bill</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Counter Checkout</p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/settings"
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Layers size={17} />
                    </div>
                    {isEmployee ? (
                      <Lock size={12} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Settings</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isEmployee ? 'Admin Only' : 'Company Profile'}
                    </p>
                  </div>
                </Link>
              )}

              {/* GST Reports Module (or Store) */}
              {selectedCompany.hasGstReports ? (
                <Link
                  href="/reports"
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-violet-500 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileSpreadsheet size={17} />
                    </div>
                    {isEmployee ? (
                      <Lock size={12} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">GST Reports</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isEmployee ? 'Admin Only' : 'GSTR-1 & Financials'}
                    </p>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => setIsImportExportModalOpen(true)}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group flex flex-col justify-between text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4c3cce] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileSpreadsheet size={17} />
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#4c3cce] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Import/Export</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">CSV File Exchange</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Clickable Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales -> Redirects to /sales */}
            <Link
              href="/sales"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#4c3cce] hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-[#4c3cce] transition-colors">
                  Total Sales
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4c3cce] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatINR(totalSales)}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                <span>{invoices.length} invoices generated</span>
                <span className="text-[#4c3cce] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  View Sales <ArrowRight size={11} />
                </span>
              </div>
            </Link>

            {/* Receivables (To Collect) -> Redirects to /parties */}
            <Link
              href="/parties"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">
                  To Collect (Receivables)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatINR(totalReceivables)}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                <span>From {debitParties.length} credit customers</span>
                <span className="text-emerald-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Khata <ArrowRight size={11} />
                </span>
              </div>
            </Link>

            {/* Payables (To Pay) -> Redirects to /parties */}
            <Link
              href="/parties"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-500 hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-amber-600 transition-colors">
                  To Pay (Payables)
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Receipt size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatINR(totalPayables)}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                <span>To {creditParties.length} suppliers</span>
                <span className="text-amber-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Manage <ArrowRight size={11} />
                </span>
              </div>
            </Link>

            {/* Low Stock Items -> Redirects to /inventory */}
            <Link
              href="/inventory"
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-rose-400 hover:shadow-md transition-all group block cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-rose-600 transition-colors">
                  Low Stock Alert
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-600 mt-2">{lowStockItems.length} Items</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                <span>{lowStockItems.length > 0 ? 'Needs reordering' : 'Stock optimal'}</span>
                <span className="text-rose-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Inventory <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          </div>

          {/* Dual Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Sales Invoices (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <Link
                  href="/sales"
                  className="group flex items-center gap-1.5 cursor-pointer"
                  title="Click to view all sales invoices"
                >
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm group-hover:text-[#4c3cce] flex items-center gap-1 transition-colors">
                      <span>Recent Invoices</span>
                      <ChevronRight size={15} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#4c3cce] transition-all" />
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Live from Supabase • Click row to view details
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href="/sales"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>View All Invoices</span>
                    <ArrowRight size={12} />
                  </Link>
                  <button
                    onClick={() => setIsBillingModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4c3cce] font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} />
                    <span>New Bill</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {invoices.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Receipt size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">No invoices generated yet</p>
                    <p className="text-xs mt-1 text-slate-400">
                      Click &ldquo;+ Create Sale Invoice&rdquo; above to record your first transaction.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase border-b border-slate-200">
                        <th className="py-2.5 px-4">Invoice #</th>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Party Name</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.slice(0, 8).map((inv) => (
                        <tr
                          key={inv.id}
                          onClick={() => router.push('/sales')}
                          className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-800 group-hover:text-[#4c3cce]">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{inv.invoiceDate}</td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {inv.partyName}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {formatINR(inv.totalAmount)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                inv.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : inv.paymentStatus === 'PARTIAL'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {inv.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => window.print()}
                                title="Print Invoice"
                                className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              >
                                <Printer size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  const msg = `Hello ${inv.partyName}, your invoice ${inv.invoiceNumber} of ${formatINR(inv.totalAmount)} from ${selectedCompany.displayName} is ready.`;
                                  window.open(`https://wa.me/91${inv.partyPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                title="Share on WhatsApp"
                                className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <Share2 size={15} />
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Permanently delete invoice ${inv.invoiceNumber} from Supabase?`)) {
                                      deleteInvoice(inv.id);
                                    }
                                  }}
                                  title="Delete from Supabase (Admin Only)"
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Low Stock & WhatsApp Reminder Sidebar (1 col) */}
            <div className="space-y-6">
              {/* Low Stock Watch -> Clickable to /inventory */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
                <div className="flex justify-between items-center mb-3">
                  <Link
                    href="/inventory"
                    className="font-bold text-slate-800 text-xs flex items-center gap-1.5 hover:text-rose-600 transition-colors group cursor-pointer"
                  >
                    <Package size={15} className="text-rose-500" />
                    <span>Low Stock Alert</span>
                    <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-rose-600 transition-transform" />
                  </Link>
                  <Link
                    href="/inventory"
                    className="text-[11px] text-[#4c3cce] font-semibold hover:underline"
                  >
                    All {items.length} items &rarr;
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {lowStockItems.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                      {items.length === 0
                        ? 'No products added yet. Click "+ Add Item" above.'
                        : 'All items in stock are above safety threshold.'}
                    </div>
                  ) : (
                    lowStockItems.slice(0, 4).map((item) => (
                      <Link
                        key={item.id}
                        href="/inventory"
                        className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-100/60 transition-colors flex justify-between items-center cursor-pointer block"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Min Alert: {item.minStockAlert} {item.unit}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-700 font-bold text-xs shrink-0">
                          {item.stock} Left
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Quick WhatsApp Khata Reminder Card -> Clickable to /parties */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <Link
                    href="/parties"
                    className="flex items-center gap-2 text-emerald-800 font-bold text-xs hover:text-emerald-900 transition-colors cursor-pointer group"
                  >
                    <FileCheck2 size={16} />
                    <span>WhatsApp Payment Recovery</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/parties" className="text-[10px] text-emerald-700 font-semibold hover:underline">
                    View Khata &rarr;
                  </Link>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                  Send 1-click ledger payment reminders with dynamic UPI QR links directly to customers.
                </p>
                <button
                  onClick={() => {
                    const firstDebtor = debitParties[0] || parties[0];
                    if (!firstDebtor) return;
                    const msg = `Respected ${firstDebtor.name}, your outstanding dues at ${selectedCompany.displayName} is ${formatINR(firstDebtor.currentBalance)}. Please clear via UPI: ${business.upiId}`;
                    window.open(`https://wa.me/91${firstDebtor.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  disabled={parties.length === 0}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Share2 size={14} />
                  <span>
                    {parties.length > 0
                      ? `Send Reminder to ${(debitParties[0] || parties[0])?.name?.slice(0, 16)}...`
                      : 'No parties available'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 8-Second Fast GST Billing Modal */}
      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
      />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* CSV Import & Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
      />
    </div>
  );
}
