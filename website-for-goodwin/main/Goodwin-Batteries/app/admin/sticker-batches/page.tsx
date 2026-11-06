"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Search, RefreshCw, BarChart2, Trash2, Printer } from "lucide-react";
import Link from "next/link";

export default function StickerBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChannel, setFilterChannel] = useState("All");
  const [filterDealer, setFilterDealer] = useState("All");
  const [filterProduct, setFilterProduct] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [soldCounts, setSoldCounts] = useState<Record<string, number>>({});
  const [dealers, setDealers] = useState<Record<string, string>>({});
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const { data: batchData, error } = await supabase
        .from('sticker_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBatches(batchData || []);
      
      // Fetch dealers for mapping
      const { data: dealerData } = await supabase.from('dealers').select('id, name, city');
      if (dealerData) {
        const dMap: Record<string, string> = {};
        dealerData.forEach(d => {
          dMap[d.id] = `${d.name} (${d.city})`;
        });
        setDealers(dMap);
      }
      
      // Calculate sold counts for each batch
      const counts: Record<string, number> = {};
      
      // We can group batches by prefix_key to minimize database calls
      const prefixKeys = [...new Set((batchData || []).map(b => b.prefix_key))];
      
      for (const prefix of prefixKeys) {
        // Fetch all registrations for this prefix
        const { data: regs } = await supabase
          .from('warranty_registrations')
          .select('serial_number')
          .like('serial_number', `${prefix}-%`);
          
        if (regs) {
          // Find all batches with this prefix
          const batchesWithPrefix = batchData?.filter(b => b.prefix_key === prefix) || [];
          
          batchesWithPrefix.forEach(batch => {
            let sold = 0;
            regs.forEach(reg => {
              const parts = reg.serial_number.split('-');
              const seqStr = parts[parts.length - 1];
              const seq = parseInt(seqStr, 10);
              if (seq >= batch.start_sequence && seq <= batch.end_sequence) {
                sold++;
              }
            });
            counts[batch.id] = sold;
          });
        }
      }
      
      setSoldCounts(counts);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedBatches.length} batches? This cannot be undone.`)) return;
    setIsDeleting(true);
    
    const { error } = await supabase
      .from('sticker_batches')
      .delete()
      .in('id', selectedBatches);
      
    if (error) {
      alert("Error deleting batches: " + error.message);
    } else {
      setSelectedBatches([]);
      fetchBatches();
    }
    setIsDeleting(false);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedBatches(filteredBatches.map(b => b.id));
    } else {
      setSelectedBatches([]);
    }
  };
  
  const handleSelectBatch = (id: string) => {
    setSelectedBatches(prev => 
      prev.includes(id) ? prev.filter(batchId => batchId !== id) : [...prev, id]
    );
  };

  const uniqueProducts = Array.from(new Set(batches.map(b => b.product_name))).filter(Boolean) as string[];

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = 
      batch.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.prefix_key?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const batchChannel = batch.sales_channel || 'Dealer Network';
    const matchesChannel = filterChannel === "All" || batchChannel === filterChannel;
    const matchesDealer = filterDealer === "All" || batch.dealer_id === filterDealer;
    const matchesProduct = filterProduct === "All" || batch.product_name === filterProduct;
    
    let matchesDate = true;
    if (dateFrom && new Date(batch.created_at) < new Date(dateFrom)) matchesDate = false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(batch.created_at) > end) matchesDate = false;
    }
    
    return matchesSearch && matchesChannel && matchesDealer && matchesProduct && matchesDate;
  }).sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === "product_asc") return (a.product_name || "").localeCompare(b.product_name || "");
    if (sortOrder === "product_desc") return (b.product_name || "").localeCompare(a.product_name || "");
    return 0;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Sticker Batches</h1>
          <p className="text-muted-foreground">Manage generated factory stickers and track sales.</p>
        </div>
        <div className="flex gap-2">
          {selectedBatches.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 font-medium"
            >
              <Trash2 size={18} />
              {isDeleting ? "Deleting..." : `Delete (${selectedBatches.length})`}
            </button>
          )}
          <button 
            onClick={fetchBatches}
            className="bg-surface border border-border text-foreground px-4 py-2 rounded-lg hover:bg-border transition-colors flex items-center gap-2 font-medium"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-background/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Search by product or prefix..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-surface px-4 py-2 rounded-lg border border-border">
            <BarChart2 size={16} className="text-brand" />
            <span>Filtered: <strong className="text-foreground">{filteredBatches.length}</strong> / {batches.length}</span>
          </div>
        </div>
        
        <div className="p-4 border-b border-border bg-background flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Product Filter</label>
            <select 
              value={filterProduct} 
              onChange={e => setFilterProduct(e.target.value)} 
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-brand outline-none text-foreground min-w-[200px]"
            >
              <option value="All">All Products</option>
              {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Sales Channel</label>
            <select 
              value={filterChannel} 
              onChange={e => { 
                setFilterChannel(e.target.value); 
                setFilterDealer("All"); 
              }} 
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-brand outline-none text-foreground min-w-[180px]"
            >
              <option value="All">All Channels</option>
              <option value="Dealer Network">Dealer Network</option>
              <option value="Online Ecommerce">Online Ecommerce</option>
              <option value="Export">Export</option>
            </select>
          </div>
          {filterChannel === "Dealer Network" && (
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Specific Dealer</label>
              <select 
                value={filterDealer} 
                onChange={e => setFilterDealer(e.target.value)} 
                className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-brand outline-none text-foreground min-w-[200px]"
              >
                <option value="All">All Dealers</option>
                {Object.entries(dealers).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-brand outline-none text-foreground min-w-[150px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-brand outline-none text-foreground min-w-[150px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Sort By</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:border-brand outline-none text-foreground min-w-[150px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="product_asc">Product (A-Z)</option>
              <option value="product_desc">Product (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredBatches.length > 0 && selectedBatches.length === filteredBatches.length}
                    className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                  />
                </th>
                <th className="p-4 font-bold text-foreground">Date Generated</th>
                <th className="p-4 font-bold text-foreground">Product</th>
                <th className="p-4 font-bold text-foreground">Mfg Date</th>
                <th className="p-4 font-bold text-foreground">Channel / Target</th>
                <th className="p-4 font-bold text-foreground">Prefix Key</th>
                <th className="p-4 font-bold text-foreground">Sequence Range</th>
                <th className="p-4 font-bold text-foreground text-center">Generated Qty</th>
                <th className="p-4 font-bold text-foreground text-center">Sold (Registered)</th>
                <th className="p-4 font-bold text-foreground text-center">Remaining</th>
                <th className="p-4 font-bold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-muted-foreground">
                    <div className="flex justify-center mb-2">
                      <RefreshCw className="animate-spin text-brand" size={24} />
                    </div>
                    Loading batch data...
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-muted-foreground">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No sticker batches found.</p>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const sold = soldCounts[batch.id] || 0;
                  const remaining = batch.quantity - sold;
                  const percentSold = batch.quantity > 0 ? (sold / batch.quantity) * 100 : 0;
                  
                  return (
                    <tr key={batch.id} className="border-b border-border hover:bg-background/50 transition-colors">
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedBatches.includes(batch.id)}
                          onChange={() => handleSelectBatch(batch.id)}
                          className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                        />
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(batch.created_at).toLocaleDateString()} <br/>
                        <span className="text-xs text-muted-foreground">{new Date(batch.created_at).toLocaleTimeString()}</span>
                      </td>
                      <td className="p-4 font-medium">
                        {batch.product_name}
                        <div className="text-xs text-muted-foreground mt-1">Plan: {batch.warranty_duration}</div>
                      </td>
                      <td className="p-4">
                        {batch.manufacturing_date}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          batch.sales_channel === 'Online Ecommerce' ? 'bg-purple-500/10 text-purple-500' :
                          batch.sales_channel === 'Export' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {batch.sales_channel || 'Dealer'}
                        </span>
                        {batch.dealer_id && (
                          <div className="text-xs text-muted-foreground mt-2 line-clamp-1">
                            {dealers[batch.dealer_id] || 'Specific Dealer'}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs text-muted-foreground">
                        {batch.prefix_key}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {String(batch.start_sequence).padStart(5, '0')} - {String(batch.end_sequence).padStart(5, '0')}
                      </td>
                      <td className="p-4 text-center font-bold">
                        {batch.quantity}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-green-500">{sold}</span>
                          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{ width: `${Math.min(100, percentSold)}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{percentSold.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-medium">
                        {remaining}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/labels/print/${batch.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand font-bold text-xs rounded-lg transition-colors border border-brand/20"
                        >
                          <Printer size={13} />
                          Print
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
