/**
 * 後方互換性レイヤー
 * 既存のデータ形式（WORD_LISTS, PHRASE_DATA等）との互換性を維持
 */

import { getDataManager } from '../managers/DataManager.js';
import type {
  WordContentItem,
  PhraseContentItem,
  SentenceContentItem,
  AlphabetContentItem,
  AgeGroup,
} from '../types/content.js';

// ===== 型定義（旧形式） =====

export interface LegacyWordItem {
  english: string;
  japanese: string;
  syllables: string;
}

export interface LegacyPhraseItem {
  english: string;
  japanese: string;
  situation: string;
  pattern?: string;
  usageFrequency?: string;
  focusWords?: string[];
  tags?: string[];
}

export interface LegacySentenceItem {
  english: string;
  japanese: string;
  category: string;
  difficulty: number;
  custom?: boolean;
}

export interface LegacyAlphabetItem {
  letter: string;
  example: string;
  japanese: string;
}

// ===== 変換関数 =====

/**
 * WordContentItemを旧形式に変換
 */
function toLegacyWord(item: WordContentItem): LegacyWordItem {
  return {
    english: item.english,
    japanese: item.japanese,
    syllables: item.syllables,
  };
}

/**
 * PhraseContentItemを旧形式に変換
 */
function toLegacyPhrase(item: PhraseContentItem): LegacyPhraseItem {
  return {
    english: item.english,
    japanese: item.japanese,
    situation: item.situation,
    pattern: item.pattern,
    usageFrequency: item.usageFrequency,
    focusWords: item.focusWords,
    tags: item.tags,
  };
}

/**
 * SentenceContentItemを旧形式に変換
 */
function toLegacySentence(item: SentenceContentItem): LegacySentenceItem {
  return {
    english: item.english,
    japanese: item.japanese,
    category: item.category,
    difficulty: item.difficulty,
    custom: item.custom,
  };
}

/**
 * AlphabetContentItemを旧形式に変換
 */
function toLegacyAlphabet(item: AlphabetContentItem): LegacyAlphabetItem {
  return {
    letter: item.letter,
    example: item.example,
    japanese: item.japanese,
  };
}

// ===== 旧形式データ構造 =====

type AgeGroupData<T> = {
  [K in AgeGroup]: T[];
};

type CategoryData<T> = {
  [category: string]: AgeGroupData<T>;
};

// ===== 遅延ロードプロキシ =====

/**
 * WORD_LISTSの旧形式プロキシを作成
 */
export function createLegacyWordLists(): CategoryData<LegacyWordItem> {
  const cache: CategoryData<LegacyWordItem> = {};

  return new Proxy(cache, {
    get(target, category: string) {
      if (typeof category !== 'string') return undefined;

      if (!target[category]) {
        target[category] = createAgeGroupProxy('word', category, toLegacyWord);
      }
      return target[category];
    },

    ownKeys() {
      const manager = getDataManager();
      return manager.getCategories('word');
    },

    getOwnPropertyDescriptor(_, key) {
      return {
        enumerable: true,
        configurable: true,
        value: this.get!(_, key, this),
      };
    },
  });
}

/**
 * PHRASE_DATAの旧形式プロキシを作成
 */
export function createLegacyPhraseData(): CategoryData<LegacyPhraseItem> {
  const cache: CategoryData<LegacyPhraseItem> = {};

  return new Proxy(cache, {
    get(target, category: string) {
      if (typeof category !== 'string') return undefined;

      if (!target[category]) {
        target[category] = createAgeGroupProxy('phrase', category, toLegacyPhrase);
      }
      return target[category];
    },

    ownKeys() {
      const manager = getDataManager();
      return manager.getCategories('phrase');
    },

    getOwnPropertyDescriptor(_, key) {
      return {
        enumerable: true,
        configurable: true,
        value: this.get!(_, key, this),
      };
    },
  });
}

/**
 * EXAMPLE_SENTENCES_BY_AGEの旧形式プロキシを作成
 */
export function createLegacyExampleSentences(): AgeGroupData<LegacySentenceItem> {
  const cache: Partial<AgeGroupData<LegacySentenceItem>> = {};

  return new Proxy(cache as AgeGroupData<LegacySentenceItem>, {
    get(target, ageGroup: string) {
      if (typeof ageGroup !== 'string') return undefined;
      if (!['4-6', '7-9', '10-12'].includes(ageGroup)) return undefined;

      if (!target[ageGroup as AgeGroup]) {
        // 同期的に空配列を返し、非同期でロード
        target[ageGroup as AgeGroup] = [];

        const manager = getDataManager();
        manager
          .getSentences({ ageGroup: ageGroup as AgeGroup })
          .then((sentences) => {
            target[ageGroup as AgeGroup] = sentences.map(toLegacySentence);
          })
          .catch((error) => {
            console.warn(`Failed to load sentences for ${ageGroup}:`, error);
          });
      }
      return target[ageGroup as AgeGroup];
    },

    ownKeys() {
      return ['4-6', '7-9', '10-12'];
    },

    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  });
}

/**
 * ALPHABET_DATAの旧形式プロキシを作成
 */
export function createLegacyAlphabetData(): {
  uppercase: LegacyAlphabetItem[];
  lowercase: LegacyAlphabetItem[];
} {
  const cache: {
    uppercase?: LegacyAlphabetItem[];
    lowercase?: LegacyAlphabetItem[];
  } = {};

  return new Proxy(cache as { uppercase: LegacyAlphabetItem[]; lowercase: LegacyAlphabetItem[] }, {
    get(target, letterCase: string) {
      if (letterCase !== 'uppercase' && letterCase !== 'lowercase') {
        return undefined;
      }

      if (!target[letterCase]) {
        // 同期的に空配列を返し、非同期でロード
        target[letterCase] = [];

        const manager = getDataManager();
        manager
          .getAlphabet({ category: letterCase })
          .then((alphabet) => {
            target[letterCase] = alphabet.map(toLegacyAlphabet);
          })
          .catch((error) => {
            console.warn(`Failed to load alphabet for ${letterCase}:`, error);
          });
      }
      return target[letterCase];
    },

    ownKeys() {
      return ['uppercase', 'lowercase'];
    },

    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  });
}

// ===== ヘルパー関数 =====

/**
 * 年齢グループプロキシを作成
 */
function createAgeGroupProxy<T, U>(
  type: 'word' | 'phrase',
  category: string,
  converter: (item: T) => U
): AgeGroupData<U> {
  const cache: Partial<AgeGroupData<U>> = {};

  return new Proxy(cache as AgeGroupData<U>, {
    get(target, ageGroup: string) {
      if (typeof ageGroup !== 'string') return undefined;
      if (!['4-6', '7-9', '10-12'].includes(ageGroup)) return undefined;

      if (!target[ageGroup as AgeGroup]) {
        // 同期的に空配列を返し、非同期でロード
        target[ageGroup as AgeGroup] = [];

        const manager = getDataManager();
        const queryFn =
          type === 'word' ? manager.getWords.bind(manager) : manager.getPhrases.bind(manager);

        queryFn({
          category,
          ageGroup: ageGroup as AgeGroup,
        })
          .then((items: T[]) => {
            target[ageGroup as AgeGroup] = items.map(converter);
          })
          .catch((error: Error) => {
            console.warn(`Failed to load ${type}/${category}/${ageGroup}:`, error);
          });
      }
      return target[ageGroup as AgeGroup];
    },

    ownKeys() {
      return ['4-6', '7-9', '10-12'];
    },

    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  });
}

// ===== 同期的データ取得（初期化後） =====

/**
 * 同期的に旧形式のWORD_LISTSを取得（DataManagerが初期化済みの場合）
 */
export function getLegacyWordListsSync(): CategoryData<LegacyWordItem> | null {
  const manager = getDataManager();
  if (!manager.isInitialized()) {
    return null;
  }

  const result: CategoryData<LegacyWordItem> = {};
  const words = manager.getAllItems().filter((item) => item.type === 'word') as WordContentItem[];

  for (const word of words) {
    if (!result[word.category]) {
      result[word.category] = { '4-6': [], '7-9': [], '10-12': [] };
    }
    result[word.category][word.ageGroup].push(toLegacyWord(word));
  }

  return result;
}

/**
 * 同期的に旧形式のPHRASE_DATAを取得（DataManagerが初期化済みの場合）
 */
export function getLegacyPhraseDataSync(): CategoryData<LegacyPhraseItem> | null {
  const manager = getDataManager();
  if (!manager.isInitialized()) {
    return null;
  }

  const result: CategoryData<LegacyPhraseItem> = {};
  const phrases = manager
    .getAllItems()
    .filter((item) => item.type === 'phrase') as PhraseContentItem[];

  for (const phrase of phrases) {
    if (!result[phrase.category]) {
      result[phrase.category] = { '4-6': [], '7-9': [], '10-12': [] };
    }
    result[phrase.category][phrase.ageGroup].push(toLegacyPhrase(phrase));
  }

  return result;
}

/**
 * 同期的に旧形式のEXAMPLE_SENTENCES_BY_AGEを取得（DataManagerが初期化済みの場合）
 */
export function getLegacyExampleSentencesSync(): AgeGroupData<LegacySentenceItem> | null {
  const manager = getDataManager();
  if (!manager.isInitialized()) {
    return null;
  }

  const result: AgeGroupData<LegacySentenceItem> = { '4-6': [], '7-9': [], '10-12': [] };
  const sentences = manager
    .getAllItems()
    .filter((item) => item.type === 'sentence') as SentenceContentItem[];

  for (const sentence of sentences) {
    result[sentence.ageGroup].push(toLegacySentence(sentence));
  }

  return result;
}

/**
 * 同期的に旧形式のALPHABET_DATAを取得（DataManagerが初期化済みの場合）
 */
export function getLegacyAlphabetDataSync(): {
  uppercase: LegacyAlphabetItem[];
  lowercase: LegacyAlphabetItem[];
} | null {
  const manager = getDataManager();
  if (!manager.isInitialized()) {
    return null;
  }

  const result: { uppercase: LegacyAlphabetItem[]; lowercase: LegacyAlphabetItem[] } = {
    uppercase: [],
    lowercase: [],
  };

  const alphabet = manager
    .getAllItems()
    .filter((item) => item.type === 'alphabet') as AlphabetContentItem[];

  for (const letter of alphabet) {
    result[letter.letterCase].push(toLegacyAlphabet(letter));
  }

  return result;
}
