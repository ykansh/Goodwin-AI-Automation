const fs = require('fs');

function updateWarrantyPlans() {
  const file = 'app/admin/warranty-plans/page.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Add state
  const stateOld = `  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);`;
  
  const stateNew = `  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredPlans = plans.filter(p => {
    if (statusFilter === "active" && !p.active) return false;
    if (statusFilter === "inactive" && p.active) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!(p.plan_name || "").toLowerCase().includes(term) && !(p.id || "").toLowerCase().includes(term)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === "name_asc") return (a.plan_name || "").localeCompare(b.plan_name || "");
    if (sortOrder === "name_desc") return (b.plan_name || "").localeCompare(a.plan_name || "");
    return 0;
  });`;

  content = content.replace(stateOld, stateNew);

  const uiOld = `      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">`;

  const uiNew = `      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface p-4 rounded-xl border border-border mb-6">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Search</label>
          <input 
            type="text" 
            placeholder="Search plan name or ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-brand text-sm" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">`;

  content = content.replace(uiOld, uiNew);
  
  content = content.replace(/plans\.map/g, 'filteredPlans.map');
  content = content.replace(/plans\.length === 0/g, 'filteredPlans.length === 0');
  
  fs.writeFileSync(file, content);
  console.log('Updated Warranty Plans Filters');
}

updateWarrantyPlans();
