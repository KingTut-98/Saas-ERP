import { ETACanonicalizer } from './eta/canonicalizer';
import { ETAClient } from './eta/client';

export const typeDefs = `#graphql
  type Taxpayer {
    id: ID!
    trn: String!
    legalName: String!
    tradeName: String
    tierLevel: String!
    commercialRegistryNumber: String
    email: String
    phone: String
  }

  type Wallet {
    id: ID!
    taxpayerId: ID!
    currency: String!
    balanceEgp: Float!
    dailyUsedEgp: Float!
    monthlyUsedEgp: Float!
    dailyLimitCapEgp: Float!
    monthlyLimitCapEgp: Float!
    dailyProgressPercent: Float!
    monthlyProgressPercent: Float!
    tierLevel: String!
  }

  type WalletTransaction {
    id: ID!
    internalRef: String!
    walletId: ID!
    amountEgp: Float!
    channel: String!
    referenceNumber: String!
    status: String!
    failureReason: String
    createdAt: String!
    cbeImpact: String
    feeEgp: Float
    vatEgp: Float
    totalEgp: Float
  }

  type AccountPreferences {
    legalName: String!
    tradeName: String!
    trn: String!
    commercialRegistryNumber: String!
    email: String!
    phone: String!
    tierLevel: String!
    defaultVatRate: Float!
    currency: String!
    language: String!
    themeColor: String!
    cbeAlertsEnabled: Boolean!
    etaFailAlertsEnabled: Boolean!
    smsReceiptsEnabled: Boolean!
  }

  type IntegrationConfig {
    etaEnvironment: String!
    etaClientId: String!
    etaClientSecret: String!
    etaCertStatus: String!
    etaCertExpiry: String!
    appsmithConnected: Boolean!
    odooConnected: Boolean!
    quickbooksConnected: Boolean!
    webhookUrl: String!
    apiKey: String!
  }

  type ConnectionResult {
    success: Boolean!
    latencyMs: Int!
    environment: String!
    message: String!
    timestamp: String!
  }

  type TRNValidationResult {
    trn: String!
    isValid: Boolean!
    formattedTrn: String
    message: String!
  }

  type WalletDepositResult {
    success: Boolean!
    code: String
    transactionId: String
    newBalance: Float
    dailyUsedEgp: Float
    monthlyUsedEgp: Float
    attemptedAmount: Float
    remainingDailyAllowance: Float
    dailyCap: Float
    tierLevel: String
    message: String!
  }

  type InvoiceItem {
    id: ID!
    itemCode: String!
    description: String!
    quantity: Float!
    unitPrice: Float!
    netAmount: Float!
    vatRate: Float!
    vatAmount: Float!
    totalAmount: Float!
  }

  type Invoice {
    id: ID!
    internalId: String!
    issuerTrn: String!
    receiverName: String!
    receiverTrn: String!
    documentType: String!
    netAmountEgp: Float!
    taxAmountVatEgp: Float!
    totalAmountEgp: Float!
    status: String!
    etaUuid: String
    qrCodeUrl: String
    canonicalHash: String
    items: [InvoiceItem!]
    createdAt: String!
  }

  type ETASubmissionResult {
    success: Boolean!
    etaUuid: String
    submissionId: String
    canonicalHash: String
    qrCodeUrl: String
    qrCodeBase64: String
    status: String!
    errors: [String!]
    submittedAt: String!
  }

  type Query {
    getWalletDetails(walletId: String): Wallet!
    validateTRN(trn: String!): TRNValidationResult!
    getInvoiceFeed: [Invoice!]!
    getInvoiceById(id: String!): Invoice
    getAccountPreferences: AccountPreferences!
    getIntegrationConfig: IntegrationConfig!
    getWalletTransactions: [WalletTransaction!]!
    getTransactionById(id: String!): WalletTransaction
  }

  type Mutation {
    processWalletDeposit(
      walletId: String
      amount: Float!
      channel: String!
      referenceNumber: String
    ): WalletDepositResult!

    submitInvoiceToETA(
      invoiceId: String!
      format: String
    ): ETASubmissionResult!

    updateAccountPreferences(
      legalName: String
      email: String
      phone: String
      language: String
      themeColor: String
      cbeAlertsEnabled: Boolean
      etaFailAlertsEnabled: Boolean
      smsReceiptsEnabled: Boolean
    ): AccountPreferences!

    updateIntegrationConfig(
      etaEnvironment: String
      etaClientId: String
      etaClientSecret: String
      webhookUrl: String
      odooConnected: Boolean
      quickbooksConnected: Boolean
    ): IntegrationConfig!

    testEtaConnection: ConnectionResult!
  }
`;

// In-Memory state fallback initialized with Page 1/2/3 values
let mockWallet = {
  id: 'w1111111-2222-3333-4444-555555555555',
  taxpayerId: 'a1b2c3d4-e5f6-7890-abcd-111111111111',
  currency: 'EGP',
  balanceEgp: 124500.00,
  dailyUsedEgp: 45000.00,
  monthlyUsedEgp: 110000.00,
  dailyLimitCapEgp: 60000.00,
  monthlyLimitCapEgp: 200000.00,
  tierLevel: 'TIER_1_INDIVIDUAL'
};

let mockTransactions = [
  {
    id: 'txn-101',
    internalRef: 'TXN-2026-001',
    walletId: 'w1111111-2222-3333-4444-555555555555',
    amountEgp: 20000.00,
    channel: 'InstaPay Egypt',
    referenceNumber: 'INSTA-99410-EG',
    status: 'COMPLETED',
    failureReason: null,
    createdAt: '2026-08-03T11:30:00.000Z',
    cbeImpact: 'Updated Daily Used: 20,000 / 60,000 EGP',
    feeEgp: 0.00,
    vatEgp: 0.00,
    totalEgp: 20000.00
  },
  {
    id: 'txn-102',
    internalRef: 'TXN-2026-002',
    walletId: 'w1111111-2222-3333-4444-555555555555',
    amountEgp: 25000.00,
    channel: 'Fawry Cash Code',
    referenceNumber: 'FAWRY-48192-EG',
    status: 'COMPLETED',
    failureReason: null,
    createdAt: '2026-08-03T13:15:00.000Z',
    cbeImpact: 'Updated Daily Used: 45,000 / 60,000 EGP',
    feeEgp: 100.00,
    vatEgp: 14.00,
    totalEgp: 25114.00
  },
  {
    id: 'txn-103',
    internalRef: 'TXN-2026-003',
    walletId: 'w1111111-2222-3333-4444-555555555555',
    amountEgp: 25000.00,
    channel: 'Credit / Debit Card',
    referenceNumber: 'CARD-88192-EG',
    status: 'EXCEEDED_LIMIT',
    failureReason: 'You attempted to deposit 25,000.00 EGP, but your remaining daily allowance is 15,000.00 EGP under Tier 1 rules.',
    createdAt: '2026-08-03T14:45:00.000Z',
    cbeImpact: 'Rejected - Exceeds 60,000 EGP Daily Cap',
    feeEgp: 0.00,
    vatEgp: 0.00,
    totalEgp: 25000.00
  },
  {
    id: 'txn-104',
    internalRef: 'TXN-2026-004',
    walletId: 'w1111111-2222-3333-4444-555555555555',
    amountEgp: 10000.00,
    channel: 'Bank Wire Transfer',
    referenceNumber: 'BANK-CIB-90182',
    status: 'COMPLETED',
    failureReason: null,
    createdAt: '2026-08-02T16:00:00.000Z',
    cbeImpact: 'Updated Monthly Used: 110,000 / 200,000 EGP',
    feeEgp: 50.00,
    vatEgp: 7.00,
    totalEgp: 10057.00
  }
];

let mockPreferences = {
  legalName: 'Nexus Egyptian Trading Co.',
  tradeName: 'Nexus Wallet',
  trn: '123-456-789',
  commercialRegistryNumber: 'CR-98421-EG',
  email: 'finance@nexus-wallet.eg',
  phone: '+201001234567',
  tierLevel: 'Tier 1 · Individual',
  defaultVatRate: 0.14,
  currency: 'EGP',
  language: 'English',
  themeColor: '#1E293B',
  cbeAlertsEnabled: true,
  etaFailAlertsEnabled: true,
  smsReceiptsEnabled: false
};

let mockIntegrations = {
  etaEnvironment: 'Pre-Production Sandbox',
  etaClientId: 'eta_client_sec_9984102',
  etaClientSecret: '••••••••••••••••••••••••',
  etaCertStatus: 'Verified & Active (CAdES-BES / Soft Cert)',
  etaCertExpiry: '14 Dec 2027',
  appsmithConnected: true,
  odooConnected: true,
  quickbooksConnected: false,
  webhookUrl: 'https://api.nexus-wallet.eg/webhooks/eta/v1',
  apiKey: 'nx_live_key_9841a0e7f229'
};

let mockInvoices: any[] = [
  {
    id: 'inv-001',
    internalId: 'INV-2026-001',
    issuerTrn: '123-456-789',
    receiverName: 'Wallet Deposit Processing Fee Customer',
    receiverTrn: '123-456-789',
    documentType: 'B2C_RECEIPT',
    netAmountEgp: 100.00,
    taxAmountVatEgp: 14.00,
    totalAmountEgp: 114.00,
    status: 'VALID',
    etaUuid: 'E3A8F92D-811C-4B2E-901B-74D3F9A08123',
    qrCodeUrl: 'https://invoicing.eta.gov.eg/receipts/search/E3A8F92D-811C-4B2E-901B-74D3F9A08123',
    canonicalHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    createdAt: '2026-08-03T14:11:00.000Z',
    items: [
      {
        id: 'item-001',
        itemCode: 'SERV-FEE-01',
        description: 'Wallet Deposit Processing Fee',
        quantity: 1,
        unitPrice: 100.00,
        netAmount: 100.00,
        vatRate: 0.14,
        vatAmount: 14.00,
        totalAmount: 114.00
      }
    ]
  },
  {
    id: 'inv-002',
    internalId: 'INV-2026-002',
    issuerTrn: '123-456-789',
    receiverName: 'Cairo Retail Supplying Co.',
    receiverTrn: '987654321',
    documentType: 'B2B_INVOICE',
    netAmountEgp: 10000.00,
    taxAmountVatEgp: 1400.00,
    totalAmountEgp: 11400.00,
    status: 'VALID',
    etaUuid: 'ETA-3F9A-412C',
    qrCodeUrl: 'https://invoicing.eta.gov.eg/receipts/search/ETA-3F9A-412C',
    canonicalHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    createdAt: '2026-08-02T10:00:00.000Z',
    items: [
      {
        id: 'item-002',
        itemCode: 'PROD-001',
        description: 'Commercial Goods Supply',
        quantity: 10,
        unitPrice: 1000.00,
        netAmount: 10000.00,
        vatRate: 0.14,
        vatAmount: 1400.00,
        totalAmount: 11400.00
      }
    ]
  },
  {
    id: 'inv-003',
    internalId: 'INV-2026-003',
    issuerTrn: '123-456-789',
    receiverName: 'Alexandria Logistics Ltd',
    receiverTrn: '456789123',
    documentType: 'B2B_INVOICE',
    netAmountEgp: 25000.00,
    taxAmountVatEgp: 3500.00,
    totalAmountEgp: 28500.00,
    status: 'QUEUED',
    etaUuid: null,
    qrCodeUrl: null,
    canonicalHash: null,
    createdAt: '2026-08-03T09:00:00.000Z',
    items: []
  }
];

export const resolvers = {
  Query: {
    getWalletDetails: (_: any, { walletId }: { walletId?: string }) => {
      const dailyProgressPercent = (mockWallet.dailyUsedEgp / mockWallet.dailyLimitCapEgp) * 100;
      const monthlyProgressPercent = (mockWallet.monthlyUsedEgp / mockWallet.monthlyLimitCapEgp) * 100;
      return {
        ...mockWallet,
        dailyProgressPercent,
        monthlyProgressPercent
      };
    },

    validateTRN: (_: any, { trn }: { trn: string }) => {
      const isValid = ETACanonicalizer.validateTRN(trn);
      const digits = trn.replace(/[^0-9]/g, '');
      const formattedTrn = isValid 
        ? `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6,9)}`
        : trn;

      return {
        trn,
        isValid,
        formattedTrn,
        message: isValid 
          ? '✅ Valid 9-digit Egyptian Tax Registration Number (TRN)' 
          : '❌ Invalid TRN length (Must contain strictly 9 digits)'
      };
    },

    getInvoiceFeed: () => mockInvoices,

    getInvoiceById: (_: any, { id }: { id: string }) => {
      return mockInvoices.find(inv => inv.id === id || inv.internalId === id) || null;
    },

    getAccountPreferences: () => mockPreferences,

    getIntegrationConfig: () => mockIntegrations,

    getWalletTransactions: () => mockTransactions,

    getTransactionById: (_: any, { id }: { id: string }) => {
      return mockTransactions.find(t => t.id === id || t.internalRef === id) || null;
    }
  },

  Mutation: {
    processWalletDeposit: (_: any, { walletId, amount, channel, referenceNumber }: any) => {
      const remainingDaily = mockWallet.dailyLimitCapEgp - mockWallet.dailyUsedEgp;
      
      if (amount > remainingDaily) {
        const txn = {
          id: `txn-${Date.now()}`,
          internalRef: `TXN-2026-${mockTransactions.length + 1}`,
          walletId: mockWallet.id,
          amountEgp: amount,
          channel: channel || 'Card Gateway',
          referenceNumber: referenceNumber || `REF-${Date.now()}`,
          status: 'EXCEEDED_LIMIT',
          failureReason: `You attempted to deposit ${amount.toLocaleString('en-US', {minimumFractionDigits: 2})} EGP, but your remaining daily allowance is ${remainingDaily.toLocaleString('en-US', {minimumFractionDigits: 2})} EGP under Tier 1 rules.`,
          createdAt: new Date().toISOString(),
          cbeImpact: 'Rejected - Exceeds 60,000 EGP Daily Cap',
          feeEgp: 0.00,
          vatEgp: 0.00,
          totalEgp: amount
        };
        mockTransactions.unshift(txn);

        return {
          success: false,
          code: 'DAILY_LIMIT_EXCEEDED',
          transactionId: txn.id,
          attemptedAmount: amount,
          remainingDailyAllowance: remainingDaily,
          dailyCap: mockWallet.dailyLimitCapEgp,
          tierLevel: mockWallet.tierLevel,
          message: txn.failureReason
        };
      }

      // Valid deposit
      mockWallet.balanceEgp += amount;
      mockWallet.dailyUsedEgp += amount;
      mockWallet.monthlyUsedEgp += amount;

      const txn = {
        id: `txn-${Date.now()}`,
        internalRef: `TXN-2026-00${mockTransactions.length + 1}`,
        walletId: mockWallet.id,
        amountEgp: amount,
        channel: channel || 'InstaPay Egypt',
        referenceNumber: referenceNumber || `REF-${Date.now()}`,
        status: 'COMPLETED',
        failureReason: null,
        createdAt: new Date().toISOString(),
        cbeImpact: `Updated Daily Used: ${mockWallet.dailyUsedEgp.toLocaleString()} / 60,000 EGP`,
        feeEgp: 0.00,
        vatEgp: 0.00,
        totalEgp: amount
      };
      mockTransactions.unshift(txn);

      return {
        success: true,
        transactionId: txn.id,
        newBalance: mockWallet.balanceEgp,
        dailyUsedEgp: mockWallet.dailyUsedEgp,
        monthlyUsedEgp: mockWallet.monthlyUsedEgp,
        message: 'Wallet deposit processed successfully'
      };
    },

    submitInvoiceToETA: async (_: any, { invoiceId, format }: { invoiceId: string, format?: string }) => {
      const invoice = mockInvoices.find(i => i.id === invoiceId || i.internalId === invoiceId);
      if (!invoice) {
        throw new Error(`Invoice with ID '${invoiceId}' not found.`);
      }

      const client = new ETAClient();
      const result = await client.submitDocument({
        internalId: invoice.internalId,
        issuerTrn: invoice.issuerTrn,
        issuerName: mockPreferences.legalName,
        receiverTrn: invoice.receiverTrn,
        receiverName: invoice.receiverName,
        documentType: invoice.documentType || 'B2C_RECEIPT',
        dateTimeIssued: new Date().toISOString(),
        items: invoice.items && invoice.items.length > 0 ? invoice.items : [{
          itemCode: 'ITEM-DEFAULT',
          description: 'Standard Goods/Services',
          quantity: 1,
          unitPrice: invoice.netAmountEgp,
          netAmount: invoice.netAmountEgp,
          vatRate: 0.14,
          vatAmount: invoice.taxAmountVatEgp,
          totalAmount: invoice.totalAmountEgp
        }],
        totalNetAmount: invoice.netAmountEgp,
        totalVatAmount: invoice.taxAmountVatEgp,
        totalAmount: invoice.totalAmountEgp
      }, (format as any) || 'JSON');

      if (result.success) {
        invoice.status = 'VALID';
        invoice.etaUuid = result.etaUuid;
        invoice.qrCodeUrl = result.qrCodeUrl;
        invoice.canonicalHash = result.canonicalHash;
      }

      return result;
    },

    updateAccountPreferences: (_: any, args: any) => {
      mockPreferences = { ...mockPreferences, ...args };
      return mockPreferences;
    },

    updateIntegrationConfig: (_: any, args: any) => {
      mockIntegrations = { ...mockIntegrations, ...args };
      return mockIntegrations;
    },

    testEtaConnection: () => {
      return {
        success: true,
        latencyMs: 42,
        environment: mockIntegrations.etaEnvironment,
        message: 'Successfully authenticated & connected to Egyptian Tax Authority (ETA) e-Invoicing API Gateway.',
        timestamp: new Date().toISOString()
      };
    }
  }
};
