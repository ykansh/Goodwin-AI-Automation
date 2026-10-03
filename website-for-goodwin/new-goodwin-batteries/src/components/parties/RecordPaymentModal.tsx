'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Check, Landmark, QrCode, Banknote } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MockParty } from '@/lib/mockData';
import { formatINR } from '@/lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultParty?: MockParty | null;
  defaultType?: 'PAYMENT_IN' | 'PAYMENT_OUT';
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  defaultParty,
  defaultType = 'PAYMENT_IN',
}: RecordPaymentModalProps) {
  const { parties, recordPayment } = useApp();

  const [type, setType] = useState<'PAYMENT_IN' | 'PAYMENT_OUT'>(defaultType);
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CASH' | 'BANK_TRANSFER' | 'CHEQUE'>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (defaultParty) {
      setSelectedPartyId(defaultParty.id);
      setType(defaultParty.type === 'CUSTOMER' ? 'PAYMENT_IN' : 'PAYMENT_OUT');
      setAmount(Math.abs(defaultParty.currentBalance));
    } else if (parties.length > 0) {
      setSelectedPartyId(parties[0].id);
      setAmount(Math.abs(parties[0].currentBalance));
    }
  }, [defaultParty, parties, isOpen]);

  if (!isOpen) return null;

  const currentParty = parties.find((p) => p.id === selectedPartyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyId || amount <= 0) {
      alert('Please select a party and enter an amount greater than 0');
      return;
    }

    recordPayment({
      partyId: selectedPartyId,
      partyName: currentParty?.name || 'Party',
      type,
      amount: Number(amount),
      paymentMode,
      referenceNumber: referenceNumber || `${paymentMode}-${Date.now().toString().slice(-6)}`,
      date,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                type === 'PAYMENT_IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {type === 'PAYMENT_IN' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {type === 'PAYMENT_IN' ? 'Record Payment In (Receipt)' : 'Record Payment Out (Payout)'}
              </h3>
              <p className="text-[10px] text-slate-500">Instant Khata ledger update &amp; receipt entry</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Type Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('PAYMENT_IN')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                type === 'PAYMENT_IN' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Payment In (Received)
            </button>
            <button
              type="button"
              onClick={() => setType('PAYMENT_OUT')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                type === 'PAYMENT_OUT' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Payment Out (Paid)
            </button>
          </div>

          {/* Party Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Customer / Vendor *</label>
            <select
              value={selectedPartyId}
              onChange={(e) => {
                setSelectedPartyId(e.target.value);
                const p = parties.find((party) => party.id === e.target.value);
                if (p) {
                  setAmount(Math.abs(p.currentBalance));
                }
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
            >
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.currentBalance >= 0 ? `Due: ${formatINR(p.currentBalance)}` : `Adv: ${formatINR(Math.abs(p.currentBalance))}`})
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              >
                <option value="UPI">UPI (GPay / PhonePe)</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
          </div>

          {/* Reference Number & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reference / UTR / Cheque #</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Optional ref no."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared bill invoice GB-26/101"
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
              className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-xs transition-all active:scale-[0.98] ${
                type === 'PAYMENT_IN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Save {type === 'PAYMENT_IN' ? 'Receipt' : 'Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
