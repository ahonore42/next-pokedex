import { describe, it, expect } from 'vitest';
import { parsePokePasteBlock, parsePokePaste, normalizeForLookup } from '~/utils/pokepaste';

const GARCHOMP_BLOCK = `\
Garchomp @ Choice Scarf
Ability: Rough Skin
Level: 50
Shiny: Yes
Tera Type: Dragon
EVs: 252 Atk / 4 Def / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Poison Jab
- Stone Edge`;

describe('parsePokePasteBlock', () => {
  it('returns null for an empty string', () => {
    expect(parsePokePasteBlock('')).toBeNull();
  });

  describe('standard block', () => {
    const result = parsePokePasteBlock(GARCHOMP_BLOCK)!;

    it('parses species name', () => expect(result.speciesName).toBe('Garchomp'));
    it('parses held item', () => expect(result.itemName).toBe('Choice Scarf'));
    it('parses ability', () => expect(result.abilityName).toBe('Rough Skin'));
    it('parses level', () => expect(result.level).toBe(50));
    it('parses shiny flag', () => expect(result.shiny).toBe(true));
    it('parses tera type (lowercased)', () => expect(result.teraType).toBe('dragon'));
    it('parses nature (lowercased)', () => expect(result.nature).toBe('jolly'));
    it('parses four moves', () => {
      expect(result.moveNames).toEqual(['Earthquake', 'Dragon Claw', 'Poison Jab', 'Stone Edge']);
    });

    it('parses EVs correctly', () => {
      expect(result.evs).toMatchObject({ attack: 252, defense: 4, speed: 252 });
      expect(result.evs.hp).toBe(0);
      expect(result.evs.specialAttack).toBe(0);
      expect(result.evs.specialDefense).toBe(0);
    });

    it('defaults unlisted IVs to 31', () => {
      expect(result.ivs).toMatchObject({
        hp: 31, attack: 31, defense: 31,
        specialAttack: 31, specialDefense: 31, speed: 31,
      });
    });

    it('sets no nickname', () => expect(result.nickname).toBeNull());
    it('sets no gender', () => expect(result.gender).toBeNull());
  });

  describe('nickname and gender parsing', () => {
    it('extracts species from "Nickname (Species)" pattern', () => {
      const result = parsePokePasteBlock('Chompy (Garchomp)\n- Earthquake')!;
      expect(result.speciesName).toBe('Garchomp');
      expect(result.nickname).toBe('Chompy');
    });

    it('parses male gender', () => {
      const result = parsePokePasteBlock('Garchomp (M)\n- Earthquake')!;
      expect(result.gender).toBe('male');
      expect(result.speciesName).toBe('Garchomp');
    });

    it('parses female gender', () => {
      const result = parsePokePasteBlock('Garchomp (F)\n- Earthquake')!;
      expect(result.gender).toBe('female');
    });
  });

  describe('missing optional fields', () => {
    it('defaults level to 100 when not specified', () => {
      const result = parsePokePasteBlock('Pikachu\n- Thunderbolt')!;
      expect(result.level).toBe(100);
    });

    it('defaults shiny to false', () => {
      const result = parsePokePasteBlock('Pikachu\n- Thunderbolt')!;
      expect(result.shiny).toBe(false);
    });

    it('sets itemName to null when no @ clause', () => {
      const result = parsePokePasteBlock('Pikachu\n- Thunderbolt')!;
      expect(result.itemName).toBeNull();
    });
  });

  describe('IV parsing', () => {
    it('overrides specific IVs while keeping others at 31', () => {
      const result = parsePokePasteBlock('Pikachu\nIVs: 0 Atk\n- Thunderbolt')!;
      expect(result.ivs.attack).toBe(0);
      expect(result.ivs.speed).toBe(31);
    });
  });
});

describe('parsePokePaste', () => {
  it('parses a multi-member paste', () => {
    const paste = [GARCHOMP_BLOCK, 'Pikachu\n- Thunderbolt'].join('\n\n');
    const result = parsePokePaste(paste);
    expect(result).toHaveLength(2);
    expect(result[0].speciesName).toBe('Garchomp');
    expect(result[1].speciesName).toBe('Pikachu');
  });

  it('returns an empty array for blank input', () => {
    expect(parsePokePaste('')).toEqual([]);
  });

  it('skips blocks that produce no species', () => {
    const result = parsePokePaste('\n\n');
    expect(result).toEqual([]);
  });
});

describe('normalizeForLookup', () => {
  it('lowercases and strips hyphens and spaces', () => {
    expect(normalizeForLookup('Mr. Mime')).toBe('mr.mime');
    expect(normalizeForLookup('Tapu-Koko')).toBe('tapukoko');
    expect(normalizeForLookup('Flutter Mane')).toBe('fluttermane');
  });
});
