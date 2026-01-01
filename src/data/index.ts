/**
 * Data Module - 統一データ管理システム
 *
 * @example
 * ```typescript
 * import { getDataManager, ContentType, WordContentItem } from './data';
 *
 * const manager = getDataManager();
 * await manager.initialize();
 *
 * // 単語を取得
 * const words = await manager.getWords({
 *   category: 'animals',
 *   ageGroup: '4-6',
 *   limit: 10
 * });
 *
 * // 統計情報を表示
 * await manager.displayStats();
 * ```
 */

// ===== 型定義 =====
export type {
  // 基本型
  ContentType,
  AgeGroup,
  DifficultyLevel,
  PhrasePattern,
  UsageFrequency,
  LetterCase,

  // コンテンツアイテム型
  BaseContentItem,
  ContentItem,
  WordContentItem,
  PhraseContentItem,
  SentenceContentItem,
  AlphabetContentItem,

  // コレクション型
  CollectionMetadata,
  DataCollection,
  ManifestEntry,
  ManifestFile,

  // クエリ型
  QueryOptions,
  DataManagerStats,

  // ユーティリティ型
  IdGeneratorParams,
  WordCategory,
  PhraseCategory,
} from './types/content.js';

// ===== 型ガード =====
export {
  isWordContentItem,
  isPhraseContentItem,
  isSentenceContentItem,
  isAlphabetContentItem,
  isAgeGroup,
  isContentType,
  isDifficultyLevel,
} from './types/content.js';

// ===== ユーティリティ関数 =====
export { generateId } from './types/content.js';

// ===== 定数 =====
export {
  ALL_AGE_GROUPS,
  ALL_CONTENT_TYPES,
  ALL_DIFFICULTY_LEVELS,
  WORD_CATEGORIES,
  PHRASE_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
} from './types/content.js';

// ===== DataManager =====
export { DataManager, getDataManager } from './managers/DataManager.js';
export type { DataManagerConfig } from './managers/DataManager.js';

// ===== ContentLoader =====
export { ContentLoader, PrefetchManager } from './loaders/ContentLoader.js';
export type { LoaderConfig } from './loaders/ContentLoader.js';

// ===== 後方互換性 =====
export {
  createLegacyWordLists,
  createLegacyPhraseData,
  createLegacyExampleSentences,
  createLegacyAlphabetData,
  getLegacyWordListsSync,
  getLegacyPhraseDataSync,
  getLegacyExampleSentencesSync,
  getLegacyAlphabetDataSync,
} from './legacy/compatibility.js';

export type {
  LegacyWordItem,
  LegacyPhraseItem,
  LegacySentenceItem,
  LegacyAlphabetItem,
} from './legacy/compatibility.js';

// ===== グローバル公開（開発者ツール用） =====
if (typeof window !== 'undefined') {
  // ブラウザ環境でのみ公開
  import('./managers/DataManager.js').then(({ getDataManager }) => {
    (window as unknown as Record<string, unknown>).dataManager = getDataManager();
    (window as unknown as Record<string, unknown>).displayDataStats = async () => {
      const manager = getDataManager();
      await manager.displayStats();
    };
  });
}
