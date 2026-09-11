import { useState } from 'react';
import type { Supplier } from '../../types';
import { useData } from '../../store/DataContext';
import { X, Edit3, CheckCircle } from 'lucide-react';

interface EditSupplierModalProps {
  supplier: Supplier | null;
  onClose: () => void;
}

export function EditSupplierModal({ supplier, onClose }: EditSupplierModalProps) {
  const { updateSupplier } = useData();

  if (!supplier) return null;

  const [name, setName] = useState(supplier.name);
  const [type, setType] = useState(supplier.type);
  const [contact, setContact] = useState(supplier.contact);
  const [email, setEmail] = useState(supplier.email);
  const [gstin, setGstin] = useState(supplier.gstin);
  const [outstanding, setOutstanding] = useState<number>(supplier.outstanding ?? 0);
  const [address, setAddress] = useState(supplier.address);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateSupplier(supplier.id, {
      name,
      type,
      contact,
      email,
      gstin,
      outstanding: Number(outstanding),
      address,
    });

    onClose();
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
                <Edit3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Edit Supplier / Vendor Record ({supplier.name})</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono hidden sm:block">
                Code: {supplier.uoi || supplier.id}
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

      {/* 2 & 3. Scrollable Form Area with min-height: 0 flex container */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-6">
            {/* Card 1: Vendor Identity & Financials */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  1. Vendor Identity & Classification
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Supplier company name, business type, and current payable</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Supplier Firm Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Category / Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a]"
                  >
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Importer">Importer</option>
                    <option value="Raw Materials">Raw Materials Vendor</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Outstanding Payable (₹)
                  </label>
                  <input
                    type="number"
                    value={outstanding}
                    onChange={(e) => setOutstanding(Number(e.target.value))}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold text-red-600 dark:text-red-400 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Contact & Location */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  2. Contact & GST Location
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Communication coordinates and supplier registered address</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-bold"
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
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-bold uppercase"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Factory / Head Office Address
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm glass-input font-medium resize-none h-24"
                  />
                </div>
              </div>
            </div>
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
              type="submit"
              className="h-10 sm:h-11 px-6 sm:px-8 rounded-xl bg-[#00a631] hover:bg-[#008a29] text-white text-sm font-extrabold shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Update Supplier Record</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
