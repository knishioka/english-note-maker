/**
 * ContentLoader - 遅延ローディングとデータ取得
 * JSONファイルからコンテンツを動的にロード
 */

import type {
  ContentItem,
  ContentType,
  DataCollection,
  ManifestFile,
  BaseContentItem,
} from '../types/content.js';

/**
 * ローダー設定
 */
export interface LoaderConfig {
  /** ベースURL */
  baseUrl: string;

  /** リクエストタイムアウト（ミリ秒） */
  timeout: number;

  /** リトライ回数 */
  retries: number;

  /** リトライ間隔（ミリ秒） */
  retryDelay: number;
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: LoaderConfig = {
  baseUrl: './src/data/collections',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
};

/**
 * ContentLoader クラス
 * JSONファイルからコンテンツを遅延ロード
 */
export class ContentLoader {
  private config: LoaderConfig;
  private manifests: Map<ContentType, ManifestFile> = new Map();
  private loadedCollections: Map<string, ContentItem[]> = new Map();
  private loadingPromises: Map<string, Promise<ContentItem[]>> = new Map();

  constructor(config: Partial<LoaderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * マニフェストファイルをロード
   */
  public async loadManifest(type: ContentType): Promise<ManifestFile> {
    // キャッシュチェック
    const cached = this.manifests.get(type);
    if (cached) {
      return cached;
    }

    const url = `${this.config.baseUrl}/${this.getTypePath(type)}/_manifest.json`;

    try {
      const response = await this.fetchWithRetry(url);
      const manifest: ManifestFile = await response.json();
      this.manifests.set(type, manifest);
      return manifest;
    } catch (error) {
      throw new Error(
        `Failed to load manifest for ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 特定カテゴリーのコレクションをロード
   */
  public async loadCollection<T extends ContentItem = ContentItem>(
    type: ContentType,
    category: string
  ): Promise<T[]> {
    const cacheKey = `${type}:${category}`;

    // キャッシュチェック
    const cached = this.loadedCollections.get(cacheKey);
    if (cached) {
      return cached as T[];
    }

    // 既にロード中の場合は待機
    const loadingPromise = this.loadingPromises.get(cacheKey);
    if (loadingPromise) {
      return loadingPromise as Promise<T[]>;
    }

    // 新規ロード
    const promise = this.fetchCollection<T>(type, category);
    this.loadingPromises.set(cacheKey, promise as Promise<ContentItem[]>);

    try {
      const items = await promise;
      this.loadedCollections.set(cacheKey, items);
      return items;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * タイプのすべてのコレクションをロード
   */
  public async loadAllCollections<T extends ContentItem = ContentItem>(
    type: ContentType
  ): Promise<T[]> {
    const manifest = await this.loadManifest(type);
    const allItems: T[] = [];

    // 並列ロード
    const promises = manifest.files.map((file) => this.loadCollection<T>(type, file.name));

    const results = await Promise.all(promises);
    for (const items of results) {
      allItems.push(...items);
    }

    return allItems;
  }

  /**
   * 指定カテゴリーがロード済みかどうか
   */
  public isLoaded(type: ContentType, category: string): boolean {
    return this.loadedCollections.has(`${type}:${category}`);
  }

  /**
   * ロード済みのコレクションを取得
   */
  public getLoaded<T extends ContentItem = ContentItem>(
    type: ContentType,
    category: string
  ): T[] | undefined {
    return this.loadedCollections.get(`${type}:${category}`) as T[] | undefined;
  }

  /**
   * キャッシュをクリア
   */
  public clearCache(): void {
    this.loadedCollections.clear();
    this.manifests.clear();
  }

  /**
   * 特定タイプのキャッシュをクリア
   */
  public clearTypeCache(type: ContentType): void {
    for (const key of this.loadedCollections.keys()) {
      if (key.startsWith(`${type}:`)) {
        this.loadedCollections.delete(key);
      }
    }
    this.manifests.delete(type);
  }

  /**
   * ロード済みカテゴリー一覧を取得
   */
  public getLoadedCategories(): Map<ContentType, string[]> {
    const result = new Map<ContentType, string[]>();

    for (const key of this.loadedCollections.keys()) {
      const [type, category] = key.split(':') as [ContentType, string];
      const categories = result.get(type) || [];
      categories.push(category);
      result.set(type, categories);
    }

    return result;
  }

  /**
   * ローダー統計を取得
   */
  public getStats(): {
    loadedCollections: number;
    loadedManifests: number;
    pendingLoads: number;
  } {
    return {
      loadedCollections: this.loadedCollections.size,
      loadedManifests: this.manifests.size,
      pendingLoads: this.loadingPromises.size,
    };
  }

  // ===== プライベートメソッド =====

  /**
   * コレクションを取得
   */
  private async fetchCollection<T extends ContentItem>(
    type: ContentType,
    category: string
  ): Promise<T[]> {
    const url = `${this.config.baseUrl}/${this.getTypePath(type)}/${category}.json`;

    try {
      const response = await this.fetchWithRetry(url);
      const collection: DataCollection<T & BaseContentItem> = await response.json();
      return collection.items as T[];
    } catch (error) {
      throw new Error(
        `Failed to load collection ${type}/${category}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * リトライ付きfetch
   */
  private async fetchWithRetry(url: string): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.retries) {
          await this.delay(this.config.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError || new Error('Failed to fetch');
  }

  /**
   * タイプからパスを取得
   */
  private getTypePath(type: ContentType): string {
    switch (type) {
      case 'word':
        return 'words';
      case 'phrase':
        return 'phrases';
      case 'sentence':
        return 'sentences';
      case 'alphabet':
        return 'alphabet';
      default:
        return type;
    }
  }

  /**
   * 遅延
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * ブラウザ環境用プリフェッチマネージャー
 */
export class PrefetchManager {
  private loader: ContentLoader;
  private prefetchedTypes: Set<ContentType> = new Set();

  constructor(loader: ContentLoader) {
    this.loader = loader;
  }

  /**
   * 練習モードに基づいてプリフェッチ
   */
  public prefetchForMode(mode: string): void {
    if (typeof requestIdleCallback === 'undefined') {
      // requestIdleCallbackがない場合はsetTimeoutで代用
      setTimeout(() => this.executePrefetch(mode), 0);
      return;
    }

    requestIdleCallback(() => this.executePrefetch(mode));
  }

  /**
   * プリフェッチを実行
   */
  private async executePrefetch(mode: string): Promise<void> {
    const typesToPrefetch = this.getTypesForMode(mode);

    for (const type of typesToPrefetch) {
      if (this.prefetchedTypes.has(type)) {
        continue;
      }

      try {
        await this.loader.loadManifest(type);
        this.prefetchedTypes.add(type);
      } catch {
        // プリフェッチ失敗は無視
      }
    }
  }

  /**
   * モードに対応するタイプを取得
   */
  private getTypesForMode(mode: string): ContentType[] {
    switch (mode) {
      case 'word':
        return ['word'];
      case 'phrase':
        return ['phrase'];
      case 'sentence':
        return ['sentence'];
      case 'alphabet':
        return ['alphabet'];
      case 'normal':
      default:
        return ['sentence', 'word'];
    }
  }

  /**
   * プリフェッチ済みタイプを取得
   */
  public getPrefetchedTypes(): ContentType[] {
    return Array.from(this.prefetchedTypes);
  }
}
