import { describe, expect, it } from 'vitest';
import { buildSightWordSequence, sanitizeSightWordCount } from '../src/sight-word-sequence.js';

const WORDS = Array.from({ length: 12 }, (_, index) => ({
  word: `word-${index}`,
  japanese: `意味${index}`,
}));

describe('sight-word sequence', () => {
  it('returns the requested count without duplicates', () => {
    const result = buildSightWordSequence(WORDS, 6, 1, () => 0.5);
    expect(result).toHaveLength(6);
    expect(new Set(result.map((item) => item.word)).size).toBe(6);
  });

  it('keeps pagination deterministic for a fixed random source and exhausts the pool first', () => {
    const first = buildSightWordSequence(WORDS, 4, 3, () => 0.25);
    expect(buildSightWordSequence(WORDS, 4, 3, () => 0.25)).toEqual(first);
    expect(new Set(first.map((item) => item.word)).size).toBe(12);
  });

  it('clamps to the dataset and defaults invalid counts to six', () => {
    expect(buildSightWordSequence(WORDS.slice(0, 3), 8, 2, () => 0)).toHaveLength(3);
    expect(sanitizeSightWordCount(4)).toBe(4);
    expect(sanitizeSightWordCount(5)).toBe(6);
  });
});
