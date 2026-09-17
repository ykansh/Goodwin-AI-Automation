import React, { useState, useRef } from 'react';
import {
  X, UploadCloud, Download, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2
} from 'lucide-react';
import type { EntitySchema } from '../../utils/excel';
import {
  parseExcelFile,
  normalizeExcelRows,
  downloadSampleTemplate,
} from '../../utils/excel';
import toast from 'react-hot-toast';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: EntitySchema;
  onConfirmImport: (rows: Record<string, any>[]) => Promise<void>;
}

export function ExcelImportModal({
  isOpen,
  onClose,
  schema,
  onConfirmImport,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validRows, setValidRows] = useState<Record<string, any>[]>([]);
  const [invalidRows, setInvalidRows] = useState<{ row: Record<string, any>; errors: string[] }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    const isExcelOrCsv =
      selectedFile.name.endsWith('.xlsx') ||
      selectedFile.name.endsWith('.xls') ||
      selectedFile.name.endsWith('.csv');

    if (!isExcelOrCsv) {
      toast.error('Please upload a valid .xlsx, .xls, or .csv file');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    try {
      const rawData = await parseExcelFile(selectedFile);
      if (rawData.length === 0) {
        toast.error('The selected file has no data rows');
        setValidRows([]);
        setInvalidRows([]);
        return;
      }

      const { validRows: valid, invalidRows: invalid } = normalizeExcelRows(rawData, schema);
      setValidRows(valid);
      setInvalidRows(invalid);

      if (valid.length > 0) {
        toast.success(`Parsed ${valid.length} valid rows successfully!`);
      }
      if (invalid.length > 0) {
        toast.error(`${invalid.length} rows have missing or invalid required columns`);
      }
    } catch (err: any) {
      toast.error(`Failed to read file: ${err.message || 'Unknown error'}`);
      setValidRows([]);
      setInvalidRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = async () => {
    if (validRows.length === 0) {
      toast.error('No valid rows available to import');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmImport(validRows);
      toast.success(`Successfully imported ${validRows.length} records!`);
      handleReset();
      onClose();
    } catch (err: any) {
      toast.error(`Import failed: ${err.message || 'Please check data'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidRows([]);
    setInvalidRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#22c55e]/10 text-[#22c55e] rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#111814] dark:text-white">
                Import {schema.title}
              </h2>
              <p className="text-xs text-[#5f7365] dark:text-[#8fa093] font-medium">
                Bulk upload records from Microsoft Excel (.xlsx) or CSV (.csv)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#5f7365] hover:text-[#111814] dark:text-[#8fa093] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Step 1: Download Template */}
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase text-[#22c55e] tracking-wider">
                Step 1: Download Template
              </div>
              <p className="text-xs text-[#5f7365] dark:text-[#8fa093] mt-0.5">
                Download a pre-configured Excel spreadsheet with the exact columns required.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadSampleTemplate(schema.entityKey)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#22c55e] text-white hover:bg-[#16a34a] shadow transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Sample Template</span>
            </button>
          </div>

          {/* Step 2: Upload File Area */}
          <div>
            <div className="text-xs font-black uppercase text-[#5f7365] dark:text-[#8fa093] tracking-wider mb-2">
              Step 2: Upload Filled File
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragOver
                  ? 'border-[#22c55e] bg-[#22c55e]/5'
                  : 'border-black/15 dark:border-white/15 hover:border-[#22c55e]/50 hover:bg-black/[0.01]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#22c55e]">
                {isParsing ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm font-black text-[#111814] dark:text-white">
                  {file ? file.name : 'Click to browse or drag & drop file here'}
                </p>
                <p className="text-xs text-[#5f7365] dark:text-[#8fa093] mt-1">
                  Supports Excel (.xlsx, .xls) and CSV (.csv) up to 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Validation & Preview Summary */}
          {(validRows.length > 0 || invalidRows.length > 0) && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    {validRows.length} Ready to Import
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-500/10 text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      {invalidRows.length} Incomplete Rows
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-bold text-[#5f7365] dark:text-[#8fa093] hover:underline"
                >
                  Clear & Re-upload
                </button>
              </div>

              {/* Preview Table */}
              {validRows.length > 0 && (
                <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden text-xs">
                  <div className="px-4 py-2 bg-black/[0.03] dark:bg-white/[0.03] font-bold text-[#5f7365] dark:text-[#8fa093] border-b border-black/10 dark:border-white/10">
                    Preview (First {Math.min(validRows.length, 5)} valid rows)
                  </div>
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/5 dark:border-white/5 font-extrabold uppercase text-[10px] text-[#5f7365] dark:text-[#8fa093] bg-black/[0.01]">
                          {schema.fields.slice(0, 5).map((f) => (
                            <th key={f.key} className="p-2.5 px-3 whitespace-nowrap">
                              {f.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y border-black/5 dark:divide-white/5">
                        {validRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5">
                            {schema.fields.slice(0, 5).map((f) => (
                              <td key={f.key} className="p-2.5 px-3 whitespace-nowrap text-[#111814] dark:text-white font-medium">
                                {String(row[f.key] ?? '—')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Invalid Rows Warning Box */}
              {invalidRows.length > 0 && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-1">
                  <div className="font-black text-red-600 dark:text-red-400">
                    ⚠️ {invalidRows.length} rows will be skipped due to missing required fields:
                  </div>
                  <ul className="list-disc list-inside text-red-700 dark:text-red-300 max-h-24 overflow-y-auto space-y-0.5">
                    {invalidRows.slice(0, 5).map((inv, idx) => (
                      <li key={idx}>
                        Row {idx + 1}: {inv.errors.join(', ')}
                      </li>
                    ))}
                    {invalidRows.length > 5 && (
                      <li className="font-bold">...and {invalidRows.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-5 border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[#5f7365] dark:text-[#8fa093]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={validRows.length === 0 || isSubmitting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black shadow-lg transition-all cursor-pointer ${
              validRows.length === 0 || isSubmitting
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-[#22c55e]/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing to Database...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Import {validRows.length} Records</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
