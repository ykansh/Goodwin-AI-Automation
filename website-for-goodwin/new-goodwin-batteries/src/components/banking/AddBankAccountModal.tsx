'use client';

import React, { useState } from 'react';
import { X, Landmark, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface AddBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBankAccountModal({ isOpen, onClose }: AddBankAccountModalProps) {
  const { addBankAccount } = useApp();

  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [isDefault, setIsDefault] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || !ifsc) {
      alert('Please fill in Account Number and IFSC Code');
      return;
    }

    addBankAccount({
      bankName,
      accountName: accountName || `${bankName} Current A/c`,
      accountNumber,
      ifsc: ifsc.toUpperCase(),
      balance: Number(openingBalance),
      isDefault,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#4c3cce] flex items-center justify-center font-bold">
              <Landmark size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Add Bank Account</h3>
              <p className="text-[10px] text-slate-500">Connect bank ledger for automated accounting</p>
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
            <label className="block font-semibold text-slate-700 mb-1">Select Bank *</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
            >
              <option value="HDFC Bank">HDFC Bank</option>
              <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
              <option value="ICICI Bank">ICICI Bank</option>
              <option value="Axis Bank">Axis Bank</option>
              <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              <option value="Bank of Baroda">Bank of Baroda</option>
              <option value="Punjab National Bank">Punjab National Bank</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Display Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Goodwin Primary Current Account"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Number *</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter bank account number"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4c3cce]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code *</label>
              <input
                type="text"
                required
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC0000123"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono uppercase text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Opening Balance (₹)</label>
              <input
                type="number"
                min="0"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Set as Primary Account</p>
              <p className="text-[10px] text-slate-400">Printed on invoice bank details</p>
            </div>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-[#4c3cce] rounded accent-[#4c3cce]"
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
              <span>Save Bank Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
