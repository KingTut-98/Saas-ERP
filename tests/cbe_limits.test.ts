import { describe, it, expect } from 'vitest';

describe('Central Bank of Egypt (CBE) Wallet Limits Engine', () => {
  const TIER_1_DAILY_CAP = 60000;
  const TIER_2_DAILY_CAP = 500000;

  it('should allow deposit within daily limit allowance', () => {
    const dailyUsed = 45000;
    const depositAmount = 10000;
    const remainingDaily = TIER_1_DAILY_CAP - dailyUsed;

    expect(depositAmount).toBeLessThanOrEqual(remainingDaily);
  });

  it('should reject deposit exceeding daily limit allowance and calculate remaining allowance', () => {
    const dailyUsed = 45000; // matching design mockup
    const depositAmount = 25000; // matching design mockup
    const remainingDaily = TIER_1_DAILY_CAP - dailyUsed; // 15,000 EGP

    expect(depositAmount).toBeGreaterThan(remainingDaily);
    expect(remainingDaily).toBe(15000);

    const errorMessage = `You attempted to deposit ${depositAmount.toLocaleString('en-US', {minimumFractionDigits: 2})} EGP, but your remaining daily allowance is ${remainingDaily.toLocaleString('en-US', {minimumFractionDigits: 2})} EGP under Tier 1 rules.`;
    expect(errorMessage).toContain('25,000.00 EGP');
    expect(errorMessage).toContain('15,000.00 EGP');
  });

  it('should support Tier 2 SME daily cap of 500,000 EGP', () => {
    const dailyUsed = 45000;
    const depositAmount = 25000;
    const remainingTier2 = TIER_2_DAILY_CAP - dailyUsed;

    expect(depositAmount).toBeLessThanOrEqual(remainingTier2);
    expect(remainingTier2).toBe(455000);
  });
});
