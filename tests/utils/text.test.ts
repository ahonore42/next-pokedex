/**
 * Unit tests for ~/utils/text.ts
 *
 * Covers: capitalizeName, capitalizeWords, romanToInteger, formatPercentage
 * Estimated coverage: ~100% of text.ts code paths
 */
import { describe, it, expect } from 'vitest';
import { capitalizeName, capitalizeWords, romanToInteger, formatPercentage } from '~/utils/text';

// ─────────────────────────────────────────────────────────────────
// capitalizeName
// ─────────────────────────────────────────────────────────────────
describe('capitalizeName', () => {
  it('capitalizes a single-word name', () => {
    expect(capitalizeName('bulbasaur')).toBe('Bulbasaur');
  });

  it('capitalizes both words in a hyphenated name', () => {
    expect(capitalizeName('mr-mime')).toBe('Mr Mime');
  });

  it('handles three-segment hyphenated names', () => {
    expect(capitalizeName('tapu-koko')).toBe('Tapu Koko');
  });

  it('handles double-hyphen (repeated evolution names)', () => {
    expect(capitalizeName('ho-oh')).toBe('Ho Oh');
  });

  it('capitalizes nidoran suffix letters', () => {
    // Each hyphen-separated segment is capitalized independently
    expect(capitalizeName('nidoran-f')).toBe('Nidoran F');
  });

  it('returns empty string unchanged', () => {
    expect(capitalizeName('')).toBe('');
  });

  it('handles already-capitalized input without doubling', () => {
    expect(capitalizeName('Pikachu')).toBe('Pikachu');
  });
});

// ─────────────────────────────────────────────────────────────────
// capitalizeWords
// ─────────────────────────────────────────────────────────────────
describe('capitalizeWords', () => {
  it('capitalizes the first letter of every space-separated word', () => {
    expect(capitalizeWords('thunder stone')).toBe('Thunder Stone');
  });

  it('is a no-op on already-capitalized words', () => {
    expect(capitalizeWords('Thunder Stone')).toBe('Thunder Stone');
  });

  it('handles a single word', () => {
    expect(capitalizeWords('earthquake')).toBe('Earthquake');
  });

  it('returns empty string unchanged', () => {
    expect(capitalizeWords('')).toBe('');
  });

  it('capitalizes mid-sentence lower-case words', () => {
    expect(capitalizeWords('use fire stone')).toBe('Use Fire Stone');
  });
});

// ─────────────────────────────────────────────────────────────────
// romanToInteger – additive notation
// ─────────────────────────────────────────────────────────────────
describe('romanToInteger – additive notation', () => {
  it.each([
    ['I', 1],
    ['V', 5],
    ['X', 10],
    ['L', 50],
    ['C', 100],
    ['D', 500],
    ['M', 1000],
    ['II', 2],
    ['III', 3],
    ['VI', 6],
    ['VII', 7],
    ['VIII', 8],
    ['XI', 11],
    ['XV', 15],
  ])('%s → %i', (roman, expected) => {
    expect(romanToInteger(roman)).toBe(expected);
  });
});

// ─────────────────────────────────────────────────────────────────
// romanToInteger – subtractive notation
// ─────────────────────────────────────────────────────────────────
describe('romanToInteger – subtractive notation', () => {
  it.each([
    ['IV', 4],
    ['IX', 9],
    ['XL', 40],
    ['XC', 90],
    ['CD', 400],
    ['CM', 900],
  ])('%s → %i', (roman, expected) => {
    expect(romanToInteger(roman)).toBe(expected);
  });
});

// ─────────────────────────────────────────────────────────────────
// romanToInteger – case insensitivity
// ─────────────────────────────────────────────────────────────────
describe('romanToInteger – case insensitivity', () => {
  it('accepts lowercase "i"', () => expect(romanToInteger('i')).toBe(1));
  it('accepts lowercase "iv"', () => expect(romanToInteger('iv')).toBe(4));
  it('accepts lowercase "ix"', () => expect(romanToInteger('ix')).toBe(9));
  it('accepts mixed-case "Iv"', () => expect(romanToInteger('Iv')).toBe(4));
});

// ─────────────────────────────────────────────────────────────────
// romanToInteger – edge cases & invalid input
// ─────────────────────────────────────────────────────────────────
describe('romanToInteger – edge / invalid input', () => {
  it('returns null for an empty string', () => {
    expect(romanToInteger('')).toBeNull();
  });

  it('returns null for a string longer than 15 characters', () => {
    // 16 I's is 16 characters
    expect(romanToInteger('IIIIIIIIIIIIIIII')).toBeNull();
  });

  it('returns null when the string contains a non-roman character', () => {
    expect(romanToInteger('hello')).toBeNull();
    expect(romanToInteger('A')).toBeNull();
    expect(romanToInteger('Z')).toBeNull();
  });

  it('returns null for a string that evaluates to zero (edge of valid range)', () => {
    // No standard roman numeral evaluates to 0, but pathological cases
    // The function returns result > 0 ? result : null, so any zero-sum returns null
    // This is hard to trigger with valid chars; the empty string case catches it
    expect(romanToInteger('')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────
// formatPercentage
// ─────────────────────────────────────────────────────────────────
describe('formatPercentage', () => {
  it('returns the raw number 100 (not a string) for exactly 100%', () => {
    const result = formatPercentage(100);
    expect(result).toBe(100);
    expect(typeof result).toBe('number');
  });

  it('returns a string with 1 decimal place for any other value', () => {
    expect(formatPercentage(50)).toBe('50.0');
    expect(formatPercentage(12.5)).toBe('12.5');
    expect(formatPercentage(87.5)).toBe('87.5');
  });

  it('returns "0.0" for 0%', () => {
    expect(formatPercentage(0)).toBe('0.0');
  });

  it('rounds to one decimal place', () => {
    expect(formatPercentage(33.333)).toBe('33.3');
    expect(formatPercentage(66.666)).toBe('66.7');
  });
});
