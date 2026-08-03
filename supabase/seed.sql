-- Seed Data for ETA E-Invoicing & Compliance SaaS MVP

-- Seed Default Taxpayer (Nexus Trading Co.)
INSERT INTO taxpayers (id, trn, legal_name, trade_name, tier_level, commercial_registry_number, email, phone)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    '123-456-789',
    'Nexus Egyptian Trading Co.',
    'Nexus Wallet',
    'TIER_1_INDIVIDUAL',
    'CR-98421-EG',
    'finance@nexus-wallet.eg',
    '+201001234567'
)
ON CONFLICT (trn) DO NOTHING;

-- Seed Wallet (Matching Page 1 Design: Balance 124,500 EGP, Daily 45,000/60,000 EGP, Monthly 110,000/200,000 EGP)
INSERT INTO wallets (id, taxpayer_id, currency, balance, daily_used_egp, monthly_used_egp)
VALUES (
    'w1111111-2222-3333-4444-555555555555',
    'a1b2c3d4-e5f6-7890-abcd-111111111111',
    'EGP',
    124500.00,
    45000.00,
    110000.00
)
ON CONFLICT (id) DO UPDATE 
SET balance = 124500.00,
    daily_used_egp = 45000.00,
    monthly_used_egp = 110000.00;

-- Seed Invoices matching design mockups (Page 3 Verified Receipt & Appsmith feed)
INSERT INTO invoices (id, internal_id, issuer_trn, receiver_name, receiver_trn, document_type, net_amount, tax_amount_vat, total_amount, status, eta_uuid, qr_code_url, canonical_hash)
VALUES 
    (
        'i1111111-0000-0000-0000-000000000001',
        'INV-2026-001',
        '123-456-789',
        'Wallet Deposit Processing Fee Customer',
        '123-456-789',
        'B2C_RECEIPT',
        100.00,
        14.00,
        114.00,
        'VALID',
        'E3A8F92D-811C-4B2E-901B-74D3F9A08123',
        'https://invoicing.eta.gov.eg/receipts/search/E3A8F92D-811C-4B2E-901B-74D3F9A08123',
        '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    ),
    (
        'i2222222-0000-0000-0000-000000000002',
        'INV-2026-002',
        '123-456-789',
        'Cairo Retail Supplying Co.',
        '987654321',
        'B2B_INVOICE',
        10000.00,
        1400.00,
        11400.00,
        'VALID',
        'ETA-3F9A-412C',
        'https://invoicing.eta.gov.eg/receipts/search/ETA-3F9A-412C',
        'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'
    ),
    (
        'i3333333-0000-0000-0000-000000000003',
        'INV-2026-003',
        '123-456-789',
        'Alexandria Logistics Ltd',
        '456789123',
        'B2B_INVOICE',
        25000.00,
        3500.00,
        28500.00,
        'QUEUED',
        NULL,
        NULL,
        NULL
    )
ON CONFLICT (internal_id) DO NOTHING;

-- Seed Line Items for INV-2026-001 (Page 3 E-Receipt)
INSERT INTO invoice_items (invoice_id, item_code, description, quantity, unit_price, net_amount, vat_rate, vat_amount, total_amount)
VALUES 
    (
        'i1111111-0000-0000-0000-000000000001',
        'SERV-FEE-01',
        'Wallet Deposit Processing Fee',
        1.00,
        100.00,
        100.00,
        0.1400,
        14.00,
        114.00
    )
ON CONFLICT DO NOTHING;
