'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/utils';
import {
  FileSpreadsheet,
  Download,
  FileCode,
  FileCheck2,
  TrendingUp,
  Percent,
  Receipt,
  Building,
  CheckCircle,
  ExternalLink,
  Share2,
} from 'lucide-react';

export default function ReportsPage() {
  const { invoices, items, expenses, business, addInvoice } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'GSTR1' | 'GSTR3B' | 'PNL' | 'TALLY'>('GSTR1');
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Financial Calculations for P&L
  const totalSalesRevenue = invoices.reduce((acc, inv) => acc + inv.subtotal, 0);
  
  // Calculate COGS based on invoice items matched to purchase price
  const estimatedCOGS = invoices.reduce((acc, inv) => {
    const invCogs = inv.items.reduce((lineAcc, line) => {
      const matched = items.find((i) => i.id === line.itemId);
      const cost = matched ? matched.purchasePrice : line.unitPrice * 0.75;
      return lineAcc + cost * line.quantity;
    }, 0);
    return acc + invCogs;
  }, 0);

  const grossProfit = Math.max(0, totalSalesRevenue - estimatedCOGS);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const grossMargin = totalSalesRevenue > 0 ? Math.round((grossProfit / totalSalesRevenue) * 100) : 0;
  const netMargin = totalSalesRevenue > 0 ? Math.round((netProfit / totalSalesRevenue) * 100) : 0;

  // GSTR-1 Categorization
  const b2bInvoices = invoices.filter((inv) => Boolean(inv.partyGstin && inv.partyGstin.length >= 15));
  const b2csInvoices = invoices.filter((inv) => !inv.partyGstin || inv.partyGstin.length < 15);

  // Tax Totals
  const totalCgst = invoices.reduce((acc, inv) => acc + inv.cgstTotal, 0);
  const totalSgst = invoices.reduce((acc, inv) => acc + inv.sgstTotal, 0);
  const totalIgst = invoices.reduce((acc, inv) => acc + inv.igstTotal, 0);
  const totalTaxLiability = totalCgst + totalSgst + totalIgst;

  // HSN Summary aggregation
  const hsnMap: { [key: string]: { hsn: string; qty: number; taxable: number; tax: number } } = {};
  invoices.forEach((inv) => {
    inv.items.forEach((line) => {
      const code = line.hsnCode || '8507';
      if (!hsnMap[code]) {
        hsnMap[code] = { hsn: code, qty: 0, taxable: 0, tax: 0 };
      }
      hsnMap[code].qty += line.quantity;
      const taxable = line.unitPrice * line.quantity;
      hsnMap[code].taxable += taxable;
      hsnMap[code].tax += (taxable * line.taxRate) / 100;
    });
  });
  const hsnSummaryList = Object.values(hsnMap);

  // Download GSTR-1 JSON (Government portal format)
  const handleDownloadGSTR1Json = () => {
    const gstr1Payload = {
      gstin: business.gstin,
      fp: '102026',
      gt: totalSalesRevenue,
      cur_gt: totalSalesRevenue,
      b2b: b2bInvoices.map((inv) => ({
        ctin: inv.partyGstin,
        inv: [
          {
            inum: inv.invoiceNumber,
            idt: inv.invoiceDate,
            val: inv.totalAmount,
            pos: inv.partyStateCode,
            rchrg: 'N',
            inv_typ: 'R',
            itms: inv.items.map((it, idx) => ({
              num: idx + 1,
              itm_det: {
                rt: it.taxRate,
                txval: it.unitPrice * it.quantity,
                iamt: it.igst,
                camt: it.cgst,
                samt: it.sgst,
                csamt: 0,
              },
            })),
          },
        ],
      })),
      b2cs: b2csInvoices.map((inv) => ({
        sply_ty: inv.partyStateCode === business.stateCode ? 'INTRA' : 'INTER',
        pos: inv.partyStateCode,
        typ: 'OE',
        txval: inv.subtotal,
        iamt: inv.igstTotal,
        camt: inv.cgstTotal,
        samt: inv.sgstTotal,
        csamt: 0,
      })),
      hsn: {
        data: hsnSummaryList.map((h, i) => ({
          num: i + 1,
          hsn_sc: h.hsn,
          desc: 'Battery & Solar Power Equipment',
          uqc: 'PCS',
          qty: h.qty,
          val: h.taxable + h.tax,
          txval: h.taxable,
          iamt: 0,
          camt: h.tax / 2,
          samt: h.tax / 2,
          csamt: 0,
        })),
      },
    };

    const blob = new Blob([JSON.stringify(gstr1Payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_${business.gstin}_Oct2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Tally Prime XML
  const handleDownloadTallyXml = () => {
    const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        ${invoices
          .map(
            (inv) => `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${inv.invoiceDate.replace(/-/g, '')}</DATE>
            <VOUCHERNUMBER>${inv.invoiceNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${inv.partyName}</PARTYLEDGERNAME>
            <AMOUNT>-${inv.totalAmount}</AMOUNT>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${inv.partyName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${inv.totalAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales GST @ ${inv.items[0]?.taxRate || 18}%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.subtotal}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>`
          )
          .join('')}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TallyPrime_Sales_${business.gstin}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
      {/* Sidebar */}
      <Sidebar onOpenQuickBill={() => setIsBillingModalOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onOpenQuickBill={() => setIsBillingModalOpen(true)}
          onOpenAddItem={() => {}}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  GST Compliance &amp; Business Reports
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-[#4c3cce]">
                  Filing Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate GSTR-1 JSON, GSTR-3B summary, P&amp;L Statements &amp; 1-click Tally Prime exports
              </p>
            </div>

            {/* Quick Export Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleDownloadTallyXml}
                className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <FileCode size={15} className="text-amber-600" />
                <span>Export to Tally XML</span>
              </button>

              <button
                onClick={handleDownloadGSTR1Json}
                className="h-9 px-4 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
              >
                <Download size={15} />
                <span>Download GSTR-1 JSON</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tax Liability */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                GST Tax Liability
              </span>
              <p className="text-xl font-black text-[#4c3cce] mt-1">
                {formatINR(totalTaxLiability)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                CGST: {formatINR(totalCgst)} | SGST: {formatINR(totalSgst)}
              </p>
            </div>

            {/* Gross Profit */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Gross Profit</span>
              <p className="text-xl font-black text-emerald-600 mt-1">{formatINR(grossProfit)}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {grossMargin}% Gross Margin
              </p>
            </div>

            {/* Total Overheads */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Operating Overheads</span>
              <p className="text-xl font-black text-rose-600 mt-1">{formatINR(totalExpenses)}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Rent, logistics, utilities</p>
            </div>

            {/* Net Profit */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Net Business Profit</span>
              <p className="text-xl font-black text-slate-900 mt-1">{formatINR(netProfit)}</p>
              <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                {netMargin}% Net Margin
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold pt-1">
            <button
              onClick={() => setActiveReportTab('GSTR1')}
              className={`pb-2.5 transition-colors flex items-center gap-1.5 border-b-2 ${
                activeReportTab === 'GSTR1'
                  ? 'border-[#4c3cce] text-[#4c3cce]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet size={15} />
              <span>GSTR-1 Outward Supplies</span>
            </button>

            <button
              onClick={() => setActiveReportTab('GSTR3B')}
              className={`pb-2.5 transition-colors flex items-center gap-1.5 border-b-2 ${
                activeReportTab === 'GSTR3B'
                  ? 'border-[#4c3cce] text-[#4c3cce]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCheck2 size={15} />
              <span>GSTR-3B Tax Summary</span>
            </button>

            <button
              onClick={() => setActiveReportTab('PNL')}
              className={`pb-2.5 transition-colors flex items-center gap-1.5 border-b-2 ${
                activeReportTab === 'PNL'
                  ? 'border-[#4c3cce] text-[#4c3cce]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp size={15} />
              <span>Profit &amp; Loss Statement</span>
            </button>

            <button
              onClick={() => setActiveReportTab('TALLY')}
              className={`pb-2.5 transition-colors flex items-center gap-1.5 border-b-2 ${
                activeReportTab === 'TALLY'
                  ? 'border-[#4c3cce] text-[#4c3cce]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCode size={15} />
              <span>Tally Prime Integration</span>
            </button>
          </div>

          {/* Tab 1: GSTR-1 Report View */}
          {activeReportTab === 'GSTR1' && (
            <div className="space-y-6">
              {/* B2B Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">
                      Table 4A: B2B Invoices (Registered Buyers)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Invoices issued to clients with valid GSTINs
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#4c3cce] font-bold text-xs">
                    {b2bInvoices.length} Registered Bills
                  </span>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-4">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Buyer Name</th>
                      <th className="py-2.5 px-3">Buyer GSTIN</th>
                      <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                      <th className="py-2.5 px-3 text-right">CGST</th>
                      <th className="py-2.5 px-3 text-right">SGST</th>
                      <th className="py-2.5 px-3 text-right">IGST</th>
                      <th className="py-2.5 px-4 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {b2bInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">{inv.invoiceDate}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{inv.partyName}</td>
                        <td className="py-3 px-3 font-mono text-[#4c3cce]">{inv.partyGstin}</td>
                        <td className="py-3 px-3 text-right font-medium">
                          {formatINR(inv.subtotal)}
                        </td>
                        <td className="py-3 px-3 text-right">{formatINR(inv.cgstTotal)}</td>
                        <td className="py-3 px-3 text-right">{formatINR(inv.sgstTotal)}</td>
                        <td className="py-3 px-3 text-right">{formatINR(inv.igstTotal)}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                          {formatINR(inv.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table 12: HSN Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-xs">
                    Table 12: HSN-wise Summary of Outward Supplies
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mandatory item classification summary for GST return submission
                  </p>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold text-[11px] uppercase border-b border-slate-200">
                      <th className="py-2.5 px-4">HSN Code</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Total Quantity</th>
                      <th className="py-2.5 px-3 text-right">Taxable Value (₹)</th>
                      <th className="py-2.5 px-4 text-right">Total Tax (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hsnSummaryList.map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{h.hsn}</td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          Electric Accumulators, Inverters &amp; Solar Products
                        </td>
                        <td className="py-3 px-3 text-center font-bold">{h.qty} PCS</td>
                        <td className="py-3 px-3 text-right font-semibold">
                          {formatINR(h.taxable)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#4c3cce]">
                          {formatINR(h.tax)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: GSTR-3B Summary View */}
          {activeReportTab === 'GSTR3B' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Form GSTR-3B (Monthly Summary Return)
                </h3>
                <p className="text-xs text-slate-500">
                  Table 3.1: Details of Outward Supplies and inward supplies liable to reverse charge
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <th className="py-3 px-4">Nature of Supply</th>
                      <th className="py-3 px-4 text-right">Total Taxable Value (₹)</th>
                      <th className="py-3 px-4 text-right">Integrated Tax (IGST)</th>
                      <th className="py-3 px-4 text-right">Central Tax (CGST)</th>
                      <th className="py-3 px-4 text-right">State/UT Tax (SGST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        (a) Outward taxable supplies (other than zero rated, nil rated and exempted)
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {formatINR(totalSalesRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{formatINR(totalIgst)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatINR(totalCgst)}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatINR(totalSgst)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Net Payment */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">Net Tax Payable for the Period</h4>
                  <p className="text-[11px] text-slate-500">
                    Ready to pay on GST Portal before 20th of the month
                  </p>
                </div>
                <span className="text-2xl font-black text-[#4c3cce]">
                  {formatINR(totalTaxLiability)}
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Profit & Loss Statement */}
          {activeReportTab === 'PNL' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Profit &amp; Loss Statement</h3>
                  <p className="text-xs text-slate-500">{business.businessName} • Financial Year 2026-27</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Net Profit</span>
                  <span className="text-2xl font-black text-emerald-600">{formatINR(netProfit)}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Revenue */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-[#4c3cce]">
                    1. Revenue from Operations
                  </h4>
                  <div className="flex justify-between text-slate-700">
                    <span>Gross Sales Turnover (Excluding GST):</span>
                    <span className="font-bold">{formatINR(totalSalesRevenue)}</span>
                  </div>
                </div>

                {/* COGS */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-amber-700">
                    2. Cost of Goods Sold (COGS)
                  </h4>
                  <div className="flex justify-between text-slate-700">
                    <span>Purchase Cost of Inventory Sold:</span>
                    <span className="font-bold text-rose-600">-{formatINR(estimatedCOGS)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Gross Margin / Gross Profit:</span>
                    <span className="text-emerald-600">{formatINR(grossProfit)} ({grossMargin}%)</span>
                  </div>
                </div>

                {/* Overheads */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-rose-700">
                    3. Operational Overheads &amp; Expenses
                  </h4>
                  {expenses.map((e) => (
                    <div key={e.id} className="flex justify-between text-slate-600">
                      <span>{e.category}:</span>
                      <span>-{formatINR(e.amount)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Total Operating Expenses:</span>
                    <span className="text-rose-600">-{formatINR(totalExpenses)}</span>
                  </div>
                </div>

                {/* Final Net Profit */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex justify-between items-baseline">
                  <div>
                    <h4 className="text-sm font-black text-emerald-950">Net Business Profit</h4>
                    <p className="text-[11px] text-slate-500">Earnings before income tax</p>
                  </div>
                  <span className="text-2xl font-black text-emerald-600">{formatINR(netProfit)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Tally Prime Integration */}
          {activeReportTab === 'TALLY' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                  <FileCode size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tally Prime XML Export</h3>
                  <p className="text-xs text-slate-500">
                    Export your daily sales and customer ledgers to standard Tally XML format
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800">How to import into Tally Prime:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 leading-relaxed">
                  <li>Click the button below to download the generated XML envelope file.</li>
                  <li>Open <strong>Tally Prime</strong> and go to <strong>Import &gt; Transactions</strong> (or press Alt + O).</li>
                  <li>Select the downloaded XML file and choose "Combine Opening Balances" or "Modify Existing".</li>
                  <li>All vouchers, customer accounts, and tax ledgers will be synchronized automatically.</li>
                </ol>

                <div className="pt-3">
                  <button
                    onClick={handleDownloadTallyXml}
                    className="px-6 py-2.5 rounded-xl bg-[#db631a] hover:bg-[#c45312] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
                  >
                    <Download size={15} />
                    <span>Download TallyPrime_Sales_{business.gstin}.xml</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <CreateInvoiceModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onInvoiceCreated={(newInv) => addInvoice(newInv)}
      />
    </div>
  );
}
