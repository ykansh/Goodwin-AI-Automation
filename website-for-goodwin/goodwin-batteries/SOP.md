# Goodwin ERP - Standard Operating Procedure (SOP)

## 1. Overview
The Goodwin ERP (Enterprise Resource Planning) system is a comprehensive web application designed to manage core business operations, including CRM, Ledger, Inventory, and Sales. This SOP outlines how to use the system, how it was built, and the AI-driven methodologies used during its development.

---

## 2. How to Use the System

### 2.1. Initial Setup & Deployment
- **Local Environment:** 
  1. Clone the repository and navigate to `website-for-goodwin/goodwin-erp`.
  2. Create a `.env` file based on `.env.example` and populate it with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  3. Run `npm install` followed by `npm run dev` to start the local Vite server.
- **Production (Vercel):**
  1. Link your GitHub repository to Vercel.
  2. Navigate to your Vercel Project Settings > **Environment Variables**.
  3. Add the Supabase URL and Anon Key exactly as they appear locally.
  4. **Redeploy** the application for the environment variables to take effect.
- **Supabase (Backend):**
  1. Ensure your PostgreSQL schema is deployed.
  2. Add your Vercel production URL to Supabase Authentication settings under **Site URL** and **Redirect URLs** to allow successful logins.

### 2.2. Core Modules
- **Authentication:** Users log in using their registered email and password. Access is controlled via Role-Based Access Control (RBAC).
- **CRM / Leads:** Manage prospective clients through a pipeline view and track follow-ups.
- **Core ERP:** Access the main dashboard. Manage Customers, Dealers, Suppliers, Products, Sales Invoices, and Purchase Orders.
- **Ledger-Pro:** Track financial transactions including Parties, Sales Ledgers, Payment In, and Payment Out.

---

## 3. How We Made This Website

### 3.1. Tech Stack
- **Frontend:** React 19, Vite (for fast bundling), TailwindCSS (for styling), React Router DOM, React Hook Form (for efficient form state), Recharts (for dashboards), and Lucide React (for icons).
- **Backend:** Supabase (PostgreSQL Database, Authentication, and Realtime data syncing).
- **Deployment & Automation:** Vercel for continuous frontend deployment, and n8n for background automation workflows.

### 3.2. Architecture
The application uses a modular routing architecture (`App.tsx`). State is currently managed centrally, synchronizing Supabase tables into memory on application load. *Note: As the application scales, data fetching is being refactored to use React Query for pagination and caching.*

---

## 4. Development Methodology: AI Prompt Engineering

This project was built using an advanced, iterative AI-assisted development workflow.

### 4.1. Tools Used
- **Anti-Gravity & Claude-Code:** Advanced AI agents used to generate foundational code, scaffold complex React components, and architect the initial database schema.
- **Stitch:** We utilized "Stitching" techniques—prompting the AI to generate isolated, modular components (e.g., generating the Ledger module separately from the CRM) and then carefully *stitching* them together into the main `App.tsx` router and `DataContext`.

### 4.2. Trial and Error (Looping)
We relied heavily on an iterative "Looping" methodology to debug and refine the application:
1. **Initial Generation:** Ask the AI to build a feature (e.g., Supabase authentication).
2. **Testing & Error Discovery:** We ran the code and encountered issues (e.g., credentials working locally but failing on Vercel).
3. **Feedback Loop:** The exact error messages, console logs, and behavioral descriptions were fed back into the AI prompt.
4. **Refinement:** The AI analyzed the missing pieces (such as Vercel ignoring local `.env` files) and provided the specific operational steps to fix it.
5. **Architectural Audits:** By continuously auditing the codebase (as seen in `ERP_AUDIT.md`), we identified anti-patterns (like loading the entire DB on mount) and fed this back into the loop to generate migration plans (e.g., shifting to React Query).

### 4.3. Prompting Best Practices Used
- **Context Loading:** Always providing the AI with the current tech stack, file structure, and specific `.env` configurations.
- **Incremental Complexity:** Starting with a raw UI template, then adding state management, and finally hooking it up to the real Supabase backend.
- **Debugging Prompts:** Instead of asking "Why is this broken?", we used prompts like: *"When deployed to Vercel, the app does not load credentials. Localhost works perfectly. The auth uses Supabase. What Vercel configurations are missing?"* This direct, context-rich prompting drastically reduced debugging time.
