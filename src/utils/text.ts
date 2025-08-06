// -------------------- Functions -------------------------

// Utility function to capitalize Pokemon names
export function capitalizeName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const capitalizeWords = (str: string) => str.replace(/\b\w/g, (l) => l.toUpperCase());

export function romanToInteger(roman: string): number | null {
  if (!roman) return null;

  const len = roman.length;
  if (len === 0 || len > 15) return null; // Quick bounds check

  // Roman numeral values - object lookup is O(1)
  const values: Record<string, number> = {
    I: 1,
    i: 1,
    V: 5,
    v: 5,
    X: 10,
    x: 10,
    L: 50,
    l: 50,
    C: 100,
    c: 100,
    D: 500,
    d: 500,
    M: 1000,
    m: 1000,
  };

  let result = 0;
  let i = 0;

  while (i < len) {
    const current = values[roman[i]];
    if (current === undefined) return null; // Invalid character

    const next = i + 1 < len ? values[roman[i + 1]] : 0;

    // If current value is less than next value, subtract current (subtractive notation)
    if (current < next) {
      result += next - current;
      i += 2; // Skip both characters
    } else {
      result += current;
      i += 1; // Move to next character
    }
  }

  return result > 0 ? result : null;
}

export const formatPercentage = (percentage: number) =>
  percentage === 100 ? percentage : percentage.toFixed(1);
