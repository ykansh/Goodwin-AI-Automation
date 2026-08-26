import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { CustomerType } from '../../types';
import { X, UserPlus, CheckCircle } from 'lucide-react';

interface NewCustomerModalProps {
  onClose: () => void;
}

export function NewCustomerModal({ onClose }: NewCustomerModalProps) {
  const { addCustomer, settings } = useData();

  const [name, setName] = useState('');
  const [type, setType] = useState<CustomerType>('dealer');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [creditLimit, setCreditLimit] = useState(300000);
  const [address, setAddress] = useState('');
  const [salesperson, setSalesperson] = useState(settings.battery_configs.salespersons[0] || 'Deepak Singh');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addCustomer({
      name,
      type,
      contact,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@batterydealer.com`,
      gstin: gstin || '23AABCX9988Z1',
      credit_limit: Number(creditLimit),
      address: address || 'Indore, Madhya Pradesh',
      salesperson,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg glass-strong rounded-3xl shadow-2xl border border-white/70 overflow-hidden my-8 animate-scale-in">
        <div className="p-6 bg-gradient-to-r from-[#3a3b39] to-[#252624] text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#cde06c]" /> Add Customer / Dealer
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              System will assign UOI (Unified Customer ID) automatically
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">Customer / Firm Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Battery Store"
              className="w-full glass-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Category / Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CustomerType)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70 capitalize"
              >
                <option value="dealer">Dealer</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer</option>
                <option value="oem">OEM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Credit Limit (₹)</label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Contact Phone</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="9876543210"
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">GSTIN Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="23AABCA1234A1Z5"
                className="w-full glass-input px-3 py-2 text-xs font-bold uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="firm@domain.com"
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3a3b39] mb-1">Assigned Salesperson</label>
              <select
                value={salesperson}
                onChange={(e) => setSalesperson(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70"
              >
                {settings.battery_configs.salespersons.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a3b39] mb-1">Full Office / Shop Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address details..."
              className="w-full glass-input px-3 py-2 text-xs font-bold h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#00a631] text-white text-xs font-extrabold rounded-xl shadow hover:bg-[#008a29] cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Save Customer Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
