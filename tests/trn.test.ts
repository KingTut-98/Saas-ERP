import { describe, it, expect } from 'vitest';
import { ETACanonicalizer } from '../backend/src/eta/canonicalizer';

describe('Egyptian TRN 9-Digit Validation', () => {
  it('should accept valid 9-digit TRN formatted with hyphens', () => {
    expect(ETACanonicalizer.validateTRN('123-456-789')).toBe(true);
  });

  it('should accept valid 9-digit TRN without hyphens', () => {
    expect(ETACanonicalizer.validateTRN('123456789')).toBe(true);
  });

  it('should reject TRN with less than 9 digits', () => {
    expect(ETACanonicalizer.validateTRN('123-456')).toBe(false);
  });

  it('should reject TRN with more than 9 digits', () => {
    expect(ETACanonicalizer.validateTRN('123-456-789-00')).toBe(false);
  });

  it('should reject empty or null input', () => {
    expect(ETACanonicalizer.validateTRN('')).toBe(false);
  });
});
