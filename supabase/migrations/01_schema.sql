-- ETA E-Invoicing & Compliance SaaS MVP Database Schema (Supabase / PostgreSQL)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CBE Deposit Limits Reference Table
CREATE TABLE IF NOT EXISTS cbe_limits (
    tier_level VARCHAR(32) PRIMARY KEY,
    label VARCHAR(64) NOT NULL,
    daily_cap_egp NUMERIC(15, 2) NOT NULL,
    monthly_cap_egp NUMERIC(15, 2) NOT NULL,
    requires_commercial_registry BOOLEAN NOT NULL DEFAULT FALSE
);

-- Seed CBE Limit Standards
INSERT INTO cbe_limits (tier_level, label, daily_cap_egp, monthly_cap_egp, requires_commercial_registry)
VALUES 
    ('TIER_1_INDIVIDUAL', 'Tier 1 - Individual', 60000.00, 200000.00, FALSE),
    ('TIER_2_SME', 'Tier 2 - SME Business', 500000.00, 2000000.00, TRUE)
ON CONFLICT (tier_level) DO UPDATE 
SET daily_cap_egp = EXCLUDED.daily_cap_egp,
    monthly_cap_egp = EXCLUDED.monthly_cap_egp;

-- 2. Taxpayers Table (Egyptian TRN 9 Digits)
CREATE TABLE IF NOT EXISTS taxpayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trn VARCHAR(20) UNIQUE NOT NULL, -- Format: 9 digits e.g. 123456789 or 123-456-789
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    tier_level VARCHAR(32) NOT NULL DEFAULT 'TIER_1_INDIVIDUAL' REFERENCES cbe_limits(tier_level),
    commercial_registry_number VARCHAR(64),
    email VARCHAR(255),
    phone VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Asset Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taxpayer_id UUID NOT NULL REFERENCES taxpayers(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL DEFAULT 'EGP',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    daily_used_egp NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    monthly_used_egp NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount_egp NUMERIC(15, 2) NOT NULL,
    channel VARCHAR(32) NOT NULL, -- INSTAPAY, FAWRY, BANK_TRANSFER, CREDIT_CARD, VODAFONE_CASH
    reference_number VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, EXCEEDED_LIMIT, REJECTED
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Invoices & E-Receipts Table (ETA v1.0 Standard)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_id VARCHAR(64) NOT NULL UNIQUE, -- e.g. INV-2026-001
    issuer_trn VARCHAR(20) NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    receiver_trn VARCHAR(20) NOT NULL,
    document_type VARCHAR(32) NOT NULL DEFAULT 'B2C_RECEIPT', -- B2B_INVOICE, B2C_RECEIPT
    net_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount_vat NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- 14% Standard Egyptian VAT
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- DRAFT, QUEUED, SUBMITTED, VALID, INVALID, CANCELLED
    eta_uuid VARCHAR(64),
    qr_code_url TEXT,
    canonical_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Invoice Line Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_code VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    vat_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.1400, -- 14%
    vat_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00
);

-- 7. ETA Submission Logs Table
CREATE TABLE IF NOT EXISTS eta_submission_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payload_format VARCHAR(10) NOT NULL, -- JSON, XML
    canonical_payload TEXT NOT NULL,
    signature_hash VARCHAR(128) NOT NULL,
    http_status INT,
    response_payload JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE taxpayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE eta_submission_logs ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demonstration / internal service operations
CREATE POLICY "Allow public read taxpayers" ON taxpayers FOR SELECT USING (true);
CREATE POLICY "Allow public read wallets" ON wallets FOR SELECT USING (true);
CREATE POLICY "Allow public read wallet_transactions" ON wallet_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public read invoices" ON invoices FOR SELECT USING (true);
