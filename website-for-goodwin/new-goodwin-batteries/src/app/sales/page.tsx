'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import InvoiceDetailModal from '@/components/sales/InvoiceDetailModal';
import { useApp } from '@/context/AppContext';
import { MockInvoice } from '@/lib/mockData';
import { formatINR } from '@/lib/utils';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Printer,
  Share2,
  Eye,
  FileCheck2,
  Calendar,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export default function SalesPage() {
  const { invoices, addInvoice, business } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<MockInvoice | null>(null);

  // Financial Metrics
  const totalSales = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalDue = invoices.reduce((acc, inv) => acc + inv.balanceAmount, 0);

  // Filter Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.partyPhone.includes(searchQuery);

    const matchesType = selectedType === 'ALL' || inv.invoiceType === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || inv.paymentStatus === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleShareWhatsApp = (inv: MockInvoice) => {
    const text = `Hello ${inv.partyName}, your invoice ${inv.invoiceNumber} for ${formatINR(
      inv.totalAmount
    )} from ${business.businessName} is ready. Pay via UPI: ${business.upiId}.`;
    window.open(`https://wa.me/91${inv.partyPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Sidebar */}
      <Sidebar onOpenQuickBill={() => setIsBillingModalOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onOpenQuickBill={() => setIsBillingModalOpen(true)}
          onOpenAddItem={() => {}}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Sales Invoices &amp; Estimates
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-[#4c3cce]">
                  {invoices.length} Total Bills
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage GST tax invoices, quotations, proformas &amp; track customer payment status
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsBillingModalOpen(true)}
                className="h-9 px-4 rounded-xl bg-[#db631a] hover:bg-[#c45312] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>+ Create Sale Invoice</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Total Invoiced
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">{formatINR(totalSales)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Gross billed sales revenue</p>
            </div>

            {/* Collected / Paid */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Payment Collected
              </span>
              <p className="text-xl font-black text-emerald-600 mt-1">{formatINR(totalPaid)}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {totalSales > 0 ? `${Math.round((totalPaid / totalSales) * 100)}% recovery rate` : '0%'}
              </p>
            </div>

            {/* Balance Due */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Pending Balance Due
              </span>
              <p className="text-xl font-black text-rose-600 mt-1">{formatINR(totalDue)}</p>
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">
                Across partial/unpaid bills
              </p>
            </div>

            {/* Invoices Count */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Vouchers Created
              </span>
              <p className="text-xl font-black text-[#4c3cce] mt-1">{invoices.length} Bills</p>
              <p className="text-[10px] text-slate-400 mt-0.5">100% GST Compliant</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice number, customer name, mobile..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            {/* Voucher Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              >
                <option value="ALL">All Types</option>
                <option value="TAX_INVOICE">Tax Invoice</option>
                <option value="BILL_OF_SUPPLY">Bill of Supply</option>
                <option value="QUOTATION">Quotation / Estimate</option>
                <option value="DELIVERY_CHALLAN">Delivery Challan</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatus === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setSelectedStatus('PAID')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatus === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setSelectedStatus('PARTIAL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatus === 'PARTIAL'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                Partial
              </button>
              <button
                onClick={() => setSelectedStatus('UNPAID')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStatus === 'UNPAID'
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                Unpaid
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">Invoice Number</th>
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Voucher Type</th>
                    <th className="py-3 px-3 text-right">Amount (₹)</th>
                    <th className="py-3 px-3 text-right">Balance Due</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No invoices found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Date */}
                        <td className="py-3 px-4 font-mono text-slate-500">{inv.invoiceDate}</td>

                        {/* Number */}
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-800 leading-tight">
                            {inv.partyName}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400">
                            +91 {inv.partyPhone}
                          </span>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {inv.invoiceType}
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3 px-3 text-right font-black text-slate-900">
                          {formatINR(inv.totalAmount)}
                        </td>

                        {/* Balance Due */}
                        <td className="py-3 px-3 text-right font-semibold text-rose-600">
                          {inv.balanceAmount > 0 ? formatINR(inv.balanceAmount) : '—'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View & Print Modal */}
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              title="View & Print Invoice"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#4c3cce] hover:bg-indigo-50 transition-colors"
                            >
                              <Eye size={15} />
                            </button>

                            {/* WhatsApp Share */}
                            <button
                              onClick={() => handleShareWhatsApp(inv)}
                              title="Share on WhatsApp"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <Share2 size={15} />
                            </button>

                            {/* Direct Print */}
                            <button
                              onClick={() => {
                                setViewingInvoice(inv);
                                setTimeout(() => window.print(), 200);
                              }}
                              title="Direct Print"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            >
                              <Printer size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <InvoiceDetailModal
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
      />

      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onInvoiceCreated={(newInv) => addInvoice(newInv)}
      />
    </div>
  );
}
