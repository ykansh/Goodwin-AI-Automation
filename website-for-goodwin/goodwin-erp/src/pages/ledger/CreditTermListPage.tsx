import { useState, useRef, useEffect } from 'react';
import { useCustomers, useInvoices } from '../../hooks/queries';
import { useBulkUpdateCreditTerms } from '../../hooks/mutations';
import type { Customer } from '../../types';
import { 
  CREDIT_TERM_OPTIONS, 
  PAYMENT_CYCLE_OPTIONS, 
  ORDER_CYCLE_OPTIONS,
  MATERIAL_RECEIVED_TIME_OPTIONS,
  calculateCustomerPendingBills,
  persistCustomerCreditTerms,
  SUPABASE_CREDIT_TERMS_MIGRATION_SQL
} from '../../utils/creditTermsStorage';
import { PendingBillsModal } from '../../components/modals/PendingBillsModal';
import { EditCreditTermsModal } from '../../components/modals/EditCreditTermsModal';
import { CustomerLedgerModal } from '../../components/modals/CustomerLedgerModal';
import { NewPaymentInModal } from '../../components/modals/NewPaymentInModal';
import { ExcelActions } from '../../components/common/ExcelActions';
import { ExcelImportModal } from '../../components/common/ExcelImportModal';
import { ENTITY_SCHEMAS } from '../../utils/excel';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Clock, Search, AlertTriangle, CheckCircle, 
  ArrowDownLeft, History, Edit3, Receipt, Calendar, 
  Database, Copy, Check, DollarSign, Layers, Loader2,
  Phone, MessageSquare, UploadCloud,
  ShieldAlert, UserCheck, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export function CreditTermListPage() {
  const queryClient = useQueryClient();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const bulkUpdateCreditTermsMutation = useBulkUpdateCreditTerms();

  const isLoading = customersLoading || invoicesLoading;

  // Primary View Mode (Tabs)
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'commitments' | 'overlimit'>('all');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [selectedPaymentCycle, setSelectedPaymentCycle] = useState('all');
  const [selectedOrderCycle, setSelectedOrderCycle] = useState('all');
  const [selectedMaterialTime, setSelectedMaterialTime] = useState('all');
  const [selectedCommitmentFilter, setSelectedCommitmentFilter] = useState<'all' | 'overdue' | 'due_today' | 'upcoming' | 'no_date'>('all');

  // Modals state
  const [selectedBillsCustomer, setSelectedBillsCustomer] = useState<Customer | null>(null);
  const [selectedEditTermsCustomer, setSelectedEditTermsCustomer] = useState<Customer | null>(null);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);
  const [paymentInCustomer, setPaymentInCustomer] = useState<Customer | null>(null);
  const [paymentInSuggestedAmount, setPaymentInSuggestedAmount] = useState<number | undefined>(undefined);
  const [showPaymentInModal, setShowPaymentInModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Quick inline commitment date editor popover
  const [inlineDateCustomer, setInlineDateCustomer] = useState<Customer | null>(null);
  const [customCommitDate, setCustomCommitDate] = useState('');
  const inlineDateRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Close inline date picker on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inlineDateRef.current && !inlineDateRef.current.contains(event.target as Node)) {
        setInlineDateCustomer(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Aggregate metrics
  const totalReceivables = customers.reduce((sum, c) => sum + Number(c.outstanding || 0), 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + Number(c.credit_limit || 0), 0);
  const customersWithOutstanding = customers.filter((c) => Number(c.outstanding || 0) > 0);
  
  // Pending bills total count
  const allPendingBillsCount = customers.reduce((count, cust) => {
    const bills = calculateCustomerPendingBills(cust, invoices);
    return count + bills.length;
  }, 0);

  // Commitments due count (overdue or due today)
  const commitmentsOverdueCount = customers.filter((c) => {
    if (!c.payment_commitment_date || Number(c.outstanding || 0) <= 0) return false;
    return c.payment_commitment_date < todayStr;
  }).length;

  const commitmentsDueTodayCount = customers.filter((c) => {
    if (!c.payment_commitment_date || Number(c.outstanding || 0) <= 0) return false;
    return c.payment_commitment_date === todayStr;
  }).length;

  const commitmentsDueCount = commitmentsOverdueCount + commitmentsDueTodayCount;

  const overLimitCustomersCount = customers.filter((c) => {
    const limit = Number(c.credit_limit || 0);
    const outstanding = Number(c.outstanding || 0);
    return limit > 0 && outstanding > limit;
  }).length;

  // Filter Logic
  const filteredCustomers = customers.filter((c) => {
    const term = c.fixed_credit_terms || '30 Days Net';
    const payCycle = c.payment_cycle || '15/30 Days';
    const ordCycle = c.order_cycle || 'Weekly';
    const matTime = c.material_received_time || 'Within 3-5 Days';
    const outstanding = Number(c.outstanding || 0);
    const limit = Number(c.credit_limit || 0);

    // 1. Primary Tab Mode Filtering
    if (activeTab === 'unpaid') {
      const pendingBills = calculateCustomerPendingBills(c, invoices);
      if (outstanding <= 0 && pendingBills.length === 0) return false;
    } else if (activeTab === 'commitments') {
      if (!c.payment_commitment_date || outstanding <= 0) return false;
    } else if (activeTab === 'overlimit') {
      if (limit <= 0 || outstanding <= limit) return false;
    }

    // 2. Search filter
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.uoi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.includes(searchTerm) ||
      (c.salesperson && c.salesperson.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // 3. Credit Term filter
    if (selectedTerm !== 'all' && term !== selectedTerm) return false;

    // 4. Payment Cycle filter
    if (selectedPaymentCycle !== 'all' && payCycle !== selectedPaymentCycle) return false;

    // 5. Order Cycle filter
    if (selectedOrderCycle !== 'all' && ordCycle !== selectedOrderCycle) return false;

    // 6. Material Received Time filter
    if (selectedMaterialTime !== 'all' && matTime !== selectedMaterialTime) return false;

    // 7. Commitment Date filter
    if (selectedCommitmentFilter !== 'all') {
      if (!c.payment_commitment_date) {
        if (selectedCommitmentFilter !== 'no_date') return false;
      } else {
        if (selectedCommitmentFilter === 'no_date') return false;
        if (selectedCommitmentFilter === 'overdue' && c.payment_commitment_date >= todayStr) return false;
        if (selectedCommitmentFilter === 'due_today' && c.payment_commitment_date !== todayStr) return false;
        if (selectedCommitmentFilter === 'upcoming' && c.payment_commitment_date <= todayStr) return false;
      }
    }

    return true;
  });

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_CREDIT_TERMS_MIGRATION_SQL);
    setCopiedSql(true);
    toast.success('SQL migration script copied to clipboard');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Quick inline commitment date saver
  const handleSaveQuickCommitment = async (customer: Customer, newDate: string) => {
    try {
      await persistCustomerCreditTerms(customer.id, {
        payment_commitment_date: newDate || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(newDate ? `Payment commitment set to ${newDate}` : 'Payment commitment date cleared');
      setInlineDateCustomer(null);
    } catch {
      toast.error('Failed to update commitment date');
    }
  };

  const handleOpenPaymentInForCustomer = (cust: Customer) => {
    setPaymentInCustomer(cust);
    setShowPaymentInModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── Top Header Banner ──────────────────────────────────────────────── */}
      <div className="glass-strong p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-[#2d302d] flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#00a631]/10 text-[#00a631] flex items-center justify-center border border-[#00a631]/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#3a3b39] dark:text-white tracking-tight">
                  Credit Term List &amp; Payment Report
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                  Track Fixed Credit Terms, Unpaid Outstanding, Pending Bills, Payment Commitment Dates &amp; Order Cycles in one unified system
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420] text-gray-700 dark:text-gray-300 hover:border-[#00a631] hover:text-[#00a631] transition-all cursor-pointer shadow-2xs"
              title="Import or sync your existing Unpaid / Pending Customer List or Credit Terms from Excel"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#00a631]" />
              <span>Import / Sync Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420] text-gray-700 dark:text-gray-300 hover:border-[#00a631] transition-all cursor-pointer"
              title="View database schema migration for Supabase"
            >
              <Database className="w-3.5 h-3.5 text-[#00a631]" />
              <span className="hidden sm:inline">DB Migration</span>
            </button>

            <ExcelActions
              data={filteredCustomers.map((c) => {
                const bills = calculateCustomerPendingBills(c, invoices);
                return {
                  'Customer Name': c.name,
                  'UOI': c.uoi,
                  'Contact': c.contact,
                  'Salesperson': c.salesperson || 'Unassigned',
                  'Fixed Credit Terms': c.fixed_credit_terms || '30 Days Net',
                  'Credit Limit (₹)': c.credit_limit,
                  'Unpaid / Outstanding Amount (₹)': c.outstanding,
                  'Pending Bills Count': bills.length,
                  'Payment Commitment Date': c.payment_commitment_date || 'None',
                  'Material Received Time': c.material_received_time || 'Within 3-5 Days',
                  'Payment Cycle': c.payment_cycle || '15/30 Days',
                  'Order Cycle': c.order_cycle || 'Weekly',
                };
              })}
              fileName="Goodwin_Credit_Terms_Payment_Report"
              hideImport={true}
            />

            <button
              type="button"
              onClick={() => {
                setPaymentInCustomer(null);
                setShowPaymentInModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#00a631] hover:bg-[#008a29] text-white text-xs sm:text-sm font-extrabold rounded-md shadow-md shadow-[#00a631]/20 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ Record Payment In</span>
            </button>
          </div>
        </div>

        {/* ── Key Metrics Overview Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          
          {/* Card 1: Total Receivables / Unpaid */}
          <div 
            onClick={() => setActiveTab('unpaid')}
            className={`p-3.5 bg-white dark:bg-[#1a1d1a] border rounded-lg shadow-2xs cursor-pointer transition-all ${
              activeTab === 'unpaid' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200/80 dark:border-[#2d302d] hover:border-red-400'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Unpaid Outstanding</span>
              <DollarSign className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400 mt-1">
              ₹{totalReceivables.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5 block">
              Across {customersWithOutstanding.length} unpaid customer accounts
            </span>
          </div>

          {/* Card 2: Credit Limit & Utilization */}
          <div className="p-3.5 bg-white dark:bg-[#1a1d1a] border border-gray-200/80 dark:border-[#2d302d] rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Approved Credit Limit</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mt-1">
              ₹{(totalCreditLimit / 100000).toFixed(1)} Lakhs
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-[#00a631] h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalReceivables / (totalCreditLimit || 1)) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block font-medium">
              {((totalReceivables / (totalCreditLimit || 1)) * 100).toFixed(1)}% total limit utilized
            </span>
          </div>

          {/* Card 3: Pending Bills Count */}
          <div 
            onClick={() => setActiveTab('unpaid')}
            className="p-3.5 bg-white dark:bg-[#1a1d1a] border border-gray-200/80 dark:border-[#2d302d] hover:border-amber-400 rounded-lg shadow-2xs cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Bills</span>
              <Receipt className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {allPendingBillsCount} Bills
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5 block">
              Active unpaid customer invoices
            </span>
          </div>

          {/* Card 4: Commitment Due / Overdue */}
          <div 
            onClick={() => setActiveTab('commitments')}
            className={`p-3.5 bg-white dark:bg-[#1a1d1a] border rounded-lg shadow-2xs cursor-pointer transition-all ${
              activeTab === 'commitments' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-gray-200/80 dark:border-[#2d302d] hover:border-purple-400'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Commitments Due</span>
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {commitmentsDueCount} Customers
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5 block">
              {commitmentsOverdueCount} Overdue • {commitmentsDueTodayCount} Due Today
            </span>
          </div>

          {/* Card 5: Customers in System */}
          <div 
            onClick={() => setActiveTab('all')}
            className={`p-3.5 bg-white dark:bg-[#1a1d1a] border rounded-lg shadow-2xs cursor-pointer transition-all col-span-2 md:col-span-1 ${
              activeTab === 'all' ? 'border-[#00a631] ring-2 ring-[#00a631]/20' : 'border-gray-200/80 dark:border-[#2d302d] hover:border-[#00a631]'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Credit Accounts</span>
              <CheckCircle className="w-4 h-4 text-[#00a631]" />
            </div>
            <div className="text-lg sm:text-xl font-black text-[#00a631] mt-1">
              {customers.length} Accounts
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5 block">
              Maintained with fixed credit terms
            </span>
          </div>

        </div>

      </div>

      {/* ── Primary View Navigation (Integrated Unpaid / Pending Customer List) ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-[#2d302d] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#00a631] text-white shadow-sm'
              : 'bg-white dark:bg-[#202420] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2d302d] hover:border-gray-400'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>All Credit Accounts ({customers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unpaid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'unpaid'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#202420] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2d302d] hover:border-red-400'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span>Integrated Unpaid / Pending Customer List ({customersWithOutstanding.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('commitments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'commitments'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#202420] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2d302d] hover:border-purple-400'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-purple-500" />
          <span>Payment Commitments Follow-up ({commitmentsDueCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overlimit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overlimit'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#202420] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2d302d] hover:border-amber-400'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Credit Limit Exceeded ({overLimitCustomersCount})</span>
        </button>
      </div>

      {/* ── Search & Secondary Filter Controls ─────────────────────────────── */}
      <div className="glass p-4 rounded-lg border border-gray-200 dark:border-[#2d302d] flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="flex items-center gap-2.5 w-full md:w-80 px-3.5 py-2 rounded-md border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825]">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer, UOI, phone, sales rep..."
            className="flex-1 min-w-0 text-xs sm:text-sm text-[#3a3b39] dark:text-white bg-transparent outline-none placeholder:text-gray-400 font-semibold"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Filter: Credit Terms */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-500 hidden sm:inline">Term:</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="glass-input px-2.5 py-1.5 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
            >
              <option value="all">All Fixed Terms</option>
              {CREDIT_TERM_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Payment Cycle */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-500 hidden sm:inline">Pay Cycle:</label>
            <select
              value={selectedPaymentCycle}
              onChange={(e) => setSelectedPaymentCycle(e.target.value)}
              className="glass-input px-2.5 py-1.5 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
            >
              <option value="all">All Payment Cycles</option>
              {PAYMENT_CYCLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Order Cycle */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-500 hidden sm:inline">Order Cycle:</label>
            <select
              value={selectedOrderCycle}
              onChange={(e) => setSelectedOrderCycle(e.target.value)}
              className="glass-input px-2.5 py-1.5 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
            >
              <option value="all">All Order Cycles</option>
              {ORDER_CYCLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Material Time */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedMaterialTime}
              onChange={(e) => setSelectedMaterialTime(e.target.value)}
              className="glass-input px-2.5 py-1.5 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
            >
              <option value="all">All Material Times</option>
              {MATERIAL_RECEIVED_TIME_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Commitment */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCommitmentFilter}
              onChange={(e) => setSelectedCommitmentFilter(e.target.value as any)}
              className="glass-input px-2.5 py-1.5 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
            >
              <option value="all">All Commitment Dates</option>
              <option value="overdue">Overdue Commitments</option>
              <option value="due_today">Due Today</option>
              <option value="upcoming">Upcoming Commitments</option>
              <option value="no_date">No Commitment Date</option>
            </select>
          </div>

        </div>

      </div>

      {/* ── Main Data Table: All 8 Required Fields ───────────────────────── */}
      <div className="glass-strong overflow-hidden rounded-lg border border-gray-200 dark:border-[#2d302d] shadow-sm">
        <div className="overflow-x-auto min-w-full">
          <table className="data-table text-xs">
            <thead>
              <tr className="bg-gray-100/90 dark:bg-[#202420] text-gray-700 dark:text-gray-300">
                <th className="whitespace-nowrap">1. Customer Name</th>
                <th className="whitespace-nowrap">2. Fixed Credit Terms &amp; Limit</th>
                <th className="whitespace-nowrap text-right">3. Unpaid / Outstanding</th>
                <th className="whitespace-nowrap text-center">4. Pending Bills</th>
                <th className="whitespace-nowrap">5. Payment Commitment Date</th>
                <th className="whitespace-nowrap">6. Material Received Time</th>
                <th className="whitespace-nowrap">7. Payment Cycle</th>
                <th className="whitespace-nowrap">8. Order Cycle</th>
                <th className="whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <Loader2 className="w-8 h-8 text-[#00a631] animate-spin mx-auto" />
                    <p className="mt-2 text-sm font-bold text-gray-500">Loading credit terms &amp; payment report...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-400 dark:text-gray-500 font-bold">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    No customers match the current view and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const pendingBills = calculateCustomerPendingBills(cust, invoices);
                  const outstanding = Number(cust.outstanding || 0);
                  const limit = Number(cust.credit_limit || 0);
                  const utilizationPercent = limit > 0 ? (outstanding / limit) * 100 : 0;
                  const isOverLimit = outstanding > limit && limit > 0;

                  // Clean phone for WhatsApp / click-to-call
                  const cleanPhone = cust.contact.replace(/[^0-9]/g, '');
                  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

                  // Commitment status check
                  const commitmentDate = cust.payment_commitment_date;
                  let commitmentBadge = null;
                  if (commitmentDate) {
                    if (commitmentDate < todayStr && outstanding > 0) {
                      commitmentBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                          <AlertTriangle className="w-3 h-3" />
                          Overdue ({commitmentDate})
                        </span>
                      );
                    } else if (commitmentDate === todayStr) {
                      commitmentBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          Due Today ({commitmentDate})
                        </span>
                      );
                    } else {
                      commitmentBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          <Calendar className="w-3 h-3" />
                          {commitmentDate}
                        </span>
                      );
                    }
                  } else {
                    commitmentBadge = (
                      <span className="text-gray-400 dark:text-gray-500 italic text-[11px]">
                        Not Committed
                      </span>
                    );
                  }

                  return (
                    <tr key={cust.id} className="hover:bg-gray-50/70 dark:hover:bg-[#1f221f] transition-colors">
                      
                      {/* 1. Customer Name */}
                      <td className="whitespace-nowrap">
                        <div className="font-extrabold text-[#3a3b39] dark:text-white text-sm flex items-center gap-1.5">
                          <span>{cust.name}</span>
                          <span className="capitalize text-[10px] font-semibold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            {cust.type || 'dealer'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] font-extrabold text-[#00a631] bg-emerald-500/10 px-1.5 py-0.2 rounded border border-[#00a631]/20">
                            {cust.uoi}
                          </span>
                          
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{cust.contact}</span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${formattedPhone}?text=Dear%20${encodeURIComponent(cust.name)},%20this%20is%20a%20reminder%20regarding%20your%20Goodwin%20Battery%20account%20outstanding%20balance%20of%20Rs.%20${outstanding.toLocaleString('en-IN')}.%20Kindly%20confirm%20payment.`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-0.5 text-emerald-600 hover:text-emerald-700 ml-0.5"
                                title="Send WhatsApp payment follow-up"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {cust.salesperson && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 rounded">
                              {cust.salesperson}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Fixed Credit Terms & Credit Limit */}
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/50 text-[#00a631] dark:text-emerald-400 border border-[#00a631]/30">
                            {cust.fixed_credit_terms || '30 Days Net'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                            Limit: ₹{limit.toLocaleString('en-IN')}
                          </span>
                          <span className={`text-[10px] font-bold ${
                            isOverLimit ? 'text-red-600 font-extrabold' : 'text-gray-400'
                          }`}>
                            ({utilizationPercent.toFixed(0)}% used)
                          </span>
                        </div>
                      </td>

                      {/* 3. Unpaid / Outstanding Amount */}
                      <td className="text-right whitespace-nowrap">
                        <div className={`font-black text-sm ${
                          outstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}>
                          ₹{outstanding.toLocaleString('en-IN')}
                        </div>
                        {isOverLimit ? (
                          <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">
                            Exceeded by ₹{(outstanding - limit).toLocaleString('en-IN')}
                          </span>
                        ) : outstanding === 0 ? (
                          <span className="text-[9px] text-[#00a631] font-bold uppercase tracking-wider block">
                            Cleared (Zero Balance)
                          </span>
                        ) : null}
                      </td>

                      {/* 4. Pending Bills */}
                      <td className="text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedBillsCustomer(cust)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs cursor-pointer transition-all ${
                            pendingBills.length > 0
                              ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 shadow-2xs'
                              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>{pendingBills.length} Pending {pendingBills.length === 1 ? 'Bill' : 'Bills'}</span>
                        </button>
                      </td>

                      {/* 5. Payment Commitment Date with Inline Quick Editor */}
                      <td className="whitespace-nowrap relative">
                        <div className="flex items-center gap-1.5">
                          <div 
                            onClick={() => {
                              setInlineDateCustomer(cust);
                              setCustomCommitDate(cust.payment_commitment_date || todayStr);
                            }}
                            className="cursor-pointer"
                            title="Click to quickly update commitment date"
                          >
                            {commitmentBadge}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setInlineDateCustomer(cust);
                              setCustomCommitDate(cust.payment_commitment_date || todayStr);
                            }}
                            className="p-1 text-gray-400 hover:text-[#00a631] rounded transition-colors"
                            title="Quick Edit Commitment Date"
                          >
                            <Calendar className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Inline Popover Date Picker */}
                        {inlineDateCustomer?.id === cust.id && (
                          <div 
                            ref={inlineDateRef}
                            className="absolute z-30 top-10 left-0 bg-white dark:bg-[#181a18] border border-gray-300 dark:border-[#374137] rounded-lg shadow-xl p-3 w-64 space-y-2 animate-scale-in"
                          >
                            <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-800">
                              <span className="text-[11px] font-extrabold text-gray-800 dark:text-gray-200">
                                Payment Commitment Date
                              </span>
                              <button
                                type="button"
                                onClick={() => setInlineDateCustomer(null)}
                                className="text-gray-400 hover:text-gray-600 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                            
                            <input
                              type="date"
                              value={customCommitDate}
                              onChange={(e) => setCustomCommitDate(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs font-bold border rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                            />

                            <div className="grid grid-cols-3 gap-1 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const d = new Date();
                                  d.setDate(d.getDate() + 3);
                                  handleSaveQuickCommitment(cust, d.toISOString().split('T')[0]);
                                }}
                                className="px-2 py-1 text-[10px] font-bold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                +3 Days
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const d = new Date();
                                  d.setDate(d.getDate() + 7);
                                  handleSaveQuickCommitment(cust, d.toISOString().split('T')[0]);
                                }}
                                className="px-2 py-1 text-[10px] font-bold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                +7 Days
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const d = new Date();
                                  d.setDate(d.getDate() + 15);
                                  handleSaveQuickCommitment(cust, d.toISOString().split('T')[0]);
                                }}
                                className="px-2 py-1 text-[10px] font-bold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              >
                                +15 Days
                              </button>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                              <button
                                type="button"
                                onClick={() => handleSaveQuickCommitment(cust, '')}
                                className="text-[10px] font-bold text-red-500 hover:underline"
                              >
                                Clear Date
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveQuickCommitment(cust, customCommitDate)}
                                className="px-3 py-1 bg-[#00a631] text-white text-[10px] font-bold rounded shadow-xs"
                              >
                                Save Date
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 6. Material Received Time */}
                      <td className="whitespace-nowrap font-medium text-gray-700 dark:text-gray-300">
                        <span className="bg-gray-100 dark:bg-[#252825] px-2.5 py-1 rounded-md text-[11px] font-semibold border border-gray-200 dark:border-gray-800">
                          {cust.material_received_time || 'Within 3-5 Days'}
                        </span>
                      </td>

                      {/* 7. Payment Cycle */}
                      <td className="whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {cust.payment_cycle || '15/30 Days'}
                        </span>
                      </td>

                      {/* 8. Order Cycle */}
                      <td className="whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {cust.order_cycle || 'Weekly'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-right whitespace-nowrap space-x-1.5">
                        {/* Edit Terms */}
                        <button
                          type="button"
                          onClick={() => setSelectedEditTermsCustomer(cust)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-200/70 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-md transition-all cursor-pointer"
                          title="Maintain Credit Terms, Outstanding & Cycles"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Terms</span>
                        </button>

                        {/* Pay In Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenPaymentInForCustomer(cust)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#00a631]/10 hover:bg-[#00a631]/20 text-[#00a631] text-xs font-bold rounded-md transition-all cursor-pointer"
                          title="Record Payment In for this customer"
                        >
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Pay In</span>
                        </button>

                        {/* Customer Ledger */}
                        <button
                          type="button"
                          onClick={() => setSelectedLedgerCustomer(cust)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-md transition-all cursor-pointer"
                          title="View Ledger Statement"
                        >
                          <History className="w-3 h-3" />
                          <span>Ledger</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}

      {/* Modal 1: Pending Bills Details */}
      {selectedBillsCustomer && (
        <PendingBillsModal
          customer={selectedBillsCustomer}
          invoices={invoices}
          onClose={() => setSelectedBillsCustomer(null)}
          onOpenPaymentIn={(customer, suggestedAmount) => {
            setSelectedBillsCustomer(null);
            setPaymentInCustomer(customer);
            setPaymentInSuggestedAmount(suggestedAmount);
            setShowPaymentInModal(true);
          }}
        />
      )}

      {/* Modal 2: Edit Credit Terms & Cycles */}
      {selectedEditTermsCustomer && (
        <EditCreditTermsModal
          customer={selectedEditTermsCustomer}
          onClose={() => setSelectedEditTermsCustomer(null)}
        />
      )}

      {/* Modal 3: Customer Ledger */}
      {selectedLedgerCustomer && (
        <CustomerLedgerModal
          party={selectedLedgerCustomer}
          partyType="customer"
          onClose={() => setSelectedLedgerCustomer(null)}
        />
      )}

      {/* Modal 4: New Payment In */}
      {showPaymentInModal && (
        <NewPaymentInModal
          onClose={() => {
            setShowPaymentInModal(false);
            setPaymentInCustomer(null);
            setPaymentInSuggestedAmount(undefined);
          }}
          initialCustomerId={paymentInCustomer?.id}
          initialAmount={paymentInSuggestedAmount !== undefined ? paymentInSuggestedAmount : (paymentInCustomer ? Number(paymentInCustomer.outstanding || 0) : undefined)}
        />
      )}

      {/* Modal 5: Excel Import Modal for Credit Terms & Unpaid Customer List */}
      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        schema={ENTITY_SCHEMAS.credit_terms}
        onConfirmImport={async (rows) => {
          await bulkUpdateCreditTermsMutation.mutateAsync(rows);
        }}
      />

      {/* Modal 6: Supabase SQL Migration Script */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#181a18] border border-gray-200 dark:border-[#2d302d] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2d302d] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#00a631]" />
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Supabase SQL Migration for Credit Terms &amp; Payment Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Run this SQL script in your <strong className="text-gray-900 dark:text-white">Supabase Dashboard → SQL Editor → New Query → Run</strong> to permanently add native database columns for fixed credit terms, payment commitment date, material received time, payment cycle, and order cycle.
            </p>

            <div className="relative bg-[#111311] text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-[#2d302d]">
              <pre>{SUPABASE_CREDIT_TERMS_MIGRATION_SQL}</pre>
              <button
                type="button"
                onClick={handleCopySql}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-bold rounded shadow transition-all cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
