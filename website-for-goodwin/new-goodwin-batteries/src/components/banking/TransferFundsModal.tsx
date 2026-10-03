'use client';

import React, { useState } from 'react';
import { X, ArrowRightLeft, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TransferFundsModal({ isOpen, onClose }: TransferFundsModalProps) {
  const { bankAccounts, transferFunds } = useApp();

  const [fromAccount, setFromAccount] = useState('CASH');
  const [toAccount, setToAccount] = useState(bankAccounts[0]?.id || 'CASH');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccount === toAccount) {
      alert('Source and destination accounts must be different');
      return;
    }
    if (amount <= 0) {
      alert('Please enter an amount greater than 0');
      return;
    }

    transferFunds(fromAccount, toAccount, Number(amount), notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#4c3cce] flex items-center justify-center font-bold">
              <ArrowRightLeft size={16} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Transfer Funds (Contra Entry)</h3>
              <p className="text-[10px] text-slate-500">Deposit cash or transfer between accounts</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transfer From *</label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              >
                <option value="CASH">Cash in Hand</option>
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transfer To *</label>
              <select
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              >
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName}
                  </option>
                ))}
                <option value="CASH">Cash in Hand</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
            <input
              type="number"
              min="1"
              required
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="₹ 0.00"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-[#4c3cce]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Remarks / Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cash deposit to HDFC Bank branch"
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
              className="px-5 py-2 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Check size={15} />
              <span>Confirm Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
