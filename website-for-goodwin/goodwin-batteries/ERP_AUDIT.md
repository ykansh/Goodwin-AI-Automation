# GOODWIN BATTERIES ERP - SYSTEM AUDIT & ROADMAP

## 1. CURRENT ARCHITECTURE
- **Frontend Stack**: React 19, Vite, TailwindCSS, React Router DOM, React Hook Form, Recharts, Lucide React.
- **Backend Stack**: Supabase (PostgreSQL, Auth, Realtime).
- **State Management**: Centralized `DataContext.tsx` which loads **all** database tables into memory on app mount using `Promise.all`.
- **Layout & Routing**: Module-based routing (ERP, Ledger, Leads) handled within `App.tsx` conditionally rendering components based on the active mode.

## 2. EXISTING MODULES
- **Auth**: Basic Email/Password Login & Registration.
- **CRM / Leads**: Leads List, Pipeline view, Follow-ups.
- **Core ERP**: Dashboard, Customers & Dealers, Suppliers, Products & Inventory, Sales / GST Invoices, Purchases & POs, Returns, Battery Warranty, Reports, Settings.
- **Ledger-Pro**: Parties, Sales Ledger, Payment In, Payment Out.

## 3. MISSING MODULES
- **Production Management**: BOM, Work orders, Batch tracking, QC, Finished goods.
- **Service Management**: Service tickets, Field technician assignment.
- **HRMS**: Employee Master, Attendance (Geo-tagging), Leaves, Salary.
- **Task Management**: Internal task delegation, workflows.
- **Document Management**: Centralized file storage via Supabase Storage.
- **Notifications & Automations**: Webhooks, n8n integration, Notification center.
- **AI Integration**: Goodwin AI (Business Assistant, Sales Coach, Daily Insights).
- **Dispatch & Logistics**: Transport tracking, LR numbers, Delivery status.

## 4. BUGS & ARCHITECTURAL ANTI-PATTERNS
- **Non-scalable State**: `DataContext.tsx` fetching the entire database (Customers, Leads, Invoices, etc.) on load. This will crash or severely lag the browser as data grows.
- **Frontend ID Generation**: Functions like `getNextInvoiceNumber` generate IDs on the client by scanning the entire list of loaded invoices, leading to severe race conditions and duplicate IDs if multiple users create invoices simultaneously.
- **Monolithic Schema**: The entire Supabase SQL schema is stored in a single string in `src/lib/supabase.ts`.

## 5. DATABASE & SUPABASE STATUS
- **Connection**: Supabase client is configured (`@supabase/supabase-js`).
- **Realtime**: Active realtime subscriptions exist in `DataContext.tsx`.
- **Tables**: Initial tables for core entities exist (customers, products, invoices, etc.), but lack complex constraints, auditing triggers, and relationships required for a mature ERP.

## 6. CRITICAL SECURITY ISSUES
- **Row Level Security (RLS) Bypass**: The schema explicitly creates permissive policies (`Public full access ... USING (true) WITH CHECK (true)`). ANY user (even unauthenticated, if the anon key is obtained) can read, modify, or delete all financial records.
- **Frontend-only RBAC**: `src/lib/permissions.ts` hides UI elements based on roles, but backend API calls are completely unprotected.
- **Exposed Fallback Keys**: `src/lib/supabase.ts` contains a hardcoded fallback Supabase Anon Key.

## 7. RECOMMENDED ARCHITECTURE
- **Data Fetching**: Replace the monolithic `DataContext.tsx` with React Query (`@tanstack/react-query`) for paginated, cached, and isolated API calls.
- **Backend ID Generation**: Move invoice/order numbering and business logic to Supabase PostgreSQL Functions/Triggers to prevent race conditions.
- **Strict RLS**: Implement robust Row Level Security policies tied to `auth.uid()` and a secure `user_roles` table.
- **Storage**: Integrate Supabase Storage for documents/receipts.
- **Edge Functions**: Use Supabase Edge Functions for AI, Webhooks, and complex business logic (e.g., automated email/WhatsApp dispatch).

## 8. ROADMAP (P0 to P3)

### P0 (Critical - Foundation)
- **Phase 1**: Authentication, secure Database schema, strict RBAC & RLS, layout refactoring. Remove global DataContext loading.

### P1 (High - Core Business Operations)
- **Phase 2**: Customers, Dealers, Products Master.
- **Phase 3**: CRM & Lead Management (with assignment & scoring).
- **Phase 4**: Quotations, Sales Orders, Repeat Orders.
- **Phase 5**: Inventory & Multi-Warehouse tracking.
- **Phase 6**: Purchase & Production Management.
- **Phase 7**: Dispatch & GST Invoices.

### P2 (Medium - Finance & Operations)
- **Phase 8**: Payments, Receivables, Accounting/Ledger.
- **Phase 9**: Returns, Warranty, Service Management.
- **Phase 10**: HRMS, Attendance, Field Sales Geo-tagging.
- **Phase 11**: Task Management, Document Management, Notifications.

### P3 (Enhancement - Intelligence)
- **Phase 12**: Reports & Analytics Engine.
- **Phase 13**: Goodwin AI (Business Insights, Sales Coach, Querying).
- **Phase 14**: Automations & External Integrations (WhatsApp, n8n).
- **Phase 15**: Final QA, Security Audit, Performance Optimization.
