import { describe, it, expect } from 'vitest';
import { resolvers } from '../backend/src/schema';

describe('Line Item Wallet Transactions Query & Detail Breakdown', () => {
  it('should fetch all wallet line item transactions', () => {
    const txns = resolvers.Query.getWalletTransactions();
    expect(txns.length).toBeGreaterThanOrEqual(4);
    expect(txns[0].internalRef).toBe('TXN-2026-001');
    expect(txns[0].amountEgp).toBe(20000);
    expect(txns[0].status).toBe('COMPLETED');
  });

  it('should fetch transaction details by internal reference', () => {
    const txn = resolvers.Query.getTransactionById(null, { id: 'TXN-2026-002' });
    expect(txn).not.toBeNull();
    expect(txn?.channel).toBe('Fawry Cash Code');
    expect(txn?.feeEgp).toBe(100);
    expect(txn?.vatEgp).toBe(14);
    expect(txn?.totalEgp).toBe(25114);
  });

  it('should retrieve failure reason for limit exceeded transaction', () => {
    const txn = resolvers.Query.getTransactionById(null, { id: 'TXN-2026-003' });
    expect(txn).not.toBeNull();
    expect(txn?.status).toBe('EXCEEDED_LIMIT');
    expect(txn?.failureReason).toContain('Tier 1 rules');
  });
});
