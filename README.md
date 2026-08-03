# ETA E-Invoicing & Compliance SaaS MVP (Saas-ERP)

[![Egyptian Tax Authority Standard v1.0](https://img.shields.io/badge/ETA%20e--Invoicing-v1.0-blue.svg)](https://invoicing.eta.gov.eg)
[![Central Bank of Egypt Compliance](https://img.shields.io/badge/CBE-Limits%20Enforced-emerald.svg)](#cbe-deposit-limits)
[![Appsmith & Supabase Stack](https://img.shields.io/badge/Stack-Appsmith%20%7C%20Supabase%20%7C%20GraphQL-slate.svg)](#architecture)

Lead Engineer reference implementation and production-ready codebase for **ETA E-Invoicing & Compliance SaaS (Saas-ERP)** built with **Appsmith**, **Supabase (PostgreSQL 15)**, **GraphQL**, and **Egyptian Tax Authority (ETA) e-Invoicing & e-Receipt v1.0 APIs**.

---

## 🏛️ Architecture & System Structure

```
├── appsmith/
│   └── eta_dashboard.json       # Appsmith Page DSL Schema with Live Widget Bindings
├── backend/
│   ├── src/
│   │   ├── eta/
│   │   │   ├── canonicalizer.ts # Canonical JSON/XML Serializer & SHA-256 Digest Signer
│   │   │   └── client.ts        # ETA Portal API Submission Client & Token Authenticator
│   │   ├── schema.ts            # GraphQL TypeDefs, Resolvers & CBE Limit Checks
│   │   └── server.ts            # Express & Apollo GraphQL Server Bootstrap
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── index.html               # Production Web Application (Wallet, Limits, E-Receipt)
│   ├── styles.css               # Glassmorphic Design System matching Page 1, 2, 3 Specs
│   └── app.js                   # Interactive Tab Switcher & Dynamic Limit Handlers
├── supabase/
│   ├── migrations/
│   │   ├── 01_schema.sql        # Database Tables (taxpayers, wallets, invoices, logs)
│   │   └── 02_functions.sql     # PL/pgSQL Functions (validate_trn & process_wallet_deposit)
│   └── seed.sql                 # Seed Mock Data (Nexus Wallet, INV-2026-001 E-Receipt)
├── tests/
│   ├── trn.test.ts              # Unit Tests: 9-Digit Egyptian TRN Validation
│   ├── cbe_limits.test.ts       # Unit Tests: CBE Tier 1 vs Tier 2 Deposit Cap Enforcement
│   └── eta_canonical.test.ts    # Unit Tests: Canonical JSON/XML & SHA-256 Digest Hashing
├── docker-compose.yml           # Complete Container Orchestration
└── README.md
```

---

## 🔑 Key Features & Compliance Rules

### 1. 🇪🇬 Egyptian Tax Registration Number (TRN / الرقم الضريبي) Validation
- Enforces strict **9-digit rule** (`XXX-XXX-XXX` or `XXXXXXXXX`).
- Rejects non-9 digit sequences with clear error reporting.

### 2. 💳 Central Bank of Egypt (CBE) Tier Limit Caps
- **Tier 1 (Individual)**: Daily Limit = **60,000.00 EGP**, Monthly Limit = **200,000.00 EGP**.
- **Tier 2 (SME Business)**: Daily Limit = **500,000.00 EGP**, Monthly Limit = **2,000,000.00 EGP** (Requires Commercial Registry & Tax ID).
- **Limit Exceeded Protocol**: When a deposit exceeds remaining allowance (e.g. attempting 25,000 EGP with only 15,000 EGP remaining), the system returns a structured limit exception payload allowing users to:
  - **Upgrade to Tier 2**
  - **Adjust deposit amount to remaining allowance**
  - **Cancel transaction**

### 3. 📄 ETA Canonicalization, SHA-256 Signatures & Verification QR Codes
- Transmits B2B Invoices & B2C E-Receipts according to ETA v1.0 specs.
- Formats Canonical JSON and Canonical XML payloads.
- Computes 64-character hex SHA-256 signature digests.
- Generates dynamic Base64 QR code verification links (`https://invoicing.eta.gov.eg/receipts/search/{etaUuid}`).

---

## 🚀 Quick Start & Installation

### Option A: Local Node.js Development

```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Run Automated Test Suite
npm test

# 3. Start Backend GraphQL Server
npm run dev
```
GraphQL endpoint will be active at: `http://localhost:4000/graphql`

### Option B: Docker Compose Launch

```bash
docker-compose up -d --build
```
- **GraphQL API**: `http://localhost:4000/graphql`
- **Frontend Dashboard**: `http://localhost:8080`
- **PostgreSQL**: `localhost:5432`

---

## 🧪 Testing & Verification

Run the Vitest test suite to verify TRN validation, CBE deposit limits, and ETA payload canonicalization:

```bash
cd backend
npx vitest run
```

---

## 📄 License & Standards

Built in compliance with the **Egyptian Tax Authority (ETA) e-Invoicing Specification v1.0** and **Central Bank of Egypt (CBE) Financial Services Regulations**.