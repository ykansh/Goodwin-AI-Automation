import { useState } from 'react';
import { Download, UploadCloud, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToCsv } from '../../utils/excel';
import toast from 'react-hot-toast';

interface ExcelActionsProps {
  data: Record<string, any>[];
  fileName: string;
  sheetName?: string;
  onOpenImport?: () => void;
  hideImport?: boolean;
}

export function ExcelActions({
  data,
  fileName,
  sheetName = 'Sheet1',
  onOpenImport,
  hideImport = false,
}: ExcelActionsProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportXlsx = () => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data records available to export');
        return;
      }
      exportToExcel(data, fileName, sheetName);
      toast.success(`Exported ${data.length} records to ${fileName}.xlsx`);
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setShowExportMenu(false);
    }
  };

  const handleExportCsv = () => {
    try {
      if (!data || data.length === 0) {
        toast.error('No data records available to export');
        return;
      }
      exportToCsv(data, fileName);
      toast.success(`Exported ${data.length} records to ${fileName}.csv`);
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    } finally {
      setShowExportMenu(false);
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
      {/* Export Dropdown Group */}
      <div className="relative">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={handleExportXlsx}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-l-md border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2e332e] transition-colors cursor-pointer"
            title="Export directly to Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Export Excel</span>
          </button>
          <button
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-2 py-2 text-xs font-bold rounded-r-md border-y border-r border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825] text-gray-500 hover:bg-gray-50 dark:hover:bg-[#2e332e] transition-colors cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showExportMenu && (
          <>
            <div
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setShowExportMenu(false)}
            />
            <div className="absolute right-0 mt-1.5 w-44 rounded-xl glass-strong border border-black/10 dark:border-white/10 shadow-xl z-30 py-1 text-xs">
              <button
                type="button"
                onClick={handleExportXlsx}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 text-[#111814] dark:text-white font-bold cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#22c55e]" />
                <span>Download .xlsx</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-black/5 dark:hover:bg-white/5 text-[#111814] dark:text-white font-bold cursor-pointer"
              >
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Download .csv</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Import Button */}
      {!hideImport && onOpenImport && (
        <button
          type="button"
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-md border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2e332e] transition-colors cursor-pointer"
          title="Import and bulk-create records from Excel or CSV"
        >
          <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
          <span>Import Excel</span>
        </button>
      )}
    </div>
  );
}
