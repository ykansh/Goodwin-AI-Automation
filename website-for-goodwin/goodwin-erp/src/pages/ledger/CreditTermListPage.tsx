import { useState } from 'react';
import { useCustomers, useInvoices } from '../../hooks/queries';
import type { Customer } from '../../types';
import { 
  CREDIT_TERM_OPTIONS, 
  PAYMENT_CYCLE_OPTIONS, 
  ORDER_CYCLE_OPTIONS,
  calculateCustomerPendingBills,
  SUPABASE_CREDIT_TERMS_MIGRATION_SQL
} from '../../utils/creditTermsStorage';
import { PendingBillsModal } from '../../components/modals/PendingBillsModal';
import { EditCreditTermsModal } from '../../components/modals/EditCreditTermsModal';
import { CustomerLedgerModal } from '../../components/modals/CustomerLedgerModal';
import { NewPaymentInModal } from '../../components/modals/NewPaymentInModal';
import { ExcelActions } from '../../components/common/ExcelActions';
import { 
  Clock, Search, AlertTriangle, CheckCircle, 
  ArrowDownLeft, History, Edit3, Receipt, Calendar, 
  Database, Copy, Check, DollarSign, Layers, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export function CreditTermListPage() {
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const isLoading = customersLoading || invoicesLoading;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('all');
  const [selectedPaymentCycle, setSelectedPaymentCycle] = useState('all');
  const [selectedOrderCycle, setSelectedOrderCycle] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'outstanding' | 'cleared' | 'overlimit'>('all');
  const [selectedCommitmentFilter, setSelectedCommitmentFilter] = useState<'all' | 'overdue' | 'due_today' | 'upcoming' | 'no_date'>('all');

  // Modals state
  const [selectedBillsCustomer, setSelectedBillsCustomer] = useState<Customer | null>(null);
  const [selectedEditTermsCustomer, setSelectedEditTermsCustomer] = useState<Customer | null>(null);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);
  const [showPaymentInModal, setShowPaymentInModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

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
  const commitmentsDueCount = customers.filter((c) => {
    if (!c.payment_commitment_date || Number(c.outstanding || 0) <= 0) return false;
    return c.payment_commitment_date <= todayStr;
  }).length;

  // Filter Logic
  const filteredCustomers = customers.filter((c) => {
    const term = c.fixed_credit_terms || '30 Days Net';
    const payCycle = c.payment_cycle || '15/30 Days';
    const ordCycle = c.order_cycle || 'Weekly';
    const outstanding = Number(c.outstanding || 0);
    const limit = Number(c.credit_limit || 0);

    // Search filter
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.uoi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact.includes(searchTerm) ||
      (c.salesperson && c.salesperson.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Credit Term filter
    if (selectedTerm !== 'all' && term !== selectedTerm) return false;

    // Payment Cycle filter
    if (selectedPaymentCycle !== 'all' && payCycle !== selectedPaymentCycle) return false;

    // Order Cycle filter
    if (selectedOrderCycle !== 'all' && ordCycle !== selectedOrderCycle) return false;

    // Financial Status filter
    if (selectedStatus === 'outstanding' && outstanding <= 0) return false;
    if (selectedStatus === 'cleared' && outstanding > 0) return false;
    if (selectedStatus === 'overlimit' && outstanding <= limit) return false;

    // Commitment Date filter
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
                  Maintain customer credit terms, pending bills, payment commitments, material times &amp; cycles in one central system
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420] text-gray-700 dark:text-gray-300 hover:border-[#00a631] transition-all cursor-pointer"
              title="View database schema migration for Supabase"
            >
              <Database className="w-3.5 h-3.5 text-[#00a631]" />
              <span>DB Migration SQL</span>
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
                  'Total Outstanding (₹)': c.outstanding,
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
              onClick={() => setShowPaymentInModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00a631] hover:bg-[#008a29] text-white text-xs sm:text-sm font-extrabold rounded-md shadow-md shadow-[#00a631]/20 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ Record Payment In</span>
            </button>
          </div>
        </div>

        {/* ── Key Metrics Overview Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          
          {/* Card 1: Total Receivables */}
          <div className="p-3.5 bg-white dark:bg-[#1a1d1a] border border-gray-200/80 dark:border-[#2d302d] rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Receivables</span>
              <DollarSign className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-red-600 dark:text-red-400 mt-1">
              ₹{totalReceivables.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5 block">
              Across {customersWithOutstanding.length} accounts with balance
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
          <div className="p-3.5 bg-white dark:bg-[#1a1d1a] border border-gray-200/80 dark:border-[#2d302d] rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Bills</span>
              <Receipt className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {allPendingBillsCount} Bills
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5 block">
              Active unpaid customer bills
            </span>
          </div>

          {/* Card 4: Commitment Due / Overdue */}
          <div className="p-3.5 bg-white dark:bg-[#1a1d1a] border border-gray-200/80 dark:border-[#2d302d] rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Commitments Due</span>
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {commitmentsDueCount} Customers
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5 block">
              Due on or before today
            </span>
          </div>

          {/* Card 5: Customers in System */}
          <div className="p-3.5 bg-white dark:bg-[#1a1d1a] border border-gray-200/80 dark:border-[#2d302d] rounded-lg shadow-2xs col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Credit Accounts</span>
              <CheckCircle className="w-4 h-4 text-[#00a631]" />
            </div>
            <div className="text-lg sm:text-xl font-black text-[#00a631] mt-1">
              {customers.length} Accounts
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5 block">
              All with active credit terms
            </span>
          </div>

        </div>

      </div>

      {/* ── Search & Filter Controls ───────────────────────────────────────── */}
      <div className="glass p-4 rounded-lg border border-gray-200 dark:border-[#2d302d] flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="flex items-center gap-2.5 w-full md:w-72 px-3.5 py-2.5 rounded-md border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825]">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customer, UOI, contact..."
            className="flex-1 min-w-0 text-xs sm:text-sm text-[#3a3b39] dark:text-white bg-transparent outline-none placeholder:text-gray-400 font-semibold"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Filter: Credit Terms */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-gray-500 hidden sm:inline">Term:</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="glass-input px-3 py-2 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
            >
              <option value="all">All Credit Terms</option>
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
              className="glass-input px-3 py-2 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
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
              className="glass-input px-3 py-2 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
            >
              <option value="all">All Order Cycles</option>
              {ORDER_CYCLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Status */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="glass-input px-3 py-2 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
            >
              <option value="all">All Balances</option>
              <option value="outstanding">Has Outstanding Balance</option>
              <option value="cleared">Cleared (Zero Balance)</option>
              <option value="overlimit">Exceeded Credit Limit</option>
            </select>
          </div>

          {/* Filter: Commitment */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCommitmentFilter}
              onChange={(e) => setSelectedCommitmentFilter(e.target.value as any)}
              className="glass-input px-3 py-2 text-xs font-semibold cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#202420]"
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
              <tr>
                <th className="whitespace-nowrap">1. Customer Name</th>
                <th className="whitespace-nowrap">2. Fixed Credit Terms &amp; Limit</th>
                <th className="whitespace-nowrap text-right">3. Unpaid / Outstanding</th>
                <th className="whitespace-nowrap text-center">4. Pending Bills</th>
                <th className="whitespace-nowrap">5. Payment Commitment</th>
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
                  <td colSpan={9} className="text-center py-14 text-gray-400 dark:text-gray-500 font-bold">
                    No customers match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const pendingBills = calculateCustomerPendingBills(cust, invoices);
                  const outstanding = Number(cust.outstanding || 0);
                  const limit = Number(cust.credit_limit || 0);
                  const utilizationPercent = limit > 0 ? (outstanding / limit) * 100 : 0;
                  const isOverLimit = outstanding > limit && limit > 0;

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
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] font-extrabold text-[#00a631] bg-emerald-500/10 px-1.5 py-0.2 rounded border border-[#00a631]/20">
                            {cust.uoi}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                            {cust.contact}
                          </span>
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
                        {isOverLimit && (
                          <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">
                            Exceeded by ₹{(outstanding - limit).toLocaleString('en-IN')}
                          </span>
                        )}
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

                      {/* 5. Payment Commitment Date */}
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {commitmentBadge}
                          <button
                            type="button"
                            onClick={() => setSelectedEditTermsCustomer(cust)}
                            className="p-1 text-gray-400 hover:text-[#00a631] rounded transition-colors"
                            title="Edit Commitment Date"
                          >
                            <Calendar className="w-3 h-3" />
                          </button>
                        </div>
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
                          title="Maintain Credit Terms & Payment Cycle"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Terms</span>
                        </button>

                        {/* Customer Ledger */}
                        <button
                          type="button"
                          onClick={() => setSelectedLedgerCustomer(cust)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#00a631]/10 hover:bg-[#00a631]/20 text-[#00a631] text-xs font-bold rounded-md transition-all cursor-pointer"
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
          onOpenPaymentIn={() => {
            setSelectedBillsCustomer(null);
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
          onClose={() => setShowPaymentInModal(false)}
        />
      )}

      {/* Modal 5: Supabase SQL Migration Script */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#181a18] border border-gray-200 dark:border-[#2d302d] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2d302d] pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#00a631]" />
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Supabase SQL Migration for Credit Terms
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
