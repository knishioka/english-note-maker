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

  it('fills every requested page after the pool is exhausted', () => {
    const perPage = 4;
    const pageCount = 5;
    const result = buildSightWordSequence(WORDS, perPage, pageCount, () => 0.25);

    // プール12語 < 4語 × 5ページ = 20。周回して全ページを埋める。
    expect(result).toHaveLength(perPage * pageCount);
    for (let page = 0; page < pageCount; page += 1) {
      const words = result.slice(page * perPage, (page + 1) * perPage);
      expect(words).toHaveLength(perPage);
      expect(new Set(words.map((item) => item.word)).size).toBe(perPage);
    }
  });

  it('still fills pages when the pool is smaller than one page', () => {
    const result = buildSightWordSequence(WORDS.slice(0, 3), 8, 2, () => 0);
    expect(result).toHaveLength(16);
    expect(new Set(result.map((item) => item.word)).size).toBe(3);
  });

  it('defaults invalid counts to six', () => {
    expect(sanitizeSightWordCount(4)).toBe(4);
    expect(sanitizeSightWordCount(5)).toBe(6);
  });
});
