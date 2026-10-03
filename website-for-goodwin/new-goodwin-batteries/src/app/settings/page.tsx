'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import AddItemModal from '@/components/inventory/AddItemModal';
import { useApp } from '@/context/AppContext';
import { BusinessProfile } from '@/lib/mockData';
import { INDIAN_STATES } from '@/lib/constants';
import {
  Building2,
  Receipt,
  FileCheck2,
  Store,
  Users,
  Shield,
  Save,
  CheckCircle,
  QrCode,
  Printer,
  Smartphone,
  CreditCard,
  Percent,
  Plus,
  Trash2,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'BILLER' | 'CA';
  status: 'ACTIVE' | 'INVITED';
}

export default function SettingsPage() {
  const { business, updateBusiness, addInvoice } = useApp();

  // Navigation Modals
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Settings Tabs
  const [activeTab, setActiveTab] = useState<
    'business' | 'invoice' | 'gst' | 'store' | 'staff'
  >('business');

  // Form State initialized from business profile
  const [formData, setFormData] = useState<BusinessProfile>({
    ...business,
  });

  // Save feedback state
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Staff members mock state
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'staff-1',
      name: 'Rajesh Goodwin',
      phone: '+91 98201 12345',
      email: 'rajesh@goodwinpower.in',
      role: 'OWNER',
      status: 'ACTIVE',
    },
    {
      id: 'staff-2',
      name: 'Amit Verma',
      phone: '+91 98220 54321',
      email: 'amit.verma@goodwinpower.in',
      role: 'MANAGER',
      status: 'ACTIVE',
    },
    {
      id: 'staff-3',
      name: 'Sunita Patel',
      phone: '+91 98190 77665',
      email: 'sunita.cashier@goodwinpower.in',
      role: 'BILLER',
      status: 'ACTIVE',
    },
    {
      id: 'staff-4',
      name: 'Manoj Shah & Associates',
      phone: '+91 98330 99881',
      email: 'ca.manoj@taxadvisors.in',
      role: 'CA',
      status: 'ACTIVE',
    },
  ]);

  // New staff modal state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'MANAGER' | 'BILLER' | 'CA'>('BILLER');

  const handleInputChange = (field: keyof BusinessProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStateChange = (stateName: string) => {
    const matchedState = INDIAN_STATES.find((s) => s.name === stateName);
    setFormData((prev) => ({
      ...prev,
      state: stateName,
      stateCode: matchedState ? matchedState.code : prev.stateCode,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim() || !newStaffPhone.trim()) {
      alert('Please enter staff name and phone number');
      return;
    }
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName,
      phone: newStaffPhone,
      email: `${newStaffName.toLowerCase().replace(/\s+/g, '')}@goodwinpower.in`,
      role: newStaffRole,
      status: 'ACTIVE',
    };
    setStaffList((prev) => [...prev, newStaff]);
    setNewStaffName('');
    setNewStaffPhone('');
    setIsAddStaffOpen(false);
  };

  const handleRemoveStaff = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Sidebar */}
      <Sidebar onOpenQuickBill={() => setIsBillingModalOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onOpenQuickBill={() => setIsBillingModalOpen(true)}
          onOpenAddItem={() => setIsAddItemModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 size={22} className="text-[#4c3cce]" />
                Business Settings & Preferences
              </h1>
              <p className="text-xs text-slate-500">
                Configure your company details, GST compliance, invoice print layout, and staff access.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <CheckCircle size={15} className="text-emerald-600" />
                  Settings Saved Successfully!
                </span>
              )}
              <button
                onClick={handleSave}
                className="h-10 px-5 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Save size={15} />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>

          {/* Settings Grid with Left Navigation Tabs & Right Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Left Nav Menu */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-1">
              <button
                onClick={() => setActiveTab('business')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'business'
                    ? 'bg-[#4c3cce] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 size={16} />
                <span>Business Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('invoice')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'invoice'
                    ? 'bg-[#4c3cce] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Receipt size={16} />
                <span>Invoice & Print Setup</span>
              </button>

              <button
                onClick={() => setActiveTab('gst')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'gst'
                    ? 'bg-[#4c3cce] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileCheck2 size={16} />
                <span>GST & Tax Compliance</span>
              </button>

              <button
                onClick={() => setActiveTab('store')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'store'
                    ? 'bg-[#4c3cce] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Store size={16} />
                <span>Online Digital Store</span>
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'staff'
                    ? 'bg-[#4c3cce] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users size={16} />
                <span>Staff & RBAC Roles</span>
              </button>
            </div>

            {/* Right Pane Form Panels */}
            <div className="md:col-span-3">
              {/* TAB 1: Business Profile */}
              {activeTab === 'business' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Business Identity & Contact Details
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      This information appears on your invoices, payment receipts, and delivery challans.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Registered Business / Firm Name *
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        GSTIN Number *
                      </label>
                      <input
                        type="text"
                        value={formData.gstin}
                        onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        UPI ID (For Instant QR Payments) *
                      </label>
                      <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => handleInputChange('upiId', e.target.value)}
                        placeholder="e.g. goodwinpower@okaxis"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Phone Number (WhatsApp Billing) *
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Official Billing Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Registered Street Address *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        State (GST State) *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
                      >
                        {INDIAN_STATES.map((s) => (
                          <option key={s.code} value={s.name}>
                            {s.code} - {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 focus:border-[#4c3cce]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        GST State Code
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.stateCode}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Bank Details on Bill */}
                  <div className="pt-4 border-t border-slate-200">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Bank Account Details for Invoices
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails || ''}
                      onChange={(e) => handleInputChange('bankDetails', e.target.value)}
                      placeholder="e.g. HDFC Bank - A/C: 50200012345678 - IFSC: HDFC0000123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Invoice & Print Setup */}
              {activeTab === 'invoice' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Invoice Sequence & Print Formatting
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose between standard A4 laser printing and 3-inch 80mm POS thermal roll printing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Invoice Number Prefix *
                      </label>
                      <input
                        type="text"
                        value={formData.invoicePrefix}
                        onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                        placeholder="e.g. GB-26/"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Next Invoice Sequence Number *
                      </label>
                      <input
                        type="number"
                        value={formData.currentInvoiceNumber}
                        onChange={(e) =>
                          handleInputChange('currentInvoiceNumber', parseInt(e.target.value) || 1)
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20"
                      />
                    </div>
                  </div>

                  {/* Print Template Preference */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Default Print Template Format:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* A4 Standard */}
                      <div
                        onClick={() => handleInputChange('defaultPrintFormat', 'A4')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          formData.defaultPrintFormat === 'A4'
                            ? 'border-[#4c3cce] bg-indigo-50/40 ring-2 ring-[#4c3cce]/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Printer size={18} className="text-[#4c3cce]" />
                            <span className="text-xs font-bold text-slate-900">
                              A4 Standard Tax Invoice
                            </span>
                          </div>
                          {formData.defaultPrintFormat === 'A4' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#4c3cce]"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Full-page professional layout with GST HSN tax summary, customer billing/shipping address, company bank details, and signature box.
                        </p>
                      </div>

                      {/* 3-inch POS Thermal */}
                      <div
                        onClick={() => handleInputChange('defaultPrintFormat', 'THERMAL')}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          formData.defaultPrintFormat === 'THERMAL'
                            ? 'border-[#4c3cce] bg-indigo-50/40 ring-2 ring-[#4c3cce]/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Receipt size={18} className="text-[#db631a]" />
                            <span className="text-xs font-bold text-slate-900">
                              80mm (3-Inch) Thermal Roll
                            </span>
                          </div>
                          {formData.defaultPrintFormat === 'THERMAL' && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#4c3cce]"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          High-speed receipt for retail counters. Fits Epson/TVS thermal printers with embedded dynamic UPI QR for quick customer scan.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Default Terms & Conditions on Invoices:
                    </label>
                    <textarea
                      rows={4}
                      value={formData.termsAndConditions || ''}
                      onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                      placeholder="Enter legal terms, warranty disclaimer, and return policy..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: GST & Tax Compliance */}
              {activeTab === 'gst' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      GST & Regulatory Settings
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure your GST tax scheme, E-Way bill threshold, and automated tax calculations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        GST Taxpayer Scheme
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                          <input type="radio" name="scheme" defaultChecked className="accent-[#4c3cce]" />
                          <span>Regular GST (ITC Eligible)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer">
                          <input type="radio" name="scheme" className="accent-[#4c3cce]" />
                          <span>Composition Scheme</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                      <span className="text-xs font-bold text-slate-800 block">
                        E-Way Bill Generation Limit
                      </span>
                      <p className="text-xs font-bold text-[#4c3cce]">₹50,000 (Mandatory threshold)</p>
                      <p className="text-[11px] text-slate-500">
                        Invoices above ₹50,000 will automatically include E-Way Bill export readiness.
                      </p>
                    </div>
                  </div>

                  {/* Standard GST Rates */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Supported GST Tax Slabs in System
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-base font-extrabold text-slate-800">28%</p>
                        <p className="text-[10px] text-slate-500">Batteries & Lead Acid</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-base font-extrabold text-slate-800">18%</p>
                        <p className="text-[10px] text-slate-500">Inverters & Controllers</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-base font-extrabold text-slate-800">12%</p>
                        <p className="text-[10px] text-slate-500">Solar Panels & Kits</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-base font-extrabold text-slate-800">5%</p>
                        <p className="text-[10px] text-slate-500">Specified Solar Devices</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-base font-extrabold text-slate-800">0%</p>
                        <p className="text-[10px] text-slate-500">Exempt Goods</p>
                      </div>
                    </div>
                  </div>

                  {/* NIC E-Invoice Status */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
                    <Shield size={20} className="text-[#4c3cce] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        GSTR-1, GSTR-3B & Tally Prime Integration Ready
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Your invoices automatically map to the GSTN portal schema with CGST, SGST, IGST intra/inter-state separation and HSN code aggregations.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Online Digital Store */}
              {activeTab === 'store' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Online Storefront Configuration
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customize your public digital storefront for WhatsApp direct ordering.
                      </p>
                    </div>

                    <a
                      href="/store"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span>Preview Live Store</span>
                    </a>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Store Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={formData.storeTagline || ''}
                        onChange={(e) => handleInputChange('storeTagline', e.target.value)}
                        placeholder="e.g. Authorized Distributor of High-Performance Tubular & Solar Inverter Batteries"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Top Announcement Ribbon (Delivery / Offer text)
                      </label>
                      <input
                        type="text"
                        value={formData.storeNotice || ''}
                        onChange={(e) => handleInputChange('storeNotice', e.target.value)}
                        placeholder="e.g. ⚡ Free same-day delivery across Mumbai & Thane on all Inverter Battery orders above ₹5,000!"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Public Store Visibility</p>
                        <p className="text-[11px] text-slate-500">
                          Allow customers to browse products and place 1-click orders via WhatsApp.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.enableOnlineStore ?? true}
                        onChange={(e) => handleInputChange('enableOnlineStore', e.target.checked)}
                        className="w-5 h-5 accent-[#4c3cce] rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Staff & RBAC Roles */}
              {activeTab === 'staff' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        Staff Members & Access Roles (RBAC)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assign roles to control who can create bills, view purchase margins, and access accounting reports.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddStaffOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus size={14} />
                      <span>Add Staff</span>
                    </button>
                  </div>

                  {/* Staff Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 border-b border-slate-200 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Member Name</th>
                          <th className="py-3 px-4">Phone / Contact</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Permissions</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {staffList.map((member) => (
                          <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                                  {member.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{member.name}</p>
                                  <p className="text-[10px] text-slate-400">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              {member.phone}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  member.role === 'OWNER'
                                    ? 'bg-purple-100 text-purple-800'
                                    : member.role === 'MANAGER'
                                    ? 'bg-blue-100 text-blue-800'
                                    : member.role === 'BILLER'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {member.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[11px] text-slate-500">
                              {member.role === 'OWNER'
                                ? 'Full administrative rights'
                                : member.role === 'MANAGER'
                                ? 'Sales, Stock adjust, Parties'
                                : member.role === 'BILLER'
                                ? 'POS Invoicing only (Purchase prices hidden)'
                                : 'GST Reports, Tally XML & Balance Sheet'}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {member.role !== 'OWNER' && (
                                <button
                                  onClick={() => handleRemoveStaff(member.id)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                  title="Remove Member"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* RBAC Security Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
                    <Lock size={18} className="text-slate-400 shrink-0" />
                    <span>
                      Cashier / Biller accounts cannot view supplier purchase costs, company profits, or bank balances on POS screens.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Team Member</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kulkarni"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Phone Number (For OTP Login) *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98201 99887"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Assigned Role *
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4c3cce]/20"
                >
                  <option value="BILLER">Biller / Cashier (POS Counter only)</option>
                  <option value="MANAGER">Store Manager (Inventory & Billing)</option>
                  <option value="CA">CA / Accountant (GST Reports only)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStaff}
                className="px-4 py-2 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white text-xs font-bold"
              >
                Save Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Billing Modal */}
      {isBillingModalOpen && (
        <CreateInvoiceModal
          isOpen={isBillingModalOpen}
          onClose={() => setIsBillingModalOpen(false)}
          onInvoiceCreated={(newInv) => addInvoice(newInv)}
        />
      )}

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <AddItemModal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} />
      )}
    </div>
  );
}
