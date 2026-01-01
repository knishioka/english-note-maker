/**
 * ContentLoader ユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContentLoader } from '../../src/data/loaders/ContentLoader.js';

// fetch のモック
const mockFetch = vi.fn();

describe('ContentLoader', () => {
  let loader: ContentLoader;

  beforeEach(() => {
    loader = new ContentLoader({
      baseUrl: './test-data',
      timeout: 5000,
      retries: 2,
      retryDelay: 100,
    });

    // グローバル fetch をモック
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    mockFetch.mockReset();
  });

  describe('loadManifest', () => {
    it('should load manifest file', async () => {
      const mockManifest = {
        type: 'word',
        version: '1.0.0',
        files: [{ name: 'animals', path: './animals.json', itemCount: 15 }],
        totalItems: 15,
        loadStrategy: 'lazy',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });

      const manifest = await loader.loadManifest('word');

      expect(manifest).toEqual(mockManifest);
      expect(mockFetch).toHaveBeenCalledWith(
        './test-data/words/_manifest.json',
        expect.any(Object)
      );
    });

    it('should cache manifest', async () => {
      const mockManifest = {
        type: 'word',
        version: '1.0.0',
        files: [],
        totalItems: 0,
        loadStrategy: 'lazy',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockManifest),
      });

      // 2回呼び出し
      await loader.loadManifest('word');
      await loader.loadManifest('word');

      // fetchは1回だけ
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw on fetch failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(loader.loadManifest('word')).rejects.toThrow('Failed to load manifest for word');
    });
  });

  describe('loadCollection', () => {
    it('should load collection file', async () => {
      const mockCollection = {
        metadata: {
          type: 'word',
          category: 'animals',
          version: '1.0.0',
          totalCount: 2,
        },
        items: [
          {
            id: 'word-animals-cat-4-6',
            type: 'word',
            english: 'cat',
            japanese: 'ねこ',
          },
          {
            id: 'word-animals-dog-4-6',
            type: 'word',
            english: 'dog',
            japanese: 'いぬ',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCollection),
      });

      const items = await loader.loadCollection('word', 'animals');

      expect(items).toHaveLength(2);
      expect(items[0].english).toBe('cat');
      expect(items[1].english).toBe('dog');
    });

    it('should cache collection', async () => {
      const mockCollection = {
        metadata: { type: 'word', category: 'animals' },
        items: [{ id: 'word-1', english: 'cat' }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCollection),
      });

      // 2回呼び出し
      await loader.loadCollection('word', 'animals');
      await loader.loadCollection('word', 'animals');

      // fetchは1回だけ
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent loads', async () => {
      const mockCollection = {
        metadata: { type: 'word', category: 'animals' },
        items: [{ id: 'word-1', english: 'cat' }],
      };

      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockCollection),
                }),
              50
            )
          )
      );

      // 同時に複数回呼び出し
      const [result1, result2, result3] = await Promise.all([
        loader.loadCollection('word', 'animals'),
        loader.loadCollection('word', 'animals'),
        loader.loadCollection('word', 'animals'),
      ]);

      // 全て同じ結果
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);

      // fetchは1回だけ
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('isLoaded', () => {
    it('should return false for unloaded collection', () => {
      expect(loader.isLoaded('word', 'animals')).toBe(false);
    });

    it('should return true for loaded collection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            metadata: { type: 'word', category: 'animals' },
            items: [],
          }),
      });

      await loader.loadCollection('word', 'animals');
      expect(loader.isLoaded('word', 'animals')).toBe(true);
    });
  });

  describe('getLoaded', () => {
    it('should return undefined for unloaded collection', () => {
      expect(loader.getLoaded('word', 'animals')).toBeUndefined();
    });

    it('should return items for loaded collection', async () => {
      const mockItems = [{ id: 'word-1', english: 'cat' }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            metadata: { type: 'word', category: 'animals' },
            items: mockItems,
          }),
      });

      await loader.loadCollection('word', 'animals');
      const loaded = loader.getLoaded('word', 'animals');

      expect(loaded).toEqual(mockItems);
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            metadata: { type: 'word', category: 'animals' },
            items: [],
          }),
      });

      await loader.loadCollection('word', 'animals');
      expect(loader.isLoaded('word', 'animals')).toBe(true);

      loader.clearCache();
      expect(loader.isLoaded('word', 'animals')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            type: 'word',
            files: [],
            metadata: { type: 'word' },
            items: [],
          }),
      });

      await loader.loadManifest('word');
      await loader.loadCollection('word', 'animals');

      const stats = loader.getStats();

      expect(stats.loadedManifests).toBe(1);
      expect(stats.loadedCollections).toBe(1);
      expect(stats.pendingLoads).toBe(0);
    });
  });

  describe('retry logic', () => {
    it('should retry on failure', async () => {
      // 最初の2回は失敗、3回目で成功
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              type: 'word',
              files: [],
              totalItems: 0,
            }),
        });

      const manifest = await loader.loadManifest('word');

      expect(manifest).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should throw after all retries fail', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(loader.loadManifest('word')).rejects.toThrow();

      // 初回 + 2回リトライ = 3回
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
