import re
import os

def fix_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# 1. App.tsx
fix_file('src/App.tsx', [("import { useState, useEffect } from 'react';", "import { useState } from 'react';")])

# 2. ConvertLeadModal.tsx (remove any remaining setMode lines)
with open('src/components/leads/ConvertLeadModal.tsx', 'r') as f:
    lines = f.readlines()
with open('src/components/leads/ConvertLeadModal.tsx', 'w') as f:
    for line in lines:
        if 'setMode' not in line:
            f.write(line)

# 3 & 4. EditInvoiceModal.tsx
fix_file('src/components/modals/EditInvoiceModal.tsx', [
    ("import { useState, useEffect } from 'react';", "import { useState } from 'react';"),
    ("const [initialPayment, setInitialPayment] = useState(0);", "")
])

# 5 & 6. InvoiceViewModal.tsx
fix_file('src/components/modals/InvoiceViewModal.tsx', [
    ("customer.contact_person", "customer.name"),
    ("customer.phone", "customer.contact")
])

# 7. UserManagementPage.tsx
with open('src/pages/erp/UserManagementPage.tsx', 'r') as f:
    lines = f.readlines()
with open('src/pages/erp/UserManagementPage.tsx', 'w') as f:
    for line in lines:
        if 'import { supabase }' not in line:
            f.write(line)

# 8. mutations.ts
with open('src/hooks/mutations.ts', 'r') as f:
    lines = f.readlines()
with open('src/hooks/mutations.ts', 'w') as f:
    for line in lines:
        if 'import type' not in line:
            f.write(line)

print("Fixed TS errors")
