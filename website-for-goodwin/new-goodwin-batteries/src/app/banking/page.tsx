'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AddBankAccountModal from '@/components/banking/AddBankAccountModal';
import AddExpenseModal from '@/components/banking/AddExpenseModal';
import TransferFundsModal from '@/components/banking/TransferFundsModal';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/utils';
import {
  Landmark,
  Banknote,
  Receipt,
  Plus,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  Calendar,
  Wallet,
  Building,
  CreditCard,
} from 'lucide-react';

export default function BankingPage() {
  const { bankAccounts, expenses, cashInHand, payments, invoices, addInvoice } = useApp();

  const [activeTab, setActiveTab] = useState<'DAYBOOK' | 'EXPENSES'>('DAYBOOK');
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Financial Calculations
  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + b.balance, 0);
  const totalLiquidity = cashInHand + totalBankBalance;
  const totalMonthlyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Daybook Transactions (Payments In, Payments Out, and Expenses)
  interface DaybookEntry {
    id: string;
    date: string;
    title: string;
    type: 'IN' | 'OUT';
    mode: string;
    source: string;
    amount: number;
    refNo: string;
  }

  const daybookEntries: DaybookEntry[] = [];

  payments.forEach((p) => {
    daybookEntries.push({
      id: p.id,
      date: p.date,
      title: `${p.type === 'PAYMENT_IN' ? 'Customer Receipt' : 'Vendor Payment'} - ${p.partyName}`,
      type: p.type === 'PAYMENT_IN' ? 'IN' : 'OUT',
      mode: p.paymentMode,
      source: p.paymentMode === 'CASH' ? 'Cash in Hand' : 'Bank',
      amount: p.amount,
      refNo: p.referenceNumber,
    });
  });

  expenses.forEach((e) => {
    daybookEntries.push({
      id: e.id,
      date: e.date,
      title: `Expense: ${e.category}`,
      type: 'OUT',
      mode: e.paymentMode,
      source: e.paidFrom,
      amount: e.amount,
      refNo: e.notes || 'Expense Voucher',
    });
  });

  daybookEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                  Cash &amp; Bank Accounts
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-[#4c3cce]">
                  {bankAccounts.length} Connected Banks
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage bank accounts, daybook cash register, operational expenses &amp; fund transfers
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ArrowRightLeft size={14} />
                <span>Transfer Funds</span>
              </button>

              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="h-9 px-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Receipt size={14} />
                <span>+ Add Expense</span>
              </button>

              <button
                onClick={() => setIsBankModalOpen(true)}
                className="h-9 px-4 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <Plus size={16} />
                <span>+ Add Bank</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Liquidity */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Total Available Balance
                </span>
                <Wallet size={16} className="text-[#4c3cce]" />
              </div>
              <p className="text-xl font-black text-[#4c3cce] mt-1">
                {formatINR(totalLiquidity)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Combined Cash + Bank funds</p>
            </div>

            {/* Cash in Hand */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Cash in Hand (Daybook)
                </span>
                <Banknote size={16} className="text-emerald-600" />
              </div>
              <p className="text-xl font-black text-emerald-600 mt-1">{formatINR(cashInHand)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Physical cash drawer balance</p>
            </div>

            {/* Bank Accounts Total */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Total in Bank Accounts
                </span>
                <Landmark size={16} className="text-indigo-600" />
              </div>
              <p className="text-xl font-black text-slate-900 mt-1">
                {formatINR(totalBankBalance)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Across {bankAccounts.length} bank accounts</p>
            </div>

            {/* Total Expenses */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Monthly Expenses
                </span>
                <TrendingDown size={16} className="text-rose-500" />
              </div>
              <p className="text-xl font-black text-rose-600 mt-1">
                {formatINR(totalMonthlyExpenses)}
              </p>
              <p className="text-[10px] text-rose-500 font-medium mt-0.5">
                {expenses.length} overhead vouchers
              </p>
            </div>
          </div>

          {/* Connected Bank Accounts Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Landmark size={16} className="text-[#4c3cce]" />
                <span>Bank Accounts &amp; Cheque Books</span>
              </h3>
              <button
                onClick={() => setIsBankModalOpen(true)}
                className="text-xs text-[#4c3cce] font-semibold hover:underline"
              >
                + Link Another Bank
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Cash Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100">
                      Physical Register
                    </span>
                    <Banknote size={20} className="text-emerald-100" />
                  </div>
                  <h4 className="font-extrabold text-base mt-1">Cash in Hand</h4>
                  <p className="text-[10px] text-emerald-100 font-mono">Store Counter Drawer</p>
                </div>
                <div className="pt-4 border-t border-emerald-400/50 mt-4 flex items-baseline justify-between">
                  <span className="text-xs text-emerald-100">Available:</span>
                  <span className="text-xl font-black">{formatINR(cashInHand)}</span>
                </div>
              </div>

              {/* Bank Cards */}
              {bankAccounts.map((bank) => (
                <div
                  key={bank.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4c3cce] flex items-center justify-center font-bold">
                          <Building size={15} />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{bank.bankName}</h4>
                      </div>
                      {bank.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-[#4c3cce] uppercase">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                      {bank.accountName}
                    </p>
                    <p className="text-xs font-mono font-semibold text-slate-800 mt-1">
                      A/C: •••• {bank.accountNumber.slice(-4)}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">IFSC: {bank.ifsc}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-4 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Balance:</span>
                    <span className="text-lg font-black text-slate-900">
                      {formatINR(bank.balance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Tabs (Daybook vs Expenses) */}
          <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold pt-2">
            <button
              onClick={() => setActiveTab('DAYBOOK')}
              className={`pb-2.5 transition-colors flex items-center gap-1.5 border-b-2 ${
                activeTab === 'DAYBOOK'
                  ? 'border-[#4c3cce] text-[#4c3cce]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar size={15} />
              <span>Daybook &amp; Bank Ledger</span>
            </button>
            <button
              onClick={() => setActiveTab('EXPENSES')}
              className={`pb-2.5 transition-colors flex items-center gap-1.5 border-b-2 ${
                activeTab === 'EXPENSES'
                  ? 'border-[#4c3cce] text-[#4c3cce]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt size={15} />
              <span>Operational Expenses ({expenses.length})</span>
            </button>
          </div>

          {/* Tab 1: Daybook View */}
          {activeTab === 'DAYBOOK' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs">Real-Time Daily Cashbook</h3>
                  <p className="text-[11px] text-slate-500">
                    All incoming customer payments, vendor disbursements &amp; overheads
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-3">Transaction Description</th>
                      <th className="py-2.5 px-3">Account / Source</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3">Reference #</th>
                      <th className="py-2.5 px-4 text-right text-emerald-700">Money In (+)</th>
                      <th className="py-2.5 px-4 text-right text-rose-700">Money Out (-)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {daybookEntries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No transactions recorded today.
                        </td>
                      </tr>
                    ) : (
                      daybookEntries.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-500">{row.date}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                            {row.type === 'IN' ? (
                              <ArrowDownLeft size={14} className="text-emerald-600 shrink-0" />
                            ) : (
                              <ArrowUpRight size={14} className="text-rose-600 shrink-0" />
                            )}
                            <span className="truncate max-w-xs">{row.title}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">{row.source}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[10px] text-slate-700">
                              {row.mode}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-400">{row.refNo}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                            {row.type === 'IN' ? formatINR(row.amount) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                            {row.type === 'OUT' ? formatINR(row.amount) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Tab 2: Expenses Log */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs">Operational Expenses</h3>
                  <p className="text-[11px] text-slate-500">
                    Detailed record of rent, salaries, utilities, tea &amp; logistics
                  </p>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} />
                  <span>+ New Expense</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Paid From</th>
                      <th className="py-2.5 px-3">Payment Mode</th>
                      <th className="py-2.5 px-3">Remarks / Notes</th>
                      <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-500">{exp.date}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{exp.category}</td>
                        <td className="py-3 px-3 text-slate-700 font-medium">{exp.paidFrom}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[10px] text-slate-700">
                            {exp.paymentMode}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{exp.notes || '—'}</td>
                        <td className="py-3 px-4 text-right font-black text-rose-600">
                          {formatINR(exp.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddBankAccountModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
      />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onInvoiceCreated={(newInv) => addInvoice(newInv)}
      />
    </div>
  );
}
