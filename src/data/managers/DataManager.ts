/**
 * DataManager - 統一データ管理クラス
 * すべてのコンテンツデータへのCRUDアクセスを提供
 */

import type {
  ContentItem,
  ContentType,
  AgeGroup,
  DifficultyLevel,
  QueryOptions,
  DataManagerStats,
  WordContentItem,
  PhraseContentItem,
  SentenceContentItem,
  AlphabetContentItem,
  BaseContentItem,
} from '../types/content.js';

import {
  ALL_AGE_GROUPS,
  ALL_CONTENT_TYPES,
  ALL_DIFFICULTY_LEVELS,
  CATEGORY_DISPLAY_NAMES,
} from '../types/content.js';

import { ContentLoader } from '../loaders/ContentLoader.js';

/**
 * キャッシュエントリ
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
}

/**
 * DataManager設定
 */
export interface DataManagerConfig {
  /** キャッシュ有効化 */
  enableCache: boolean;

  /** キャッシュ最大サイズ */
  cacheSize: number;

  /** キャッシュTTL（ミリ秒） */
  cacheTTL: number;

  /** プリロードするタイプ */
  preloadTypes: ContentType[];

  /** ベースURL（データファイルのパス） */
  baseUrl: string;
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: DataManagerConfig = {
  enableCache: true,
  cacheSize: 1000,
  cacheTTL: 5 * 60 * 1000, // 5分
  preloadTypes: [],
  baseUrl: './src/data/collections',
};

/**
 * DataManager - シングルトンパターン
 */
export class DataManager {
  private static instance: DataManager | null = null;

  private config: DataManagerConfig;
  private items: Map<string, ContentItem> = new Map();
  private queryCache: Map<string, CacheEntry<ContentItem[]>> = new Map();
  private initialized = false;
  private loadedTypes: Set<ContentType> = new Set();
  private loadedCategories: Set<string> = new Set();
  private loader: ContentLoader;

  // 統計情報
  private cacheHits = 0;
  private cacheMisses = 0;
  private lastLoadTime = 0;

  private constructor(config: Partial<DataManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loader = new ContentLoader({ baseUrl: this.config.baseUrl });
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(config?: Partial<DataManagerConfig>): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager(config);
    }
    return DataManager.instance;
  }

  /**
   * インスタンスをリセット（テスト用）
   */
  public static resetInstance(): void {
    DataManager.instance = null;
  }

  /**
   * 初期化
   */
  public async initialize(options?: {
    preloadTypes?: ContentType[];
    data?: ContentItem[];
  }): Promise<void> {
    if (this.initialized) {
      return;
    }

    const startTime = performance.now();

    // 直接データを渡された場合はそれを使用
    if (options?.data) {
      for (const item of options.data) {
        this.items.set(item.id, item);
        this.loadedTypes.add(item.type);
        this.loadedCategories.add(`${item.type}:${item.category}`);
      }
    }

    // プリロード指定があればロード
    const typesToPreload = options?.preloadTypes || this.config.preloadTypes;
    if (typesToPreload.length > 0) {
      await this.preload(typesToPreload);
    }

    this.lastLoadTime = performance.now() - startTime;
    this.initialized = true;
  }

  /**
   * 初期化済みかどうか
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 指定タイプがロード済みかどうか
   */
  public isLoaded(type: ContentType): boolean {
    return this.loadedTypes.has(type);
  }

  // ===== クエリメソッド =====

  /**
   * クエリオプションに基づいてアイテムを取得
   */
  public async query<T extends ContentItem = ContentItem>(
    options: QueryOptions = {}
  ): Promise<T[]> {
    // シャッフルが有効な場合はキャッシュをスキップ（毎回新しい順序）
    const skipCache = options.shuffle === true;

    // キャッシュチェック
    const cacheKey = this.generateCacheKey(options);
    if (this.config.enableCache && !skipCache) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
        this.cacheHits++;
        cached.accessCount++;
        return cached.data as T[];
      }
    }

    if (!skipCache) {
      this.cacheMisses++;
    }

    // フィルタリング
    let results = Array.from(this.items.values());

    if (options.type) {
      results = results.filter((item) => item.type === options.type);
    }

    if (options.category) {
      results = results.filter((item) => item.category === options.category);
    }

    if (options.ageGroup) {
      results = results.filter((item) => item.ageGroup === options.ageGroup);
    }

    if (options.difficulty) {
      results = results.filter((item) => item.difficulty === options.difficulty);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter(
        (item) => item.tags && options.tags!.every((tag) => item.tags!.includes(tag))
      );
    }

    if (options.searchTerm) {
      const term = options.searchTerm.toLowerCase();
      results = results.filter(
        (item) => item.english.toLowerCase().includes(term) || item.japanese.includes(term)
      );
    }

    // シャッフル
    if (options.shuffle) {
      results = this.shuffleArray(results);
    }

    // ページネーション
    if (options.offset) {
      results = results.slice(options.offset);
    }

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    // キャッシュに保存（シャッフル時はスキップ）
    if (this.config.enableCache && !skipCache) {
      this.queryCache.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
        accessCount: 1,
      });

      // キャッシュサイズ管理
      this.evictCacheIfNeeded();
    }

    return results as T[];
  }

  /**
   * IDでアイテムを取得
   */
  public async getById<T extends ContentItem = ContentItem>(id: string): Promise<T | null> {
    return (this.items.get(id) as T) || null;
  }

  /**
   * ランダムにアイテムを取得
   */
  public async getRandom<T extends ContentItem = ContentItem>(
    options: QueryOptions & { count: number }
  ): Promise<T[]> {
    const { count, ...queryOptions } = options;
    const allResults = await this.query<T>({ ...queryOptions, shuffle: true });
    return allResults.slice(0, count);
  }

  /**
   * テキスト検索
   */
  public async search<T extends ContentItem = ContentItem>(
    searchTerm: string,
    options?: Omit<QueryOptions, 'searchTerm'>
  ): Promise<T[]> {
    return this.query<T>({ ...options, searchTerm });
  }

  // ===== 型別コンビニエンスメソッド =====

  /**
   * 単語を取得
   */
  public async getWords(options?: Omit<QueryOptions, 'type'>): Promise<WordContentItem[]> {
    return this.query<WordContentItem>({ ...options, type: 'word' });
  }

  /**
   * フレーズを取得
   */
  public async getPhrases(options?: Omit<QueryOptions, 'type'>): Promise<PhraseContentItem[]> {
    return this.query<PhraseContentItem>({ ...options, type: 'phrase' });
  }

  /**
   * 例文を取得
   */
  public async getSentences(options?: Omit<QueryOptions, 'type'>): Promise<SentenceContentItem[]> {
    return this.query<SentenceContentItem>({ ...options, type: 'sentence' });
  }

  /**
   * アルファベットを取得
   */
  public async getAlphabet(options?: Omit<QueryOptions, 'type'>): Promise<AlphabetContentItem[]> {
    return this.query<AlphabetContentItem>({ ...options, type: 'alphabet' });
  }

  // ===== カテゴリー/メタデータ =====

  /**
   * 指定タイプの利用可能なカテゴリーを取得
   */
  public getCategories(type: ContentType): string[] {
    const categories = new Set<string>();
    for (const item of this.items.values()) {
      if (item.type === type) {
        categories.add(item.category);
      }
    }
    return Array.from(categories).sort();
  }

  /**
   * カテゴリー表示名を取得
   */
  public getCategoryDisplayName(category: string): string {
    return CATEGORY_DISPLAY_NAMES[category] || category;
  }

  /**
   * 全カテゴリー表示名を取得
   */
  public getCategoryDisplayNames(type?: ContentType): Record<string, string> {
    const categories = type ? this.getCategories(type) : Object.keys(CATEGORY_DISPLAY_NAMES);
    const result: Record<string, string> = {};
    for (const category of categories) {
      result[category] = this.getCategoryDisplayName(category);
    }
    return result;
  }

  // ===== 統計 =====

  /**
   * 統計情報を取得
   */
  public async getStats(): Promise<DataManagerStats> {
    const byType: Record<ContentType, number> = {
      word: 0,
      phrase: 0,
      sentence: 0,
      alphabet: 0,
    };

    const byCategory: Record<string, number> = {};
    const byAgeGroup: Record<AgeGroup, number> = {
      '4-6': 0,
      '7-9': 0,
      '10-12': 0,
    };
    const byDifficulty: Record<DifficultyLevel, number> = {
      1: 0,
      2: 0,
      3: 0,
    };

    for (const item of this.items.values()) {
      byType[item.type]++;
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      byAgeGroup[item.ageGroup]++;
      byDifficulty[item.difficulty]++;
    }

    return {
      totalItems: this.items.size,
      byType,
      byCategory,
      byAgeGroup,
      byDifficulty,
      cacheHitRate: this.getCacheHitRate(),
      lastLoadTime: this.lastLoadTime,
      loadedCategories: this.loadedCategories.size,
      totalCategories: Object.keys(byCategory).length,
    };
  }

  /**
   * コンテンツレポートを生成
   */
  public async generateReport(): Promise<string> {
    const stats = await this.getStats();

    let report = '# コンテンツ統計レポート\n\n';
    report += `生成日時: ${new Date().toISOString()}\n\n`;

    report += '## 概要\n\n';
    report += `- 総アイテム数: ${stats.totalItems}\n`;
    report += `- ロード済みカテゴリー: ${stats.loadedCategories}/${stats.totalCategories}\n`;
    report += `- キャッシュヒット率: ${(stats.cacheHitRate * 100).toFixed(1)}%\n`;
    report += `- 最終ロード時間: ${stats.lastLoadTime.toFixed(2)}ms\n\n`;

    report += '## タイプ別\n\n';
    for (const type of ALL_CONTENT_TYPES) {
      report += `- ${type}: ${stats.byType[type]}\n`;
    }
    report += '\n';

    report += '## 年齢グループ別\n\n';
    for (const age of ALL_AGE_GROUPS) {
      report += `- ${age}歳: ${stats.byAgeGroup[age]}\n`;
    }
    report += '\n';

    report += '## 難易度別\n\n';
    for (const level of ALL_DIFFICULTY_LEVELS) {
      report += `- レベル${level}: ${stats.byDifficulty[level]}\n`;
    }
    report += '\n';

    report += '## カテゴリー別\n\n';
    for (const [category, count] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
      const displayName = this.getCategoryDisplayName(category);
      report += `- ${displayName} (${category}): ${count}\n`;
    }

    return report;
  }

  // ===== データ操作 =====

  /**
   * アイテムを追加
   */
  public addItem(item: ContentItem): void {
    this.items.set(item.id, item);
    this.loadedTypes.add(item.type);
    this.loadedCategories.add(`${item.type}:${item.category}`);
    this.clearQueryCache();
  }

  /**
   * 複数アイテムを追加
   */
  public addItems(items: ContentItem[]): void {
    for (const item of items) {
      this.addItem(item);
    }
  }

  /**
   * アイテムを削除
   */
  public removeItem(id: string): boolean {
    const result = this.items.delete(id);
    if (result) {
      this.clearQueryCache();
    }
    return result;
  }

  /**
   * すべてのデータをクリア
   */
  public clear(): void {
    this.items.clear();
    this.queryCache.clear();
    this.loadedTypes.clear();
    this.loadedCategories.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.initialized = false;
  }

  // ===== キャッシュ管理 =====

  /**
   * クエリキャッシュをクリア
   */
  public clearQueryCache(): void {
    this.queryCache.clear();
  }

  /**
   * キャッシュヒット率を取得
   */
  public getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total === 0 ? 0 : this.cacheHits / total;
  }

  // ===== プリロード =====

  /**
   * 指定タイプをプリロード
   */
  public async preload(types: ContentType[]): Promise<void> {
    const startTime = performance.now();

    for (const type of types) {
      if (this.loadedTypes.has(type)) {
        continue;
      }

      try {
        const items = await this.loader.loadAllCollections(type);
        for (const item of items) {
          this.items.set(item.id, item);
          this.loadedCategories.add(`${item.type}:${item.category}`);
        }
        this.loadedTypes.add(type);
      } catch (error) {
        console.warn(`Failed to preload ${type}:`, error);
      }
    }

    this.lastLoadTime = performance.now() - startTime;
  }

  /**
   * JSONファイルからすべてのデータをロード
   */
  public async loadFromFiles(): Promise<void> {
    await this.preload(['word', 'phrase', 'sentence', 'alphabet']);
    this.initialized = true;
  }

  /**
   * 特定タイプとカテゴリーのデータをロード（遅延ローディング）
   */
  public async loadCategory(type: ContentType, category: string): Promise<void> {
    const cacheKey = `${type}:${category}`;
    if (this.loadedCategories.has(cacheKey)) {
      return;
    }

    const items = await this.loader.loadCollection(type, category);
    for (const item of items) {
      this.items.set(item.id, item);
    }
    this.loadedCategories.add(cacheKey);
    this.loadedTypes.add(type);
  }

  // ===== プライベートメソッド =====

  /**
   * クエリオプションからキャッシュキーを生成
   */
  private generateCacheKey(options: QueryOptions): string {
    return JSON.stringify(options);
  }

  /**
   * 配列をシャッフル（Fisher-Yates）
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * キャッシュサイズを超えた場合にLRU削除
   */
  private evictCacheIfNeeded(): void {
    if (this.queryCache.size <= this.config.cacheSize) {
      return;
    }

    // 最もアクセス回数が少ないエントリを削除
    let minKey: string | null = null;
    let minAccessCount = Infinity;

    for (const [key, entry] of this.queryCache) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        minKey = key;
      }
    }

    if (minKey) {
      this.queryCache.delete(minKey);
    }
  }

  // ===== デバッグ/開発者ツール =====

  /**
   * コンソールに統計を表示
   */
  public async displayStats(): Promise<void> {
    const stats = await this.getStats();
    console.group('DataManager Statistics');
    console.log('Total Items:', stats.totalItems);
    console.table(stats.byType);
    console.table(stats.byAgeGroup);
    console.log('Cache Hit Rate:', `${(stats.cacheHitRate * 100).toFixed(1)}%`);
    console.groupEnd();
  }

  /**
   * すべてのアイテムを取得（デバッグ用）
   */
  public getAllItems(): ContentItem[] {
    return Array.from(this.items.values());
  }

  /**
   * アイテム数を取得
   */
  public get size(): number {
    return this.items.size;
  }
}

/**
 * グローバルDataManagerインスタンスを取得
 */
export function getDataManager(config?: Partial<DataManagerConfig>): DataManager {
  return DataManager.getInstance(config);
}
