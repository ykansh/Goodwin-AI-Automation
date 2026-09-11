import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import type { Lead, CustomerType } from '../../types';
import { X, Building2, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess?: () => void;
}

export function ConvertLeadModal({ isOpen, onClose, lead, onSuccess }: ConvertLeadModalProps) {
  const { customers, convertLeadToParty } = useData();
  const { setMode } = useAuth();

  const [partyName, setPartyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [partyType, setPartyType] = useState<CustomerType>('dealer');
  const [gstin, setGstin] = useState('');
  const [linkMode, setLinkMode] = useState<'create' | 'link'>('create');

  if (!isOpen || !lead) return null;

  // Check if existing customer has same phone
  const cleanPhone = (phone || lead.phone).replace(/\D/g, '');
  const existingParty = cleanPhone.length >= 7
    ? customers.find((c) => c.contact.replace(/\D/g, '').includes(cleanPhone))
    : null;

  const handleConvert = () => {
    if (existingParty && linkMode === 'link') {
      convertLeadToParty(lead.id, {
        name: existingParty.name,
        contact: existingParty.contact,
        email: existingParty.email,
        address: existingParty.address,
        type: existingParty.type,
        gstin: existingParty.gstin,
        linkExistingId: existingParty.id,
      });
    } else {
      convertLeadToParty(lead.id, {
        name: partyName.trim() || lead.company_name || lead.name,
        contact: phone.trim() || lead.phone,
        email: email.trim() || lead.email,
        address: address.trim() || 'Address not provided',
        type: partyType,
        gstin: gstin.trim(),
      });
    }

    if (onSuccess) onSuccess();
    onClose();

    // Show toast with action to view party in Ledger-Pro
    toast(
      (t) => (
        <div className="flex items-center gap-3 text-xs font-extrabold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Lead converted successfully!</span>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t.id);
              setMode('ledger');
            }}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
          >
            View Parties
          </button>
        </div>
      ),
      { duration: 5000 }
    );
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#f8faf8] dark:bg-[#121412] h-full w-full animate-fade-in">
      {/* 4. Page Header (Height 56-70px, max-w-1200px aligned) */}
      <header className="shrink-0 h-16 sm:h-[68px] bg-white dark:bg-[#1a1d1a] border-b border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 shadow-xs flex items-center z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5 text-sm font-bold"
            >
              <span>← Back</span>
            </button>
            <div className="h-5 w-px bg-gray-200 dark:bg-[#2d302d]" />
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#3a3b39] dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Convert Lead to Party Account</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Transfer lead profile directly to Goodwin ERP customer ledger directory
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2 & 3. Scrollable Area with min-height: 0 flex container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-6">
          {/* Explanation Banner */}
          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            This lead will be promoted to active <strong className="text-gray-900 dark:text-white font-bold">Customer Parties</strong> and unlocked for sales orders, GST invoices, and financial ledger tracking.
          </div>

          {/* Duplicate warning if applicable */}
          {existingParty && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-sm">This phone number already exists in Parties.</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    Matched Party: <span className="font-bold">{existingParty.name}</span> ({existingParty.uoi || existingParty.id}, {existingParty.type.toUpperCase()})
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1 text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="linkOption"
                    checked={linkMode === 'link'}
                    onChange={() => setLinkMode('link')}
                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Link to Existing Party ({existingParty.uoi || existingParty.id})</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 dark:text-gray-300">
                  <input
                    type="radio"
                    name="linkOption"
                    checked={linkMode === 'create'}
                    onChange={() => setLinkMode('create')}
                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Create New Party Record</span>
                </label>
              </div>
            </div>
          )}

          {/* Form fields (disabled if linking existing) */}
          {(!existingParty || linkMode === 'create') && (
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  New Customer Account Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Verify and complete dealer profile credentials for ledger master</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Party Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma / Gupta Auto"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Party Type
                  </label>
                  <select
                    value={partyType}
                    onChange={(e) => setPartyType(e.target.value as any)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a]"
                  >
                    <option value="dealer">Dealer</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                    <option value="oem">OEM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@firm.com"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="e.g. 23AABCS5678B2Z6"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-bold uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Registered Address
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop #, Street, City, State"
                    className="w-full p-3.5 text-sm glass-input font-medium resize-none min-h-[90px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 10, 11, 12. Sticky Action Bar */}
      <div className="shrink-0 bg-white dark:bg-[#1a1d1a] border-t border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="h-10 sm:h-11 px-5 rounded-xl border border-gray-300 dark:border-[#2d302d] text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConvert}
            className="h-10 sm:h-11 px-6 sm:px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <span>Convert to Party</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
