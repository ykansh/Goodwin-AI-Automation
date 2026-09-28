import { useState } from 'react';
import type { CustomerType } from '../../types';
import { useSettings } from '../../hooks/queries';
import { useAddCustomer } from '../../hooks/mutations';
import { 
  CREDIT_TERM_OPTIONS, 
  PAYMENT_CYCLE_OPTIONS, 
  ORDER_CYCLE_OPTIONS, 
  MATERIAL_RECEIVED_TIME_OPTIONS 
} from '../../utils/creditTermsStorage';
import { X, UserPlus, CheckCircle, Clock } from 'lucide-react';

interface NewCustomerModalProps {
  onClose: () => void;
}

export function NewCustomerModal({ onClose }: NewCustomerModalProps) {
  const { data: settings } = useSettings();
  const addCustomerMutation = useAddCustomer();

  const [name, setName] = useState('');
  const [type, setType] = useState<CustomerType>('dealer');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [creditLimit, setCreditLimit] = useState(300000);
  const [outstanding, setOutstanding] = useState<number | string>('');
  const [address, setAddress] = useState('');
  const [salesperson, setSalesperson] = useState(settings?.battery_configs?.salespersons?.[0] || 'Deepak Singh');

  // Credit & Payment Tracking Details
  const [fixedCreditTerms, setFixedCreditTerms] = useState('30 Days Net');
  const [paymentCycle, setPaymentCycle] = useState('15/30 Days');
  const [orderCycle, setOrderCycle] = useState('Weekly');
  const [materialReceivedTime, setMaterialReceivedTime] = useState('Within 3-5 Days');
  const [paymentCommitmentDate, setPaymentCommitmentDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addCustomerMutation.mutate({
      name,
      type,
      contact,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@batterydealer.com`,
      gstin: gstin || '23AABCX9988Z1',
      credit_limit: Number(creditLimit),
      outstanding: Number(outstanding || 0),
      address: address || 'Indore, Madhya Pradesh',
      salesperson,
      fixed_credit_terms: fixedCreditTerms,
      payment_cycle: paymentCycle,
      order_cycle: orderCycle,
      material_received_time: materialReceivedTime,
      payment_commitment_date: paymentCommitmentDate || undefined,
    });

    onClose();
  };

  if (!settings) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#f8faf8] dark:bg-[#121412] h-full w-full animate-fade-in">
      {/* 4. Page Header (Height 56-70px, max-w-1200px aligned) */}
      <header className="shrink-0 h-16 sm:h-[68px] bg-white dark:bg-[#1a1d1a] border-b border-gray-200 dark:border-[#2d302d] px-4 sm:px-6 lg:px-8 shadow-xs flex items-center z-10">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-1.5 text-sm font-bold"
            >
              <span>← Back</span>
            </button>
            <div className="h-5 w-px bg-gray-200 dark:bg-[#2d302d]" />
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[#3a3b39] dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Add New Customer / Dealer</span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                System will assign UOI (Unified Customer ID) automatically
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2 & 3. Scrollable Form Area with min-height: 0 flex container */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="w-full max-w-[1200px] mx-auto space-y-6 pb-6">
            {/* Card 1: Identity & Financials */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-md p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  1. Business Identity & Financial Limits
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Firm trade name, category, and credit management</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Customer / Firm Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Battery Store"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Category / Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CustomerType)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a] capitalize"
                  >
                    <option value="dealer">Dealer</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                    <option value="oem">OEM Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Opening Outstanding Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={outstanding}
                    onChange={(e) => setOutstanding(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold text-red-600 dark:text-red-400 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Assigned Sales Representative
                  </label>
                  <select
                    value={salesperson}
                    onChange={(e) => setSalesperson(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold bg-white dark:bg-[#1a1d1a]"
                  >
                    {(settings.battery_configs?.salespersons || []).map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Card 2: Credit Terms & Payment Tracking */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-md p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>2. Credit Terms &amp; Payment Cycle Details</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fixed credit duration, payment cadence, order frequency &amp; commitment date</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Fixed Credit Terms <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={fixedCreditTerms}
                    onChange={(e) => setFixedCreditTerms(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  >
                    {CREDIT_TERM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Payment Cycle (Pattern) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentCycle}
                    onChange={(e) => setPaymentCycle(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  >
                    {PAYMENT_CYCLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Order Cycle (Frequency) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={orderCycle}
                    onChange={(e) => setOrderCycle(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  >
                    {ORDER_CYCLE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Material Received Time
                  </label>
                  <select
                    value={materialReceivedTime}
                    onChange={(e) => setMaterialReceivedTime(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold"
                  >
                    {MATERIAL_RECEIVED_TIME_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Payment Commitment Date
                  </label>
                  <input
                    type="date"
                    value={paymentCommitmentDate}
                    onChange={(e) => setPaymentCommitmentDate(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Contact & Location */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-md p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  3. Contact &amp; Billing Location
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">GST details, communication channel, and delivery address</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Primary Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="9876543210"
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
                    placeholder="23AABCA1234A1Z5"
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
                    placeholder="firm@domain.com"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Office / Shop Address
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop #, Street, Commercial Complex, City, State..."
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
              className="h-10 sm:h-11 px-5 rounded-md border border-gray-300 dark:border-[#2d302d] text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 sm:h-11 px-6 sm:px-8 rounded-md bg-[#00a631] hover:bg-[#008a29] text-white text-sm font-extrabold shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Customer Record</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
