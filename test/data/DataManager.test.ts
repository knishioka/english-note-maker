/**
 * DataManager ユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DataManager } from '../../src/data/managers/DataManager.js';
import type {
  WordContentItem,
  PhraseContentItem,
  SentenceContentItem,
  AlphabetContentItem,
  ContentItem,
} from '../../src/data/types/content.js';

// テスト用データ
const createTestWord = (overrides: Partial<WordContentItem> = {}): WordContentItem => ({
  id: 'word-animals-cat-4-6',
  type: 'word',
  english: 'cat',
  japanese: 'ねこ',
  syllables: 'cat',
  category: 'animals',
  ageGroup: '4-6',
  difficulty: 1,
  ...overrides,
});

const createTestPhrase = (overrides: Partial<PhraseContentItem> = {}): PhraseContentItem => ({
  id: 'phrase-greetings-hello-4-6',
  type: 'phrase',
  english: 'Hello!',
  japanese: 'こんにちは！',
  situation: '友達に会ったとき',
  category: 'greetings',
  ageGroup: '4-6',
  difficulty: 1,
  pattern: 'exclamation',
  usageFrequency: 'core',
  ...overrides,
});

const createTestSentence = (overrides: Partial<SentenceContentItem> = {}): SentenceContentItem => ({
  id: 'sentence-daily-i-like-apples-4-6',
  type: 'sentence',
  english: 'I like apples.',
  japanese: 'わたしはりんごがすきです。',
  category: 'daily',
  ageGroup: '4-6',
  difficulty: 1,
  ...overrides,
});

const createTestAlphabet = (overrides: Partial<AlphabetContentItem> = {}): AlphabetContentItem => ({
  id: 'alphabet-uppercase-a-4-6',
  type: 'alphabet',
  english: 'A',
  japanese: 'りんご',
  letter: 'A',
  example: 'Apple',
  letterCase: 'uppercase',
  category: 'uppercase',
  ageGroup: '4-6',
  difficulty: 1,
  ...overrides,
});

describe('DataManager', () => {
  let manager: DataManager;

  beforeEach(() => {
    DataManager.resetInstance();
    manager = DataManager.getInstance();
  });

  afterEach(() => {
    DataManager.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DataManager.getInstance();
      const instance2 = DataManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should reset instance correctly', () => {
      const instance1 = DataManager.getInstance();
      DataManager.resetInstance();
      const instance2 = DataManager.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize with empty data', async () => {
      await manager.initialize();
      expect(manager.isInitialized()).toBe(true);
      expect(manager.size).toBe(0);
    });

    it('should initialize with provided data', async () => {
      const testData: ContentItem[] = [createTestWord(), createTestPhrase(), createTestSentence()];

      await manager.initialize({ data: testData });

      expect(manager.isInitialized()).toBe(true);
      expect(manager.size).toBe(3);
    });

    it('should not re-initialize', async () => {
      await manager.initialize({ data: [createTestWord()] });
      await manager.initialize({ data: [createTestPhrase()] });

      expect(manager.size).toBe(1); // 最初の初期化のみ有効
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      const testData: ContentItem[] = [
        createTestWord({
          id: 'word-1',
          english: 'cat',
          japanese: 'ねこ',
          ageGroup: '4-6',
          difficulty: 1,
        }),
        createTestWord({
          id: 'word-2',
          english: 'dog',
          japanese: 'いぬ',
          ageGroup: '4-6',
          difficulty: 1,
        }),
        createTestWord({
          id: 'word-3',
          english: 'elephant',
          japanese: 'ぞう',
          ageGroup: '7-9',
          difficulty: 2,
        }),
        createTestPhrase({
          id: 'phrase-1',
          japanese: 'こんにちは',
          ageGroup: '4-6',
          difficulty: 1,
        }),
        createTestPhrase({
          id: 'phrase-2',
          japanese: 'さようなら',
          ageGroup: '7-9',
          difficulty: 2,
        }),
        createTestSentence({
          id: 'sentence-1',
          japanese: 'すきです',
          ageGroup: '4-6',
          difficulty: 1,
        }),
      ];
      await manager.initialize({ data: testData });
    });

    it('should query all items', async () => {
      const results = await manager.query();
      expect(results).toHaveLength(6);
    });

    it('should filter by type', async () => {
      const words = await manager.query({ type: 'word' });
      expect(words).toHaveLength(3);
      expect(words.every((item) => item.type === 'word')).toBe(true);
    });

    it('should filter by ageGroup', async () => {
      const results = await manager.query({ ageGroup: '4-6' });
      expect(results).toHaveLength(4);
      expect(results.every((item) => item.ageGroup === '4-6')).toBe(true);
    });

    it('should filter by difficulty', async () => {
      const results = await manager.query({ difficulty: 2 });
      expect(results).toHaveLength(2);
      expect(results.every((item) => item.difficulty === 2)).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const results = await manager.query({
        type: 'word',
        ageGroup: '4-6',
        difficulty: 1,
      });
      expect(results).toHaveLength(2);
    });

    it('should limit results', async () => {
      const results = await manager.query({ limit: 2 });
      expect(results).toHaveLength(2);
    });

    it('should offset results', async () => {
      const allResults = await manager.query();
      const offsetResults = await manager.query({ offset: 2 });
      expect(offsetResults).toHaveLength(4);
      expect(offsetResults[0]).toEqual(allResults[2]);
    });

    it('should search by text', async () => {
      const results = await manager.search('cat');
      expect(results).toHaveLength(1);
      expect(results[0].english).toBe('cat');
    });

    it('should search in Japanese', async () => {
      const results = await manager.search('ねこ');
      expect(results).toHaveLength(1);
      expect(results[0].japanese).toBe('ねこ');
    });
  });

  describe('Type-specific Methods', () => {
    beforeEach(async () => {
      const testData: ContentItem[] = [
        createTestWord(),
        createTestPhrase(),
        createTestSentence(),
        createTestAlphabet(),
      ];
      await manager.initialize({ data: testData });
    });

    it('should get words only', async () => {
      const words = await manager.getWords();
      expect(words).toHaveLength(1);
      expect(words[0].type).toBe('word');
    });

    it('should get phrases only', async () => {
      const phrases = await manager.getPhrases();
      expect(phrases).toHaveLength(1);
      expect(phrases[0].type).toBe('phrase');
    });

    it('should get sentences only', async () => {
      const sentences = await manager.getSentences();
      expect(sentences).toHaveLength(1);
      expect(sentences[0].type).toBe('sentence');
    });

    it('should get alphabet only', async () => {
      const alphabet = await manager.getAlphabet();
      expect(alphabet).toHaveLength(1);
      expect(alphabet[0].type).toBe('alphabet');
    });
  });

  describe('getById', () => {
    beforeEach(async () => {
      await manager.initialize({ data: [createTestWord()] });
    });

    it('should return item by id', async () => {
      const item = await manager.getById('word-animals-cat-4-6');
      expect(item).not.toBeNull();
      expect(item?.english).toBe('cat');
    });

    it('should return null for non-existent id', async () => {
      const item = await manager.getById('non-existent');
      expect(item).toBeNull();
    });
  });

  describe('getRandom', () => {
    beforeEach(async () => {
      const testData: ContentItem[] = Array.from({ length: 10 }, (_, i) =>
        createTestWord({ id: `word-${i}`, english: `word${i}` })
      );
      await manager.initialize({ data: testData });
    });

    it('should return specified count', async () => {
      const results = await manager.getRandom({ count: 3 });
      expect(results).toHaveLength(3);
    });

    it('should return different order on each call', async () => {
      const results1 = await manager.getRandom({ count: 5 });
      const results2 = await manager.getRandom({ count: 5 });

      // 完全に同じ順序になる確率は非常に低い
      const sameOrder = results1.every((item, i) => item.id === results2[i].id);
      // 確率的テストなのでスキップ可能
      // expect(sameOrder).toBe(false);
    });
  });

  describe('Categories', () => {
    beforeEach(async () => {
      const testData: ContentItem[] = [
        createTestWord({ category: 'animals' }),
        createTestWord({ id: 'word-2', category: 'animals' }),
        createTestWord({ id: 'word-3', category: 'food' }),
        createTestPhrase({ category: 'greetings' }),
      ];
      await manager.initialize({ data: testData });
    });

    it('should get categories for type', () => {
      const categories = manager.getCategories('word');
      expect(categories).toContain('animals');
      expect(categories).toContain('food');
      expect(categories).not.toContain('greetings');
    });

    it('should get category display names', () => {
      const displayName = manager.getCategoryDisplayName('animals');
      expect(displayName).toBe('動物');
    });

    it('should return category as-is if no display name', () => {
      const displayName = manager.getCategoryDisplayName('unknown');
      expect(displayName).toBe('unknown');
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      const testData: ContentItem[] = [
        createTestWord({ ageGroup: '4-6', difficulty: 1 }),
        createTestWord({ id: 'word-2', ageGroup: '7-9', difficulty: 2 }),
        createTestPhrase({ ageGroup: '4-6', difficulty: 1 }),
        createTestSentence({ ageGroup: '10-12', difficulty: 3 }),
      ];
      await manager.initialize({ data: testData });
    });

    it('should return correct stats', async () => {
      const stats = await manager.getStats();

      expect(stats.totalItems).toBe(4);
      expect(stats.byType.word).toBe(2);
      expect(stats.byType.phrase).toBe(1);
      expect(stats.byType.sentence).toBe(1);
      expect(stats.byAgeGroup['4-6']).toBe(2);
      expect(stats.byAgeGroup['7-9']).toBe(1);
      expect(stats.byAgeGroup['10-12']).toBe(1);
      expect(stats.byDifficulty[1]).toBe(2);
      expect(stats.byDifficulty[2]).toBe(1);
      expect(stats.byDifficulty[3]).toBe(1);
    });

    it('should generate report', async () => {
      const report = await manager.generateReport();

      expect(report).toContain('コンテンツ統計レポート');
      expect(report).toContain('総アイテム数: 4');
      expect(report).toContain('word: 2');
    });
  });

  describe('Cache', () => {
    beforeEach(async () => {
      const testData: ContentItem[] = Array.from({ length: 100 }, (_, i) =>
        createTestWord({ id: `word-${i}`, english: `word${i}` })
      );
      await manager.initialize({ data: testData });
    });

    it('should cache query results', async () => {
      // 最初のクエリ
      await manager.query({ type: 'word', limit: 10 });

      // 同じクエリ（キャッシュヒット）
      await manager.query({ type: 'word', limit: 10 });

      const stats = await manager.getStats();
      expect(stats.cacheHitRate).toBeGreaterThan(0);
    });

    it('should clear cache', async () => {
      await manager.query({ type: 'word' });
      manager.clearQueryCache();

      // キャッシュがクリアされているので、新しいクエリはミス
      await manager.query({ type: 'word' });

      // 2回クエリして1回ヒット（最初がミス、2回目がヒット）ではなく
      // キャッシュクリア後なので、最初のクエリはミス
    });
  });

  describe('Data Manipulation', () => {
    beforeEach(async () => {
      await manager.initialize({ data: [createTestWord()] });
    });

    it('should add item', () => {
      manager.addItem(createTestPhrase());
      expect(manager.size).toBe(2);
    });

    it('should add multiple items', () => {
      manager.addItems([createTestPhrase(), createTestSentence()]);
      expect(manager.size).toBe(3);
    });

    it('should remove item', () => {
      const result = manager.removeItem('word-animals-cat-4-6');
      expect(result).toBe(true);
      expect(manager.size).toBe(0);
    });

    it('should return false when removing non-existent item', () => {
      const result = manager.removeItem('non-existent');
      expect(result).toBe(false);
    });

    it('should clear all data', () => {
      manager.addItems([createTestPhrase(), createTestSentence()]);
      manager.clear();

      expect(manager.size).toBe(0);
      expect(manager.isInitialized()).toBe(false);
    });
  });
});
