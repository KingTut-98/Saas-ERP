# Appsmith Setup & Dashboard Import Guide

This guide walks you through setting up **Appsmith**, importing the **ETA E-Invoicing & Compliance Dashboard** (`eta_dashboard.json`), and connecting it to your GraphQL backend and PostgreSQL database.

---

## 🚀 1. Launching Appsmith via Docker Compose

Run the following command in the root folder (`d:\Saas Fintech`):

```bash
docker-compose up -d
```

This starts:
- **Appsmith**: Available at `http://localhost:8000`
- **Frontend Dashboard**: Available at `http://localhost:8080`
- **Backend GraphQL Server**: Available at `http://localhost:4000/graphql`
- **PostgreSQL / Supabase Database**: Available at `localhost:5432`

---

## 📥 2. Importing `eta_dashboard.json` into Appsmith

1. Open your browser and go to `http://localhost:8000`.
2. Follow the prompt to complete the initial setup / administrator account creation.
3. In the Appsmith workspace home screen, click **"Create New"** -> **"Import"** (or click **"Import"** on an existing application space).
4. Select **"Upload JSON file"** and choose:
   `d:\Saas Fintech\appsmith\eta_dashboard.json`
5. Click **Import**. Appsmith will automatically construct the complete dashboard UI with widgets, tables, form controls, and pre-configured queries.

---

## 🔗 3. Configuring Datasources

### Option A: Direct GraphQL Backend Connection (Recommended)
1. Inside Appsmith editor, open **Datasources** on the left panel.
2. Click **Create New Datasource** -> Select **GraphQL**.
3. Set the **URL** to:
   - If running inside Docker container: `http://backend:4000/graphql`
   - If running outside Docker: `http://localhost:4000/graphql`
4. Set **Header**:
   - Key: `Content-Type` | Value: `application/json`
5. Test the connection and click **Save**.

### Option B: Direct PostgreSQL / Supabase Connection
1. In Datasources, click **Create New Datasource** -> Select **PostgreSQL**.
2. Connection Settings:
   - **Host Address**: `postgres` (inside Docker) or `localhost` (outside Docker)
   - **Port**: `5432`
   - **Database Name**: `saas_erp_db`
   - **Username**: `postgres`
   - **Password**: `postgrespassword`
3. Click **Test** and **Save**.

---

## 🧪 4. Testing Dashboard Functionality

Once imported and connected, test the following key compliance features:

1. **Egyptian TRN Validation (الرقم الضريبي)**:
   - Enter a 9-digit TRN (e.g. `123456789` or `123-456-789`). Observe real-time validation success banner.
   - Enter an invalid number (e.g. `12345`). Observe error status message.

2. **CBE Wallet Deposit Cap Enforcement**:
   - Tier 1 Daily Cap is **60,000.00 EGP** (Current used: **45,000.00 EGP**, Remaining: **15,000.00 EGP**).
   - Try depositing **10,000.00 EGP**: Process completes, balance updates to **134,500.00 EGP**.
   - Try depositing **25,000.00 EGP**: Triggers `DAILY_LIMIT_EXCEEDED` exception modal offering Tier 2 upgrade options.

3. **ETA Canonicalization & E-Receipt Verification**:
   - Inspect the Invoices table fed by `getInvoiceFeed`.
   - Click **"Submit to ETA Portal"** on `INV-2026-003` to trigger canonical JSON hashing and generation of the Base64 QR code link (`https://invoicing.eta.gov.eg/receipts/search/{etaUuid}`).
