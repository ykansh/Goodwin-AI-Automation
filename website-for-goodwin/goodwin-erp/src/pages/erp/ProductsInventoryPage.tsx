import { useState } from 'react';
import { useData } from '../../store/DataContext';
import type { Product } from '../../types';
import { NewProductModal } from '../../components/modals/NewProductModal';
import { EditProductModal } from '../../components/modals/EditProductModal';
import { Search, Plus } from 'lucide-react';

export function ProductsInventoryPage() {
  const { products } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.battery_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-strong p-6 rounded-3xl border border-gray-200 dark:border-[#2d302d] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white tracking-tight">
            Products & Inventory Catalog
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Goodwin Battery Models (12V 8Ah, 12V 14Ah, 12V 150Ah Endura N150) & Warehouse Rack Locations
          </p>
        </div>

        {/* Top Right: Add Products Option */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> + Add Products
        </button>
      </div>

      {/* Search Top Left */}
      <div className="flex items-center gap-2 w-full sm:w-56 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-[#374137] bg-white dark:bg-[#252825]">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
          className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-200 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Data Table Matching User Photo */}
      <div className="glass-strong overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>PRODUCT NAME & SPEC</th>
                <th>SKU & HSN</th>
                <th>CATEGORY & TYPE</th>
                <th>COST PRICE</th>
                <th>SELLING PRICE</th>
                <th>STOCK</th>
                <th>WARRANTY</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400 font-bold">
                    No battery products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                    {/* PRODUCT NAME & SPEC */}
                    <td>
                      <div className="font-extrabold text-[#3a3b39] dark:text-white text-sm">{p.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        Goodwin · {p.voltage} {p.ah}
                      </div>
                    </td>

                    {/* SKU & HSN */}
                    <td>
                      <div className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300">{p.sku}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">HSN: {p.hsn}</div>
                    </td>

                    {/* CATEGORY & TYPE */}
                    <td>
                      <div className="mb-0.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {p.category || 'Automotive'}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        {p.technology || 'Flooded (Lead-Acid)'}
                      </div>
                    </td>

                    {/* COST PRICE */}
                    <td className="font-semibold text-gray-600 dark:text-gray-400">
                      ₹{p.purchase_price.toLocaleString('en-IN')}.00
                    </td>

                    {/* SELLING PRICE */}
                    <td className="font-extrabold text-[#3a3b39] dark:text-white">
                      ₹{p.selling_price.toLocaleString('en-IN')}.00
                    </td>

                    {/* STOCK */}
                    <td>
                      <span
                        className={`font-extrabold text-sm ${
                          p.stock < 5 ? 'text-red-600 font-black' : 'text-[#3a3b39] dark:text-white'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>

                    {/* WARRANTY */}
                    <td className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {p.warranty_months} mos
                    </td>

                    {/* ACTIONS: Edit */}
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(p)}
                        className="px-3 py-1 bg-gray-100 dark:bg-[#252825] hover:bg-gray-200 dark:hover:bg-[#2d302d] text-[#3a3b39] dark:text-gray-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && <NewProductModal onClose={() => setShowAddModal(false)} />}
      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} />
      )}
    </div>
  );
}
