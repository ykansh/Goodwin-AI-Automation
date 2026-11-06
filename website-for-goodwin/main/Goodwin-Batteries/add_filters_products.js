const fs = require('fs');

function updateProducts() {
  const file = 'app/admin/products/page.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Add state
  const stateOld = `  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);`;
  
  const stateNew = `  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("display_order");

  const uniqueCategories = Array.from(new Set(products.map(p => p.categories?.name).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    if (statusFilter === "published" && !p.is_published) return false;
    if (statusFilter === "draft" && p.is_published) return false;
    if (categoryFilter !== "all" && p.categories?.name !== categoryFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!(p.name || "").toLowerCase().includes(term) && !(p.series || "").toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === "display_order") return (a.display_order || 0) - (b.display_order || 0);
    if (sortOrder === "name_asc") return (a.name || "").localeCompare(b.name || "");
    if (sortOrder === "name_desc") return (b.name || "").localeCompare(a.name || "");
    return 0;
  });`;

  content = content.replace(stateOld, stateNew);

  const uiOld = `      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">`;

  const uiNew = `      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface p-4 rounded-xl border border-border mb-6">
        <div className="lg:col-span-4 mb-2">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Search</label>
          <input 
            type="text" 
            placeholder="Search by Model Name or Series..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border text-foreground px-4 py-2.5 rounded-lg focus:outline-none focus:border-brand text-sm" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm">
            <option value="all">All Categories</option>
            {uniqueCategories.map((c: any) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Sort By</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-lg focus:outline-none focus:border-brand text-sm">
            <option value="display_order">Default (Display Order)</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">`;

  content = content.replace(uiOld, uiNew);
  
  content = content.replace(/products\.map/g, 'filteredProducts.map');
  content = content.replace(/products\.length === 0/g, 'filteredProducts.length === 0');
  
  fs.writeFileSync(file, content);
  console.log('Updated Products Filters');
}

updateProducts();
