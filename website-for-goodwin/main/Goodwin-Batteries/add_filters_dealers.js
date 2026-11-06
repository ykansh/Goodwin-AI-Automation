const fs = require('fs');

function addDealersFilters() {
  const file = 'app/admin/dealers/page.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Add state
  const stateOld = `  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);`;
  
  const stateNew = `  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  
  const [isModalOpen, setIsModalOpen] = useState(false);`;

  content = content.replace(stateOld, stateNew);

  // Filter Logic right before the return
  const filterLogicOld = `  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand" size={32} /></div>;`;
  
  const filterLogicNew = `  const uniqueRegions = Array.from(new Set(dealers.map(d => d.region).filter(Boolean)));

  const filteredDealers = dealers.filter(d => {
    if (roleFilter !== "all" && (d.role || 'dealer') !== roleFilter) return false;
    if (regionFilter !== "all" && d.region !== regionFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (d.name || "").toLowerCase().includes(term);
      const matchEmail = (d.email || "").toLowerCase().includes(term);
      const matchMobile = (d.mobile || "").toLowerCase().includes(term);
      const matchCode = (d.seller_code || "").toLowerCase().includes(term);
      const matchParent = (d.parent_dealer_code || "").toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchMobile && !matchCode && !matchParent) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === "name_asc") return (a.name || "").localeCompare(b.name || "");
    if (sortOrder === "name_desc") return (b.name || "").localeCompare(a.name || "");
    return 0;
  });

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand" size={32} /></div>;`;

  content = content.replace(filterLogicOld, filterLogicNew);

  // UI block
  const uiOld = `        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">`;

  const uiNew = `        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface p-4 rounded-xl border border-border mb-6">
        <div className="lg:col-span-4 mb-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Search</label>
          <input 
            type="text" 
            placeholder="Search by Name, Code, Email, or Mobile..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-brand text-sm" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Role</label>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm">
            <option value="all">All Roles</option>
            <option value="dealer">Dealer</option>
            <option value="retailer">Retailer</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Region</label>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm">
            <option value="all">All Regions</option>
            {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Sort By</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">`;

  content = content.replace(uiOld, uiNew);
  
  // replace the map and length checks
  content = content.replace(/dealers\.map/g, 'filteredDealers.map');
  content = content.replace(/dealers\.length === 0/g, 'filteredDealers.length === 0');
  
  fs.writeFileSync(file, content);
  console.log('Updated Dealers Filters');
}

addDealersFilters();
