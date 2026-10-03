'use client';

import React, { useState } from 'react';
import { X, Receipt, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_EXPENSE_CATEGORIES = [
  'Shop / Warehouse Rent',
  'Electricity & Utilities',
  'Logistics & Battery Freight',
  'Staff Salary & Wages',
  'Tea & Refreshments',
  'Office Stationery & Supplies',
  'Repair & Maintenance',
  'Marketing & Advertising',
  'Other Operational Expense',
];

export default function AddExpenseModal({ isOpen, onClose }: AddExpenseModalProps) {
  const { addExpense, bankAccounts } = useApp();

  const [category, setCategory] = useState(COMMON_EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<number>(0);
  const [paidFrom, setPaidFrom] = useState('Cash in Hand');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE'>('CASH');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter an expense amount greater than 0');
      return;
    }

    addExpense({
      category,
      amount: Number(amount),
      paidFrom,
      paymentMode,
      date,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Receipt size={17} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Record Business Expense</h3>
              <p className="text-[10px] text-slate-500">Track overheads, utilities &amp; operational costs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
            >
              {COMMON_EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="₹ 0.00"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Paid From *</label>
              <select
                value={paidFrom}
                onChange={(e) => {
                  setPaidFrom(e.target.value);
                  if (e.target.value === 'Cash in Hand') setPaymentMode('CASH');
                  else setPaymentMode('UPI');
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              >
                <option value="Cash in Hand">Cash in Hand</option>
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.bankName}>
                    {b.bankName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT)</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Bill Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid electricity bill via PhonePe"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Check size={15} />
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
