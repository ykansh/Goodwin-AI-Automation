const fs = require('fs');

const file = 'app/admin/warranties/list/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const stateBlockOld = `  const [filterType, setFilterType] = useState<"all" | "customers" | "dealers">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [dealerFilter, setDealerFilter] = useState("all");

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
      return true;
    });`;

const stateBlockNew = `  const [filterType, setFilterType] = useState<"all" | "customers" | "dealers">("all");
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
    });`;

content = content.replace(stateBlockOld, stateBlockNew);

const uiBlockOld = `          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 bg-surface p-4 rounded-xl border border-border">
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
                    <option key={dealerName} value={dealerName}>{dealerName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>`;


const uiBlockNew = `          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 bg-surface p-4 rounded-xl border border-border">
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

          </div>`;

content = content.replace(uiBlockOld, uiBlockNew);
fs.writeFileSync(file, content);
console.log('Successfully updated filters.');
