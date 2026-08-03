import { describe, it, expect } from 'vitest';
import { ETACanonicalizer, ETADocumentPayload } from '../backend/src/eta/canonicalizer';

describe('ETA v1.0 Canonicalization & SHA-256 Digest Engine', () => {
  const sampleDoc: ETADocumentPayload = {
    internalId: 'INV-2026-001',
    issuerTrn: '123-456-789',
    issuerName: 'Nexus Egyptian Trading Co.',
    receiverTrn: '123-456-789',
    receiverName: 'Wallet Deposit Processing Fee Customer',
    documentType: 'B2C_RECEIPT',
    dateTimeIssued: '2026-08-03T14:11:00Z',
    items: [
      {
        itemCode: 'SERV-FEE-01',
        description: 'Wallet Deposit Processing Fee',
        quantity: 1,
        unitPrice: 100.00,
        netAmount: 100.00,
        vatRate: 0.14,
        vatAmount: 14.00,
        totalAmount: 114.00
      }
    ],
    totalNetAmount: 100.00,
    totalVatAmount: 14.00,
    totalAmount: 114.00
  };

  it('should generate valid canonical JSON string', () => {
    const canonicalJson = ETACanonicalizer.toCanonicalJson(sampleDoc);
    expect(canonicalJson).toContain('"INTERNALID":"INV-2026-001"');
    expect(canonicalJson).toContain('"TRN":"123456789"');
    expect(canonicalJson).toContain('"TOTALAMOUNT":"114.00"');
  });

  it('should generate valid canonical XML string', () => {
    const canonicalXml = ETACanonicalizer.toCanonicalXml(sampleDoc);
    expect(canonicalXml).toContain('<InternalId>INV-2026-001</InternalId>');
    expect(canonicalXml).toContain('<TRN>123456789</TRN>');
    expect(canonicalXml).toContain('<TotalAmount>114.00</TotalAmount>');
  });

  it('should compute deterministic 64-character hex SHA-256 hash', () => {
    const canonicalJson = ETACanonicalizer.toCanonicalJson(sampleDoc);
    const hash = ETACanonicalizer.computeSHA256Hash(canonicalJson);

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
