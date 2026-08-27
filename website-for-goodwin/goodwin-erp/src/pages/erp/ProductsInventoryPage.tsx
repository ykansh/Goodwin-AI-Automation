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
      <div className="glass-strong p-6 rounded-3xl border border-white/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] tracking-tight">
            Products & Inventory Catalog
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Goodwin Battery Models (12V 8Ah, 12V 14Ah, 12V 150Ah Endura N150) & Warehouse Rack Locations
          </p>
        </div>

        {/* Top Right: Add Products Option */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00a631] hover:bg-[#008a29] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#00a631]/30 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> + Add Products
        </button>
      </div>

      {/* Search Top Left */}
      <div className="glass p-4 rounded-2xl border border-white/60">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Battery Model, SKU (GW-N150)..."
            className="w-full pl-9 pr-4 py-2 text-xs glass-input font-semibold"
          />
        </div>
      </div>

      {/* Data Table Matching User Photo */}
      <div className="glass-strong rounded-3xl border border-white/60 overflow-hidden shadow-sm">
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
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    {/* PRODUCT NAME & SPEC */}
                    <td>
                      <div className="font-extrabold text-[#3a3b39] text-sm">{p.name}</div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        Goodwin · {p.voltage} {p.ah}
                      </div>
                    </td>

                    {/* SKU & HSN */}
                    <td>
                      <div className="font-mono text-xs font-bold text-gray-700">{p.sku}</div>
                      <div className="text-[10px] text-gray-400 font-semibold">HSN: {p.hsn}</div>
                    </td>

                    {/* CATEGORY & TYPE */}
                    <td>
                      <div className="mb-0.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                          {p.category || 'Automotive'}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        {p.technology || 'Flooded (Lead-Acid)'}
                      </div>
                    </td>

                    {/* COST PRICE */}
                    <td className="font-semibold text-gray-600">
                      ₹{p.purchase_price.toLocaleString('en-IN')}.00
                    </td>

                    {/* SELLING PRICE */}
                    <td className="font-extrabold text-[#3a3b39]">
                      ₹{p.selling_price.toLocaleString('en-IN')}.00
                    </td>

                    {/* STOCK */}
                    <td>
                      <span
                        className={`font-extrabold text-sm ${
                          p.stock < 5 ? 'text-red-600 font-black' : 'text-[#3a3b39]'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>

                    {/* WARRANTY */}
                    <td className="text-xs font-semibold text-gray-600">
                      {p.warranty_months} mos
                    </td>

                    {/* ACTIONS: Edit */}
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(p)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-[#3a3b39] text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
