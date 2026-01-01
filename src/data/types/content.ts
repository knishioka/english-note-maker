/**
 * 統一コンテンツ型定義
 * すべての学習コンテンツアイテムの基底インターフェースと型別拡張
 */

// ============= 基本型 =============

/**
 * コンテンツタイプ
 */
export type ContentType = 'word' | 'phrase' | 'sentence' | 'alphabet';

/**
 * 年齢グループ
 */
export type AgeGroup = '4-6' | '7-9' | '10-12';

/**
 * 難易度レベル
 */
export type DifficultyLevel = 1 | 2 | 3;

/**
 * フレーズパターン
 */
export type PhrasePattern =
  | 'question'
  | 'request'
  | 'invitation'
  | 'introduction'
  | 'response'
  | 'exclamation'
  | 'statement';

/**
 * 使用頻度
 */
export type UsageFrequency = 'critical' | 'core' | 'common' | 'situational' | 'specialized';

/**
 * アルファベットケース
 */
export type LetterCase = 'uppercase' | 'lowercase';

// ============= 基底インターフェース =============

/**
 * すべてのコンテンツアイテムの基底インターフェース
 */
export interface BaseContentItem {
  /** 一意識別子（例: word-animals-cat-4-6） */
  id: string;

  /** コンテンツタイプ */
  type: ContentType;

  /** 英語テキスト */
  english: string;

  /** 日本語テキスト */
  japanese: string;

  /** カテゴリー */
  category: string;

  /** 年齢グループ */
  ageGroup: AgeGroup;

  /** 難易度レベル（1-3） */
  difficulty: DifficultyLevel;

  /** タグ（オプション） */
  tags?: string[];

  /** 作成日時（ISO 8601） */
  createdAt?: string;

  /** 更新日時（ISO 8601） */
  updatedAt?: string;

  /** バージョン番号 */
  version?: number;
}

// ============= 型別拡張 =============

/**
 * 単語アイテム
 */
export interface WordContentItem extends BaseContentItem {
  type: 'word';

  /** 音節分割（例: "el-e-phant"） */
  syllables: string;

  /** 発音記号（IPA、オプション） */
  pronunciation?: string;

  /** 品詞（オプション） */
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
}

/**
 * フレーズアイテム
 */
export interface PhraseContentItem extends BaseContentItem {
  type: 'phrase';

  /** 使用シチュエーション */
  situation: string;

  /** フレーズパターン（自動推論または指定） */
  pattern?: PhrasePattern;

  /** 使用頻度（自動推論または指定） */
  usageFrequency?: UsageFrequency;

  /** 重要単語リスト（自動抽出または指定） */
  focusWords?: string[];
}

/**
 * 例文アイテム
 */
export interface SentenceContentItem extends BaseContentItem {
  type: 'sentence';

  /** カスタム例文フラグ */
  custom?: boolean;
}

/**
 * アルファベットアイテム
 */
export interface AlphabetContentItem extends BaseContentItem {
  type: 'alphabet';

  /** 文字（A, a, B, b, ...） */
  letter: string;

  /** 例単語（Apple, apple, Ball, ball, ...） */
  example: string;

  /** 大文字/小文字 */
  letterCase: LetterCase;
}

/**
 * 任意のコンテンツアイテム（Union型）
 */
export type ContentItem =
  | WordContentItem
  | PhraseContentItem
  | SentenceContentItem
  | AlphabetContentItem;

// ============= コレクション型 =============

/**
 * コレクションメタデータ
 */
export interface CollectionMetadata {
  /** コンテンツタイプ */
  type: ContentType;

  /** カテゴリー名 */
  category: string;

  /** バージョン（セマンティックバージョニング） */
  version: string;

  /** 最終更新日時（ISO 8601） */
  lastUpdated: string;

  /** アイテム総数 */
  totalCount: number;

  /** スキーマバージョン */
  schemaVersion: string;
}

/**
 * データコレクション
 */
export interface DataCollection<T extends BaseContentItem> {
  /** メタデータ */
  metadata: CollectionMetadata;

  /** アイテム配列 */
  items: T[];
}

// ============= マニフェスト型 =============

/**
 * マニフェストファイルエントリ
 */
export interface ManifestEntry {
  /** ファイル名（拡張子なし） */
  name: string;

  /** 相対パス */
  path: string;

  /** アイテム数 */
  itemCount: number;

  /** 含まれる年齢グループ */
  ageGroups: AgeGroup[];

  /** チェックサム（オプション） */
  checksum?: string;
}

/**
 * マニフェストファイル
 */
export interface ManifestFile {
  /** コンテンツタイプ */
  type: ContentType;

  /** バージョン */
  version: string;

  /** 最終更新日時 */
  lastUpdated: string;

  /** ファイルエントリ */
  files: ManifestEntry[];

  /** 総アイテム数 */
  totalItems: number;

  /** ロード戦略 */
  loadStrategy: 'eager' | 'lazy' | 'on-demand';
}

// ============= クエリ型 =============

/**
 * クエリオプション
 */
export interface QueryOptions {
  /** コンテンツタイプでフィルタ */
  type?: ContentType;

  /** カテゴリーでフィルタ */
  category?: string;

  /** 年齢グループでフィルタ */
  ageGroup?: AgeGroup;

  /** 難易度でフィルタ */
  difficulty?: DifficultyLevel;

  /** タグでフィルタ（AND条件） */
  tags?: string[];

  /** 結果数制限 */
  limit?: number;

  /** オフセット（ページネーション） */
  offset?: number;

  /** シャッフル */
  shuffle?: boolean;

  /** テキスト検索（english/japaneseフィールド） */
  searchTerm?: string;
}

// ============= 統計型 =============

/**
 * DataManager統計情報
 */
export interface DataManagerStats {
  /** 総アイテム数 */
  totalItems: number;

  /** タイプ別カウント */
  byType: Record<ContentType, number>;

  /** カテゴリー別カウント */
  byCategory: Record<string, number>;

  /** 年齢グループ別カウント */
  byAgeGroup: Record<AgeGroup, number>;

  /** 難易度別カウント */
  byDifficulty: Record<DifficultyLevel, number>;

  /** キャッシュヒット率 */
  cacheHitRate: number;

  /** 最終ロード時間（ms） */
  lastLoadTime: number;

  /** ロード済みカテゴリー数 */
  loadedCategories: number;

  /** 総カテゴリー数 */
  totalCategories: number;
}

// ============= 型ガード =============

/**
 * WordContentItem型ガード
 */
export function isWordContentItem(item: ContentItem): item is WordContentItem {
  return item.type === 'word';
}

/**
 * PhraseContentItem型ガード
 */
export function isPhraseContentItem(item: ContentItem): item is PhraseContentItem {
  return item.type === 'phrase';
}

/**
 * SentenceContentItem型ガード
 */
export function isSentenceContentItem(item: ContentItem): item is SentenceContentItem {
  return item.type === 'sentence';
}

/**
 * AlphabetContentItem型ガード
 */
export function isAlphabetContentItem(item: ContentItem): item is AlphabetContentItem {
  return item.type === 'alphabet';
}

/**
 * AgeGroup型ガード
 */
export function isAgeGroup(value: unknown): value is AgeGroup {
  return typeof value === 'string' && ['4-6', '7-9', '10-12'].includes(value);
}

/**
 * ContentType型ガード
 */
export function isContentType(value: unknown): value is ContentType {
  return typeof value === 'string' && ['word', 'phrase', 'sentence', 'alphabet'].includes(value);
}

/**
 * DifficultyLevel型ガード
 */
export function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return typeof value === 'number' && [1, 2, 3].includes(value);
}

// ============= ユーティリティ型 =============

/**
 * ID生成用パラメータ
 */
export interface IdGeneratorParams {
  type: ContentType;
  category: string;
  english: string;
  ageGroup: AgeGroup;
}

/**
 * 一意IDを生成
 * @example generateId({ type: 'word', category: 'animals', english: 'cat', ageGroup: '4-6' })
 *          => 'word-animals-cat-4-6'
 */
export function generateId(params: IdGeneratorParams): string {
  const normalizedEnglish = params.english
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);

  return `${params.type}-${params.category}-${normalizedEnglish}-${params.ageGroup}`;
}

// ============= 定数 =============

/**
 * 全年齢グループ
 */
export const ALL_AGE_GROUPS: readonly AgeGroup[] = ['4-6', '7-9', '10-12'] as const;

/**
 * 全コンテンツタイプ
 */
export const ALL_CONTENT_TYPES: readonly ContentType[] = [
  'word',
  'phrase',
  'sentence',
  'alphabet',
] as const;

/**
 * 全難易度レベル
 */
export const ALL_DIFFICULTY_LEVELS: readonly DifficultyLevel[] = [1, 2, 3] as const;

/**
 * 単語カテゴリー一覧
 */
export const WORD_CATEGORIES = [
  'animals',
  'food',
  'colors',
  'numbers',
  'calendar',
  'school_items',
  'body_parts',
  'weather',
] as const;

/**
 * フレーズカテゴリー一覧
 */
export const PHRASE_CATEGORIES = [
  'greetings',
  'self_introduction',
  'school',
  'shopping',
  'travel',
  'feelings',
  'daily_life',
  'classroom_english',
  'friend_making',
  'cultural_exchange',
  'emergency_situations',
  'numbers_math',
] as const;

/**
 * カテゴリー表示名（日本語）
 */
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  // 単語カテゴリー
  animals: '動物',
  food: '食べ物',
  colors: '色',
  numbers: '数字',
  calendar: 'カレンダー',
  school_items: '学校用品',
  body_parts: '体の部位',
  weather: '天気',
  // フレーズカテゴリー
  greetings: 'あいさつ',
  self_introduction: '自己紹介',
  school: '学校生活',
  shopping: '買い物',
  travel: '旅行',
  feelings: '気持ち',
  daily_life: '日常生活',
  classroom_english: '教室英語',
  friend_making: '友達作り',
  cultural_exchange: '文化交流',
  emergency_situations: '緊急事態',
  numbers_math: '数学・数字',
  // 例文カテゴリー
  daily: '日常',
  family: '家族',
  hobby: '趣味',
};

export type WordCategory = (typeof WORD_CATEGORIES)[number];
export type PhraseCategory = (typeof PHRASE_CATEGORIES)[number];
