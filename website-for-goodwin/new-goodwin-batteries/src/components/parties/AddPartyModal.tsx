'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Building, Phone, Mail, FileText, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MockParty } from '@/lib/mockData';
import { GST_STATES } from '@/lib/constants';

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  editParty?: MockParty | null;
}

export default function AddPartyModal({ isOpen, onClose, editParty }: AddPartyModalProps) {
  const { addParty, updateParty } = useApp();

  const [type, setType] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [stateCode, setStateCode] = useState('27');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(100000);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [balanceType, setBalanceType] = useState<'RECEIVE' | 'PAY'>('RECEIVE');

  useEffect(() => {
    if (editParty) {
      setType(editParty.type);
      setName(editParty.name);
      setPhone(editParty.phone);
      setEmail(editParty.email || '');
      setGstin(editParty.gstin || '');
      setStateCode(editParty.stateCode || '27');
      setAddress(editParty.address || '');
      setCreditLimit(editParty.creditLimit || 0);
      setOpeningBalance(Math.abs(editParty.currentBalance));
      setBalanceType(editParty.currentBalance >= 0 ? 'RECEIVE' : 'PAY');
    } else {
      setType('CUSTOMER');
      setName('');
      setPhone('');
      setEmail('');
      setGstin('');
      setStateCode('27');
      setAddress('');
      setCreditLimit(100000);
      setOpeningBalance(0);
      setBalanceType('RECEIVE');
    }
  }, [editParty, isOpen]);

  if (!isOpen) return null;

  const handleGstinChange = (val: string) => {
    const uppercaseVal = val.toUpperCase();
    setGstin(uppercaseVal);
    if (uppercaseVal.length >= 2) {
      const code = uppercaseVal.slice(0, 2);
      const stateObj = GST_STATES.find((s) => s.code === code);
      if (stateObj) {
        setStateCode(code);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a party name');
      return;
    }

    const stateObj = GST_STATES.find((s) => s.code === stateCode);
    const finalBalance =
      balanceType === 'RECEIVE' ? Number(openingBalance) : -Math.abs(Number(openingBalance));

    if (editParty) {
      updateParty(editParty.id, {
        type,
        name,
        phone,
        email,
        gstin,
        state: stateObj?.name || 'Maharashtra',
        stateCode,
        address,
        creditLimit: Number(creditLimit),
        currentBalance: finalBalance,
      });
    } else {
      addParty({
        type,
        name,
        phone,
        email,
        gstin,
        state: stateObj?.name || 'Maharashtra',
        stateCode,
        address,
        creditLimit: Number(creditLimit),
        currentBalance: finalBalance,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4c3cce] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <UserPlus size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base">
                {editParty ? 'Edit Party Details' : 'Add Customer / Vendor (Khata)'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Setup ledger accounts, GSTIN verification &amp; WhatsApp reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Party Type Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('CUSTOMER')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                type === 'CUSTOMER'
                  ? 'bg-white text-[#4c3cce] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Customer (Buyer / Debtor)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('SUPPLIER');
                setBalanceType('PAY');
              }}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                type === 'SUPPLIER'
                  ? 'bg-white text-[#db631a] shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Supplier (Vendor / Creditor)
            </button>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {type === 'CUSTOMER' ? 'Customer / Company Name *' : 'Vendor / Company Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Electricals"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Number (WhatsApp Enabled) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>
          </div>

          {/* GSTIN & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => handleGstinChange(e.target.value)}
                placeholder="e.g. 27ABCDE1234F1Z5"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State / Place of Supply</label>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              >
                {GST_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop No, Street, City"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="billing@party.com"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#4c3cce]"
              />
            </div>
          </div>

          {/* Opening Balance & Credit Limit */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase text-[#4c3cce]">
              Khata Ledger &amp; Credit Limits
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Opening Balance */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opening Balance (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(Number(e.target.value))}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                  />
                  <select
                    value={balanceType}
                    onChange={(e) => setBalanceType(e.target.value as any)}
                    className="w-32 bg-white border border-slate-200 rounded-lg px-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="RECEIVE">To Receive (Dr)</option>
                    <option value="PAY">To Pay (Cr)</option>
                  </select>
                </div>
              </div>

              {/* Credit Limit */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Credit Limit Threshold (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#4c3cce]"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Warns cashier if customer dues exceed this amount
                </p>
              </div>
            </div>
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
              <Check size={16} />
              <span>{editParty ? 'Update Party' : 'Save to Khata'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
