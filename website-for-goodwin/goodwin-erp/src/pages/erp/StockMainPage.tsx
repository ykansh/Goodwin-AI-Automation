import { useState } from 'react';
import { useProducts } from '../../hooks/queries';
import { useUpdateProduct } from '../../hooks/mutations';
import type { Product } from '../../types';
import { ExcelActions } from '../../components/common/ExcelActions';
import { Search, Loader2, Edit2, Check, X, Sliders, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function StockMainPage() {
  const { data: products = [], isLoading } = useProducts();
  const updateProductMutation = useUpdateProduct();

  const [searchTerm, setSearchTerm] = useState('');
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineValue, setInlineValue] = useState<string>('');

  // Modal editing state
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalStableStock, setModalStableStock] = useState<string>('20');

  const filteredProducts = products.filter(
    (p) =>
      (p.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.battery_model ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = filteredProducts.map((p) => {
    const stableStock = p.stable_stock ?? 20;
    const currentStock = p.stock ?? 0;
    const requiredStock = Math.max(0, stableStock - currentStock);
    return {
      'Product Name': p.name,
      'Model & Spec': `${p.voltage} ${p.ah}`,
      'SKU': p.sku,
      'Current Stock': currentStock,
      'Stable Stock': stableStock,
      'Required Stock (Restock)': requiredStock,
      'Restock Needed': requiredStock > 0 ? 'YES' : 'NO',
    };
  });

  // Start inline editing
  const handleStartInlineEdit = (p: Product) => {
    setInlineEditingId(p.id);
    setInlineValue(String(p.stable_stock ?? 20));
  };

  // Save inline edit
  const handleSaveInline = (productId: string) => {
    const num = parseInt(inlineValue, 10);
    if (isNaN(num) || num < 0) {
      toast.error('Stable stock must be a non-negative number');
      return;
    }

    updateProductMutation.mutate(
      {
        id: productId,
        data: { stable_stock: num },
      },
      {
        onSuccess: () => {
          setInlineEditingId(null);
        },
      }
    );
  };

  // Open modal edit
  const handleOpenModal = (p: Product) => {
    setModalProduct(p);
    setModalStableStock(String(p.stable_stock ?? 20));
  };

  // Save modal edit
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalProduct) return;

    const num = parseInt(modalStableStock, 10);
    if (isNaN(num) || num < 0) {
      toast.error('Stable stock must be a non-negative number');
      return;
    }

    updateProductMutation.mutate(
      {
        id: modalProduct.id,
        data: { stable_stock: num },
      },
      {
        onSuccess: () => {
          setModalProduct(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-strong p-4 rounded-lg border border-gray-200 dark:border-[#2d302d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white tracking-tight">
            Stock Main
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Overview of current stock, stable baseline, and calculated restock requirements.
          </p>
        </div>

        {/* Top Right: Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <ExcelActions
            data={exportData}
            fileName="Goodwin_Stock_Main_Restock_Report"
            hideImport={true}
          />
        </div>
      </div>

      {/* Search Top Left */}
      <div className="flex items-center gap-2 w-full sm:w-56 px-3 py-2.5 rounded-md border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825]">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-200 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Data Table */}
      <div className="glass-strong overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>PRODUCT NAME & SPEC</th>
                <th>SKU</th>
                <th>CURRENT STOCK</th>
                <th>STABLE STOCK</th>
                <th>REQUIRED STOCK</th>
                <th className="text-right pr-6">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-[#00a631] animate-spin mx-auto" />
                    <p className="mt-2 text-sm font-bold text-gray-500">Loading stock data...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 font-bold">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stableStock = p.stable_stock ?? 20;
                  const currentStock = p.stock ?? 0;
                  const requiredStock = Math.max(0, stableStock - currentStock);
                  const isInlineEditing = inlineEditingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      {/* PRODUCT NAME & SPEC */}
                      <td>
                        <div className="font-extrabold text-[#3a3b39] dark:text-white text-sm">{p.name}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                          Goodwin · {p.voltage} {p.ah}
                        </div>
                      </td>

                      {/* SKU */}
                      <td>
                        <div className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{p.sku}</div>
                      </td>

                      {/* CURRENT STOCK */}
                      <td>
                        <span className="font-extrabold text-sm text-[#3a3b39] dark:text-white">
                          {currentStock}
                        </span>
                      </td>

                      {/* STABLE STOCK (WITH INLINE EDIT) */}
                      <td>
                        {isInlineEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveInline(p.id);
                                if (e.key === 'Escape') setInlineEditingId(null);
                              }}
                              autoFocus
                              className="w-20 px-2 py-1 text-xs font-black rounded border border-[#22c55e] bg-white dark:bg-[#1a1d1a] text-[#111814] dark:text-white outline-none focus:ring-1 focus:ring-[#22c55e]"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveInline(p.id)}
                              disabled={updateProductMutation.isPending}
                              className="p-1 rounded bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors cursor-pointer"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setInlineEditingId(null)}
                              className="p-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span className="font-extrabold text-sm text-gray-700 dark:text-gray-200">
                              {stableStock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartInlineEdit(p)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-all cursor-pointer"
                              title="Click to edit stable stock inline"
                            >
                              <Edit2 className="w-3 h-3 text-[#22c55e]" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* REQUIRED STOCK */}
                      <td>
                        <span
                          className={`font-black text-sm ${
                            requiredStock > 0 ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {requiredStock}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="text-right pr-6">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(p)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-black/5 dark:bg-white/5 hover:bg-[#22c55e]/10 text-gray-700 dark:text-gray-300 hover:text-[#22c55e] border border-black/5 dark:border-white/5 hover:border-[#22c55e]/30 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Stable Stock</span>
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

      {/* Edit Stable Stock Modal */}
      {modalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-strong border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#22c55e]/10 text-[#22c55e] rounded-lg">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111814] dark:text-white">
                    Edit Stable Stock Baseline
                  </h3>
                  <p className="text-xs text-[#5f7365] dark:text-[#8fa093]">
                    {modalProduct.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalProduct(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-5">
              {/* Product Info Summary */}
              <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5f7365] dark:text-[#8fa093]">SKU Code:</span>
                  <span className="font-mono font-bold text-[#111814] dark:text-white">{modalProduct.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5f7365] dark:text-[#8fa093]">Spec / Voltage:</span>
                  <span className="font-bold text-[#111814] dark:text-white">{modalProduct.voltage} {modalProduct.ah}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-black/5 dark:border-white/5">
                  <span className="text-[#5f7365] dark:text-[#8fa093]">Current Physical Stock:</span>
                  <span className="font-black text-[#111814] dark:text-white">{modalProduct.stock ?? 0} units</span>
                </div>
              </div>

              {/* Stable Stock Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-[#5f7365] dark:text-[#8fa093]">
                  Stable Stock Baseline Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={modalStableStock}
                  onChange={(e) => setModalStableStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825] text-[#111814] dark:text-white font-extrabold text-sm outline-none focus:ring-2 focus:ring-[#22c55e]"
                  placeholder="e.g. 20"
                />
                <p className="text-[11px] text-[#5f7365] dark:text-[#8fa093]">
                  The target threshold you always want ready on hand in your warehouse.
                </p>
              </div>

              {/* Dynamic Live Calculation Preview */}
              {(() => {
                const parsedStable = parseInt(modalStableStock, 10) || 0;
                const current = modalProduct.stock ?? 0;
                const req = Math.max(0, parsedStable - current);

                return (
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                      req > 0
                        ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {req > 0 ? (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-black">
                        {req > 0 ? (
                          <>Required Stock: <span className="underline">{req} units</span> (Restock Needed)</>
                        ) : (
                          <>Current stock satisfies this baseline. Required Stock: 0</>
                        )}
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        Math: {parsedStable} (Stable) - {current} (Current) = {parsedStable - current > 0 ? parsedStable - current : 0}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalProduct(null)}
                  disabled={updateProductMutation.isPending}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-[#5f7365] dark:text-[#8fa093]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-black rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-lg shadow-[#22c55e]/20 transition-all cursor-pointer"
                >
                  {updateProductMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Stable Stock</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
