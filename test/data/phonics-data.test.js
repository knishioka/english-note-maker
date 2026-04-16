import { describe, expect, it } from 'vitest';

import {
  PHONICS_DATA,
  PHONICS_PATTERN_OPTIONS,
  buildPhonicsWordSequence,
  getPhonicsPatternConfig,
  getPhonicsWords,
} from '../../src/data/phonics-data.js';

describe('phonics data', () => {
  it('exposes at least 8 selectable patterns', () => {
    expect(PHONICS_PATTERN_OPTIONS.length).toBeGreaterThanOrEqual(8);
  });

  it('keeps words unique within each pattern', () => {
    Object.values(PHONICS_DATA).forEach((pattern) => {
      const words = pattern.words.map((entry) => entry.english.toLowerCase());
      expect(new Set(words).size).toBe(words.length);
    });
  });

  it('returns a stable fallback pattern config', () => {
    const fallback = getPhonicsPatternConfig('missing-pattern');
    expect(fallback).toBeTruthy();
    expect(fallback.id).toBe('at');
  });

  it('returns a copy of words for the requested pattern', () => {
    const words = getPhonicsWords('at');
    expect(words.length).toBeGreaterThan(0);
    expect(words).not.toBe(PHONICS_DATA.at.words);
  });

  it('builds a page sequence without duplicates when enough words exist', () => {
    const sequence = buildPhonicsWordSequence('at', 4, 1);
    const wordSet = new Set(sequence.map((entry) => entry.english));

    expect(sequence).toHaveLength(4);
    expect(wordSet.size).toBe(4);
  });

  it('reuses words only after exhausting the pattern inventory', () => {
    const inventorySize = PHONICS_DATA.sh.words.length;
    const sequence = buildPhonicsWordSequence('sh', inventorySize, 2);
    const firstCycle = sequence.slice(0, inventorySize).map((entry) => entry.english);
    const secondCycle = sequence.slice(inventorySize).map((entry) => entry.english);

    expect(new Set(firstCycle).size).toBe(inventorySize);
    expect(new Set(secondCycle).size).toBe(inventorySize);
  });
});
