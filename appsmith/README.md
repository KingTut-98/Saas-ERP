# 🇪🇬 Appsmith Setup & ETA Compliance Dashboard Guide

This guide walks you through setting up and importing the **ETA E-Invoicing & CBE Compliance SaaS Portal** into **Appsmith**, connecting it to the GraphQL backend (`http://localhost:4000/graphql`) and PostgreSQL database (`saas_erp_db`).

---

## 🚀 1. Quick Start via Docker Compose

Run the following command from the project root (`d:\Saas Fintech`):

```bash
docker-compose up -d
```

### Access Ports & Services
| Service | Endpoint | Description |
| :--- | :--- | :--- |
| **Appsmith Editor** | `http://localhost:8000` | Appsmith Admin & Dashboard UI |
| **Frontend Web App** | `http://localhost:8080` | React / Vite Client Application |
| **Backend GraphQL Server** | `http://localhost:4000/graphql` | GraphQL Schema & Business Logic |
| **PostgreSQL Database** | `localhost:5432` | Supabase / PostgreSQL DB (`saas_erp_db`) |

---

## 📥 2. Importing the Project into Appsmith

Appsmith provides two import options:

### Option A: Import Full Application (`appsmith_application.json` - Recommended)
1. Open your browser at `http://localhost:8000`.
2. On your workspace home screen, click **"Create New"** -> **"Import"**.
3. Select **"Upload JSON file"** and choose:
   `d:\Saas Fintech\appsmith\appsmith_application.json`
4. Appsmith will automatically import:
   - **Page Layout**: Canvas, header banner, CBE limit meter, TRN validator, and status feed.
   - **Datasources**: Pre-configured `GraphQL_Backend_DS` and `PostgreSQL_Database_DS`.
   - **Queries & Mutations**: `GetWalletDetails`, `ValidateTRN`, `GetInvoiceFeed`, `ProcessWalletDeposit`, `SubmitInvoiceToETA`.
   - **JSObjects**: `JSUtils` for currency and TRN formatting.

### Option B: Import Page JSON (`eta_dashboard.json`)
1. Create a blank app in Appsmith.
2. In the left panel, click on **Pages** -> **Import Page**.
3. Upload `d:\Saas Fintech\appsmith\eta_dashboard.json`.

---

## 🎨 3. Dashboard UI Components & Controls Map

All tables, inputs, buttons, and status indicators follow strict Appsmith best practices and clear labeling:

### 1. Header Banner (`cnt_header`)
- **Title**: `🇪🇬 ETA E-Invoicing & Compliance SaaS Portal`
- **Subtitle**: `Central Bank of Egypt (CBE) Wallet Cap Enforcement & Tax Authority v1.0 Integration`
- **Buttons**:
  - `+ New Wallet Deposit` (Green primary button -> opens `mdl_create_deposit`)
  - `⚡ Upgrade Tier` (Blue button -> opens `mdl_tier_upgrade`)

### 2. Financial Controls & CBE Deposit Limit Meter (`cnt_deposit_meter`)
- **Stat Boxes**:
  - `Available Balance`: Formatted as `124,500.00 EGP`
  - `Daily CBE Used`: `45,000.00 / 60,000.00 EGP` (Tier 1 Limit)
  - `Monthly CBE Used`: `110,000.00 / 200,000.00 EGP`
- **Progress Bar**: `progress_daily_cbe` displaying daily limit percentage with color thresholds (Blue -> Amber -> Red).

### 3. Egyptian Taxpayer TRN Lookup & Validator (`cnt_trn_lookup`)
- **Input Field**: `inp_trn_search` (Label: `"Egyptian Tax Registration Number (TRN)"`, Regex: `^[0-9]{3}-?[0-9]{3}-?[0-9]{3}$`)
- **Button**: `btn_validate_trn` (Label: `"Verify TRN with ETA"`, triggers `ValidateTRN` query)
- **Status Card**: Dynamic legal status feedback card.

### 4. ETA v1.0 Invoice Submission Feed Table (`tbl_invoices`)
- **Table Columns & Header Labels**:
  - `Invoice ID` (`internalId`)
  - `Receiver Legal Name` (`receiverName`)
  - `Receiver TRN` (`receiverTrn`)
  - `Type` (`documentType`)
  - `Net Amount (EGP)` (`netAmountEgp`)
  - `VAT 14% (EGP)` (`taxAmountVatEgp`)
  - `Total Amount (EGP)` (`totalAmountEgp`)
  - `ETA Status` (`status` - Badges: `VALID` [Green], `QUEUED` [Orange], `DRAFT` [Gray])
- **Custom Button Action Columns**:
  - `Submit to ETA Portal` (Triggers `SubmitInvoiceToETA` GraphQL mutation)
  - `View Hash & QR` (Opens compliance receipt modal `mdl_invoice_details`)

### 5. Interactive Compliance Modals
- `mdl_create_deposit`: Form modal for entering EGP deposit amount, payment channel (InstaPay, Fawry, Bank Transfer, Vodafone Cash), and reference number.
- `mdl_limit_exceeded`: Warning modal when deposit exceeds 60,000 EGP daily limit, offering Tier 2 SME upgrade options.
- `mdl_tier_upgrade`: Form for submitting Commercial Registry Number (السجل التجاري) to unlock 500,000 EGP/day cap.
- `mdl_invoice_details`: Pop-up showing canonical SHA-256 hash string and direct ETA portal QR verification link.

---

## 🧪 4. Step-by-Step Validation Scenarios

1. **TRN 9-Digit Validation Test**:
   - Enter `123456789` -> Validation Card shows `✅ Valid 9-digit Egyptian TRN format`.
   - Enter `12345` -> Validation Card shows `❌ Invalid TRN length (Must be 9 digits)`.

2. **CBE Deposit Cap Enforcement Test**:
   - Deposit `10,000.00 EGP` via `InstaPay` -> Balance increases to `134,500.00 EGP`, Daily used becomes `55,000.00 EGP`.
   - Deposit `25,000.00 EGP` -> Triggers `mdl_limit_exceeded` warning modal due to Tier 1 daily cap violation (60,000 EGP max).

3. **ETA E-Receipt Submission Test**:
   - In `tbl_invoices`, click **"Submit to ETA Portal"** on queued invoice `INV-2026-003`.
   - Status updates from `QUEUED` to `VALID`, generating an official ETA UUID, canonical SHA-256 hash, and Base64 QR Code URL.
   - Click **"View Hash & QR"** to view receipt details and open the ETA portal link.
