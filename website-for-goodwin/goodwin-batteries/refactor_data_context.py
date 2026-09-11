import re

with open('src/store/DataContext.tsx', 'r') as f:
    content = f.read()

# 1. Update imports
content = content.replace('import { supabase, isSupabaseConfigured } from \'../lib/supabaseClient\';', 
                          'import { supabase } from \'../lib/supabaseClient\';')
content = re.sub(r"import\s+\{\s*dummy[^\}]+\}\s*from\s*'../data/dummyData';\n?", '', content)

# 2. Simplify useStates
def simplify_useState(match):
    type_name = match.group(1)
    return f"const [{match.group(2)}, set{match.group(2).capitalize()}] = useState<{type_name}>([]);"

# Specific match for settings which defaults to empty object / base
settings_default = "const [settings, setSettings] = useState<CompanySettings>({\n    id: '1',\n    name: 'Goodwin Batteries Pvt. Ltd.',\n    gstin: '',\n    address: '',\n    phone: '',\n    email: '',\n    logo_url: '',\n    bank_details: { bank_name: '', account_number: '', ifsc_code: '', branch: '' },\n    battery_configs: { voltages: [], ah_ratings: [], warehouses: [], customer_types: [], salespersons: [], default_gst_percent: 28 },\n    updated_at: new Date().toISOString()\n  });"

content = re.sub(r'const \[settings, setSettings\] = useState<CompanySettings>\(\(\) => \{[^}]+\}\);', settings_default, content)

# Remove other useStates that use dummyData
# Format: const [leads, setLeads] = useState<Lead[]>(() => { ... });
for var_name, setter, type_name in [
    ('customers', 'Customers', 'Customer[]'),
    ('suppliers', 'Suppliers', 'Supplier[]'),
    ('products', 'Products', 'Product[]'),
    ('invoices', 'Invoices', 'SalesInvoice[]'),
    ('purchases', 'Purchases', 'PurchaseOrder[]'),
    ('returns', 'Returns', 'Return[]'),
    ('warranties', 'Warranties', 'BatteryWarranty[]'),
    ('payments', 'Payments', 'Payment[]'),
    ('ledgerEntries', 'LedgerEntries', 'LedgerEntry[]'),
    ('leads', 'Leads', 'Lead[]'),
    ('activities', 'Activities', 'LeadActivity[]')
]:
    pattern = rf'const \[{var_name}, set{setter}\] = useState<{type_name}>\(\(\) => \{{[\s\S]*?dummy{setter.replace("LedgerEntries", "LedgerEntries")}[^\}]*\}}\);'
    content = re.sub(pattern, f'const [{var_name}, set{setter}] = useState<{type_name}>([]);', content)
    # Generic fallback if regex missed due to naming
    pattern2 = rf'const \[{var_name}, set{setter}\] = useState<{type_name}>\(\(\) => \{{[^}}]+\}}\);'
    content = re.sub(pattern2, f'const [{var_name}, set{setter}] = useState<{type_name}>([]);', content)

# 3. Remove localStorage useEffects
content = re.sub(r'  useEffect\(\(\) => \{\n    if \(!isSupabaseConfigured\)[^\n]+\n  \}, \[[^\]]+\]\);\n?', '', content)

# 4. Remove isSupabaseConfigured checks
content = content.replace('!isSupabaseConfigured || !supabase', '!supabase')
content = content.replace('isSupabaseConfigured && supabase', 'supabase')
content = content.replace('if (isSupabaseConfigured) {', 'if (true) {')

# 5. Fix fetchData errors and empty arrays
for var_name, type_name, res_name in [
    ('Customers', 'Customer[]', 'custRes'),
    ('Suppliers', 'Supplier[]', 'suppRes'),
    ('Products', 'Product[]', 'prodRes'),
    ('Invoices', 'SalesInvoice[]', 'invRes'),
    ('Purchases', 'PurchaseOrder[]', 'poRes'),
    ('Returns', 'Return[]', 'retRes'),
    ('Warranties', 'BatteryWarranty[]', 'warRes'),
    ('Payments', 'Payment[]', 'payRes'),
    ('LedgerEntries', 'LedgerEntry[]', 'ledRes'),
    ('Leads', 'Lead[]', 'leadsRes'),
    ('Activities', 'LeadActivity[]', 'actRes')
]:
    old_code = f"if ({res_name}.error) console.error('[Supabase] {var_name.replace('LedgerEntries', 'Ledger').replace('Activities', 'Lead activities')} load error:', {res_name}.error);\n      if ({res_name}.data && {res_name}.data.length > 0) set{var_name}({res_name}.data as {type_name});"
    
    new_code = f"""if ({res_name}.error) {{
        console.error('[Supabase] {var_name} load error:', {res_name}.error);
        toast.error(`Error loading {var_name}: ${{res_name}.error.message}`);
      }} else if ({res_name}.data) {{
        set{var_name}({res_name}.data as {type_name});
      }}"""
    content = content.replace(old_code, new_code)

with open('src/store/DataContext.tsx', 'w') as f:
    f.write(content)
print("Done")
