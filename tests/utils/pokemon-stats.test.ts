import { describe, it, expect } from 'vitest';
import { calculateStat, calculateAllStats } from '~/utils/pokemon-stats';

// Reference values verified against the official formula:
// Non-HP: floor((2B + I + floor(E/4) + 5) × N)
// HP:     2B + I + floor(E/4) + 110  (at level 100)

describe('calculateStat', () => {
  describe('non-HP stat at level 100', () => {
    it('returns correct value with max IVs/EVs, neutral nature', () => {
      // base 100, 31 IV, 252 EV → floor((200+31+63+5)×1.0) = 299
      expect(calculateStat({ baseStat: 100, iv: 31, ev: 252, level: 100 })).toBe(299);
    });

    it('applies beneficial nature (×1.1)', () => {
      // floor(299 × 1.1) = floor(328.9) = 328
      expect(
        calculateStat({ baseStat: 100, iv: 31, ev: 252, level: 100, natureModifier: 1.1 }),
      ).toBe(328);
    });

    it('applies hindering nature (×0.9)', () => {
      // floor(299 × 0.9) = floor(269.1) = 269
      expect(
        calculateStat({ baseStat: 100, iv: 31, ev: 252, level: 100, natureModifier: 0.9 }),
      ).toBe(269);
    });

    it('returns correct value with 0 IVs and 0 EVs', () => {
      // floor((200+0+0+5)×1.0) = 205
      expect(calculateStat({ baseStat: 100, iv: 0, ev: 0, level: 100 })).toBe(205);
    });
  });

  describe('HP stat at level 100', () => {
    it('returns correct value with max IVs/EVs', () => {
      // 2×100 + 31 + 63 + 110 = 404
      expect(
        calculateStat({ baseStat: 100, iv: 31, ev: 252, level: 100, isHpStat: true }),
      ).toBe(404);
    });

    it('ignores nature modifier for HP', () => {
      const hp = calculateStat({
        baseStat: 100, iv: 31, ev: 252, level: 100, isHpStat: true, natureModifier: 1.1,
      });
      // HP formula does not multiply by nature
      expect(hp).toBe(404);
    });
  });

  describe('non-HP stat at level 50', () => {
    it('returns correct value with max IVs/EVs, neutral nature', () => {
      // floor(((200+31+63)/100)×50) + 5 = floor(147)+5 = 152; floor(152×1.0) = 152
      expect(calculateStat({ baseStat: 100, iv: 31, ev: 252, level: 50 })).toBe(152);
    });

    it('applies beneficial nature at level 50', () => {
      // floor(152 × 1.1) = floor(167.2) = 167
      expect(
        calculateStat({ baseStat: 100, iv: 31, ev: 252, level: 50, natureModifier: 1.1 }),
      ).toBe(167);
    });
  });

  describe('HP stat at level 50', () => {
    it('returns correct value with max IVs/EVs', () => {
      // floor(((200+31+63)/100)×50) + 50 + 10 = 147 + 60 = 207
      expect(
        calculateStat({ baseStat: 100, iv: 31, ev: 252, level: 50, isHpStat: true }),
      ).toBe(207);
    });
  });

  describe('input validation', () => {
    it('throws on base stat > 255', () => {
      expect(() => calculateStat({ baseStat: 256, iv: 31, ev: 0, level: 100 })).toThrow();
    });

    it('throws on IV > 31', () => {
      expect(() => calculateStat({ baseStat: 100, iv: 32, ev: 0, level: 100 })).toThrow();
    });

    it('throws on EV > 252', () => {
      expect(() => calculateStat({ baseStat: 100, iv: 31, ev: 253, level: 100 })).toThrow();
    });

    it('throws on invalid nature modifier', () => {
      expect(() =>
        calculateStat({ baseStat: 100, iv: 31, ev: 0, level: 100, natureModifier: 1.2 }),
      ).toThrow();
    });
  });

  describe('EV partial credit', () => {
    it('floors EV contribution (floor(E/4))', () => {
      // 1 EV → floor(1/4) = 0 — same as 0 EVs
      const withOneEv = calculateStat({ baseStat: 100, iv: 31, ev: 1, level: 100 });
      const withZeroEv = calculateStat({ baseStat: 100, iv: 31, ev: 0, level: 100 });
      expect(withOneEv).toBe(withZeroEv);

      // 4 EVs → floor(4/4) = 1 — one point higher
      const withFourEv = calculateStat({ baseStat: 100, iv: 31, ev: 4, level: 100 });
      expect(withFourEv).toBe(withZeroEv + 1);
    });
  });
});

describe('calculateAllStats', () => {
  it('calculates all six stats and treats hp differently', () => {
    const baseStats = {
      hp: 100, attack: 100, defense: 100,
      specialAttack: 100, specialDefense: 100, speed: 100,
    };
    const ivs = { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 };
    const evs = { hp: 252, attack: 252, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };

    const result = calculateAllStats(baseStats, { level: 100, ivs, evs });

    expect(result.hp).toBe(404);         // HP formula
    expect(result.attack).toBe(299);     // max EVs, neutral
    expect(result.defense).toBe(236);    // 0 EVs: floor((200+31+0+5)×1.0)=236
    expect(result.speed).toBe(236);
  });
});
