-- Goodwin Grow AI ERP - Supabase SQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMS & TYPES
-- ==========================================
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee', 'client');
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'completed', 'draft');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE project_phase AS ENUM ('planning', 'execution', 'review', 'completed');

-- ==========================================
-- 2. CORE SYSTEM & AUDIT
-- ==========================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- References auth.users(id) but keeping loose for now
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(255) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 3. HRMS MODULE
-- ==========================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- Link to auth.users if they login
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    type VARCHAR(50), -- Full-time, Contract, etc.
    salary DECIMAL(12,2),
    join_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    skills TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 4. OPERATIONS MODULE
-- ==========================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    business_type VARCHAR(255),
    package VARCHAR(255),
    monthly_value DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE,
    next_review DATE,
    account_manager_id UUID REFERENCES employees(id),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE operations_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    business VARCHAR(255),
    source VARCHAR(255),
    contact VARCHAR(255),
    status VARCHAR(50),
    potential_value DECIMAL(12,2),
    first_contact DATE,
    last_follow_up DATE,
    next_follow_up DATE,
    assigned_to UUID REFERENCES employees(id),
    proposal_sent BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id),
    phase project_phase DEFAULT 'planning',
    date_started DATE,
    expected_completion DATE,
    review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES clients(id),
    project_id UUID REFERENCES projects(id),
    assigned_to UUID REFERENCES employees(id),
    category VARCHAR(100),
    due_date DATE,
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'todo',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 5. MARKETING MODULE
-- ==========================================
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(100),
    type VARCHAR(100),
    budget DECIMAL(12,2),
    spend DECIMAL(12,2),
    reach INTEGER,
    clicks INTEGER,
    leads INTEGER,
    cost_per_lead DECIMAL(12,2),
    status campaign_status DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 6. FINANCE MODULE
-- ==========================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    invoice_date DATE,
    due_date DATE,
    paid_date DATE,
    status VARCHAR(50) DEFAULT 'unpaid',
    payment_mode VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    vendor VARCHAR(255),
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE,
    paid_by UUID REFERENCES employees(id),
    recurring BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 7. AI SLOP MODULE
-- ==========================================
CREATE TABLE ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    used_for TEXT,
    monthly_cost DECIMAL(12,2),
    subscription_type VARCHAR(100),
    login_email VARCHAR(255),
    renewal_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- 8. INITIAL DATA SEEDING (Optional)
-- ==========================================
INSERT INTO employees (name, role, type, email) VALUES 
('Admin User', 'Administrator', 'Full-time', 'admin@goodwingrow.com');
