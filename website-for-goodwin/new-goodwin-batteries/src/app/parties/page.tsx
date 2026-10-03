'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddPartyModal from '@/components/parties/AddPartyModal';
import RecordPaymentModal from '@/components/parties/RecordPaymentModal';
import PartyStatementModal from '@/components/parties/PartyStatementModal';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import { useApp } from '@/context/AppContext';
import { MockParty } from '@/lib/mockData';
import { formatINR } from '@/lib/utils';
import {
  Users,
  Plus,
  Search,
  Filter,
  Share2,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Building,
  Phone,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function PartiesPage() {
  const { parties, deleteParty, business, addInvoice } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER' | 'DUES'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<MockParty | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentParty, setPaymentParty] = useState<MockParty | null>(null);
  const [statementParty, setStatementParty] = useState<MockParty | null>(null);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Calculations
  const totalReceivables = parties
    .filter((p) => p.currentBalance > 0)
    .reduce((acc, p) => acc + p.currentBalance, 0);

  const totalPayables = Math.abs(
    parties
      .filter((p) => p.currentBalance < 0)
      .reduce((acc, p) => acc + p.currentBalance, 0)
  );

  const customerCount = parties.filter((p) => p.type === 'CUSTOMER').length;
  const supplierCount = parties.filter((p) => p.type === 'SUPPLIER').length;

  // Filtered List
  const filteredParties = parties.filter((party) => {
    const matchesSearch =
      party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.phone.includes(searchQuery) ||
      (party.gstin && party.gstin.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      filterType === 'ALL'
        ? true
        : filterType === 'CUSTOMER'
        ? party.type === 'CUSTOMER'
        : filterType === 'SUPPLIER'
        ? party.type === 'SUPPLIER'
        : Math.abs(party.currentBalance) > 0;

    return matchesSearch && matchesType;
  });

  const handleSendReminder = (party: MockParty) => {
    const isReceivable = party.currentBalance >= 0;
    const text = isReceivable
      ? `Dear ${party.name}, gentle reminder from ${business.businessName}. Your outstanding due is ${formatINR(
          party.currentBalance
        )}. Please pay via UPI: ${business.upiId}. Thank you!`
      : `Dear ${party.name}, your credit balance with ${business.businessName} is ${formatINR(
          Math.abs(party.currentBalance)
        )}.`;
    window.open(`https://wa.me/91${party.phone}?text=${encodeURIComponent(text)}`, '_blank');
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
                  Parties &amp; Khata Ledger
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-[#4c3cce]">
                  {parties.length} Contacts
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage customer &amp; vendor ledgers, credit limits &amp; WhatsApp payment recovery
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setPaymentParty(null);
                  setIsPaymentModalOpen(true);
                }}
                className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ArrowDownLeft size={15} className="text-emerald-600" />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => {
                  setEditingParty(null);
                  setIsAddModalOpen(true);
                }}
                className="h-9 px-4 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>+ Add Party</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Receivables (To Collect) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                To Collect (Receivables)
              </span>
              <p className="text-xl font-black text-[#4c3cce] mt-1">
                {formatINR(totalReceivables)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">From credit customers (Dr)</p>
            </div>

            {/* Total Payables (To Pay) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                To Pay (Payables)
              </span>
              <p className="text-xl font-black text-rose-600 mt-1">{formatINR(totalPayables)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">To suppliers &amp; vendors (Cr)</p>
            </div>

            {/* Net Balance */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Net Khata Position
              </span>
              <p className="text-xl font-black text-emerald-600 mt-1">
                {formatINR(totalReceivables - totalPayables)}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                Positive Cash Flow
              </p>
            </div>

            {/* Contacts Count */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Party Breakdown
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {customerCount} <span className="text-xs font-normal text-slate-500">Customers</span> • {supplierCount} <span className="text-xs font-normal text-slate-500">Vendors</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">WhatsApp automated reminders</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search party by name, phone, or GSTIN..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterType === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Contacts
              </button>
              <button
                onClick={() => setFilterType('CUSTOMER')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterType === 'CUSTOMER'
                    ? 'bg-white text-[#4c3cce] shadow-2xs'
                    : 'text-slate-500 hover:text-[#4c3cce]'
                }`}
              >
                Customers ({customerCount})
              </button>
              <button
                onClick={() => setFilterType('SUPPLIER')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterType === 'SUPPLIER'
                    ? 'bg-white text-[#db631a] shadow-2xs'
                    : 'text-slate-500 hover:text-[#db631a]'
                }`}
              >
                Suppliers ({supplierCount})
              </button>
              <button
                onClick={() => setFilterType('DUES')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterType === 'DUES'
                    ? 'bg-rose-500 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                With Outstanding Dues
              </button>
            </div>
          </div>

          {/* Parties Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                    <th className="py-3 px-4">Party Name</th>
                    <th className="py-3 px-3">Contact Details</th>
                    <th className="py-3 px-3">GSTIN / State</th>
                    <th className="py-3 px-3">Credit Limit</th>
                    <th className="py-3 px-3 text-right">Current Balance</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No parties found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredParties.map((party) => {
                      const isReceivable = party.currentBalance >= 0;
                      const hasBalance = party.currentBalance !== 0;
                      const isOverLimit =
                        party.creditLimit > 0 && party.currentBalance > party.creditLimit;

                      return (
                        <tr key={party.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Name & Type */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  party.type === 'CUSTOMER'
                                    ? 'bg-[#ece9fb] text-[#4c3cce]'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {party.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {party.name}
                                </p>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                  {party.type}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3 px-3">
                            <p className="font-mono text-slate-800 font-medium">+91 {party.phone}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {party.address || party.email || '—'}
                            </p>
                          </td>

                          {/* GSTIN */}
                          <td className="py-3 px-3">
                            <p className="font-mono text-slate-700 font-medium">
                              {party.gstin || 'Unregistered'}
                            </p>
                            <span className="text-[10px] text-slate-500">
                              {party.state} ({party.stateCode})
                            </span>
                          </td>

                          {/* Credit Limit */}
                          <td className="py-3 px-3">
                            <p className="font-medium text-slate-700">
                              {formatINR(party.creditLimit)}
                            </p>
                            {isOverLimit && (
                              <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                                <AlertCircle size={11} /> Over Limit
                              </span>
                            )}
                          </td>

                          {/* Balance */}
                          <td className="py-3 px-3 text-right">
                            <p
                              className={`text-sm font-extrabold ${
                                !hasBalance
                                  ? 'text-slate-400'
                                  : isReceivable
                                  ? 'text-[#4c3cce]'
                                  : 'text-rose-600'
                              }`}
                            >
                              {formatINR(Math.abs(party.currentBalance))}
                            </p>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {!hasBalance
                                ? 'Settled'
                                : isReceivable
                                ? 'Receivable (Dr)'
                                : 'Payable (Cr)'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* 1-Click WhatsApp Reminder */}
                              <button
                                onClick={() => handleSendReminder(party)}
                                title="Send WhatsApp Ledger Reminder"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <Share2 size={15} />
                              </button>

                              {/* Ledger Statement */}
                              <button
                                onClick={() => setStatementParty(party)}
                                title="View Statement of Account"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-[#4c3cce] hover:bg-indigo-50 transition-colors"
                              >
                                <FileText size={15} />
                              </button>

                              {/* Quick Payment In/Out */}
                              <button
                                onClick={() => {
                                  setPaymentParty(party);
                                  setIsPaymentModalOpen(true);
                                }}
                                title="Record Payment"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              >
                                <ArrowDownLeft size={15} />
                              </button>

                              {/* Edit Party */}
                              <button
                                onClick={() => {
                                  setEditingParty(party);
                                  setIsAddModalOpen(true);
                                }}
                                title="Edit Party"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>

                              {/* Delete Party */}
                              <button
                                onClick={() => {
                                  if (confirm(`Remove ${party.name} from Khata?`)) {
                                    deleteParty(party.id);
                                  }
                                }}
                                title="Delete"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddPartyModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingParty(null);
        }}
        editParty={editingParty}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentParty(null);
        }}
        defaultParty={paymentParty}
      />

      <PartyStatementModal
        isOpen={Boolean(statementParty)}
        onClose={() => setStatementParty(null)}
        party={statementParty}
        onRecordPayment={(p) => {
          setPaymentParty(p);
          setIsPaymentModalOpen(true);
        }}
      />

      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onInvoiceCreated={(newInv) => addInvoice(newInv)}
      />
    </div>
  );
}
