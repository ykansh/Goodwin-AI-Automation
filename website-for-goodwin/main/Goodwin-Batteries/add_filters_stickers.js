const fs = require('fs');

function updateStickers() {
  const file = 'app/admin/sticker-batches/page.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Add state
  const stateOld = `  const [filterProduct, setFilterProduct] = useState("All");
  const [soldCounts, setSoldCounts] = useState<Record<string, number>>({});`;
  
  const stateNew = `  const [filterProduct, setFilterProduct] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [soldCounts, setSoldCounts] = useState<Record<string, number>>({});`;

  content = content.replace(stateOld, stateNew);

  const logicOld = `  const filteredBatches = batches.filter(batch => {
    const matchesSearch = 
      batch.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.prefix_key?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const batchChannel = batch.sales_channel || 'Dealer Network';
    const matchesChannel = filterChannel === "All" || batchChannel === filterChannel;
    const matchesDealer = filterDealer === "All" || batch.dealer_id === filterDealer;
    const matchesProduct = filterProduct === "All" || batch.product_name === filterProduct;
    
    return matchesSearch && matchesChannel && matchesDealer && matchesProduct;
  });`;

  const logicNew = `  const filteredBatches = batches.filter(batch => {
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
  });`;

  content = content.replace(logicOld, logicNew);

  const uiOld = `          {filterChannel === "Dealer Network" && (
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
        </div>`;

  const uiNew = `          {filterChannel === "Dealer Network" && (
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
        </div>`;

  content = content.replace(uiOld, uiNew);
  
  fs.writeFileSync(file, content);
  console.log('Updated Sticker Batches Filters');
}

updateStickers();
