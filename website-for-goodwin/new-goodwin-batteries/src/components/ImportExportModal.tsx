'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  exportInvoicesToCSV,
  exportItemsToCSV,
  exportPartiesToCSV,
  downloadSampleItemsTemplate,
  downloadSamplePartiesTemplate,
  parseImportedItems,
  parseImportedParties,
} from '@/lib/csvUtils';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Package,
  Users,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Sparkles,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'EXPORT' | 'IMPORT';
}

export default function ImportExportModal({
  isOpen,
  onClose,
  initialTab = 'EXPORT',
}: ImportExportModalProps) {
  const {
    invoices,
    items,
    parties,
    addItem,
    addParty,
    selectedCompany,
    refreshData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT'>(initialTab);
  const [importEntity, setImportEntity] = useState<'ITEMS' | 'PARTIES'>('ITEMS');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [parsedItemCount, setParsedItemCount] = useState<number>(0);
  const [parsedPartyCount, setParsedPartyCount] = useState<number>(0);
  const [parsedItemsData, setParsedItemsData] = useState<any[]>([]);
  const [parsedPartiesData, setParsedPartiesData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle CSV file selection and parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setValidationErrors([]);
    setImportSuccessMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (importEntity === 'ITEMS') {
        const { items: parsed, errors } = parseImportedItems(content);
        setParsedItemsData(parsed);
        setParsedItemCount(parsed.length);
        setValidationErrors(errors);
      } else {
        const { parties: parsed, errors } = parseImportedParties(content);
        setParsedPartiesData(parsed);
        setParsedPartyCount(parsed.length);
        setValidationErrors(errors);
      }
    };
    reader.readAsText(file);
  };

  // Perform Batch Import into AppContext & Supabase
  const handleExecuteImport = async () => {
    setIsProcessing(true);
    setImportSuccessMessage('');
    try {
      if (importEntity === 'ITEMS') {
        let successCount = 0;
        for (const item of parsedItemsData) {
          await addItem(item);
          successCount++;
        }
        setImportSuccessMessage(
          `Successfully imported ${successCount} products into ${selectedCompany.displayName} and synced to Supabase!`
        );
        setParsedItemsData([]);
        setParsedItemCount(0);
      } else {
        let successCount = 0;
        for (const party of parsedPartiesData) {
          await addParty(party);
          successCount++;
        }
        setImportSuccessMessage(
          `Successfully imported ${successCount} customer & dealer profiles into ${selectedCompany.displayName}!`
        );
        setParsedPartiesData([]);
        setParsedPartyCount(0);
      }
      setSelectedFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await refreshData();
    } catch (err: any) {
      setValidationErrors([err.message || 'Error occurred while saving records.']);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-[#4c3cce] flex items-center justify-center">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Data Import &amp; Export Center</h2>
              <p className="text-[11px] text-slate-500">
                Functional CSV exchange for {selectedCompany.displayName} (Supabase Sync)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-5 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('EXPORT');
              setImportSuccessMessage('');
              setValidationErrors([]);
            }}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'EXPORT'
                ? 'bg-white text-[#4c3cce] border-t-2 border-x border-[#4c3cce] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download size={14} />
            <span>Export Data (Download CSV)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('IMPORT');
              setImportSuccessMessage('');
              setValidationErrors([]);
            }}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'IMPORT'
                ? 'bg-white text-[#4c3cce] border-t-2 border-x border-[#4c3cce] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload size={14} />
            <span>Import Data (Upload CSV)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* ── TAB 1: EXPORT DATA ────────────────────────────────────────────── */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Download structured CSV spreadsheets containing all live database records for{' '}
                <strong>{selectedCompany.displayName}</strong>. Compatible with Microsoft Excel,
                Google Sheets, and Tally.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Export Invoices */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4c3cce] flex items-center justify-center mb-3">
                      <Receipt size={16} />
                    </div>
                    <h3 className="font-bold text-xs text-slate-900">Sales Invoices</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {invoices.length} live bills &amp; estimates
                    </p>
                  </div>
                  <button
                    onClick={() => exportInvoicesToCSV(invoices, selectedCompany.displayName)}
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4c3cce] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download size={13} />
                    <span>Download CSV</span>
                  </button>
                </div>

                {/* Export Inventory */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                      <Package size={16} />
                    </div>
                    <h3 className="font-bold text-xs text-slate-900">Products &amp; Stock</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {items.length} live catalog items
                    </p>
                  </div>
                  <button
                    onClick={() => exportItemsToCSV(items, selectedCompany.displayName)}
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download size={13} />
                    <span>Download CSV</span>
                  </button>
                </div>

                {/* Export Parties */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                      <Users size={16} />
                    </div>
                    <h3 className="font-bold text-xs text-slate-900">Parties (Khata)</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {parties.length} customers &amp; dealers
                    </p>
                  </div>
                  <button
                    onClick={() => exportPartiesToCSV(parties, selectedCompany.displayName)}
                    className="mt-4 w-full py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download size={13} />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: IMPORT DATA ────────────────────────────────────────────── */}
          {activeTab === 'IMPORT' && (
            <div className="space-y-4">
              {/* Select Entity Type */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Import Entity:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImportEntity('ITEMS');
                      setSelectedFileName('');
                      setParsedItemsData([]);
                      setParsedItemCount(0);
                      setValidationErrors([]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      importEntity === 'ITEMS'
                        ? 'border-[#4c3cce] bg-[#ece9fb] text-[#4c3cce]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Package size={14} />
                    <span>Products &amp; Inventory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportEntity('PARTIES');
                      setSelectedFileName('');
                      setParsedPartiesData([]);
                      setParsedPartyCount(0);
                      setValidationErrors([]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      importEntity === 'PARTIES'
                        ? 'border-[#4c3cce] bg-[#ece9fb] text-[#4c3cce]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Users size={14} />
                    <span>Customers &amp; Dealers</span>
                  </button>
                </div>

                {/* Sample Template Download */}
                <button
                  type="button"
                  onClick={() => {
                    if (importEntity === 'ITEMS') downloadSampleItemsTemplate();
                    else downloadSamplePartiesTemplate();
                  }}
                  className="ml-auto text-[11px] font-semibold text-[#4c3cce] hover:underline flex items-center gap-1"
                >
                  <Download size={12} />
                  <span>Download Sample Template</span>
                </button>
              </div>

              {/* Upload Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#4c3cce] rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,text/csv"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#4c3cce] flex items-center justify-center mx-auto mb-2">
                  <Upload size={18} />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {selectedFileName ? selectedFileName : 'Click to select CSV spreadsheet'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports comma-separated .csv files. Required columns: Name, Price / Phone.
                </p>
              </div>

              {/* Success Notification */}
              {importSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}

              {/* Errors Notification */}
              {validationErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={15} />
                    <span>Validation Warnings</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                    {validationErrors.slice(0, 4).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              {(parsedItemCount > 0 || parsedPartyCount > 0) && (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">
                      Parsed Preview ({importEntity === 'ITEMS' ? parsedItemCount : parsedPartyCount}{' '}
                      records ready)
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Valid CSV Format
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-600 sticky top-0">
                        <tr>
                          <th className="p-2">Name</th>
                          {importEntity === 'ITEMS' ? (
                            <>
                              <th className="p-2">Category</th>
                              <th className="p-2">Rate (₹)</th>
                              <th className="p-2">Stock</th>
                            </>
                          ) : (
                            <>
                              <th className="p-2">Phone</th>
                              <th className="p-2">GSTIN</th>
                              <th className="p-2">State</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importEntity === 'ITEMS'
                          ? parsedItemsData.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2 font-medium">{row.name}</td>
                                <td className="p-2">{row.category}</td>
                                <td className="p-2 font-bold">₹{row.salesPrice}</td>
                                <td className="p-2">{row.stock}</td>
                              </tr>
                            ))
                          : parsedPartiesData.slice(0, 5).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2 font-medium">{row.name}</td>
                                <td className="p-2">{row.phone}</td>
                                <td className="p-2 font-mono">{row.gstin || 'None'}</td>
                                <td className="p-2">{row.state}</td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-16 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Database size={13} className="text-[#4c3cce]" />
            <span>Target: {selectedCompany.displayName} (Supabase)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              Close
            </button>
            {activeTab === 'IMPORT' && (parsedItemCount > 0 || parsedPartyCount > 0) && (
              <button
                onClick={handleExecuteImport}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-[#db631a] hover:bg-[#c45312] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Syncing to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>
                      Save {importEntity === 'ITEMS' ? parsedItemCount : parsedPartyCount} Records
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
