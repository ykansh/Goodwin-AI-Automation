const fs = require('fs');

function addEnquiriesFilters() {
  const file = 'app/admin/enquiries/page.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Add state
  const stateOld = `  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);`;
  
  const stateNew = `  const [enquiries, setEnquiries] = useState<any[]>([]);
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
  });`;

  content = content.replace(stateOld, stateNew);

  // Replace UI
  const uiOld = `        <div className="bg-surface border border-border rounded-lg flex items-center px-4 py-2 w-full md:w-auto">
          <Search size={18} className="text-muted-foreground mr-2 shrink-0" />
          <input type="text" placeholder="Search enquiries..." className="bg-transparent text-foreground focus:outline-none w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {enquiries.map((enquiry) => (`;

  const uiNew = `      </div>

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
        {filteredEnquiries.map((enquiry) => (`;

  content = content.replace(uiOld, uiNew);
  
  // replace the map and length checks
  content = content.replace(/enquiries\.length === 0/g, 'filteredEnquiries.length === 0');
  
  fs.writeFileSync(file, content);
  console.log('Updated Enquiries Filters');
}

addEnquiriesFilters();
