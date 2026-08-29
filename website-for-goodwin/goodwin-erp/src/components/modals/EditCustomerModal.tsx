import { useState } from 'react';
import type { Customer, CustomerType } from '../../types';
import { useData } from '../../store/DataContext';
import { X, Edit3, CheckCircle } from 'lucide-react';

interface EditCustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export function EditCustomerModal({ customer, onClose }: EditCustomerModalProps) {
  const { updateCustomer, settings } = useData();

  if (!customer) return null;

  const [name, setName] = useState(customer.name);
  const [type, setType] = useState<CustomerType>(customer.type);
  const [contact, setContact] = useState(customer.contact);
  const [email, setEmail] = useState(customer.email);
  const [gstin, setGstin] = useState(customer.gstin);
  const [creditLimit, setCreditLimit] = useState(customer.credit_limit);
  const [address, setAddress] = useState(customer.address);
  const [salesperson, setSalesperson] = useState(customer.salesperson || settings.battery_configs.salespersons[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateCustomer(customer.id, {
      name,
      type,
      contact,
      email,
      gstin,
      credit_limit: Number(creditLimit),
      address,
      salesperson,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl glass-strong rounded-3xl shadow-2xl border border-gray-200 dark:border-[#2d302d] overflow-hidden my-auto animate-scale-in">
        <div className="p-6 bg-gradient-to-r from-[#3a3b39] to-[#252624] text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold tracking-wide flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-[#cde06c]" /> Edit Customer / Dealer Record
            </h2>
            <p className="text-xs text-gray-300 mt-0.5 font-mono">
              UOI ID: {customer.uoi}
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
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              Customer / Firm Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input px-3 py-2 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                Category / Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CustomerType)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70 dark:bg-gray-800 capitalize"
              >
                <option value="dealer">Dealer</option>
                <option value="distributor">Distributor</option>
                <option value="retailer">Retailer</option>
                <option value="oem">OEM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                Credit Limit (₹)
              </label>
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
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                Assigned Salesperson
              </label>
              <select
                value={salesperson}
                onChange={(e) => setSalesperson(e.target.value)}
                className="w-full glass-input px-3 py-2 text-xs font-bold bg-white/70 dark:bg-gray-800"
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
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
              Full Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full glass-input px-3 py-2 text-xs font-bold h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#00a631] text-white text-xs font-extrabold rounded-xl shadow hover:bg-[#008a29] cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Save Customer Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
