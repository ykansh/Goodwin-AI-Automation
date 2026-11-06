"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Phone, Calendar, Search } from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredEnquiries = enquiries.filter(item => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (item.name || "").toLowerCase().includes(term);
      const matchEmail = (item.email || "").toLowerCase().includes(term);
      const matchMobile = (item.mobile || "").toLowerCase().includes(term);
      const matchSubject = (item.subject || "").toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchMobile && !matchSubject) return false;
    }
    if (dateFrom && new Date(item.created_at) < new Date(dateFrom)) return false;
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(item.created_at) > end) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return 0;
  });

  useEffect(() => {
    fetchEnquiries();
  }, []);

  async function fetchEnquiries() {
    setLoading(true);
    const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
    if (data) setEnquiries(data);
    setLoading(false);
  }

  const updateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'New' ? 'Contacted' : currentStatus === 'Contacted' ? 'Resolved' : 'New';
    await supabase.from("enquiries").update({ status: newStatus }).eq("id", id);
    fetchEnquiries();
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand" size={32} /></div>;

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Enquiries & Leads</h1>
          <p className="text-muted-foreground">View incoming messages from Contact and Quick Enquiry forms.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface p-4 rounded-xl border border-border mb-6">
        <div className="lg:col-span-4 mb-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Search</label>
          <div className="bg-background border border-border rounded-lg flex items-center px-4 py-2.5 w-full focus-within:border-brand">
            <Search size={18} className="text-muted-foreground mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search by Name, Email, Mobile, or Subject..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-transparent text-foreground focus:outline-none w-full text-sm" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Resolved">Resolved</option>
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
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredEnquiries.map((enquiry) => (
          <div key={enquiry.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-brand/30 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-foreground">{enquiry.name}</h3>
                  <button 
                    onClick={() => updateStatus(enquiry.id, enquiry.status)}
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${
                      enquiry.status === 'New' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      enquiry.status === 'Contacted' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}
                  >
                    {enquiry.status}
                  </button>
                </div>
                <h4 className="text-brand font-semibold text-sm uppercase tracking-wider">{enquiry.subject}</h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-background border border-border px-3 py-1.5 rounded">
                <Calendar size={14} />
                {new Date(enquiry.created_at).toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-background border border-border rounded-lg text-muted-foreground mb-4 whitespace-pre-wrap leading-relaxed">
              {enquiry.message || "No message content."}
            </div>

            <div className="flex flex-wrap gap-6 border-t border-border pt-4">
              <a href={`tel:+91${enquiry.mobile}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand transition-colors font-mono">
                <Phone size={16} className="text-muted-foreground" />
                +91 {enquiry.mobile}
              </a>
              {enquiry.email && (
                <a href={`mailto:${enquiry.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand transition-colors">
                  <Mail size={16} className="text-muted-foreground" />
                  {enquiry.email}
                </a>
              )}
            </div>
          </div>
        ))}

        {filteredEnquiries.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-12 text-center text-muted-foreground">
            <Mail size={48} className="mx-auto mb-4 opacity-20" />
            <p>No enquiries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
