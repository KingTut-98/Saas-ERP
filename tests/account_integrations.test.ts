import { describe, it, expect } from 'vitest';
import { resolvers } from '../backend/src/schema';

describe('Account Preferences & Integrations Management', () => {
  it('should fetch default account preferences', () => {
    const prefs = resolvers.Query.getAccountPreferences();
    expect(prefs.legalName).toBe('Nexus Egyptian Trading Co.');
    expect(prefs.trn).toBe('123-456-789');
    expect(prefs.cbeAlertsEnabled).toBe(true);
    expect(prefs.defaultVatRate).toBe(0.14);
  });

  it('should update account preferences via mutation', () => {
    const updated = resolvers.Mutation.updateAccountPreferences(null, {
      legalName: 'Nexus Global Logistics Egypt',
      email: 'admin@nexus-global.eg',
      language: 'Arabic'
    });

    expect(updated.legalName).toBe('Nexus Global Logistics Egypt');
    expect(updated.email).toBe('admin@nexus-global.eg');
    expect(updated.language).toBe('Arabic');
  });

  it('should fetch integration configurations', () => {
    const config = resolvers.Query.getIntegrationConfig();
    expect(config.etaEnvironment).toBe('Pre-Production Sandbox');
    expect(config.appsmithConnected).toBe(true);
    expect(config.odooConnected).toBe(true);
    expect(config.apiKey).toContain('nx_live_key_');
  });

  it('should test ETA connection successfully', () => {
    const result = resolvers.Mutation.testEtaConnection();
    expect(result.success).toBe(true);
    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.message).toContain('Egyptian Tax Authority');
  });
});
