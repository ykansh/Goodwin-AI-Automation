"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Calendar, ShieldCheck, AlertTriangle, Edit2, Trash2, Download, Upload, CheckSquare, Square, SortDesc } from "lucide-react";
import WarrantyModal from "@/components/admin/WarrantyModal";
import ClaimModal from "@/components/admin/ClaimModal";

export default function AdminWarrantiesPage() {
  const [activeTab, setActiveTab] = useState<"registrations" | "claims">("registrations");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReg, setSelectedReg] = useState<any>(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const [statusUpdatePrompt, setStatusUpdatePrompt] = useState<{ id: string, type: 'reg'|'claim', currentStatus: string, newStatus: string } | null>(null);
  const [statusNote, setStatusNote] = useState("");

  // New Features State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [regRes, claimsRes] = await Promise.all([
      supabase.from("warranty_registrations").select("*").order("created_at", { ascending: false }),
      supabase.from("warranty_claims").select("*").order("created_at", { ascending: false })
    ]);
    
    if (regRes.data) setRegistrations(regRes.data);
    if (claimsRes.data) setClaims(claimsRes.data);
    setSelectedIds([]);
    setLoading(false);
  }

  const updateRegStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Registered' ? 'Verified' : currentStatus === 'Verified' ? 'Rejected' : 'Registered';
    setStatusUpdatePrompt({ id, type: 'reg', currentStatus, newStatus });
    setStatusNote("");
  };

  const updateClaimStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending Review' ? 'Under Inspection' : currentStatus === 'Under Inspection' ? 'Approved' : currentStatus === 'Approved' ? 'Rejected' : 'Pending Review';
    setStatusUpdatePrompt({ id, type: 'claim', currentStatus, newStatus });
    setStatusNote("");
  };

  const submitStatusUpdate = async () => {
    if (!statusUpdatePrompt) return;
    if (statusNote.trim().length < 10) {
      alert("Note must be at least 10 characters.");
      return;
    }

    const table = statusUpdatePrompt.type === 'reg' ? "warranty_registrations" : "warranty_claims";
    await supabase.from(table).update({ 
      status: statusUpdatePrompt.newStatus, 
      admin_notes: statusNote 
    }).eq("id", statusUpdatePrompt.id);
    
    setStatusUpdatePrompt(null);
    setStatusNote("");
    fetchData();
  };

  const deleteSingle = async (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      const table = activeTab === "registrations" ? "warranty_registrations" : "warranty_claims";
      await supabase.from(table).delete().eq("id", id);
      fetchData();
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected records?`)) {
      const table = activeTab === "registrations" ? "warranty_registrations" : "warranty_claims";
      await supabase.from(table).delete().in("id", selectedIds);
      fetchData();
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = (list: any[]) => {
    if (selectedIds.length === list.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(list.map(i => i.id));
    }
  };

  const handleExportCSV = (list: any[], filename: string) => {
    if (list.length === 0) return;
    const keys = Object.keys(list[0]);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += keys.join(",") + "\n";
    list.forEach(row => {
      const values = keys.map(k => {
        const val = row[k] === null || row[k] === undefined ? "" : String(row[k]);
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvContent += values.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      
      const rows = text.split("\n").filter(r => r.trim());
      if (rows.length < 2) {
        alert("CSV file is empty or missing headers.");
        return;
      }
      
      const headers = rows[0].split(",").map(h => h.trim().replace(/"/g, ''));
      const dataToInsert = [];
      
      for (let i = 1; i < rows.length; i++) {
        // Simple CSV parser that respects quotes (basic)
        const rowData = rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!rowData) continue;
        const record: any = {};
        headers.forEach((h, index) => {
          if (rowData[index]) {
            record[h] = rowData[index].replace(/(^"|"$)/g, '').trim();
          }
        });
        if (Object.keys(record).length > 0) {
          // Remove ID so it gets auto-generated
          delete record.id;
          dataToInsert.push(record);
        }
      }
      
      if (dataToInsert.length > 0) {
        setLoading(true);
        const table = activeTab === "registrations" ? "warranty_registrations" : "warranty_claims";
        const { error } = await supabase.from(table).insert(dataToInsert);
        if (error) {
          alert("Import failed: " + error.message);
        } else {
          alert(`Successfully imported ${dataToInsert.length} records.`);
          fetchData();
        }
        setLoading(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [filterType, setFilterType] = useState<"all" | "customers" | "dealers">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [dealerFilter, setDealerFilter] = useState("all");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [productFilter, setProductFilter] = useState("all");

  const filterAndSortList = (list: any[]) => {
    const filtered = list.filter(item => {
      if (filterType === "customers") {
        if (item.seller_code !== "DIRECT" && item.seller_code) return false;
      }
      if (filterType === "dealers") {
        if (item.seller_code === "DIRECT" || !item.seller_code) return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (filterType === "customers" && platformFilter !== "all") {
        if (item.dealer_name !== platformFilter) return false;
      }
      if (filterType === "dealers" && dealerFilter !== "all") {
        if (item.dealer_name !== dealerFilter) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = (item.customer_name || "").toLowerCase().includes(term);
        const matchesPhone = (item.mobile || "").toLowerCase().includes(term);
        const matchesSerial = (item.serial_number || "").toLowerCase().includes(term);
        const matchesEmail = (item.email || "").toLowerCase().includes(term);
        if (!matchesName && !matchesPhone && !matchesSerial && !matchesEmail) return false;
      }
      if (dateFrom) {
        if (new Date(item.created_at) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
         const end = new Date(dateTo);
         end.setHours(23, 59, 59, 999);
         if (new Date(item.created_at) > end) return false;
      }
      if (productFilter !== "all" && item.battery_model_id !== productFilter) return false;
      
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortOrder === "name_asc") return (a.customer_name || "").localeCompare(b.customer_name || "");
      if (sortOrder === "name_desc") return (b.customer_name || "").localeCompare(a.customer_name || "");
      return 0;
    });
  };

  const filteredRegistrations = filterAndSortList(registrations);
  const filteredClaims = filterAndSortList(claims);
  const currentList = activeTab === "registrations" ? filteredRegistrations : filteredClaims;

  const uniqueDealers = Array.from(new Set([...registrations, ...claims].filter(i => i.seller_code && i.seller_code !== "DIRECT").map(i => i.dealer_name)));

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand" size={32} /></div>;

  return (
    <div>
      <div className="mb-8 flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Warranties & Claims</h1>
          <p className="text-muted-foreground mt-1">Manage product warranty registrations and service claims.</p>
        </div>
        
        <div className="flex flex-col gap-3 w-full xl:w-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex bg-surface p-1 rounded-xl border border-border w-full md:w-fit self-end">
              <button 
                onClick={() => { setActiveTab("registrations"); setStatusFilter("all"); setSelectedIds([]); }}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'registrations' ? 'bg-brand text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Registrations ({registrations.length})
              </button>
              <button 
                onClick={() => { setActiveTab("claims"); setStatusFilter("all"); setSelectedIds([]); }}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'claims' ? 'bg-brand text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Claims ({claims.length})
              </button>
            </div>
            <div className="flex gap-2 items-end">
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-surface border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-border transition-colors">
                <Upload size={16} /> Import
              </button>
              <button onClick={() => handleExportCSV(currentList, `${activeTab}_export.csv`)} className="flex items-center gap-2 bg-surface border border-border px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-border transition-colors">
                <Download size={16} /> Export
              </button>
              {selectedIds.length > 0 && (
                <button onClick={deleteSelected} className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors">
                  <Trash2 size={16} /> Delete ({selectedIds.length})
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 bg-surface p-4 rounded-xl border border-border">
            {/* SEARCH */}
            <div className="md:col-span-2 xl:col-span-5 mb-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by Name, Mobile, Email, or Serial Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-brand text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Source</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setPlatformFilter("all");
                  setDealerFilter("all");
                }}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm"
              >
                <option value="all">All Sources</option>
                <option value="customers">Direct Customers</option>
                <option value="dealers">Dealers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm"
              >
                <option value="all">All Statuses</option>
                {activeTab === 'registrations' ? (
                  <>
                    <option value="Registered">Registered</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </>
                ) : (
                  <>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Under Inspection">Under Inspection</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Product Model</label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm"
              >
                <option value="all">All Products</option>
                {Array.from(new Set([...registrations, ...claims].map(i => i.battery_model_id).filter(Boolean))).map(model => (
                  <option key={model as string} value={model as string}>{model as string}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
              </select>
            </div>

            {filterType === "customers" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Platform</label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm"
                >
                  <option value="all">All Platforms</option>
                  <option value="Goodwin Website">Goodwin Website</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Online Marketplace">Online Marketplace</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            {filterType === "dealers" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Dealer Name</label>
                <select
                  value={dealerFilter}
                  onChange={(e) => setDealerFilter(e.target.value)}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm"
                >
                  <option value="all">All Dealers</option>
                  {uniqueDealers.map(dealerName => (
                    <option key={dealerName as string} value={dealerName as string}>{dealerName as string}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="md:col-span-2 lg:col-span-4 xl:col-span-5 flex justify-end mt-2">
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setDateFrom("");
                  setDateTo("");
                  setProductFilter("all");
                  setFilterType("all");
                  setStatusFilter("all");
                  setPlatformFilter("all");
                  setDealerFilter("all");
                  setSortOrder("newest");
                }}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear All Filters
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 pl-2">
        <button 
          onClick={() => toggleSelectAll(currentList)} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium"
        >
          {selectedIds.length === currentList.length && currentList.length > 0 ? <CheckSquare size={18} className="text-brand"/> : <Square size={18}/>}
          Select All
        </button>
      </div>

      {activeTab === "registrations" && (
        <div className="grid grid-cols-1 gap-4">
          {filteredRegistrations.map((reg) => (
            <div key={reg.id} className={`bg-surface border ${selectedIds.includes(reg.id) ? 'border-brand shadow-md ring-1 ring-brand' : 'border-border'} rounded-xl p-6 shadow-sm transition-all relative`}>
              <button 
                onClick={() => toggleSelect(reg.id)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-brand"
              >
                {selectedIds.includes(reg.id) ? <CheckSquare size={24} className="text-brand"/> : <Square size={24}/>}
              </button>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pb-4 border-b border-border pr-12">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground">{reg.customer_name}</h3>
                    <button 
                      onClick={() => updateRegStatus(reg.id, reg.status)}
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                        reg.status === 'Registered' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                        reg.status === 'Verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}
                    >
                      {reg.status}
                    </button>
                  </div>
                  <p className="text-muted-foreground font-mono text-sm">{reg.id}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-background border border-border px-3 py-1.5 rounded">
                    <Calendar size={14} />
                    {new Date(reg.created_at).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedReg(reg); setIsRegModalOpen(true); }} className="p-1.5 bg-background border border-border rounded hover:text-brand transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => deleteSingle(reg.id)} className="p-1.5 bg-background border border-border rounded hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>

              {reg.admin_notes && (
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-foreground mb-6">
                  <p className="text-xs text-yellow-600 uppercase tracking-widest font-bold mb-2">Admin Notes</p>
                  <p className="whitespace-pre-wrap text-sm">{reg.admin_notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Serial Number</p>
                  <p className="font-mono text-foreground font-semibold">{reg.serial_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Battery Model ID</p>
                  <p className="font-mono text-foreground">{reg.battery_model_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Dealer</p>
                  <p className="text-foreground">{reg.dealer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Vehicle</p>
                  <p className="text-foreground font-mono text-sm uppercase">{reg.vehicle_reg_number}</p>
                  <p className="text-foreground text-sm">{reg.vehicle_make_model}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Mobile</p>
                  <a href={`tel:+91${reg.mobile}`} className="font-mono text-brand hover:underline">{reg.mobile}</a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Email</p>
                  <p className="text-foreground">{reg.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Purchase Date</p>
                  <p className="font-mono text-foreground">{reg.purchase_date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Invoice</p>
                  {reg.invoice_url ? (
                    <a href={reg.invoice_url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-bold text-sm">View Invoice</a>
                  ) : (
                    <p className="text-muted-foreground text-sm">Not provided</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Invoice No.</p>
                  <p className="text-foreground font-mono">{reg.invoice_number}</p>
                </div>
              </div>
            </div>
          ))}

          {filteredRegistrations.length === 0 && (
            <div className="bg-surface border border-border rounded-xl p-12 text-center text-muted-foreground">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
              <p>No warranty registrations found.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "claims" && (
        <div className="grid grid-cols-1 gap-4">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className={`bg-surface border ${selectedIds.includes(claim.id) ? 'border-brand shadow-md ring-1 ring-brand' : 'border-border'} rounded-xl p-6 shadow-sm transition-all relative`}>
              <button 
                onClick={() => toggleSelect(claim.id)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-brand"
              >
                {selectedIds.includes(claim.id) ? <CheckSquare size={24} className="text-brand"/> : <Square size={24}/>}
              </button>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pb-4 border-b border-border pr-12">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground">{claim.customer_name}</h3>
                    <button 
                      onClick={() => updateClaimStatus(claim.id, claim.status)}
                      className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                        claim.status === 'Pending Review' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        claim.status === 'Under Inspection' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                        claim.status === 'Approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}
                    >
                      {claim.status}
                    </button>
                  </div>
                  <p className="text-muted-foreground font-mono text-sm">{claim.id}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-background border border-border px-3 py-1.5 rounded">
                    <Calendar size={14} />
                    {new Date(claim.created_at).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedClaim(claim); setIsClaimModalOpen(true); }} className="p-1.5 bg-background border border-border rounded hover:text-brand transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => deleteSingle(claim.id)} className="p-1.5 bg-background border border-border rounded hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-foreground mb-6">
                <p className="text-xs text-red-500 uppercase tracking-widest font-bold mb-2">Issue Description</p>
                <p className="whitespace-pre-wrap">{claim.issue_description}</p>
              </div>

              {claim.admin_notes && (
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-foreground mb-6">
                  <p className="text-xs text-yellow-600 uppercase tracking-widest font-bold mb-2">Admin Notes</p>
                  <p className="whitespace-pre-wrap text-sm">{claim.admin_notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Serial Number</p>
                  <p className="font-mono text-foreground font-semibold">{claim.serial_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Warranty ID</p>
                  <p className="font-mono text-foreground">{claim.warranty_id || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Mobile</p>
                  <a href={`tel:+91${claim.mobile}`} className="font-mono text-brand hover:underline">{claim.mobile}</a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Dealer</p>
                  <p className="text-foreground">{claim.dealer_name}</p>
                </div>
              </div>
            </div>
          ))}

          {filteredClaims.length === 0 && (
            <div className="bg-surface border border-border rounded-xl p-12 text-center text-muted-foreground">
              <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" />
              <p>No warranty claims found.</p>
            </div>
          )}
        </div>
      )}

      <WarrantyModal 
        isOpen={isRegModalOpen}
        onClose={() => { setIsRegModalOpen(false); setSelectedReg(null); }}
        registration={selectedReg}
        onSuccess={fetchData}
      />
      
      <ClaimModal 
        isOpen={isClaimModalOpen}
        onClose={() => { setIsClaimModalOpen(false); setSelectedClaim(null); }}
        claim={selectedClaim}
        onSuccess={fetchData}
      />

      {statusUpdatePrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-surface border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-foreground mb-4">Confirm Status Update</h3>
            <p className="text-muted-foreground mb-4">
              You are updating this {statusUpdatePrompt.type === 'reg' ? 'registration' : 'claim'} to <span className="font-bold text-foreground">{statusUpdatePrompt.newStatus}</span>.
            </p>
            <label className="block text-sm font-bold text-muted-foreground mb-2">Mandatory Admin Note (Min 10-15 chars)</label>
            <textarea
              className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-brand h-24 mb-6"
              placeholder="E.g. Verified purchase details, approved."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setStatusUpdatePrompt(null)} 
                className="flex-1 bg-surface border border-border py-3 rounded-lg font-bold text-foreground hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitStatusUpdate} 
                disabled={statusNote.trim().length < 10}
                className="flex-1 bg-brand text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
