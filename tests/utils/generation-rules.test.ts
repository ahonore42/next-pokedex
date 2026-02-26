import { describe, it, expect } from 'vitest';
import { getGenFeatures } from '~/utils/generation-rules';

describe('getGenFeatures', () => {
  describe('Gen 1', () => {
    const f = getGenFeatures(1);
    it('has no abilities', () => expect(f.hasAbilities).toBe(false));
    it('has no natures', () => expect(f.hasNatures).toBe(false));
    it('has no held items', () => expect(f.hasHeldItems).toBe(false));
    it('has no EV cap', () => expect(f.hasEvCap).toBe(false));
    it('has no gender', () => expect(f.hasGender).toBe(false));
    it('has no shiny', () => expect(f.hasShiny).toBe(false));
    it('has no Tera Type', () => expect(f.hasTera).toBe(false));
    it('uses DVs (ivMax = 15)', () => expect(f.ivMax).toBe(15));
  });

  describe('Gen 2', () => {
    const f = getGenFeatures(2);
    it('has no abilities', () => expect(f.hasAbilities).toBe(false));
    it('has no natures', () => expect(f.hasNatures).toBe(false));
    it('has held items', () => expect(f.hasHeldItems).toBe(true));
    it('has no EV cap', () => expect(f.hasEvCap).toBe(false));
    it('has gender', () => expect(f.hasGender).toBe(true));
    it('has shiny', () => expect(f.hasShiny).toBe(true));
    it('still uses DVs (ivMax = 15)', () => expect(f.ivMax).toBe(15));
  });

  describe('Gen 3', () => {
    const f = getGenFeatures(3);
    it('has abilities', () => expect(f.hasAbilities).toBe(true));
    it('has natures', () => expect(f.hasNatures).toBe(true));
    it('has held items', () => expect(f.hasHeldItems).toBe(true));
    it('has EV cap', () => expect(f.hasEvCap).toBe(true));
    it('uses IVs (ivMax = 31)', () => expect(f.ivMax).toBe(31));
    it('has no Tera Type', () => expect(f.hasTera).toBe(false));
  });

  describe('Gen 9', () => {
    const f = getGenFeatures(9);
    it('has Tera Type', () => expect(f.hasTera).toBe(true));
    it('has all standard features', () => {
      expect(f.hasAbilities).toBe(true);
      expect(f.hasNatures).toBe(true);
      expect(f.hasHeldItems).toBe(true);
      expect(f.hasEvCap).toBe(true);
      expect(f.ivMax).toBe(31);
    });
  });
});
