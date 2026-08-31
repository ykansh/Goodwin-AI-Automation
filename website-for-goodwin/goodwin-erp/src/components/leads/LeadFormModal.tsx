import { useState, useEffect } from 'react';
import { useData } from '../../store/DataContext';
import type { Lead, LeadSource, LeadStage } from '../../types';
import { X, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLead?: Lead | null; // If provided, edit mode
}

const SOURCES: LeadSource[] = [
  'WhatsApp',
  'Phone',
  'Website',
  'Referral',
  'Walk-in',
  'Existing Customer',
  'Other',
];

const STAGES: LeadStage[] = [
  'New',
  'Contacted',
  'Follow-up',
  'Qualified',
  'Won',
  'Lost',
];

const ASSIGNEES = [
  'Deepak Singh',
  'Priya Sharma',
  'Rajesh Kumar',
  'Vikram Singh',
  'Admin',
];

export function LeadFormModal({ isOpen, onClose, initialLead }: LeadFormModalProps) {
  const { addLead, updateLead, leads, customers } = useData();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('WhatsApp');
  const [stage, setStage] = useState<LeadStage>('New');
  const [expectedValue, setExpectedValue] = useState<string>('');
  const [requirement, setRequirement] = useState('');
  const [assignedTo, setAssignedTo] = useState(ASSIGNEES[0]);
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [nextFollowupTime, setNextFollowupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);

  // Sync initial data if editing
  useEffect(() => {
    if (initialLead) {
      setName(initialLead.name || '');
      setCompanyName(initialLead.company_name || '');
      setPhone(initialLead.phone || '');
      setWhatsapp(initialLead.whatsapp || '');
      setEmail(initialLead.email || '');
      setSource(initialLead.source || 'WhatsApp');
      setStage(initialLead.stage || 'New');
      setExpectedValue(initialLead.expected_value ? String(initialLead.expected_value) : '');
      setRequirement(initialLead.requirement || '');
      setAssignedTo(initialLead.assigned_to || ASSIGNEES[0]);
      setNextFollowupDate(initialLead.next_followup_date || '');
      setNextFollowupTime(initialLead.next_followup_time || '');
      setNotes(initialLead.notes || '');
      setSameAsPhone(initialLead.phone === initialLead.whatsapp);
    } else {
      setName('');
      setCompanyName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setSource('WhatsApp');
      setStage('New');
      setExpectedValue('');
      setRequirement('');
      setAssignedTo(ASSIGNEES[0]);
      setNextFollowupDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Tomorrow default
      setNextFollowupTime('11:00 AM');
      setNotes('');
      setSameAsPhone(true);
    }
  }, [initialLead, isOpen]);

  if (!isOpen) return null;

  // Duplicate phone warning check
  const cleanPhone = phone.trim().replace(/\D/g, '');
  const existingLeadPhone = cleanPhone.length >= 7
    ? leads.find((l) => l.id !== initialLead?.id && l.phone.replace(/\D/g, '').includes(cleanPhone))
    : null;
  const existingPartyPhone = cleanPhone.length >= 7
    ? customers.find((c) => c.contact.replace(/\D/g, '').includes(cleanPhone))
    : null;

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() && !companyName.trim()) {
      toast.error('Please enter a Lead Name or Company Name');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter a valid Phone number');
      return;
    }

    const leadPayload = {
      name: name.trim(),
      company_name: companyName.trim() || name.trim(),
      phone: phone.trim(),
      whatsapp: (sameAsPhone ? phone.trim() : whatsapp.trim()) || phone.trim(),
      email: email.trim(),
      source,
      stage,
      expected_value: Number(expectedValue) || 0,
      requirement: requirement.trim(),
      assigned_to: assignedTo,
      next_followup_date: nextFollowupDate,
      next_followup_time: nextFollowupTime,
      notes: notes.trim(),
    };

    if (initialLead) {
      updateLead(initialLead.id, leadPayload);
    } else {
      addLead(leadPayload);
    }

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
                <span>{initialLead ? 'Edit Lead' : 'Add New Lead'}</span>
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {initialLead ? 'Update lead credentials and follow-up timeline' : 'Capture prospect details and initialize sales tracking'}
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
            {/* Duplicate Phone Warning */}
            {(existingLeadPhone || existingPartyPhone) && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Duplicate Phone:</span>{' '}
                  {existingPartyPhone
                    ? `Already registered as Customer/Party "${existingPartyPhone.name}" (${existingPartyPhone.uoi}).`
                    : `Already exists as Lead "${existingLeadPhone?.name || existingLeadPhone?.company_name}".`}
                </div>
              </div>
            )}

            {/* Section 1: Basic & Contact Information Card */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  1. Contact & Identity Information
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Primary point of contact, business entity name and phone communications</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Lead Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rajesh Sharma"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Company / Firm Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Sharma Battery & Solar Hub"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
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
                    placeholder="contact@sharma.in"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="9876543210"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300">
                      WhatsApp Number
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={(e) => {
                          setSameAsPhone(e.target.checked);
                          if (e.target.checked) setWhatsapp(phone);
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span>Same as Phone</span>
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={whatsapp}
                    disabled={sameAsPhone}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="9876543210"
                    className={`w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-mono font-medium ${sameAsPhone ? 'opacity-60 bg-gray-50 dark:bg-gray-900' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Business & Assignment Card */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  2. Pipeline & Requirement Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Source channel, deal size expectation, pipeline stage and sales rep</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Lead Source
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as LeadSource)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold cursor-pointer bg-white dark:bg-[#1a1d1a]"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Expected Value (₹)
                  </label>
                  <input
                    type="number"
                    value={expectedValue}
                    onChange={(e) => setExpectedValue(e.target.value)}
                    placeholder="250000"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Pipeline Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as LeadStage)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold cursor-pointer bg-white dark:bg-[#1a1d1a]"
                  >
                    {STAGES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Assigned Rep
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-semibold cursor-pointer bg-white dark:bg-[#1a1d1a]"
                  >
                    {ASSIGNEES.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Battery Requirement / Specifics
                  </label>
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g. 50x Tubular 150Ah Batteries, Inverter set"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Follow-up Schedule & Notes Card */}
            <div className="bg-white dark:bg-[#1a1d1a] border border-gray-200 dark:border-[#2d302d] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
              <div className="border-b border-gray-100 dark:border-[#2d302d] pb-3">
                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  3. Follow-up Schedule & Context
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Upcoming engagement calendar and conversation discussion remarks</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={nextFollowupDate}
                    onChange={(e) => setNextFollowupDate(e.target.value)}
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Next Follow-up Time
                  </label>
                  <input
                    type="text"
                    value={nextFollowupTime}
                    onChange={(e) => setNextFollowupTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full h-10 sm:h-11 px-3.5 text-sm glass-input font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Notes & Discussion Context
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add specific details discussed with the customer..."
                    className="w-full p-3.5 text-sm glass-input font-medium resize-none min-h-[90px]"
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
              className="h-10 sm:h-11 px-6 sm:px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
            >
              {initialLead ? 'Update Lead' : 'Save Lead'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
