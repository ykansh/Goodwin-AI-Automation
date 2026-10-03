'use client';

import React from 'react';
import {
  X,
  Share2,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  PlusCircle,
  Phone,
  Building,
} from 'lucide-react';
import { MockParty } from '@/lib/mockData';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/utils';

interface PartyStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: MockParty | null;
  onRecordPayment: (party: MockParty) => void;
}

export default function PartyStatementModal({
  isOpen,
  onClose,
  party,
  onRecordPayment,
}: PartyStatementModalProps) {
  const { invoices, payments, business } = useApp();

  if (!isOpen || !party) return null;

  // Filter transactions for this party
  const partyInvoices = invoices.filter(
    (inv) => inv.partyName.toLowerCase() === party.name.toLowerCase()
  );
  const partyPayments = payments.filter((p) => p.partyId === party.id);

  // Combine and sort by date
  interface LedgerRow {
    id: string;
    date: string;
    type: 'INVOICE' | 'PAYMENT';
    title: string;
    refNo: string;
    debit: number;
    credit: number;
  }

  const rows: LedgerRow[] = [];

  partyInvoices.forEach((inv) => {
    rows.push({
      id: inv.id,
      date: inv.invoiceDate,
      type: 'INVOICE',
      title: `Sale Bill (${inv.invoiceType})`,
      refNo: inv.invoiceNumber,
      debit: inv.totalAmount, // Increases receivable
      credit: 0,
    });
  });

  partyPayments.forEach((pay) => {
    rows.push({
      id: pay.id,
      date: pay.date,
      type: 'PAYMENT',
      title: pay.type === 'PAYMENT_IN' ? `Payment Received (${pay.paymentMode})` : `Payment Out (${pay.paymentMode})`,
      refNo: pay.referenceNumber,
      debit: 0,
      credit: pay.amount, // Decreases receivable
    });
  });

  // Sort descending by date
  rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const isReceivable = party.currentBalance >= 0;

  const handleSendWhatsAppReminder = () => {
    const text = isReceivable
      ? `Dear ${party.name}, gentle reminder from ${business.businessName}. Your outstanding balance is ${formatINR(
          party.currentBalance
        )}. Please clear via UPI: ${business.upiId}. Thank you!`
      : `Dear ${party.name}, your account balance statement with ${business.businessName} is ${formatINR(
          Math.abs(party.currentBalance)
        )} (Credit).`;
    window.open(`https://wa.me/91${party.phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4c3cce] text-white flex items-center justify-center font-bold text-sm">
              <Building size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 text-base">{party.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {party.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Phone: +91 {party.phone} • GSTIN: {party.gstin || 'Unregistered'}
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

        {/* Financial Balance Strip */}
        <div className="p-4 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/30 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Net Outstanding (Khata)
              </span>
              <p
                className={`text-2xl font-black ${
                  isReceivable ? 'text-[#4c3cce]' : 'text-emerald-700'
                }`}
              >
                {formatINR(Math.abs(party.currentBalance))}{' '}
                <span className="text-xs font-semibold">
                  {isReceivable ? '(You will receive - Dr)' : '(You will pay - Cr)'}
                </span>
              </p>
            </div>

            <div className="border-l border-slate-200 pl-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Credit Limit
              </span>
              <p className="text-base font-bold text-slate-800">{formatINR(party.creditLimit)}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSendWhatsAppReminder}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Share2 size={14} />
              <span>WhatsApp Reminder</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onRecordPayment(party);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <PlusCircle size={14} />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
            >
              <Printer size={15} />
            </button>
          </div>
        </div>

        {/* Ledger Transaction Statement Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Ledger Transaction Statement</h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Transaction / Voucher</th>
                  <th className="py-2.5 px-4">Ref Number</th>
                  <th className="py-2.5 px-4 text-right text-rose-700">Debit (+)</th>
                  <th className="py-2.5 px-4 text-right text-emerald-700">Credit (-)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No past transactions found for this party.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{row.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                        {row.type === 'INVOICE' ? (
                          <Receipt size={14} className="text-[#4c3cce]" />
                        ) : (
                          <ArrowDownLeft size={14} className="text-emerald-600" />
                        )}
                        <span>{row.title}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{row.refNo}</td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600">
                        {row.debit > 0 ? formatINR(row.debit) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        {row.credit > 0 ? formatINR(row.credit) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-[11px] text-slate-500">
            UPI ID: <span className="font-mono text-slate-800">{business.upiId}</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
