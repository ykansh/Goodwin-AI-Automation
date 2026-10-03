'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import AddItemModal from '@/components/inventory/AddItemModal';
import {
  TrendingUp,
  Receipt,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Printer,
  Share2,
  FileCheck2,
  Package,
  Plus,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/utils';

export default function DashboardPage() {
  const { invoices, items, parties, addInvoice, business } = useApp();
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Metrics
  const totalSales = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalReceivables = parties
    .filter((p) => p.currentBalance > 0)
    .reduce((acc, p) => acc + p.currentBalance, 0);
  const totalPayables = Math.abs(
    parties
      .filter((p) => p.currentBalance < 0)
      .reduce((acc, p) => acc + p.currentBalance, 0)
  );
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
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Live Business Pulse
              </span>
              <h1 className="text-2xl font-black tracking-tight">
                Goodwin Batteries &amp; Power Dashboard
              </h1>
              <p className="text-xs text-indigo-100 max-w-xl">
                Ready for superfast 8-second GST billing, live stock auto-deduction, and WhatsApp ledger reminders.
              </p>
            </div>
            <button
              onClick={() => setIsBillingModalOpen(true)}
              className="mt-4 md:mt-0 px-5 py-3 rounded-xl bg-[#db631a] hover:bg-[#c45312] text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Receipt size={17} />
              <span>+ Create Sale Invoice (F2)</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Total Sales (This Month)</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4c3cce] flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatINR(totalSales)}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <ArrowUpRight size={13} />
                <span>+18.4% vs last month</span>
              </div>
            </div>

            {/* Receivables (To Collect) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">To Collect (Receivables)</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatINR(totalReceivables)}</p>
              <p className="text-[11px] text-slate-500 mt-1">From 2 credit customers</p>
            </div>

            {/* Payables (To Pay) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">To Pay (Payables)</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Receipt size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatINR(totalPayables)}</p>
              <p className="text-[11px] text-slate-500 mt-1">To 1 vendor (Exide Alloys)</p>
            </div>

            {/* Low Stock Items */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Low Stock Alert</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-600 mt-2">{lowStockItems.length} Items</p>
              <p className="text-[11px] text-slate-500 mt-1">Needs reordering immediately</p>
            </div>
          </div>

          {/* Dual Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Sales Invoices (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Recent Invoices</h2>
                  <p className="text-[11px] text-slate-500">GST tax invoices &amp; proformas</p>
                </div>
                <button
                  onClick={() => setIsBillingModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4c3cce] font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} />
                  <span>New Bill</span>
                </button>
              </div>

              <div className="overflow-x-auto">
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
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
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
                        <td className="py-3 px-4 text-center">
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
                                const msg = `Hello ${inv.partyName}, your invoice ${inv.invoiceNumber} of ${formatINR(inv.totalAmount)} is ready.`;
                                window.open(`https://wa.me/91${inv.partyPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              title="Share on WhatsApp"
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <Share2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock & WhatsApp Reminder Sidebar (1 col) */}
            <div className="space-y-6">
              {/* Low Stock Watch */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Package size={15} className="text-rose-500" />
                    <span>Low Stock Alert</span>
                  </h3>
                  <span className="text-[11px] text-[#4c3cce] font-semibold cursor-pointer">
                    View All
                  </span>
                </div>

                <div className="space-y-2.5">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Min Alert: {item.minStockAlert} {item.unit}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-700 font-bold text-xs">
                        {item.stock} Left
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick WhatsApp Khata Reminder Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                  <FileCheck2 size={16} />
                  <span>WhatsApp Payment Recovery</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                  Send 1-click ledger payment reminders with dynamic UPI QR links directly to overdue customers.
                </p>
                <button
                  onClick={() => {
                    const firstDebtor = parties[0];
                    if (!firstDebtor) return;
                    const msg = `Respected ${firstDebtor.name}, your outstanding dues at Goodwin Batteries is ${formatINR(firstDebtor.currentBalance)}. Please clear via UPI: ${business.upiId}`;
                    window.open(`https://wa.me/91${firstDebtor.phone}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Share2 size={14} />
                  <span>Send Reminder to {parties[0]?.name?.slice(0, 15) || 'Customer'}...</span>
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
        onInvoiceCreated={(newInv) => addInvoice(newInv)}
      />

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
