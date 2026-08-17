// === 英語罫線ノート作成スクリプト ===

import {
  URL_STATE_ELEMENT_IDS,
  applyUrlStateToDocument,
  parseUrlState,
  serializeUrlStateToSearch,
} from './src/url-state.js';
import { buildSightWordSequence, sanitizeSightWordCount } from './src/sight-word-sequence.js';

// モジュールローダー（CommonJS互換のため動的インポートを使用）
let EXAMPLE_SENTENCES_BY_AGE = {};
let WORD_LISTS = {};
let ALPHABET_DATA = {};
let PHRASE_DATA = {};
let PHONICS_DATA = {};
let SIGHT_WORDS_DATA = [];
let SIGHT_WORD_SET_DATA = new Set();
let SIGHT_WORD_MAP_DATA = new Map();
let PHONICS_PATTERN_OPTIONS = [];
let buildPhonicsWordSequenceImpl = () => [];
let getPhonicsPatternConfigImpl = () => null;

let currentExamples = [];
let urlStateSyncEnabled = false;
let shouldReplaceUrlOnNextPreview = false;

let currentExamplesMeta = { key: '', perPageCount: 0, pageCount: 0 };
let wordSequenceCache = { key: '', perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };
let phraseSequenceCache = { key: '', perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };
let clozeSequenceCache = { key: '', perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };
let phonicsSequenceCache = { key: '', perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };
let sentenceSequenceCache = {
  key: '',
  perPage: 0,
  pageCount: 0,
  fingerprint: '',
  sequence: [],
  emptySource: false,
};
let sightWordSequenceCache = { perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };

const PX_TO_MM = 0.2645833333;
const A4_HEIGHT_MM = 297;
const A4_WIDTH_MM = 210;
const A4_TOLERANCE_MM = 0.5;
const MAX_AUTO_LAYOUT_ATTEMPTS = 12;
const CUSTOM_EXAMPLES_STORAGE_KEY = 'english-note-maker.customExamples.v1';
const VALID_CUSTOM_EXAMPLE_AGE_GROUPS = new Set(['4-6', '7-9', '10-12']);
const VALID_CUSTOM_EXAMPLE_CATEGORIES = new Set(['daily', 'school', 'family', 'hobby']);
const CUSTOM_EXAMPLE_CATEGORY_LABELS = {
  daily: '日常会話',
  school: '学校',
  family: '家族',
  hobby: '趣味',
};

let setCurrentExamplesImpl = (examples) => {
  currentExamples = Array.isArray(examples) ? examples : [];
};

let setCurrentExampleIndicesImpl = () => {};
let setCustomExamplesImpl = () => {};

const modulesReady = (async () => {
  const [
    exampleModule,
    wordModule,
    alphabetModule,
    phraseModule,
    appConfigModule,
    sightWordsModule,
    phonicsModule,
    phraseCollectionsModule,
  ] = await Promise.all([
    import('./src/data/example-sentences.js'),
    import('./src/data/word-lists.js'),
    import('./src/data/alphabet-data.js'),
    import('./src/data/phrase-data.js'),
    import('./src/models/app-config.js'),
    import('./src/data/sight-words.js'),
    import('./src/data/phonics-data.js'),
    import('./src/data/phrase-collections.js'),
  ]);

  EXAMPLE_SENTENCES_BY_AGE = exampleModule.EXAMPLE_SENTENCES_BY_AGE;
  WORD_LISTS = wordModule.WORD_LISTS;
  ALPHABET_DATA = alphabetModule.ALPHABET_DATA;
  PHRASE_DATA = await phraseCollectionsModule.loadMergedPhraseData(phraseModule.PHRASE_DATA);
  SIGHT_WORDS_DATA = sightWordsModule.SIGHT_WORDS;
  SIGHT_WORD_SET_DATA = sightWordsModule.SIGHT_WORD_SET;
  SIGHT_WORD_MAP_DATA = sightWordsModule.SIGHT_WORD_MAP;
  PHONICS_DATA = phonicsModule.PHONICS_DATA;
  PHONICS_PATTERN_OPTIONS = phonicsModule.PHONICS_PATTERN_OPTIONS;
  buildPhonicsWordSequenceImpl = phonicsModule.buildPhonicsWordSequence;
  getPhonicsPatternConfigImpl = phonicsModule.getPhonicsPatternConfig;

  currentExamples = Array.isArray(appConfigModule.currentExamples)
    ? appConfigModule.currentExamples
    : [];
  setCurrentExamplesImpl = (examples) => {
    appConfigModule.setCurrentExamples(examples);
    currentExamples = Array.isArray(appConfigModule.currentExamples)
      ? appConfigModule.currentExamples
      : [];
  };

  setCurrentExampleIndicesImpl = (indices) => {
    appConfigModule.setCurrentExampleIndices(indices);
  };

  setCustomExamplesImpl = (examples) => {
    appConfigModule.setCustomExamples(Array.isArray(examples) ? [...examples] : []);
  };
})();

function setCurrentExamples(examples) {
  setCurrentExamplesImpl(examples);
  currentExamples = Array.isArray(examples) ? examples : [];
  if (!currentExamples.length) {
    resetExampleCacheMeta();
  }
}

function setCurrentExampleIndices(indices) {
  setCurrentExampleIndicesImpl(indices);
}

function setCustomExamples(examples) {
  const nextExamples = Array.isArray(examples) ? [...examples] : [];
  customExamples.splice(0, customExamples.length, ...nextExamples);
  setCustomExamplesImpl(customExamples);
}

function resetExampleCacheMeta() {
  currentExamplesMeta = { key: '', perPageCount: 0, pageCount: 0 };
}

function resetWordCache() {
  wordSequenceCache = { key: '', perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };
}

function resetPhraseCache() {
  phraseSequenceCache = { key: '', perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };
}

function resetClozeCache() {
  clozeSequenceCache = { key: '', perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };
}

function resetPhonicsCache() {
  phonicsSequenceCache = { key: '', perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };
}

function resetSentenceCache() {
  sentenceSequenceCache = {
    key: '',
    perPage: 0,
    pageCount: 0,
    fingerprint: '',
    sequence: [],
    emptySource: false,
  };
}

function resetSightWordCache() {
  sightWordSequenceCache = { perPage: 0, pageCount: 0, fingerprint: '', sequence: [] };
}

// カテゴリーキー → 日本語ラベル（cloze / phrase 両モードで共有）
const CATEGORY_NAMES = {
  all: 'すべてのカテゴリー',
  greetings: 'あいさつ',
  self_introduction: '自己紹介',
  school: '学校生活',
  shopping: '買い物',
  travel: '旅行・移動',
  feelings: '感情表現',
  daily_life: '日常生活',
  classroom_english: '教室での英語',
  friend_making: '友達作り',
  cultural_exchange: '文化交流',
  emergency_situations: '緊急時の表現',
  numbers_math: '数と算数',
  family: '家族',
  hobbies: '趣味・遊び',
  food_eating: '食べ物・食事',
  weather: '天気',
  asking_for_help: '助けを求める',
  opinions_preferences: '意見・好み',
  making_plans: '予定を立てる',
  apologizing_thanking: '謝る・感謝する',
  health_body: '体・健康',
};

// フレーズプール取得（cloze / phrase 共有）。
// - category === 'all' なら全カテゴリーを連結
// - 日本語は年齢ごとに漢字レベルを変えているため、選択年齢のフレーズだけを集める
//   （他年齢で補うと、その年齢では読めない漢字の問題文が混ざる）
// - english を正規化して重複排除
// - カテゴリーが存在しない場合は greetings にフォールバック
function getPhrasePool(category, ageGroup) {
  // PHRASE_DATA 未初期化（ロード前・テスト環境など）でも安全に動くようガード
  if (!PHRASE_DATA) {
    return [];
  }

  const normalize = (s) => (s || '').toString().trim().toLowerCase();
  const seen = new Set();
  const pool = [];

  const pushUnique = (arr) => {
    if (!Array.isArray(arr)) {
      return;
    }
    for (const item of arr) {
      const norm = normalize(item && item.english);
      if (!norm || seen.has(norm)) {
        continue;
      }
      seen.add(norm);
      pool.push(item);
    }
  };

  const cats =
    category === 'all'
      ? Object.keys(PHRASE_DATA)
      : PHRASE_DATA[category]
        ? [category]
        : ['greetings'];

  // 全対象カテゴリーから「選択年齢」だけを集める。
  // category==='all' でも先頭カテゴリーに偏らず、全カテゴリーから満遍なく集まる。
  // 数が足りない場合は他年齢で補わず、同じ年齢のフレーズを繰り返す
  // （足りないことは getVarietyWarning() が利用者に伝える）。
  for (const cat of cats) {
    const ageMap = PHRASE_DATA[cat];
    if (ageMap) {
      pushUnique(ageMap[ageGroup]);
    }
  }

  return pool;
}

function reportInitializationFailure(error) {
  const message = 'Initialization failed due to module load error';

  if (window.Debug) {
    window.Debug.error('INIT', message, { error });
    return;
  }

  const existingBanner = document.getElementById('app-init-error');
  if (existingBanner) {
    existingBanner.textContent = `${message}: ${error.message}`;
    return;
  }

  const banner = document.createElement('div');
  banner.id = 'app-init-error';
  banner.setAttribute('role', 'alert');
  banner.textContent = `${message}: ${error.message}`;
  banner.style.backgroundColor = '#f44336';
  banner.style.color = '#ffffff';
  banner.style.padding = '12px';
  banner.style.textAlign = 'center';
  banner.style.fontWeight = 'bold';
  banner.style.margin = '0';

  document.body.prepend(banner);
}

// カスタム例文を保存する配列
const customExamples = [];

// 汎用ユーティリティ
function addEventListenerIfExists(element, eventType, handler) {
  if (!element) {
    if (window.Debug) {
      window.Debug.warn('EVENT', 'イベントリスナーを設定できませんでした', {
        eventType,
      });
    }
    return;
  }
  element.addEventListener(eventType, handler);
}

function setCheckboxState(element, isChecked) {
  if (!element) {
    if (window.Debug) {
      window.Debug.warn('CHECKBOX', 'チェックボックスが見つかりません', {});
    }
    return;
  }
  element.checked = Boolean(isChecked);
}

function normalizeCustomExample(rawExample) {
  if (!rawExample || typeof rawExample !== 'object') {
    return null;
  }

  const english = typeof rawExample.english === 'string' ? rawExample.english.trim() : '';
  const japanese = typeof rawExample.japanese === 'string' ? rawExample.japanese.trim() : '';
  const ageGroup =
    typeof rawExample.ageGroup === 'string' &&
    VALID_CUSTOM_EXAMPLE_AGE_GROUPS.has(rawExample.ageGroup)
      ? rawExample.ageGroup
      : '';
  const category =
    typeof rawExample.category === 'string' &&
    VALID_CUSTOM_EXAMPLE_CATEGORIES.has(rawExample.category)
      ? rawExample.category
      : '';

  if (!english || !japanese || !ageGroup || !category) {
    return null;
  }

  const parsedDifficulty = Number(rawExample.difficulty);
  const difficulty = Number.isFinite(parsedDifficulty)
    ? Math.min(3, Math.max(1, Math.round(parsedDifficulty)))
    : 1;

  return {
    english,
    japanese,
    category,
    ageGroup,
    difficulty,
    custom: true,
  };
}

function normalizeCustomExamples(rawExamples) {
  if (!Array.isArray(rawExamples)) {
    return [];
  }
  return rawExamples.map(normalizeCustomExample).filter(Boolean);
}

function getCustomExamplesStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  } catch (error) {
    if (window.Debug) {
      window.Debug.warn('CUSTOM_EXAMPLES', 'localStorage にアクセスできません', { error });
    }
    return null;
  }
}

function loadCustomExamplesFromStorage() {
  const storage = getCustomExamplesStorage();
  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(CUSTOM_EXAMPLES_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }
    return normalizeCustomExamples(JSON.parse(rawValue));
  } catch (error) {
    if (window.Debug) {
      window.Debug.warn('CUSTOM_EXAMPLES', '保存済みカスタム例文を読み込めませんでした', { error });
    }
    return [];
  }
}

function saveCustomExamplesToStorage() {
  const storage = getCustomExamplesStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(CUSTOM_EXAMPLES_STORAGE_KEY, JSON.stringify(customExamples));
  } catch (error) {
    if (window.Debug) {
      window.Debug.warn('CUSTOM_EXAMPLES', 'カスタム例文を保存できませんでした', { error });
    }
  }
}

function hydrateCustomExamplesFromStorage() {
  setCustomExamples(loadCustomExamplesFromStorage());
}

function getCustomExampleMetaLabel(example) {
  const categoryLabel = CUSTOM_EXAMPLE_CATEGORY_LABELS[example.category] || example.category;
  return `${example.ageGroup} / ${categoryLabel}`;
}

function renderCustomExamplesList() {
  const listElement = document.getElementById('customExamplesList');
  const countElement = document.getElementById('customExamplesCount');

  if (countElement) {
    countElement.textContent = `${customExamples.length}件`;
  }

  if (!listElement) {
    return;
  }

  if (customExamples.length === 0) {
    listElement.innerHTML = '<p class="custom-examples__empty">保存済みの例文はありません。</p>';
    return;
  }

  listElement.innerHTML = customExamples
    .map(
      (example, index) => `
        <div class="custom-example-item">
          <div>
            <div class="custom-example-item__english">${escapeHtml(example.english)}</div>
            <div class="custom-example-item__japanese">${escapeHtml(example.japanese)}</div>
            <div class="custom-example-item__meta">${escapeHtml(getCustomExampleMetaLabel(example))}</div>
          </div>
          <button
            class="custom-example-item__delete"
            type="button"
            data-custom-example-index="${index}"
            aria-label="${escapeHtml(example.english)}を削除"
          >
            ×
          </button>
        </div>
      `
    )
    .join('');
}

function removeCustomExample(index) {
  if (!Number.isInteger(index) || index < 0 || index >= customExamples.length) {
    return;
  }

  const nextExamples = customExamples.filter((_, currentIndex) => currentIndex !== index);
  setCustomExamples(nextExamples);
  saveCustomExamplesToStorage();
  renderCustomExamplesList();
  setCurrentExamples([]);
  resetSentenceCache();
  updatePreview();
}

function handleCustomExamplesListClick(event) {
  const target = event.target;
  const deleteButton =
    typeof target?.closest === 'function'
      ? target.closest('[data-custom-example-index]')
      : target?.parentElement?.closest?.('[data-custom-example-index]');
  if (!deleteButton) {
    return;
  }

  const index = Number.parseInt(deleteButton.dataset.customExampleIndex, 10);
  removeCustomExample(index);
}

// コンテンツ統計
const CONTENT_STATS = {
  lastUpdated: '2025年1月',
  words: { total: 0, byCategory: {}, byAge: {} },
  phrases: { total: 0, byCategory: {}, byAge: {} },
  examples: { total: 0, byAge: {} },
};

const OPTION_SECTION_IDS = [
  'exampleOptions',
  'translationOptions',
  'ageOptions',
  'wordOptions',
  'wordDifficultyOptions',
  'customExampleOptions',
  'alphabetOptions',
  'phraseOptions',
  'phraseDifficultyOptions',
  'clozeOptions',
  'phonicsOptions',
  'sentenceDifficultyOptions',
  'sightWordOptions',
];

const PRACTICE_MODE_CONFIGS = {
  sentence: {
    sections: [
      'ageOptions',
      'exampleOptions',
      'translationOptions',
      'sentenceDifficultyOptions',
      'customExampleOptions',
    ],
    checkboxes: { showExamples: true, showTranslation: true },
  },
  word: {
    sections: ['ageOptions', 'wordOptions', 'wordDifficultyOptions'],
    checkboxes: { showExamples: false, showTranslation: false },
  },
  phonics: {
    sections: ['phonicsOptions'],
    checkboxes: { showExamples: false, showTranslation: false },
  },
  alphabet: {
    sections: ['alphabetOptions'],
    checkboxes: { showExamples: false, showTranslation: false },
  },
  phrase: {
    sections: ['ageOptions', 'phraseOptions', 'phraseDifficultyOptions', 'translationOptions'],
    checkboxes: { showExamples: false, showTranslation: true },
  },
  cloze: {
    sections: ['ageOptions', 'clozeOptions'],
    checkboxes: { showExamples: false, showTranslation: false },
  },
  sightWords: {
    sections: ['sightWordOptions'],
    checkboxes: { showExamples: false, showTranslation: false },
  },
  default: {
    sections: [],
    checkboxes: { showExamples: false, showTranslation: false },
  },
};

const PHRASE_USAGE_PRIORITY = ['critical', 'core', 'common', 'situational', 'specialized'];
const PHRASE_PATTERN_LIMITS = {
  question: 3,
  introduction: 2,
  response: 2,
  request: 2,
  invitation: 2,
  exclamation: 1,
  statement: 3,
  other: 2,
};

function syncPhonicsPatternOptions() {
  const phonicsSelect = document.getElementById('phonicsPattern');
  if (!phonicsSelect) {
    return;
  }

  const options =
    Array.isArray(PHONICS_PATTERN_OPTIONS) && PHONICS_PATTERN_OPTIONS.length
      ? PHONICS_PATTERN_OPTIONS
      : Object.keys(PHONICS_DATA).map((patternKey) => ({
          value: patternKey,
          label: PHONICS_DATA[patternKey]?.label || patternKey,
        }));

  if (!options.length) {
    phonicsSelect.innerHTML = '';
    return;
  }

  const previousValue = phonicsSelect.value;
  phonicsSelect.innerHTML = options
    .map(
      (option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`
    )
    .join('');

  const hasPreviousValue = options.some((option) => option.value === previousValue);
  phonicsSelect.value = hasPreviousValue ? previousValue : options[0].value;
}

function init() {
  syncPhonicsPatternOptions();
  hydrateCustomExamplesFromStorage();
  updateOptionsVisibility();
  hydrateWorksheetSettingsFromUrl();
  setupEventListeners();
  setupPreviewScaleSync();
  renderCustomExamplesList();
  updatePreview();
}

// プレビュー領域の幅が変わったら縮小率を計算し直す（レイアウト自体は A4 実寸のまま）
function setupPreviewScaleSync() {
  const notePreview = document.getElementById('notePreview');
  if (!notePreview || typeof window === 'undefined') return;

  // applyPreviewScale は枠の高さを書き換えるため、高さの変化に反応すると
  // ResizeObserver が自分自身を呼び続ける。幅が変わったときだけ再計算する。
  let lastWidth = notePreview.clientWidth;
  const resync = () => {
    const width = notePreview.clientWidth;
    if (width === lastWidth) return;
    lastWidth = width;
    applyPreviewScale(notePreview);
  };

  // ResizeObserver は描画フレームに紐づくため、非表示タブなどでは通知が来ない。
  // 取りこぼしても崩れたままにならないよう resize イベントも併用する。
  window.addEventListener('resize', resync);
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(resync).observe(notePreview);
  }
}

function hydrateWorksheetSettingsFromUrl() {
  if (typeof window === 'undefined' || !window.location) {
    return;
  }

  const parsedState = parseUrlState(window.location.search, document);
  if (!Object.keys(parsedState).length) {
    return;
  }

  shouldReplaceUrlOnNextPreview = true;

  if (Object.prototype.hasOwnProperty.call(parsedState, 'practiceMode')) {
    applyUrlStateToDocument({ practiceMode: parsedState.practiceMode }, document);
    updateOptionsVisibility();
  }

  applyUrlStateToDocument(parsedState, document);
  resetWordCache();
  resetPhraseCache();
  resetPhonicsCache();
  resetClozeCache();
  resetSentenceCache();
  setCurrentExamples([]);
}

function handleUrlStateControlInteraction(event) {
  const target = event.target;
  if (!target || !URL_STATE_ELEMENT_IDS.has(target.id)) {
    return;
  }

  urlStateSyncEnabled = true;
}

function updateBrowserUrlState() {
  if (typeof window === 'undefined' || !window.history || !window.location) {
    return;
  }

  if (!urlStateSyncEnabled && !shouldReplaceUrlOnNextPreview) {
    return;
  }

  const nextSearch = serializeUrlStateToSearch(document);
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${
    window.location.hash
  }`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, '', nextUrl);
  }

  shouldReplaceUrlOnNextPreview = false;
}

// イベントリスナーのセットアップ
function setupEventListeners() {
  const elements = {
    practiceMode: document.getElementById('practiceMode'),
    showExamples: document.getElementById('showExamples'),
    showTranslation: document.getElementById('showTranslation'),
    refreshExamplesBtn: document.getElementById('refreshExamplesBtn'),
    ageGroup: document.getElementById('ageGroup'),
    printBtn: document.getElementById('printBtn'),
    lineHeight: document.getElementById('lineHeight'),
    lineColor: document.getElementById('lineColor'),
    showHeader: document.getElementById('showHeader'),
    pageCount: document.getElementById('pageCount'),
    exampleCategory: document.getElementById('exampleCategory'),
    wordCategory: document.getElementById('wordCategory'),
    phonicsPattern: document.getElementById('phonicsPattern'),
    shufflePhonicsBtn: document.getElementById('shufflePhonics'),
    addCustomExampleBtn: document.getElementById('addCustomExampleBtn'),
    customExamplesList: document.getElementById('customExamplesList'),
    alphabetType: document.getElementById('alphabetType'),
    alphabetMode: document.getElementById('alphabetMode'),
    alphabetTraceRepeat: document.getElementById('alphabetTraceRepeat'),
    alphabetWordCount: document.getElementById('alphabetWordCount'),
    showAlphabetExample: document.getElementById('showAlphabetExample'),
    phraseCategory: document.getElementById('phraseCategory'),
    showSituation: document.getElementById('showSituation'),
    shufflePhrasesBtn: document.getElementById('shufflePhrases'),
    previewBtn: document.getElementById('previewBtn'),
    clozeCategory: document.getElementById('clozeCategory'),
    clozeBlankType: document.getElementById('clozeBlankType'),
    clozeDifficulty: document.getElementById('clozeDifficulty'),
    showClozeAnswers: document.getElementById('showClozeAnswers'),
    shuffleClozeBtn: document.getElementById('shuffleCloze'),
    wordDifficulty: document.getElementById('wordDifficulty'),
    phraseDifficulty: document.getElementById('phraseDifficulty'),
    sentenceDifficulty: document.getElementById('sentenceDifficulty'),
    sightWordCount: document.getElementById('sightWordCount'),
    shuffleSightWordsBtn: document.getElementById('shuffleSightWords'),
  };

  document.addEventListener('change', handleUrlStateControlInteraction, true);
  document.addEventListener('input', handleUrlStateControlInteraction, true);

  addEventListenerIfExists(elements.showExamples, 'change', updatePreview);
  addEventListenerIfExists(elements.showTranslation, 'change', updatePreview);
  addEventListenerIfExists(elements.refreshExamplesBtn, 'click', () => {
    shuffleCurrentExamples();
    updatePreview();
  });

  addEventListenerIfExists(elements.ageGroup, 'change', () => {
    setCurrentExampleIndices({});
    setCurrentExamples([]);
    resetWordCache();
    resetPhraseCache();
    resetPhonicsCache();
    resetClozeCache();
    resetSentenceCache();
    updatePreview();
  });

  addEventListenerIfExists(elements.lineHeight, 'change', () => {
    resetWordCache();
    resetPhraseCache();
    resetPhonicsCache();
    resetSentenceCache();
    updatePreview();
  });

  [elements.lineColor, elements.showHeader].forEach((element) =>
    addEventListenerIfExists(element, 'change', updatePreview)
  );

  if (elements.pageCount) {
    const handlePageCountChange = () => {
      resetWordCache();
      resetPhraseCache();
      resetPhonicsCache();
      resetClozeCache();
      resetSentenceCache();
      updatePreview();
    };
    addEventListenerIfExists(elements.pageCount, 'change', handlePageCountChange);
    addEventListenerIfExists(elements.pageCount, 'input', handlePageCountChange);
  }

  addEventListenerIfExists(elements.exampleCategory, 'change', () => {
    setCurrentExamples([]);
    resetSentenceCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.wordCategory, 'change', () => {
    resetWordCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.phonicsPattern, 'change', () => {
    resetPhonicsCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.shufflePhonicsBtn, 'click', () => {
    resetPhonicsCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.addCustomExampleBtn, 'click', handleAddCustomExample);
  addEventListenerIfExists(elements.customExamplesList, 'click', handleCustomExamplesListClick);
  addEventListenerIfExists(elements.alphabetType, 'change', updatePreview);
  addEventListenerIfExists(elements.alphabetMode, 'change', updatePreview);
  addEventListenerIfExists(elements.alphabetTraceRepeat, 'change', updatePreview);
  addEventListenerIfExists(elements.alphabetWordCount, 'change', updatePreview);
  addEventListenerIfExists(elements.showAlphabetExample, 'change', updatePreview);

  addEventListenerIfExists(elements.phraseCategory, 'change', () => {
    if (window.Debug) {
      window.Debug.log('PHRASE_CATEGORY', 'フレーズカテゴリーが変更されました', {
        newCategory: elements.phraseCategory ? elements.phraseCategory.value : undefined,
      });
    }
    resetPhraseCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.showSituation, 'change', updatePreview);

  addEventListenerIfExists(elements.shufflePhrasesBtn, 'click', () => {
    if (window.Debug) {
      window.Debug.log('PHRASE_SHUFFLE', 'フレーズをシャッフルします', {
        currentCategory: elements.phraseCategory ? elements.phraseCategory.value : undefined,
      });
    }
    resetPhraseCache();
    updatePreview();
  });

  addEventListenerIfExists(elements.clozeCategory, 'change', () => {
    resetClozeCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.clozeBlankType, 'change', updatePreview);
  addEventListenerIfExists(elements.clozeDifficulty, 'change', () => {
    resetClozeCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.showClozeAnswers, 'change', updatePreview);
  addEventListenerIfExists(elements.shuffleClozeBtn, 'click', () => {
    resetClozeCache();
    updatePreview();
  });

  addEventListenerIfExists(elements.wordDifficulty, 'change', () => {
    resetWordCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.phraseDifficulty, 'change', () => {
    resetPhraseCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.sentenceDifficulty, 'change', () => {
    resetSentenceCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.sightWordCount, 'change', () => {
    resetSightWordCache();
    updatePreview();
  });
  addEventListenerIfExists(elements.shuffleSightWordsBtn, 'click', () => {
    resetSightWordCache();
    updatePreview();
  });

  addEventListenerIfExists(elements.printBtn, 'click', printNote);

  if (elements.previewBtn) {
    addEventListenerIfExists(elements.previewBtn, 'click', showPrintPreview);
    if (window.Debug) {
      window.Debug.log('INIT', '印刷プレビューボタンのイベントリスナーを設定しました');
    }
  } else if (window.Debug) {
    window.Debug.error('INIT', '印刷プレビューボタンが見つかりません', { element: 'previewBtn' });
  }

  addEventListenerIfExists(elements.practiceMode, 'change', () => {
    updateOptionsVisibility();
    resetWordCache();
    resetPhraseCache();
    resetClozeCache();
    resetPhonicsCache();
    resetSentenceCache();
    resetSightWordCache();
    setCurrentExamples([]);
    updatePreview();
  });
}

// オプションの表示/非表示を更新
function updateOptionsVisibility() {
  const practiceModeElement = document.getElementById('practiceMode');
  const showExamplesCheckbox = document.getElementById('showExamples');
  const showTranslationCheckbox = document.getElementById('showTranslation');

  if (!practiceModeElement) {
    if (window.Debug) {
      window.Debug.error('INIT', '練習モードの選択要素が見つかりません', {
        element: 'practiceMode',
      });
    }
    return;
  }

  const practiceModeValue = practiceModeElement.value;
  const config = PRACTICE_MODE_CONFIGS[practiceModeValue] ?? PRACTICE_MODE_CONFIGS.default;

  OPTION_SECTION_IDS.forEach((sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      if (window.Debug) {
        window.Debug.warn('OPTIONS', 'オプションセクションが見つかりません', { sectionId });
      }
      return;
    }
    element.style.display = config.sections.includes(sectionId) ? 'block' : 'none';
  });

  setCheckboxState(showExamplesCheckbox, config.checkboxes.showExamples);
  setCheckboxState(showTranslationCheckbox, config.checkboxes.showTranslation);
}

// プレビュー更新
function updatePreview() {
  // アルファベット練習モードでは、全文字を1巡表示できるよう pageCount をレンダー前に同期で引き上げる
  // （旧実装は generateAlphabetPractice 内の setTimeout で再帰的に updatePreview を呼んでおり、
  //   不要な二重レンダリング＆ pageCount.max を超えると無限ループする恐れがあった）
  bumpPageCountForAlphabet();

  const state = getPreviewState();
  const notePreview = document.getElementById('notePreview');

  if (!notePreview) {
    if (window.Debug) {
      window.Debug.error('PREVIEW', 'notePreview 要素が見つかりません');
    }
    return;
  }

  const baseLayout = calculateBaseLayout(state);
  // 各モードの生成関数は override が無いとプリセット由来の値を自前で計算するため、
  // プールで抑えた基準値を最初の描画から渡す（自動調整の起点とも一致させる）。
  const initialOverrides = buildInitialOverrides(state.practiceMode, baseLayout);

  renderNotePreview(notePreview, state, initialOverrides);

  const adjustmentResult = autoAdjustPreview(notePreview, state, baseLayout, initialOverrides);

  updateAutoLayoutNotice(adjustmentResult, state, baseLayout);
  updateBrowserUrlState();
}

// アルファベット練習で全文字を表示できる枚数を返す（モードでなければ null）
function computeAlphabetNeededPages() {
  const practiceMode = document.getElementById('practiceMode')?.value;
  if (practiceMode !== 'alphabet') return null;

  const alphabetType = document.getElementById('alphabetType')?.value || 'uppercase';
  const alphabetMode = document.getElementById('alphabetMode')?.value || 'normal';
  const isTrace = alphabetMode === 'trace';
  const traceRepeat = clampInt(document.getElementById('alphabetTraceRepeat')?.value, 1, 5, 3);
  const wordCount = clampInt(document.getElementById('alphabetWordCount')?.value, 1, 3, 2);
  const lineHeight = clampInt(document.getElementById('lineHeight')?.value, 8, 12, 10);
  const showExample = Boolean(document.getElementById('showAlphabetExample')?.checked);

  let total = 0;
  if (alphabetType === 'uppercase' || alphabetType === 'both')
    total += ALPHABET_DATA.uppercase?.length || 0;
  if (alphabetType === 'lowercase' || alphabetType === 'both')
    total += ALPHABET_DATA.lowercase?.length || 0;
  if (total === 0) return null;

  const lettersPerPage = isTrace
    ? computeTraceLettersPerPage(traceRepeat, wordCount, showExample, lineHeight)
    : 6;
  return Math.ceil(total / lettersPerPage);
}

// アルファベット練習では、文字種・罫線高さの変更に合わせて pageCount を同期する
function bumpPageCountForAlphabet() {
  const needed = computeAlphabetNeededPages();
  if (!needed) return;
  const pageCountInput = document.getElementById('pageCount');
  if (!pageCountInput) return;
  const maxAttr = parseInt(pageCountInput.getAttribute('max') || '', 10);
  const maxPages = Number.isFinite(maxAttr) ? maxAttr : 60;
  const target = Math.min(needed, maxPages);
  const current = parseInt(pageCountInput.value, 10);
  if (!Number.isFinite(current) || current !== target) {
    pageCountInput.value = String(target);
  }
}

function getPreviewState() {
  const practiceModeElement = document.getElementById('practiceMode');
  const lineHeightElement = document.getElementById('lineHeight');
  const showExamplesElement = document.getElementById('showExamples');
  const showTranslationElement = document.getElementById('showTranslation');
  const showClozeAnswersElement = document.getElementById('showClozeAnswers');
  const pageCountInput = document.getElementById('pageCount');

  const practiceMode = practiceModeElement ? practiceModeElement.value : 'normal';
  const lineHeight = parseInt(lineHeightElement ? lineHeightElement.value : '10', 10);
  const showExamples = Boolean(showExamplesElement?.checked);
  const showTranslation = Boolean(showTranslationElement?.checked);
  const showClozeAnswers = Boolean(showClozeAnswersElement?.checked);

  const maxAttr = pageCountInput?.getAttribute('max');
  const maxPageCount = Number.isFinite(parseInt(maxAttr || '', 10)) ? parseInt(maxAttr, 10) : 20;
  const rawPageCount = parseInt(pageCountInput ? pageCountInput.value : '1', 10);
  const pageCount = clampNumber(Number.isFinite(rawPageCount) ? rawPageCount : 1, 1, maxPageCount);

  if (pageCountInput && Number.isFinite(rawPageCount) && rawPageCount !== pageCount) {
    pageCountInput.value = String(pageCount);
  }

  return {
    practiceMode,
    lineHeight: Number.isFinite(lineHeight) ? lineHeight : 10,
    showExamples,
    showTranslation,
    showClozeAnswers,
    pageCount,
  };
}

function renderNotePreview(notePreview, state, overrides) {
  let html = '';

  for (let page = 0; page < state.pageCount; page++) {
    if (page > 0) {
      html += `
                <div class="page-separator">
                    <div class="page-separator-line"></div>
                    <div class="page-separator-text">ページ ${page + 1}</div>
                    <div class="page-separator-line"></div>
                </div>
            `;
    }
    // ページは A4 実寸で組み、表示だけを縮小するため枠で包む
    html += `<div class="note-page-frame">${generateNotePage(page + 1, state.pageCount, overrides)}</div>`;
  }

  notePreview.innerHTML = html;
  applyPreviewScale(notePreview);
}

// A4 実寸のページを、プレビュー領域の幅に収まるよう transform で縮小する。
// transform はレイアウトを変えないので、枠の高さは縮小後の実寸に合わせて指定する。
function applyPreviewScale(notePreview) {
  const frames = notePreview.querySelectorAll('.note-page-frame');
  if (!frames.length) return;

  // notePreview.clientWidth は内側パディングを含むので、枠自身の幅を基準にする
  const available = frames[0].clientWidth;
  const pageWidthPx = A4_WIDTH_MM / PX_TO_MM;
  const scale = available > 0 ? Math.min(1, available / pageWidthPx) : 1;
  // 左上を基準に縮小するので、余った幅の半分だけ右へずらして中央に置く
  const offset = Math.max(0, (available - pageWidthPx * scale) / 2);

  notePreview.style.setProperty('--preview-scale', String(scale));
  frames.forEach((frame) => {
    const page = frame.querySelector('.note-page');
    if (!page) return;
    page.style.marginLeft = `${offset}px`;
    frame.style.height = `${page.offsetHeight * scale}px`;
  });
}

// 1ページあたりの項目数を A4 の高さに合わせて調整する。
// はみ出していれば減らし、余っていれば増やす。項目の高さは文の折り返し次第で
// 変わるため、見積もりではなく実際に描画した高さで判定する。
function autoAdjustPreview(notePreview, state, baseLayout, initialOverrides) {
  const appliedOverrides = cloneOverrides(initialOverrides);
  let overflowInfo = detectOverflow(notePreview);
  let attempts = 0;
  let previousValue = null;
  let nextValue = null;
  let exhausted = false;

  // 描画したあとの実寸だけを判定材料にする。
  // 出題内容はランダムなので、同じ設定で描き直しても中身が変わることがある。
  // 「測った状態」と「最後に画面へ残した状態」を必ず一致させること。
  const renderAndMeasure = (overrides) => {
    renderNotePreview(notePreview, state, overrides);
    overflowInfo = detectOverflow(notePreview);
  };

  // はみ出している間、収まるまで1つずつ減らす
  const shrinkUntilFits = () => {
    while (overflowInfo.hasOverflow && attempts < MAX_AUTO_LAYOUT_ATTEMPTS) {
      const adjustment = computeNextOverrides(state, appliedOverrides, baseLayout, -1);
      if (!adjustment.changed) {
        exhausted = true;
        return;
      }

      previousValue = adjustment.previous;
      nextValue = adjustment.next;
      Object.assign(appliedOverrides, adjustment.overrides);

      renderAndMeasure(appliedOverrides);
      attempts += 1;
    }
  };

  shrinkUntilFits();

  // 減らす必要がなかった＝まだ余白がある可能性があるので、はみ出す直前まで増やす
  if (attempts === 0 && !exhausted) {
    while (attempts < MAX_AUTO_LAYOUT_ATTEMPTS) {
      const adjustment = computeNextOverrides(state, appliedOverrides, baseLayout, +1);
      if (!adjustment.changed) break;

      const candidate = cloneOverrides(appliedOverrides);
      Object.assign(candidate, adjustment.overrides);
      renderAndMeasure(candidate);
      attempts += 1;

      if (overflowInfo.hasOverflow) {
        // 増やしすぎたので直前の設定へ戻す。戻した描画でも出題内容は選び直されるため、
        // 測り直したうえで、それでもはみ出していれば収まるまで減らす。
        renderAndMeasure(appliedOverrides);
        shrinkUntilFits();
        break;
      }

      previousValue = adjustment.previous;
      nextValue = adjustment.next;
      Object.assign(appliedOverrides, adjustment.overrides);
    }
  }

  const modeLayout = baseLayout[state.practiceMode] || null;
  const finalValue = modeLayout
    ? (appliedOverrides[state.practiceMode]?.[modeLayout.property] ?? modeLayout.baseValue)
    : null;

  return {
    // 増やそうとして戻した場合は「調整なし」なので、値が変わったかで判定する
    adjusted: modeLayout ? finalValue !== modeLayout.baseValue : attempts > 0,
    success: !overflowInfo.hasOverflow,
    attempts,
    mode: state.practiceMode,
    baseLayout,
    appliedOverrides,
    overflow: overflowInfo,
    previousValue,
    nextValue,
    finalValue,
  };
}

function detectOverflow(notePreview) {
  const pages = notePreview.querySelectorAll('.note-page');
  const overflows = [];

  pages.forEach((page, index) => {
    // 表示は transform で縮小しているので、実寸である offsetHeight で測る
    const heightMm = page.offsetHeight * PX_TO_MM;
    const overflowMm = heightMm - A4_HEIGHT_MM;

    if (overflowMm > A4_TOLERANCE_MM) {
      overflows.push({
        pageIndex: index,
        displayIndex: index + 1,
        heightMm: parseFloat(heightMm.toFixed(2)),
        overflowMm: parseFloat(overflowMm.toFixed(2)),
      });
    }
  });

  return {
    hasOverflow: overflows.length > 0,
    overflows,
    pageCount: pages.length,
  };
}

function computeNextOverrides(state, overrides, baseLayout, direction = -1) {
  const layout = baseLayout[state.practiceMode];
  if (!layout) {
    return { changed: false, overrides };
  }

  const current = overrides[state.practiceMode]?.[layout.property] ?? layout.baseValue;
  const limit = direction < 0 ? layout.minValue : getLayoutMaxValue(layout);

  if (direction < 0 ? current <= limit : current >= limit) {
    return { changed: false, overrides };
  }

  const next = current + direction;
  const updated = cloneOverrides(overrides);
  if (!updated[state.practiceMode]) {
    updated[state.practiceMode] = {};
  }
  updated[state.practiceMode][layout.property] = next;

  return {
    changed: true,
    overrides: updated,
    previous: current,
    next,
  };
}

function calculateBaseLayout(state) {
  const ageGroup = document.getElementById('ageGroup')?.value || '7-9';

  const rawWordDifficulty = document.getElementById('wordDifficulty')?.value || 'auto';
  const wordDifficulty = resolveWordDifficulty(rawWordDifficulty, ageGroup);
  const wordPreset = getWordDifficultyPreset(wordDifficulty);

  const rawSentenceDifficulty = document.getElementById('sentenceDifficulty')?.value || 'auto';
  const sentenceDifficulty = resolveSentenceDifficulty(rawSentenceDifficulty, ageGroup);
  const sentencePreset = getSentenceDifficultyPreset(sentenceDifficulty);
  const effectiveSentenceShowTranslation =
    rawSentenceDifficulty === 'auto' ? state.showTranslation : sentencePreset.showJapanese;

  const rawPhraseDifficulty = document.getElementById('phraseDifficulty')?.value || 'auto';
  const phrasePreset = getPhraseDifficultyPreset(
    resolvePhraseDifficulty(rawPhraseDifficulty, ageGroup)
  );

  const phraseCategory = document.getElementById('phraseCategory')?.value || 'greetings';
  const clozeCategory = document.getElementById('clozeCategory')?.value || 'greetings';
  const wordCategory = document.getElementById('wordCategory')?.value || 'animals';
  const exampleCategory = document.getElementById('exampleCategory')?.value || 'all';
  const phonicsPattern = document.getElementById('phonicsPattern')?.value || '';

  return {
    normal: calculateNormalPracticeLayout(state.lineHeight, state.showExamples),
    sentence: clampLayoutToPool(
      calculateSentencePracticeLayout(state.lineHeight, effectiveSentenceShowTranslation),
      getFilteredSentencesForPractice(ageGroup, exampleCategory, sentencePreset).length
    ),
    word: clampLayoutToPool(
      calculateWordPracticeLayout(state.lineHeight, wordPreset.maxWords),
      getWordPoolSize(wordCategory, ageGroup)
    ),
    phonics: clampLayoutToPool(
      calculatePhonicsPracticeLayout(state.lineHeight),
      getPhonicsPoolSize(phonicsPattern)
    ),
    phrase: clampLayoutToPool(
      calculatePhrasePracticeLayout(state.lineHeight, phrasePreset.maxPhrases),
      getPhrasePool(phraseCategory, ageGroup).length
    ),
    cloze: clampLayoutToPool(
      calculateClozePracticeLayout(state.lineHeight, state.showClozeAnswers),
      getPhrasePool(clozeCategory, ageGroup).length
    ),
    sightWords: calculateSightWordPracticeLayout(),
  };
}

function calculateSightWordPracticeLayout() {
  const selected = sanitizeSightWordCount(document.getElementById('sightWordCount')?.value);
  return {
    property: 'wordsPerPage',
    label: 'サイトワード数',
    baseValue: selected,
    minValue: Math.min(4, selected),
    maxValue: selected,
  };
}

function buildInitialOverrides(practiceMode, baseLayout) {
  const layout = baseLayout?.[practiceMode];
  if (!layout) {
    return {};
  }
  return { [practiceMode]: { [layout.property]: layout.baseValue } };
}

function getWordPoolSize(category, ageGroup) {
  const list = WORD_LISTS?.[category]?.[ageGroup];
  return Array.isArray(list) ? list.length : 0;
}

function getPhonicsPoolSize(patternKey) {
  const config = getPhonicsPatternConfigImpl(patternKey);
  return Array.isArray(config?.words) ? config.words.length : 0;
}

// 1ページに載せる数がその年齢の項目数を超えると、同じ問題が1枚の中で重複する。
// 自動調整で増やす場合も含め、プールの実数を超えないようにする。
function clampLayoutToPool(layout, poolSize) {
  if (!Number.isFinite(poolSize) || poolSize <= 0) {
    return layout;
  }

  const baseValue = Math.max(1, Math.min(layout.baseValue, poolSize));

  return {
    ...layout,
    baseValue,
    minValue: Math.min(layout.minValue, baseValue),
    maxValue: Math.max(baseValue, Math.min(getLayoutMaxValue(layout), poolSize)),
  };
}

function calculateNormalPracticeLayout(lineHeight, showExamples) {
  const baseMaxLines = showExamples ? 12 : 14;
  let maxLines = baseMaxLines;

  if (lineHeight === 12) {
    maxLines = Math.floor(baseMaxLines * 0.8);
  } else if (lineHeight === 8) {
    maxLines = Math.floor(baseMaxLines * 1.2);
  }

  maxLines = Math.max(6, maxLines);
  const minLines = Math.max(4, Math.min(maxLines - 2, Math.floor(maxLines * 0.7)));

  return {
    property: 'maxLines',
    label: '行数',
    baseValue: maxLines,
    minValue: minLines,
  };
}

function calculateSentencePracticeLayout(lineHeight, showTranslation) {
  const baseMaxExamples = showTranslation ? 4 : 5;
  let maxExamples = baseMaxExamples;

  if (lineHeight === 12) {
    maxExamples = Math.floor(baseMaxExamples * 0.8);
  } else if (lineHeight === 8) {
    maxExamples = Math.floor(baseMaxExamples * 1.2);
  }

  maxExamples = Math.max(2, maxExamples);
  const minExamples = Math.max(1, Math.min(maxExamples - 1, Math.floor(maxExamples * 0.7)));

  return {
    property: 'maxExamples',
    label: '例文数',
    baseValue: maxExamples,
    minValue: minExamples,
  };
}

function calculateWordPracticeLayout(lineHeight, basePresetMaxWords = 8) {
  let scale = 1;
  if (lineHeight === 12) {
    scale = 0.8;
  } else if (lineHeight === 8) {
    scale = 1.2;
  }
  const maxWords = Math.max(2, Math.floor(basePresetMaxWords * scale));

  // 1語につき4本線が2行ぶん必要で、行間や年齢によっては3〜4語しか載らない。
  // 収まるところまで減らせるよう下限は小さく取る。
  const minWords = Math.max(1, Math.min(maxWords - 1, 3));

  return {
    property: 'maxWords',
    label: '単語数',
    baseValue: maxWords,
    minValue: minWords,
  };
}

function calculatePhonicsPracticeLayout(lineHeight) {
  const baseWords = getPhonicsCapacity(lineHeight);
  const minWords = Math.max(1, Math.min(baseWords - 1, Math.floor(baseWords * 0.7)));

  return {
    property: 'wordsPerPage',
    label: '単語数',
    baseValue: baseWords,
    minValue: minWords,
  };
}

function getPhonicsCapacity(lineHeight) {
  if (lineHeight === 12) {
    return 3;
  }
  if (lineHeight === 8) {
    return 5;
  }
  return 4;
}

function calculatePhrasePracticeLayout(lineHeight, presetMaxPhrases = 4) {
  const basePhrases = Math.max(1, Math.min(getPhraseCapacity(lineHeight), presetMaxPhrases));
  const minPhrases = Math.max(1, Math.min(basePhrases - 1, Math.floor(basePhrases * 0.7)));

  return {
    property: 'phrasesPerPage',
    label: 'フレーズ数',
    baseValue: basePhrases,
    minValue: minPhrases,
  };
}

// cloze / phrase モードで、選択条件のユニークなフレーズ数が
// 印刷に必要な数（1ページの問題数 × ページ数）に満たない場合に警告文を返す。
// 不足がなければ空文字を返す。
function getVarietyWarning(state) {
  if (!state) {
    return '';
  }
  const mode = state.practiceMode;
  if (mode !== 'cloze' && mode !== 'phrase') {
    return '';
  }

  const categoryId = mode === 'cloze' ? 'clozeCategory' : 'phraseCategory';
  const categoryEl = document.getElementById(categoryId);
  const category = (categoryEl && categoryEl.value) || 'greetings';

  const ageGroupEl = document.getElementById('ageGroup');
  const ageGroup = (ageGroupEl && ageGroupEl.value) || '7-9';

  let perPage;
  if (mode === 'cloze') {
    perPage = calculateClozePracticeLayout(state.lineHeight, state.showClozeAnswers).baseValue || 1;
  } else {
    perPage = calculatePhrasePracticeLayout(state.lineHeight).baseValue || 1;
  }

  const pageCount = Math.max(1, state.pageCount || 1);
  const needed = perPage * pageCount;

  const uniqueCount = getPhrasePool(category, ageGroup).length;

  if (uniqueCount >= needed) {
    return '';
  }

  return `選択条件のフレーズは ${uniqueCount} 件です。${pageCount}ページ印刷では同じ問題が繰り返されます。「すべてのカテゴリー」を選ぶか、対象年齢を変えると種類が増えます。`;
}

function updateAutoLayoutNotice(result, state, baseLayout) {
  const notice = document.getElementById('autoLayoutNotice');
  if (!notice) {
    return;
  }

  const varietyWarning = getVarietyWarning(state);
  const show = (text, status) => {
    notice.textContent = text || '';
    notice.style.display = text ? 'block' : 'none';
    // 自動調整メッセージとバリエーション警告を \n で連結した場合に改行表示されるように
    notice.style.whiteSpace = text ? 'pre-line' : '';
    notice.dataset.status = text ? status : 'idle';
  };

  if (!result || (!result.adjusted && result.success !== false)) {
    // 自動レイアウト調整は不要。バリエーション警告があればそれを表示。
    show(varietyWarning, 'warning');
    return;
  }

  const modeLayout = baseLayout[state.practiceMode];
  const currentValue =
    result.finalValue ??
    (modeLayout ? result.appliedOverrides?.[state.practiceMode]?.[modeLayout.property] : null) ??
    modeLayout?.baseValue;

  if (result.success === false) {
    const overflowSummary = result.overflow?.overflows?.[0];
    const overflowText = overflowSummary
      ? `（ページ${overflowSummary.displayIndex}が約${overflowSummary.overflowMm}mmはみ出しています）`
      : '';
    const base = `自動調整を試みましたが、A4サイズに収まりませんでした。ページ数や行間、カテゴリ設定を見直してください。${overflowText}`;
    show(varietyWarning ? `${base}\n${varietyWarning}` : base, 'error');
    return;
  }

  if (modeLayout && result.adjusted) {
    const fromValue = modeLayout.baseValue;
    const label = modeLayout.label || '項目数';
    const base = `A4に合わせて、1ページあたりの${label}を ${fromValue} → ${currentValue} に自動調整しました。`;
    show(varietyWarning ? `${base}\n${varietyWarning}` : base, 'adjusted');
    return;
  }

  show(varietyWarning, 'warning');
}

function escapeHtml(text) {
  const replacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return String(text ?? '').replace(/[&<>"']/g, (char) => replacements[char]);
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function cloneOverrides(overrides) {
  const clone = {};
  if (!overrides) {
    return clone;
  }

  ['normal', 'sentence', 'word', 'phonics', 'phrase', 'cloze', 'sightWords'].forEach((key) => {
    if (overrides[key]) {
      clone[key] = { ...overrides[key] };
    }
  });

  return clone;
}

// 自動調整で増やせる上限。見積もりが控えめでも A4 を使い切れるよう、
// 基準値の2倍まで試せるようにしておく（実際は、はみ出した時点で止まる）。
function getLayoutMaxValue(layoutInfo) {
  if (!layoutInfo) return undefined;
  return layoutInfo.maxValue ?? Math.max(layoutInfo.baseValue, layoutInfo.baseValue * 2);
}

function resolveLayoutValue(layoutInfo, overrideValue) {
  if (!layoutInfo) {
    return Number.isFinite(overrideValue) ? overrideValue : undefined;
  }

  const base = layoutInfo.baseValue;
  const min = layoutInfo.minValue;

  if (!Number.isFinite(overrideValue)) {
    return base;
  }

  const rounded = Math.round(overrideValue);
  return clampNumber(rounded, min, getLayoutMaxValue(layoutInfo));
}

// ノートページ生成
function generateNotePage(pageNumber, totalPages, layoutOverrides = {}) {
  const practiceMode = document.getElementById('practiceMode').value;
  const lineHeight = parseInt(document.getElementById('lineHeight').value);
  const lineColor = document.getElementById('lineColor').value;
  const showHeader = document.getElementById('showHeader').checked;
  const showExamples = document.getElementById('showExamples').checked;
  const showTranslation = document.getElementById('showTranslation').checked;
  const ageGroup = document.getElementById('ageGroup').value;

  // 行高さに応じたスペーシングを計算
  const lineSpacing = Math.max(1, Math.floor(lineHeight * 0.2)); // 行高の20%
  const lineSeparatorHeight = Math.max(2, Math.floor(lineHeight * 0.4)); // 行高の40%
  const lineSeparatorSmallHeight = Math.max(2, Math.floor(lineHeight * 0.4));
  const lineGroupSeparatorHeight = Math.max(2, Math.floor(lineHeight * 0.3));
  const sentenceGroupMargin = Math.max(8, lineHeight);

  // CSS変数を設定
  const styleVars = `style="
        --line-height-mm: ${lineHeight}mm;
        --line-spacing-mm: ${lineSpacing}mm;
        --line-separator-height: ${lineSeparatorHeight}mm;
        --line-separator-small-height: ${lineSeparatorSmallHeight}mm;
        --line-group-separator-height: ${lineGroupSeparatorHeight}mm;
        --sentence-group-margin: ${sentenceGroupMargin}mm;
    "`;
  const colorClass = lineColor !== 'gray' ? `line-color-${lineColor}` : '';

  let html = `<div class="note-page ${colorClass}" ${styleVars}>`;

  // ヘッダー
  if (showHeader) {
    html += `
            <div class="note-header">
                <div class="note-header__item">
                    <span class="note-header__label">名前:</span>
                    <input class="note-header__input" type="text">
                </div>
                <div class="note-header__item">
                    <span class="note-header__label">日付:</span>
                    <input class="note-header__input" type="text">
                </div>
            </div>
        `;
  }

  // コンテンツ
  if (practiceMode === 'sentence') {
    html += generateSentencePractice(
      pageNumber,
      totalPages,
      showTranslation,
      ageGroup,
      layoutOverrides.sentence
    );
  } else if (practiceMode === 'word') {
    html += generateWordPractice(pageNumber, totalPages, ageGroup, layoutOverrides.word);
  } else if (practiceMode === 'phonics') {
    html += generatePhonicsPractice(pageNumber, totalPages, layoutOverrides.phonics);
  } else if (practiceMode === 'alphabet') {
    html += generateAlphabetPractice(pageNumber);
  } else if (practiceMode === 'phrase') {
    html += generatePhrasePractice(
      pageNumber,
      totalPages,
      showTranslation,
      ageGroup,
      layoutOverrides.phrase
    );
  } else if (practiceMode === 'cloze') {
    html += generateClozePractice(pageNumber, totalPages, ageGroup, layoutOverrides.cloze);
  } else if (practiceMode === 'sightWords') {
    html += generateSightWordPractice(pageNumber, totalPages, layoutOverrides.sightWords);
  } else {
    html += generateNormalPractice(
      pageNumber,
      totalPages,
      showExamples,
      showTranslation,
      ageGroup,
      layoutOverrides.normal
    );
  }

  html += '</div>';

  return html;
}

function ensureSightWordSequence(perPage, pageCount) {
  const fingerprint = SIGHT_WORDS_DATA.map((item) => item.word).join('|');
  const totalNeeded = Math.min(perPage * pageCount, SIGHT_WORDS_DATA.length);
  if (
    sightWordSequenceCache.perPage !== perPage ||
    sightWordSequenceCache.pageCount !== pageCount ||
    sightWordSequenceCache.fingerprint !== fingerprint ||
    sightWordSequenceCache.sequence.length < totalNeeded
  ) {
    sightWordSequenceCache = {
      perPage,
      pageCount,
      fingerprint,
      sequence: buildSightWordSequence(SIGHT_WORDS_DATA, perPage, pageCount),
    };
  }
  return sightWordSequenceCache.sequence;
}

function generateSightWordPractice(pageNumber, totalPages, layoutOverride = {}) {
  const layout = calculateSightWordPracticeLayout();
  const wordsPerPage = Math.max(1, resolveLayoutValue(layout, layoutOverride?.wordsPerPage));
  const pageCount = Math.max(1, totalPages || 1);
  const sequence = ensureSightWordSequence(wordsPerPage, pageCount);
  const start = (pageNumber - 1) * wordsPerPage;
  const words = sequence.slice(start, start + wordsPerPage);
  const pageLabel = pageCount > 1 ? ` (${pageNumber}/${pageCount})` : '';

  let html = `<section class="sight-word-practice sight-word-practice--count-${wordsPerPage}">
    <h3 class="practice-title practice-title--sight-word">Sight Word Practice${pageLabel}</h3>
    <div class="sight-word-grid">`;

  for (const item of words) {
    const word = escapeHtml(item.word);
    const japanese = escapeHtml(item.japanese);
    html += `<article class="sight-word-item" data-sight-word="${word}">
      <div class="sight-word-step sight-word-step--read">
        <span class="sight-word-step__label">1 Read / Trace</span>
        <span class="sight-word-model">${word}</span><span class="sight-word-japanese">${japanese}</span>
        ${generateBaselineGroup(item.word, 3)}
      </div>
      <div class="sight-word-step sight-word-step--copy">
        <span class="sight-word-step__label">2 Copy</span><span class="sight-word-copy-model">${word}</span>
        ${generateBaselineGroup()}
      </div>
      <div class="sight-word-step sight-word-step--recall">
        <span class="sight-word-step__label">3 Recall</span><span class="sight-word-japanese">${japanese}</span>
        ${generateBaselineGroup()}
      </div>
    </article>`;
  }

  if (!words.length) html += '<p class="sight-word-empty">表示できるサイトワードがありません。</p>';
  return `${html}</div></section>`;
}

// 通常練習モード生成
function generateNormalPractice(
  pageNumber,
  totalPages,
  showExamples,
  showTranslation,
  ageGroup,
  layoutOverride = {}
) {
  let html = '';
  // 行高さに応じて最大行数を調整
  const lineHeight = parseInt(document.getElementById('lineHeight').value);
  const layoutInfo = calculateNormalPracticeLayout(lineHeight, showExamples);
  const maxLines = resolveLayoutValue(layoutInfo, layoutOverride?.maxLines);

  const category = document.getElementById('exampleCategory')?.value || 'all';
  const examplesPerPage = showExamples ? Math.max(1, Math.floor(maxLines / 4)) : 0;

  if (showExamples && examplesPerPage > 0) {
    ensureExamples(examplesPerPage, ageGroup, totalPages, category);
  }

  const baseExampleIndex = showExamples ? (pageNumber - 1) * examplesPerPage : 0;

  for (let i = 0; i < maxLines; i++) {
    const exampleIndex = Math.floor(i / 4);
    const globalExampleIndex = baseExampleIndex + exampleIndex;
    const exampleData = showExamples ? currentExamples[globalExampleIndex] : undefined;
    const shouldShowExample = showExamples && exampleData && i % 4 === 0;

    if (shouldShowExample) {
      html += generateExampleSentence(exampleData, showTranslation);
    }

    html += generateBaselineGroup();

    if (i !== maxLines - 1) {
      html += '<div class="line-separator-small"></div>';
    }
  }

  return html;
}

// 文章練習モード生成
function generateSentencePractice(
  pageNumber,
  totalPages,
  showTranslation,
  ageGroup,
  layoutOverride = {}
) {
  let html = '';
  const category = document.getElementById('exampleCategory')?.value || 'all';
  const sentenceDifficultyElement = document.getElementById('sentenceDifficulty');
  const rawSentenceDifficulty =
    (sentenceDifficultyElement && sentenceDifficultyElement.value) || 'auto';
  const sentenceDifficulty = resolveSentenceDifficulty(rawSentenceDifficulty, ageGroup);
  const sentencePreset = getSentenceDifficultyPreset(sentenceDifficulty);

  // 'auto' のときは既存の翻訳チェックボックスを尊重し、明示的指定時のみ
  // preset の規定値で上書き。
  const isAutoSentenceDifficulty = rawSentenceDifficulty === 'auto';
  const effectiveShowTranslation = isAutoSentenceDifficulty
    ? showTranslation
    : sentencePreset.showJapanese;

  // 行高さに応じた例文数は、実際に表示する翻訳有無で計算する。
  const lineHeight = parseInt(document.getElementById('lineHeight').value);
  const layoutInfo = clampLayoutToPool(
    calculateSentencePracticeLayout(lineHeight, effectiveShowTranslation),
    getFilteredSentencesForPractice(ageGroup, category, sentencePreset).length
  );
  const maxExamples = resolveLayoutValue(layoutInfo, layoutOverride?.maxExamples);

  const pageCount = Math.max(1, totalPages || 1);
  const sequence = ensureSentenceSequence(
    ageGroup,
    category,
    maxExamples,
    pageCount,
    sentenceDifficulty,
    sentencePreset
  );

  let pageExamples;
  if (sequence.length === 0) {
    // フィルタ後にゼロ件になった場合は従来の挙動（年齢グループ全体）に
    // フォールバック。これでバックワード互換性を維持する。
    ensureExamples(maxExamples, ageGroup, totalPages, category);
    const baseExampleIndex = (pageNumber - 1) * maxExamples;
    pageExamples = currentExamples.slice(baseExampleIndex, baseExampleIndex + maxExamples);
  } else {
    const startIndex = (pageNumber - 1) * maxExamples;
    pageExamples = sequence.slice(startIndex, startIndex + maxExamples);
  }

  pageExamples.forEach((example) => {
    if (!example) {
      return;
    }

    html += `
            <div class="sentence-practice-group">
                ${generateExampleSentence(example, effectiveShowTranslation)}
                <div class="practice-lines">
                    ${generateBaselineGroup()}
                    <div class="line-separator"></div>
                    ${generateBaselineGroup()}
                </div>
            </div>
        `;
  });

  return html;
}

// 例文を年齢グループ・カテゴリー・難易度プリセットでフィルタした結果を返す。
// カスタム例文も含めるが、`difficulty` プロパティが無い場合は通過させる
// （ユーザー定義は難易度の規定が無いため）。
function getFilteredSentencesForPractice(ageGroup, category, preset) {
  const baseSentences = EXAMPLE_SENTENCES_BY_AGE[ageGroup] || EXAMPLE_SENTENCES_BY_AGE['7-9'] || [];
  const categoryFiltered =
    category && category !== 'all'
      ? baseSentences.filter((s) => s && s.category === category)
      : baseSentences;

  const customForCategory = customExamples.filter(
    (e) =>
      e && e.ageGroup === ageGroup && (category === 'all' || !category || e.category === category)
  );

  const merged = [...categoryFiltered, ...customForCategory].filter(Boolean);

  return merged.filter((sentence) => {
    const wordCount = String(sentence.english || '')
      .split(/\s+/)
      .filter(Boolean).length;
    const passesLength = wordCount <= preset.maxLength;
    const sentenceDifficulty = Number.isFinite(sentence.difficulty) ? sentence.difficulty : 1;
    const passesDifficulty = sentenceDifficulty <= preset.difficultyMax;
    return passesLength && passesDifficulty;
  });
}

function highlightPhonicsPattern(word, focus) {
  const safeWord = String(word || '');
  const safeFocus = String(focus || '');

  if (!safeFocus) {
    return escapeHtml(safeWord);
  }

  const escapedFocus = safeFocus.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patternRegex = new RegExp(`(${escapedFocus})`, 'gi');

  return safeWord
    .split(patternRegex)
    .map((part) =>
      part.toLowerCase() === safeFocus.toLowerCase()
        ? `<span class="phonics-pattern-highlight">${escapeHtml(part)}</span>`
        : escapeHtml(part)
    )
    .join('');
}

function ensurePhonicsSequence(patternKey, perPage, pageCount, words) {
  const totalNeeded = perPage * pageCount;
  const fingerprint = words.map((word) => word?.english || '').join('|');
  const needsRefresh =
    phonicsSequenceCache.key !== patternKey ||
    phonicsSequenceCache.perPage !== perPage ||
    phonicsSequenceCache.pageCount !== pageCount ||
    phonicsSequenceCache.sequence.length < totalNeeded ||
    phonicsSequenceCache.fingerprint !== fingerprint;

  if (needsRefresh) {
    const generatedSequence = buildPhonicsWordSequenceImpl(
      patternKey,
      perPage,
      pageCount,
      PHONICS_DATA
    );
    const sequence =
      Array.isArray(generatedSequence) && generatedSequence.length
        ? generatedSequence
        : buildExtendedSequence(words, totalNeeded);

    phonicsSequenceCache = {
      key: patternKey,
      perPage,
      pageCount,
      fingerprint,
      sequence: sequence.slice(0, totalNeeded),
    };
  }

  return phonicsSequenceCache.sequence;
}

function generatePhonicsPractice(pageNumber, totalPages, layoutOverride = {}) {
  let html = '<div class="phonics-practice">';
  const phonicsPatternElement = document.getElementById('phonicsPattern');
  const requestedPattern = phonicsPatternElement ? phonicsPatternElement.value : '';
  const patternConfig = getPhonicsPatternConfigImpl(requestedPattern);

  if (!patternConfig) {
    html +=
      '<p class="phrase-empty">フォニックスデータを読み込めませんでした。ページを再読み込みしてください。</p>';
    html += '</div>';
    return html;
  }

  const lineHeight = parseInt(document.getElementById('lineHeight').value, 10);
  const safeWords = Array.isArray(patternConfig.words) ? patternConfig.words.filter(Boolean) : [];
  const layoutInfo = clampLayoutToPool(
    calculatePhonicsPracticeLayout(lineHeight),
    safeWords.length
  );
  const wordsPerPage = resolveLayoutValue(layoutInfo, layoutOverride?.wordsPerPage);
  const pageCount = Math.max(1, totalPages || 1);

  if (!safeWords.length) {
    html += '<p class="phrase-empty">このパターンには現在表示できる単語がありません。</p>';
    html += '</div>';
    return html;
  }

  const words = ensurePhonicsSequence(
    patternConfig.id || requestedPattern,
    wordsPerPage,
    pageCount,
    safeWords
  );
  const startIndex = (pageNumber - 1) * wordsPerPage;
  const pageWords = words.slice(startIndex, startIndex + wordsPerPage).filter(Boolean);
  const pageLabel = pageCount > 1 ? ` (${pageNumber}/${pageCount})` : '';

  html += `<h3 class="practice-title practice-title--phonics">Phonics Practice - ${escapeHtml(
    patternConfig.displayPattern || patternConfig.label || requestedPattern
  )}${pageLabel}</h3>`;
  html += `<p class="phonics-pattern-note">${escapeHtml(patternConfig.label || requestedPattern)} / ${escapeHtml(
    patternConfig.hint || ''
  )}</p>`;
  html += '<div class="phonics-grid">';

  if (!pageWords.length) {
    html +=
      '<p class="phrase-empty">このページに表示できる単語が不足しています。条件を変更してください。</p>';
    html += '</div></div>';
    return html;
  }

  for (const word of pageWords) {
    const patternBadgeText = escapeHtml(patternConfig.displayPattern || patternConfig.focus || '');

    html += `
            <div class="phonics-item">
                <div class="phonics-header">
                    <div class="phonics-main">
                        <div class="phonics-word">${highlightPhonicsPattern(word.english, patternConfig.focus)}</div>
                        <div class="phonics-japanese">${escapeHtml(word.japanese || '')}</div>
                    </div>
                    <span class="phonics-pattern-chip">${patternBadgeText}</span>
                </div>
                <div class="phonics-lines">
                    ${generateBaselineGroup(word.english)}
                    <div class="line-separator-small"></div>
                    ${generateBaselineGroup()}
                </div>
            </div>
        `;
  }

  html += '</div>';
  html += '</div>';
  return html;
}

// Phase 2: 単語練習モード生成
function generateWordPractice(pageNumber, totalPages, ageGroup, layoutOverride = {}) {
  let html = '<div class="word-practice">';

  // 単語カテゴリーを選択
  const category = document.getElementById('wordCategory').value || 'animals';
  const words =
    WORD_LISTS[category] && WORD_LISTS[category][ageGroup]
      ? WORD_LISTS[category][ageGroup]
      : WORD_LISTS['animals'][ageGroup] || WORD_LISTS['animals']['7-9'];

  const wordDifficultyElement = document.getElementById('wordDifficulty');
  const rawWordDifficulty = (wordDifficultyElement && wordDifficultyElement.value) || 'auto';
  const wordDifficulty = resolveWordDifficulty(rawWordDifficulty, ageGroup);
  const wordPreset = getWordDifficultyPreset(wordDifficulty);

  const categoryNames = {
    animals: '動物',
    food: '食べ物',
    colors: '色',
    numbers: '数字',
    calendar: '曜日・月',
    school_items: '学用品',
    body_parts: '身体',
    weather: '天気',
    classroom_objects: '教室の物',
    subjects: '教科',
    sports_activities: 'スポーツ・活動',
    emotions_advanced: '感情（上級）',
    academic_words: '学習用語',
  };

  const difficultyLabels = { easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい' };
  const pageCount = Math.max(1, totalPages || 1);
  const pageLabel = pageCount > 1 ? ` (${pageNumber}/${pageCount})` : '';
  html += `<h3 style="text-align: center; margin-bottom: 6mm;">Word Practice - ${categoryNames[category] || category}${pageLabel}</h3>`;
  html += `<p style="text-align: center; margin: 0 0 6mm; font-size: 10pt; color: #888;">${difficultyLabels[wordDifficulty] || ''}</p>`;

  // 行高さに応じて単語数を調整
  const lineHeight = parseInt(document.getElementById('lineHeight').value);
  const safeWords = Array.isArray(words) ? [...words] : [];
  // 何個載るかは autoAdjustPreview が実際の描画高さで決める（プリセット値は初期値）。
  // 難易度による見た目の差は音節・日本語の表示有無で付く。
  const layoutInfo = clampLayoutToPool(
    calculateWordPracticeLayout(lineHeight, wordPreset.maxWords),
    safeWords.length
  );
  const maxWords = Math.max(1, resolveLayoutValue(layoutInfo, layoutOverride?.maxWords));

  if (!safeWords.length) {
    html +=
      '<p style="text-align: center; color: #999;">表示できる単語が見つかりませんでした。</p></div>';
    return html;
  }

  // 難易度の選択は「同じカテゴリー・年齢でも違う並びで取り出す」ためのキー
  // 役割を兼ねる（cloze と同様）。
  const sequence = ensureWordSequence(
    category,
    ageGroup,
    maxWords,
    pageCount,
    safeWords,
    wordDifficulty
  );
  const startIndex = (pageNumber - 1) * maxWords;
  const displayWords = sequence.slice(startIndex, startIndex + maxWords);

  // ユーザーが明示的にチェックを操作するUIは現状ないため、preset で
  // 表示制御する（auto時は年齢、明示指定時はその値）。
  const showSyllables = wordPreset.showSyllables;
  const showJapanese = wordPreset.showJapanese;

  for (const word of displayWords) {
    if (!word) continue;
    const syllablesHtml = showSyllables
      ? `<span style="font-size: 12pt; color: #666;">${word.syllables}</span>`
      : '';
    const japaneseHtml = showJapanese
      ? `<span style="font-size: 12pt; color: #666;">${word.japanese}</span>`
      : '';

    html += `
            <div class="word-practice-item" style="margin-bottom: ${lineHeight === 12 ? '18mm' : lineHeight === 8 ? '10mm' : '12mm'};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2mm;">
                    <span style="font-size: 16pt; font-weight: bold;">${word.english}</span>
                    ${syllablesHtml}
                    ${japaneseHtml}
                </div>
                ${generateBaselineGroup()}
                <div class="line-separator-small"></div>
                ${generateBaselineGroup()}
            </div>
        `;
  }

  if (pageCount > 1) {
    html += `<p style="text-align: center; margin-top: 5mm; font-size: 9pt; color: #666;">Page ${pageNumber} / ${pageCount}</p>`;
  }

  html += '</div>';
  return html;
}

// ベースライングループ生成
// horizRepeat > 1 で薄字ガイドを行内に複数回繰り返し描画する（なぞり書き用）
function generateBaselineGroup(guideText = '', horizRepeat = 1) {
  let traceGuide = '';
  if (typeof guideText === 'string' && guideText.trim()) {
    const safe = escapeHtml(guideText.trim());
    const count = Math.max(1, horizRepeat | 0);
    const spans = Array.from({ length: count }, () => `<span>${safe}</span>`).join('');
    traceGuide = `<div class="guide-letter ${getTraceGuideClass(guideText)}">${spans}</div>`;
  }
  const traceClass = traceGuide ? ' baseline-group--trace' : '';

  return `
        <div class="baseline-group${traceClass}">
            ${traceGuide}
            <div class="baseline baseline--top"></div>
            <div class="baseline baseline--upper"></div>
            <div class="baseline baseline--lower"></div>
            <div class="baseline baseline--bottom"></div>
        </div>
    `;
}

const TRACE_ASCENDERS = new Set(['b', 'd', 'f', 'h', 'k', 'l', 't']);
const TRACE_DESCENDERS = new Set(['g', 'j', 'p', 'q', 'y']);

function getTraceGuideClass(text) {
  const value = (text || '').trim();
  if (/^[a-z]$/.test(value)) {
    if (TRACE_ASCENDERS.has(value)) return 'guide-letter--lowercase-ascender';
    if (TRACE_DESCENDERS.has(value)) return 'guide-letter--lowercase-descender';
    return 'guide-letter--lowercase-short';
  }

  if (/^[a-z]+$/.test(value)) {
    return 'guide-letter--lowercase-word';
  }

  if (/^[A-Z][a-z]+$/.test(value)) {
    return 'guide-letter--mixed-word';
  }

  return 'guide-letter--uppercase';
}

// テキスト長に応じた行内なぞり数を返す（短い文字ほど多く並べる）
function horizRepeatForText(text, lineHeight = 10) {
  const len = (text || '').trim().length;
  if (len <= 1) return 7;
  if (len <= 3) return lineHeight >= 12 ? 3 : 4;
  if (len <= 5) return lineHeight >= 12 ? 2 : 3;
  if (len <= 7) return 2;
  return 2;
}

// 例文表示生成
function generateExampleSentence(sentence, showTranslation) {
  const difficulty = '★'.repeat(sentence.difficulty || 1);
  const english = escapeHtml(sentence.english || '');
  const japanese = escapeHtml(sentence.japanese || '');
  return `
        <div class="example-sentence">
            <div class="example-english">
                ${english}
                <span style="font-size: 10pt; color: #999; margin-left: 5mm;">${difficulty}</span>
            </div>
            ${showTranslation ? `<div class="example-japanese">${japanese}</div>` : ''}
        </div>
    `;
}

// 例文を確保
function ensureExamples(countPerPage, ageGroup, pageCount, category) {
  const pages = Math.max(1, pageCount || 1);
  const totalNeeded = countPerPage * pages;
  const cacheKey = `${ageGroup}|${category}`;
  const needsRefresh =
    currentExamples.length < totalNeeded ||
    currentExamplesMeta.key !== cacheKey ||
    currentExamplesMeta.perPageCount !== countPerPage ||
    currentExamplesMeta.pageCount !== pages;

  if (!countPerPage) {
    setCurrentExamples([]);
    return;
  }

  if (needsRefresh) {
    const examples = getRandomExamples(totalNeeded, ageGroup, category);
    setCurrentExamples(examples);
    currentExamplesMeta = { key: cacheKey, perPageCount: countPerPage, pageCount: pages };
  }
}

// ランダムな例文を取得
function getRandomExamples(count, ageGroup, category = 'all') {
  let sentences = EXAMPLE_SENTENCES_BY_AGE[ageGroup] || EXAMPLE_SENTENCES_BY_AGE['7-9'];

  // カテゴリーでフィルタリング
  if (category !== 'all') {
    sentences = sentences.filter((s) => s.category === category);
  }

  const allSentences = [
    ...sentences,
    ...customExamples.filter(
      (e) => e.ageGroup === ageGroup && (category === 'all' || e.category === category)
    ),
  ];
  const safeSentences = Array.isArray(allSentences) ? allSentences.filter(Boolean) : [];
  if (!safeSentences.length) {
    return [];
  }

  const shuffled = shuffleArray(safeSentences);
  if (shuffled.length >= count) {
    return shuffled.slice(0, count);
  }

  return buildExtendedSequence(shuffled, count);
}

// 現在の例文をシャッフル
function shuffleCurrentExamples() {
  setCurrentExamples([]);
  resetExampleCacheMeta();
  resetSentenceCache();
}

// 印刷機能
function printNote() {
  // 印刷前に品質チェックを実行
  if (window.LayoutValidator && window.PrintSimulator) {
    const validator = new window.LayoutValidator();
    const simulator = new window.PrintSimulator();

    // レイアウト検証
    const layoutReport = validator.generateReport();

    // 印刷シミュレーション
    const printQuality = simulator.diagnose();

    // エラーがある場合は警告
    if (layoutReport.errors.length > 0 || printQuality.grade === 'D') {
      const errorMessages = layoutReport.errors.map((e) => e.message).join('\n');
      const warningMessages = layoutReport.warnings.map((w) => w.message).join('\n');

      let message = '⚠️ 印刷品質に問題が検出されました:\n\n';
      if (errorMessages) {
        message += '【エラー】\n' + errorMessages + '\n\n';
      }
      if (warningMessages) {
        message += '【警告】\n' + warningMessages + '\n\n';
      }
      message += `品質スコア: ${printQuality.score}/100 (${printQuality.grade})\n\n`;
      message += 'このまま印刷しますか？';

      if (!confirm(message)) {
        /* eslint-disable-next-line no-console */
        console.log('印刷がキャンセルされました');
        return;
      }
    }

    // 警告のみの場合は情報表示
    if (layoutReport.warnings.length > 0 && layoutReport.errors.length === 0) {
      /* eslint-disable-next-line no-console */
      console.info('印刷品質に軽微な警告があります:', layoutReport.warnings);
    }
  }

  window.print();
}

// 印刷プレビュー機能
function showPrintPreview() {
  if (window.Debug) {
    window.Debug.startTimer('print-preview');
    window.Debug.logEvent('click', { id: 'previewBtn' }, { action: 'showPrintPreview' });
  }

  const modal = document.getElementById('printPreviewModal');
  const previewPage = document.getElementById('a4Preview');
  const notePreview = document.getElementById('notePreview');

  // 要素の存在確認
  if (!modal || !previewPage || !notePreview) {
    if (window.Debug)
      window.Debug.error('PRINT_PREVIEW', '印刷プレビューに必要な要素が見つかりません', {
        modal: !!modal,
        previewPage: !!previewPage,
        notePreview: !!notePreview,
      });
    return;
  }

  if (window.Debug)
    window.Debug.debug('PRINT_PREVIEW', '必要な要素が見つかりました', {
      modal: !!modal,
      notePreview: !!notePreview,
      previewPage: !!previewPage,
    });

  // 現在のプレビュー内容をコピーして印刷用にスタイル調整
  previewPage.innerHTML = notePreview.innerHTML;

  // 画面プレビュー用の縮小指定（枠の高さ・中央寄せ）は印刷プレビューでは不要
  previewPage.querySelectorAll('.note-page-frame').forEach((frame) => {
    frame.style.height = '';
  });
  previewPage.querySelectorAll('.note-page').forEach((page) => {
    page.style.marginLeft = '';
  });

  // プレビューページに印刷用の余白設定を適用（統一設定を使用）
  const previewNotePages = previewPage.querySelectorAll('.note-page');
  const standardMargin = getComputedStyle(document.documentElement)
    .getPropertyValue('--margin-standard')
    .trim();

  previewNotePages.forEach((page) => {
    page.style.padding = standardMargin; // CSS変数から取得した標準余白
    page.style.boxShadow = 'none'; // 印刷では影なし
    page.style.maxWidth = 'none'; // 印刷では幅制限なし
  });

  if (window.Debug)
    window.Debug.debug('PRINT_PREVIEW', 'プレビュー内容をコピーし印刷用スタイルを適用しました', {
      contentLength: previewPage.innerHTML.length,
      pageCount: previewNotePages.length,
    });

  // モーダルを表示（display属性とクラスの両方を使用）
  modal.style.display = 'flex';
  // 少し遅延を入れてからクラスを追加（アニメーション効果のため）
  setTimeout(() => {
    modal.classList.add('modal-visible');
    if (window.Debug) {
      window.Debug.log('PRINT_PREVIEW', 'モーダルを表示しました', {
        display: modal.style.display,
        classList: modal.classList.toString(),
      });
      window.Debug.endTimer('print-preview');
    }
  }, 10);

  // ズーム機能の初期化
  initializePreviewZoom();

  // モーダルのイベントリスナーを設定
  setupPreviewModalEvents();
}

// プレビューのズーム機能
let currentZoom = 60;
const zoomLevels = [50, 60, 70, 80, 90, 100];

function initializePreviewZoom() {
  currentZoom = 60;
  updateZoomDisplay();
}

function updateZoomDisplay() {
  const previewPage = document.getElementById('a4Preview');
  const zoomLevel = document.getElementById('zoomLevel');

  // 既存のズームクラスを削除
  zoomLevels.forEach((level) => {
    previewPage.classList.remove(`zoom-${level}`);
  });

  // 新しいズームクラスを追加
  previewPage.classList.add(`zoom-${currentZoom}`);
  zoomLevel.textContent = `${currentZoom}%`;
}

function zoomIn() {
  const currentIndex = zoomLevels.indexOf(currentZoom);
  if (currentIndex < zoomLevels.length - 1) {
    currentZoom = zoomLevels[currentIndex + 1];
    updateZoomDisplay();
  }
}

function zoomOut() {
  const currentIndex = zoomLevels.indexOf(currentZoom);
  if (currentIndex > 0) {
    currentZoom = zoomLevels[currentIndex - 1];
    updateZoomDisplay();
  }
}

function setupPreviewModalEvents() {
  const modal = document.getElementById('printPreviewModal');
  const closeBtn = document.getElementById('closePreviewBtn');
  const cancelBtn = document.getElementById('cancelPreviewBtn');
  const printBtn = document.getElementById('printFromPreviewBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');

  // 要素の存在確認
  if (!modal) {
    if (window.Debug) window.Debug.error('PRINT_PREVIEW', 'モーダル要素が見つかりません');
    return;
  }

  // 閉じるボタン
  const closePreview = () => {
    if (window.Debug) window.Debug.log('PRINT_PREVIEW', 'プレビューモーダルを閉じます');
    modal.style.display = 'none';
    modal.classList.remove('modal-visible');
  };

  if (closeBtn) closeBtn.onclick = closePreview;
  if (cancelBtn) cancelBtn.onclick = closePreview;

  // モーダル外クリックで閉じる
  modal.onclick = (e) => {
    if (e.target === modal) {
      closePreview();
    }
  };

  // ESCキーで閉じる
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closePreview();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);

  // 印刷実行
  if (printBtn) {
    printBtn.onclick = () => {
      closePreview();
      setTimeout(() => {
        printNote();
      }, 100);
    };
  }

  // ズーム
  if (zoomInBtn) zoomInBtn.onclick = zoomIn;
  if (zoomOutBtn) zoomOutBtn.onclick = zoomOut;
}

// PDFレイアウトの自動テスト機能
function runLayoutTest() {
  if (window.Debug)
    window.Debug.log('TEST', 'PDFレイアウトテスト実行開始', {
      timestamp: new Date().toLocaleString(),
    });

  const validator = new window.LayoutValidator();
  const report = validator.generateReport();

  // テスト結果のサマリー
  if (window.Debug) {
    window.Debug.log('TEST', 'テスト結果サマリー', {
      passed: report.summary.passed,
      failed: report.summary.failed,
      skipped: report.summary.skipped,
    });
  }

  // エラーの詳細
  if (report.errors.length > 0) {
    report.errors.forEach((error) => {
      if (window.Debug)
        window.Debug.error(
          'LAYOUT_VALIDATION',
          `- ${error.rule}: ${error.actualValue} (期待値: ${error.expectedRange})`
        );
    });
  }

  // 警告の詳細
  if (report.warnings.length > 0) {
    report.warnings.forEach((warning) => {
      if (window.Debug)
        window.Debug.warn(
          'LAYOUT_VALIDATION',
          `- ${warning.rule}: ${warning.actualValue} (期待値: ${warning.expectedRange})`
        );
    });
  }

  // ページ高さのチェック結果を強調
  const pageHeightErrors = report.errors.filter((e) => e.rule.startsWith('pageHeight'));
  if (pageHeightErrors.length > 0) {
    pageHeightErrors.forEach((error) => {
      if (window.Debug) window.Debug.error('LAYOUT_VALIDATION', error.message);
    });
  }

  // 最終判定
  const isPassed = report.errors.length === 0;
  if (isPassed) {
    if (window.Debug)
      window.Debug.log('TEST', 'すべてのレイアウトテストに合格しました！', { status: 'success' });
  } else {
    if (window.Debug)
      window.Debug.error('TEST', 'レイアウトに問題があります。印刷結果を確認してください。', {
        errors: report.errors,
      });
  }

  // Group end removed - using structured logging instead

  return report;
}

// 初期化実行
document.addEventListener('DOMContentLoaded', () => {
  modulesReady
    .then(() => {
      init();
    })
    .catch((error) => {
      reportInitializationFailure(error);
    });
});

// デバッグ機能
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    document.body.classList.toggle('debug-mode');
    if (window.Debug)
      window.Debug.log('DEBUG', 'Debug mode toggled', {
        enabled: document.body.classList.contains('debug-mode'),
      });
  }

  // Ctrl + Shift + T でレイアウトテスト実行
  if (e.ctrlKey && e.shiftKey && e.key === 'T') {
    if (window.Debug) window.Debug.log('TEST', '手動レイアウトテストを実行します...');
    runLayoutTest();
  }
});

// グローバルに公開（開発者コンソールから実行可能）
window.testPDFLayout = function () {
  if (window.Debug) window.Debug.log('TEST', 'PDFレイアウトテストを開始します...');
  updatePreview(); // プレビューを最新状態に更新
  setTimeout(() => {
    const report = runLayoutTest();

    // 追加の診断情報
    if (window.Debug) {
      window.Debug.log('DIAGNOSTICS', '追加診断情報', {
        practiceMode: document.getElementById('practiceMode').value,
        pageCount: document.getElementById('pageCount').value,
        lineHeight: document.getElementById('lineHeight').value + 'mm',
      });
    }

    // ページごとの高さ情報
    const pages = document.querySelectorAll('.note-page');
    pages.forEach((page, index) => {
      // 縮小表示の影響を受けない実寸で測る
      const heightInMm = page.offsetHeight / 3.7795275591;
      if (window.Debug)
        window.Debug.debug('DIAGNOSTICS', `ページ${index + 1}の高さ`, {
          height: `${heightInMm.toFixed(2)}mm`,
        });
    });
    // Group end removed - using structured logging instead

    return report;
  }, 100);
};

// カスタム例文を追加するハンドラ
function handleAddCustomExample() {
  const english = document.getElementById('customEnglish').value.trim();
  const japanese = document.getElementById('customJapanese').value.trim();
  const ageGroup = document.getElementById('ageGroup').value;
  const category = document.getElementById('exampleCategory').value || 'daily';

  if (!english || !japanese) {
    alert('英語と日本語の両方を入力してください。');
    return;
  }

  addCustomExample(english, japanese, category, ageGroup);

  // 入力フィールドをクリア
  document.getElementById('customEnglish').value = '';
  document.getElementById('customJapanese').value = '';

  alert('カスタム例文を追加しました！');
}

// アルファベット練習モード生成
function generateAlphabetPractice(pageNumber) {
  const alphabetType = document.getElementById('alphabetType').value;
  const showExample = document.getElementById('showAlphabetExample').checked;
  const alphabetMode = document.getElementById('alphabetMode')?.value || 'normal';
  const isTrace = alphabetMode === 'trace';
  const traceRepeat = clampInt(document.getElementById('alphabetTraceRepeat')?.value, 1, 5, 3);
  const wordCount = clampInt(document.getElementById('alphabetWordCount')?.value, 1, 3, 2);
  const lineHeight = clampInt(document.getElementById('lineHeight')?.value, 8, 12, 10);

  let letters = [];
  if (alphabetType === 'uppercase' || alphabetType === 'both') {
    letters = letters.concat(ALPHABET_DATA.uppercase);
  }
  if (alphabetType === 'lowercase' || alphabetType === 'both') {
    letters = letters.concat(ALPHABET_DATA.lowercase);
  }

  // 通常: 2列×3行=6 / なぞり書き: A4 高さ (297mm − 余白 − タイトル ≒ 260mm) に収まる文字数を密度から逆算
  const lettersPerPage = isTrace
    ? computeTraceLettersPerPage(traceRepeat, wordCount, showExample, lineHeight)
    : 6;
  const startIndex = (pageNumber - 1) * lettersPerPage;
  const endIndex = startIndex + lettersPerPage;
  const currentPageLetters = letters.slice(startIndex, endIndex);

  // 空のページの場合は何も表示しない
  if (currentPageLetters.length === 0) {
    return '<div class="alphabet-practice"><p style="text-align: center; color: #999;">このページには表示する文字がありません</p></div>';
  }

  // pageCount の自動引き上げは updatePreview() の bumpPageCountForAlphabet() が
  // レンダー前に同期で済ませるため、ここでは何もしない（再帰呼び出し回避）。

  let html = '<div class="alphabet-practice">';

  // タイトルにページ情報を追加
  const totalPages = Math.ceil(letters.length / lettersPerPage);
  html += `<h3 class="practice-title">Alphabet Practice ${totalPages > 1 ? `(${pageNumber}/${totalPages})` : ''}</h3>`;

  const gridClass = isTrace ? 'alphabet-grid alphabet-grid--tracing' : 'alphabet-grid';
  html += `<div class="${gridClass}">`;

  for (let i = 0; i < currentPageLetters.length; i++) {
    const item = currentPageLetters[i];
    const itemWords = Array.isArray(item.words) ? item.words.slice(0, wordCount) : [];

    let bodyHtml = '';

    if (isTrace) {
      // なぞり書き: 文字 + 例示単語ごとに薄字ガイド付きベースラインを repeat 本描画
      bodyHtml += `<div class="alphabet-trace-row">
                <div class="alphabet-trace-label"><span class="alphabet-trace-letter">${escapeHtml(item.letter)}</span></div>
                <div class="alphabet-trace-lines">${repeatBaselineGroup(item.letter, traceRepeat, lineHeight)}</div>
            </div>`;
      if (showExample) {
        for (const word of itemWords) {
          bodyHtml += `<div class="alphabet-trace-row">
                    <div class="alphabet-trace-label">
                        <span class="example-word">${escapeHtml(word.english)}</span>
                        <span class="example-meaning">(${escapeHtml(word.japanese)})</span>
                    </div>
                    <div class="alphabet-trace-lines">${repeatBaselineGroup(word.english, traceRepeat, lineHeight)}</div>
                </div>`;
        }
      }
    } else {
      const exampleHtml =
        showExample && itemWords.length > 0
          ? `<div class="alphabet-example">${itemWords
              .map(
                (w) =>
                  `<span class="example-word">${escapeHtml(w.english)}</span>` +
                  `<span class="example-meaning">(${escapeHtml(w.japanese)})</span>`
              )
              .join('<span class="example-separator">/</span>')}</div>`
          : '';
      bodyHtml = `<div class="alphabet-header">
                <span class="alphabet-letter">${escapeHtml(item.letter)}</span>
                ${exampleHtml}
            </div>
            <div class="alphabet-lines">
                ${generateBaselineGroup()}
            </div>`;
    }

    html += `<div class="alphabet-grid-item">${bodyHtml}</div>`;
  }

  html += '</div>'; // alphabet-grid
  html += '</div>'; // alphabet-practice
  return html;
}

// 薄字ガイド付きベースラインを n 本連続で生成（行内には複数回なぞれるよう horizRepeat 個並べる）
function repeatBaselineGroup(guideText, count, lineHeight = null) {
  const effectiveLineHeight =
    lineHeight ?? clampInt(document.getElementById('lineHeight')?.value, 8, 12, 10);
  const horiz = horizRepeatForText(guideText, effectiveLineHeight);
  let out = '';
  for (let i = 0; i < count; i++) {
    out += generateBaselineGroup(guideText, horiz);
  }
  return out;
}

// 整数クランプヘルパー（select 値の安全パース用）
function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// なぞり書き時の 1 ページあたり文字数を A4 高さから逆算
// 1セル=(1+wordCount)行 × repeat 本。罫線高さの設定に合わせて行間も再計算する。
// タイトル、ページパディング、セル間ギャップを差し引き、例示単語ありでは少し保守的に見積もる。
function computeTraceLettersPerPage(repeat, wordCount, showExample, lineHeight = 10) {
  const rowsPerCell = 1 + (showExample ? wordCount : 0);
  const lineSpacingMm = Math.max(1, Math.floor(lineHeight * 0.2));
  const rowMarginMm = 3;
  const cellHeightMm = rowsPerCell * (repeat * (lineHeight + lineSpacingMm) + rowMarginMm);
  const interCellGapMm = 5;
  const availableMm = showExample ? 250 : 260;
  const fit = Math.floor((availableMm + interCellGapMm) / (cellHeightMm + interCellGapMm));
  return Math.max(1, fit);
}

// フレーズ練習モード生成
function generatePhrasePractice(
  pageNumber,
  totalPages,
  showTranslation,
  ageGroup,
  layoutOverride = {}
) {
  let html = '<div class="phrase-practice">';
  const phraseCategoryElement = document.getElementById('phraseCategory');
  const phraseCategory = (phraseCategoryElement && phraseCategoryElement.value) || 'greetings';
  const userShowSituation = Boolean(document.getElementById('showSituation')?.checked);
  const lineHeight = parseInt(document.getElementById('lineHeight').value);

  const phraseDifficultyElement = document.getElementById('phraseDifficulty');
  const rawPhraseDifficulty = (phraseDifficultyElement && phraseDifficultyElement.value) || 'auto';
  const phraseDifficulty = resolvePhraseDifficulty(rawPhraseDifficulty, ageGroup);
  const phrasePreset = getPhraseDifficultyPreset(phraseDifficulty);

  // 'auto' のときは既存のユーザー操作チェックボックスを尊重し、明示的に
  // 難易度を選んだ場合は preset の規定値で上書きする。
  const isAutoPhraseDifficulty = rawPhraseDifficulty === 'auto';
  const effectiveShowTranslation = isAutoPhraseDifficulty
    ? showTranslation
    : phrasePreset.showTranslation;
  const effectiveShowSituation = isAutoPhraseDifficulty
    ? userShowSituation
    : phrasePreset.showSituation;

  if (window.Debug) {
    window.Debug.log('PHRASE_PRACTICE', 'フレーズ練習生成開始', {
      category: phraseCategory,
      ageGroup,
      showTranslation: effectiveShowTranslation,
      showSituation: effectiveShowSituation,
      difficulty: phraseDifficulty,
    });
  }

  // 選択年齢のフレーズだけを使う（他年齢を混ぜると漢字レベルが合わなくなる）
  const safePhrases = getPhrasePool(phraseCategory, ageGroup);

  // 何問載るかは autoAdjustPreview が実際の描画高さで決める（プリセット値は初期値）。
  // 1枚の中で同じ問題が重なるのを防ぐため、上限はプールの件数に収める。
  const layoutInfo = clampLayoutToPool(
    calculatePhrasePracticeLayout(lineHeight, phrasePreset.maxPhrases),
    safePhrases.length
  );
  const phrasesPerPage = Math.max(
    1,
    resolveLayoutValue(layoutInfo, layoutOverride?.phrasesPerPage)
  );
  const pageCount = Math.max(1, totalPages || 1);
  const totalDesiredCount = phrasesPerPage * pageCount;

  if (!safePhrases.length) {
    if (window.Debug) {
      window.Debug.warn('PHRASE_PRACTICE', '選択可能なフレーズが見つかりませんでした', {
        category: phraseCategory,
        ageGroup,
      });
    }

    return `
        <div class="phrase-practice">
            <p class="phrase-empty">このカテゴリーには現在表示できるフレーズがありません。</p>
        </div>
    `;
  }

  const phrases = ensurePhraseSequence(
    phraseCategory,
    ageGroup,
    phrasesPerPage,
    pageCount,
    safePhrases,
    phraseDifficulty
  );

  const startIndex = (pageNumber - 1) * phrasesPerPage;
  const pagePhrases = phrases.slice(startIndex, startIndex + phrasesPerPage).filter(Boolean);

  if (!pagePhrases.length) {
    html +=
      '<p class="phrase-empty">このページに表示できるフレーズが不足しています。条件を変更してください。</p>';
    html += '</div>';
    return html;
  }

  const usageSummary = phrases.reduce((acc, phrase) => {
    const key = (phrase.usageFrequency || 'common').toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const focusSummary = new Set();
  const patternSummary = phrases.reduce((acc, phrase) => {
    const key = (phrase.pattern || 'statement').toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    (phrase.focusWords || []).forEach((word) => focusSummary.add(word));
    return acc;
  }, {});

  if (window.Debug) {
    window.Debug.log('PHRASE_PRACTICE', '多様性を考慮したフレーズを選択', {
      selectedCount: phrases.length,
      desiredCount: totalDesiredCount,
      usageSummary,
      patternSummary,
      focusWords: Array.from(focusSummary).slice(0, 10),
    });
  }

  const categoryNames = CATEGORY_NAMES;

  const usageLabels = {
    core: 'よく使う',
    common: '日常',
    situational: '場面',
    critical: '緊急',
    specialized: 'トピック',
  };

  const phraseDifficultyLabels = { easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい' };
  const pageLabel = pageCount > 1 ? ` (${pageNumber}/${pageCount})` : '';
  html += `<h3 class="practice-title practice-title--phrase">Phrase Practice - ${categoryNames[phraseCategory] || phraseCategory}${pageLabel}</h3>`;
  html += `<p class="phrase-difficulty-label" style="text-align:center;margin:0 0 4mm;font-size:9pt;color:#888;">${phraseDifficultyLabels[phraseDifficulty] || ''}</p>`;
  html += '<div class="phrase-grid">';

  for (const phrase of pagePhrases) {
    const usageKey = (phrase.usageFrequency || 'common').toLowerCase();
    const usageLabel = usageLabels[usageKey];
    const usageBadge = usageLabel
      ? `<span class="phrase-usage usage-${usageKey}">${usageLabel}</span>`
      : '';
    const focusWords = Array.isArray(phrase.focusWords)
      ? phrase.focusWords.filter(Boolean).slice(0, 3)
      : [];
    const focusWordsHtml = focusWords.length
      ? `
            <div class="phrase-focus-words">
                <span class="phrase-focus-label">覚えたい単語</span>
                ${focusWords.map((word) => `<span class="phrase-focus-token">${word}</span>`).join('')}
            </div>
        `
      : '';
    const metaHtml =
      usageBadge || focusWordsHtml
        ? `<div class="phrase-meta">${usageBadge}${focusWordsHtml}</div>`
        : '';

    html += `
            <div class="phrase-item">
                <div class="phrase-header">
                    <div class="phrase-main">
                        <div class="phrase-english">${phrase.english}</div>
                        ${effectiveShowTranslation ? `<div class="phrase-japanese">${phrase.japanese}</div>` : ''}
                    </div>
                    ${effectiveShowSituation && phrase.situation ? `<div class="phrase-situation">【${phrase.situation}】</div>` : ''}
                </div>
                ${metaHtml}
                <div class="phrase-lines">
                    ${generateBaselineGroup()}
                    <div class="line-separator-small"></div>
                    ${generateBaselineGroup()}
                    <div class="line-separator-small"></div>
                    ${generateBaselineGroup()}
                </div>
            </div>
        `;
  }

  html += '</div>';
  html += '</div>';
  return html;
}

function getPhraseCapacity(lineHeight) {
  // 利用可能な高さは余白(上下10mm)を除いた277mm
  const availableHeight = 277; // mm
  const itemHeight = 17 + 2 * lineHeight;
  const maxItems = Math.max(1, Math.floor(availableHeight / itemHeight));

  // 実測で余裕を残すため 60% の安全率を適用（行高12mmはさらに厳しめ）
  const safetyFactor = lineHeight >= 12 ? 0.55 : 0.6;
  const safeItems = Math.max(1, Math.floor(maxItems * safetyFactor));

  // 4問を上限としつつ、最低でも3問は確保（auto adjustで2問まで減らせる想定）
  const cappedItems = Math.min(4, safeItems);
  return cappedItems >= 3 ? cappedItems : Math.max(2, cappedItems);
}

function selectDiversePhrases(phrases, desiredCount) {
  if (!Array.isArray(phrases) || phrases.length === 0) {
    return [];
  }

  if (phrases.length <= desiredCount) {
    return shuffleArray(phrases).slice(0, desiredCount);
  }

  const orderedCandidates = interleavePhrasesByUsage(phrases);
  const selected = [];
  const patternCounts = new Map();
  const focusCoverage = new Set();

  const selectionPasses = [
    (phrase) => hasNewFocusWord(phrase, focusCoverage),
    (phrase) => (phrase.focusWords || []).length > 0,
    () => true,
  ];

  for (const predicate of selectionPasses) {
    for (const phrase of orderedCandidates) {
      if (selected.length >= desiredCount) {
        break;
      }
      if (selected.includes(phrase)) {
        continue;
      }
      if (!predicate(phrase)) {
        continue;
      }

      const patternKey = (phrase.pattern || 'statement').toLowerCase();
      const patternLimit = PHRASE_PATTERN_LIMITS[patternKey] ?? PHRASE_PATTERN_LIMITS.other;
      if ((patternCounts.get(patternKey) || 0) >= patternLimit) {
        continue;
      }

      selected.push(phrase);
      patternCounts.set(patternKey, (patternCounts.get(patternKey) || 0) + 1);
      (phrase.focusWords || []).forEach((word) => focusCoverage.add(normaliseFocusWord(word)));
    }

    if (selected.length >= desiredCount) {
      break;
    }
  }

  if (selected.length < desiredCount) {
    for (const phrase of orderedCandidates) {
      if (selected.length >= desiredCount) {
        break;
      }
      if (selected.includes(phrase)) {
        continue;
      }
      selected.push(phrase);
    }
  }

  return selected.slice(0, desiredCount);
}

function interleavePhrasesByUsage(phrases) {
  const usageBuckets = new Map();

  for (const phrase of phrases) {
    const usage = normaliseUsage(phrase);
    if (!usageBuckets.has(usage)) {
      usageBuckets.set(usage, []);
    }
    usageBuckets.get(usage).push(phrase);
  }

  const usageOrder = Array.from(
    new Set([
      ...PHRASE_USAGE_PRIORITY,
      ...Array.from(usageBuckets.keys()).filter((usage) => !PHRASE_USAGE_PRIORITY.includes(usage)),
    ])
  );

  for (const usage of usageBuckets.keys()) {
    usageBuckets.set(usage, shuffleArray(usageBuckets.get(usage)));
  }

  const interleaved = [];
  let hasMore = true;
  while (hasMore) {
    hasMore = false;
    for (const usage of usageOrder) {
      const bucket = usageBuckets.get(usage);
      if (bucket && bucket.length > 0) {
        interleaved.push(bucket.shift());
        hasMore = true;
      }
    }
  }

  return interleaved;
}

function hasNewFocusWord(phrase, focusCoverage) {
  if (!phrase.focusWords || phrase.focusWords.length === 0) {
    return false;
  }

  return phrase.focusWords.some((word) => !focusCoverage.has(normaliseFocusWord(word)));
}

function normaliseFocusWord(word) {
  return String(word || '')
    .trim()
    .toLowerCase();
}

function normaliseUsage(phrase) {
  return String((phrase.usageFrequency || 'common').toLowerCase());
}

function shuffleArray(array) {
  const clone = Array.isArray(array) ? [...array] : [];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function buildExtendedSequence(source, desiredLength) {
  if (!Array.isArray(source) || source.length === 0 || desiredLength <= 0) {
    return [];
  }

  const result = [];
  let working = shuffleArray(source);
  let index = 0;

  while (result.length < desiredLength) {
    if (index >= working.length) {
      working = shuffleArray(source);
      index = 0;
    }
    result.push(working[index]);
    index += 1;
  }

  return result.slice(0, desiredLength);
}

function ensureWordSequence(category, ageGroup, perPage, pageCount, words, difficulty) {
  const key = `${category}|${ageGroup}|${difficulty || 'auto'}`;
  const totalNeeded = perPage * pageCount;
  const fingerprint = words.map((word) => word?.english || '').join('|');
  const needsRefresh =
    wordSequenceCache.key !== key ||
    wordSequenceCache.perPage !== perPage ||
    wordSequenceCache.pageCount !== pageCount ||
    wordSequenceCache.sequence.length < totalNeeded ||
    wordSequenceCache.fingerprint !== fingerprint;

  if (needsRefresh) {
    const sequence = buildPagedUniqueSequence(words, perPage, pageCount, (w) => w?.english);
    wordSequenceCache = {
      key,
      perPage,
      pageCount,
      fingerprint,
      sequence: sequence.slice(0, totalNeeded),
    };
  }

  return wordSequenceCache.sequence;
}

function ensurePhraseSequence(category, ageGroup, perPage, pageCount, phrases, difficulty) {
  const key = `${category}|${ageGroup}|${difficulty || 'auto'}`;
  const totalNeeded = perPage * pageCount;
  const fingerprint = phrases.map((phrase) => phrase?.english || '').join('|');
  const needsRefresh =
    phraseSequenceCache.key !== key ||
    phraseSequenceCache.perPage !== perPage ||
    phraseSequenceCache.pageCount !== pageCount ||
    phraseSequenceCache.sequence.length < totalNeeded ||
    phraseSequenceCache.fingerprint !== fingerprint;

  if (needsRefresh) {
    const sequence = buildPagedUniqueSequence(phrases, perPage, pageCount, (p) => p?.english);
    phraseSequenceCache = {
      key,
      perPage,
      pageCount,
      fingerprint,
      sequence: sequence.slice(0, totalNeeded),
    };
  }

  return phraseSequenceCache.sequence;
}

function ensureSentenceSequence(ageGroup, category, perPage, pageCount, difficulty, preset) {
  const key = `${ageGroup}|${category}|${difficulty || 'auto'}`;
  const totalNeeded = perPage * pageCount;
  const needsRefresh =
    sentenceSequenceCache.key !== key ||
    sentenceSequenceCache.perPage !== perPage ||
    sentenceSequenceCache.pageCount !== pageCount ||
    (!sentenceSequenceCache.emptySource && sentenceSequenceCache.sequence.length < totalNeeded);

  if (needsRefresh) {
    const filteredSentences = getFilteredSentencesForPractice(ageGroup, category, preset);
    if (filteredSentences.length === 0) {
      sentenceSequenceCache = {
        key,
        perPage,
        pageCount,
        fingerprint: '',
        sequence: [],
        emptySource: true,
      };
      return sentenceSequenceCache.sequence;
    }

    const fingerprint = filteredSentences.map((sentence) => sentence?.english || '').join('|');
    const sequence = buildPagedUniqueSequence(
      filteredSentences,
      perPage,
      pageCount,
      (s) => s?.english
    );
    sentenceSequenceCache = {
      key,
      perPage,
      pageCount,
      fingerprint,
      sequence: sequence.slice(0, totalNeeded),
      emptySource: false,
    };
  }

  return sentenceSequenceCache.sequence;
}

// === 穴埋めフレーズ練習（Cloze Practice） ===

// A4（210×297mm・余白10mm）で実測したレイアウト値。
// 1問の高さは「番号＋英文1行＋日本語1行＋内部余白（≒12.4mm）＋罫線の高さ」で、
// 英文が折り返すと1行あたり約6mm増える。折り返し数は文の長さと空所の数で変わり
// 事前には確定しないため、ここでは英文1行の場合の上限だけを出し、実際の高さ超過は
// autoAdjustPreview の再描画ループが1問ずつ減らして解消する。
const CLOZE_LAYOUT_MM = {
  usableHeight: 277,
  titleBlock: 26,
  itemGap: 1.5,
  itemBase: 12.4,
  answersTop: 8,
  answersRowHeight: 4.6,
  answersPerRow: 2,
};

// 折り返しの多い問題文でも収まるところまで減らせるよう、下限は小さめに取る
const CLOZE_MIN_ITEMS = 3;

function calculateClozePracticeLayout(lineHeight, showAnswers = false) {
  const basePhrases = getClozeCapacity(lineHeight, showAnswers);

  return {
    property: 'clozesPerPage',
    label: '穴埋め数',
    baseValue: basePhrases,
    minValue: Math.min(CLOZE_MIN_ITEMS, basePhrases),
  };
}

function getClozeCapacity(lineHeight, showAnswers = false) {
  const layout = CLOZE_LAYOUT_MM;
  const itemHeight = layout.itemBase + lineHeight + layout.itemGap;
  const budget = layout.usableHeight - layout.titleBlock;

  let maxItems = Math.max(CLOZE_MIN_ITEMS, Math.floor(budget / itemHeight));

  if (showAnswers) {
    while (maxItems > CLOZE_MIN_ITEMS) {
      const answerRows = Math.ceil(maxItems / layout.answersPerRow);
      const answersHeight = layout.answersTop + answerRows * layout.answersRowHeight;

      if (maxItems * itemHeight + answersHeight <= budget) {
        break;
      }

      maxItems -= 1;
    }
  }

  return maxItems;
}

function resolveClozeDifficulty(rawDifficulty, ageGroup) {
  const valid = ['easy', 'normal', 'hard'];
  if (valid.includes(rawDifficulty)) return rawDifficulty;
  // 'auto' or invalid → derive from ageGroup
  if (ageGroup === '4-6') return 'easy';
  if (ageGroup === '10-12') return 'hard';
  return 'normal';
}

// Same age→level mapping is reused across word/phrase/sentence modes; keeping
// the resolver shape identical to the cloze one means UI bindings and tests
// stay symmetric.
function resolveDifficultyByAge(rawDifficulty, ageGroup) {
  const valid = ['easy', 'normal', 'hard'];
  if (valid.includes(rawDifficulty)) return rawDifficulty;
  if (ageGroup === '4-6') return 'easy';
  if (ageGroup === '10-12') return 'hard';
  return 'normal';
}

function resolveWordDifficulty(rawDifficulty, ageGroup) {
  return resolveDifficultyByAge(rawDifficulty, ageGroup);
}

function resolvePhraseDifficulty(rawDifficulty, ageGroup) {
  return resolveDifficultyByAge(rawDifficulty, ageGroup);
}

function resolveSentenceDifficulty(rawDifficulty, ageGroup) {
  return resolveDifficultyByAge(rawDifficulty, ageGroup);
}

function generateClozePractice(pageNumber, totalPages, ageGroup, layoutOverride = {}) {
  let html = '<div class="cloze-practice">';
  const clozeCategoryElement = document.getElementById('clozeCategory');
  const clozeCategory = (clozeCategoryElement && clozeCategoryElement.value) || 'greetings';
  const blankTypeElement = document.getElementById('clozeBlankType');
  const blankType = (blankTypeElement && blankTypeElement.value) || 'word';
  const difficultyElement = document.getElementById('clozeDifficulty');
  const rawDifficulty = (difficultyElement && difficultyElement.value) || 'auto';
  const difficulty = resolveClozeDifficulty(rawDifficulty, ageGroup);
  const showAnswers = Boolean(document.getElementById('showClozeAnswers')?.checked);
  const lineHeight = parseInt(document.getElementById('lineHeight').value);

  // 選択年齢のフレーズだけを使う（他年齢を混ぜると漢字レベルが合わなくなる）
  const safePhrases = getPhrasePool(clozeCategory, ageGroup);

  // 1枚の中で同じ問題が重なるのを防ぐため、上限はプールの件数に収める。
  const layoutInfo = clampLayoutToPool(
    calculateClozePracticeLayout(lineHeight, showAnswers),
    safePhrases.length
  );
  const clozesPerPage = resolveLayoutValue(layoutInfo, layoutOverride?.clozesPerPage);
  const pageCount = Math.max(1, totalPages || 1);

  if (!safePhrases.length) {
    return `
      <div class="cloze-practice">
        <p class="phrase-empty">このカテゴリーには現在表示できるフレーズがありません。</p>
      </div>
    `;
  }

  const phrases = ensureClozeSequence(
    clozeCategory,
    ageGroup,
    clozesPerPage,
    pageCount,
    safePhrases,
    difficulty
  );

  const startIndex = (pageNumber - 1) * clozesPerPage;
  const pagePhrases = phrases.slice(startIndex, startIndex + clozesPerPage).filter(Boolean);

  if (!pagePhrases.length) {
    html +=
      '<p class="phrase-empty">このページに表示できるフレーズが不足しています。条件を変更してください。</p>';
    html += '</div>';
    return html;
  }

  const categoryNames = CATEGORY_NAMES;

  const blankTypeLabel = blankType === 'char' ? '文字レベル' : '単語レベル';
  const difficultyLabels = { easy: 'やさしい', normal: 'ふつう', hard: 'むずかしい' };
  const difficultyLabel = difficultyLabels[difficulty] || 'ふつう';
  const pageLabel = pageCount > 1 ? ` (${pageNumber}/${pageCount})` : '';
  html += `<h3 class="practice-title practice-title--cloze">Fill in the Blanks - ${categoryNames[clozeCategory] || clozeCategory}${pageLabel}</h3>`;
  html += `<p class="cloze-type-label">${blankTypeLabel}・${difficultyLabel}</p>`;
  html += '<div class="cloze-grid">';

  const clozeResults = pagePhrases.map((p) => generateClozeText(p.english, blankType, difficulty));

  for (let i = 0; i < pagePhrases.length; i++) {
    const phrase = pagePhrases[i];
    const clozeResult = clozeResults[i];
    // 採点AIが「何番の解答か」を対応づけられるよう、必ず番号を印字する。
    // 1枚で完結した用紙を複数枚刷る使い方なので、番号はページごとに 1 から振る。
    const questionNumber = i + 1;
    html += `
      <div class="cloze-item">
        <div class="cloze-header">
          <div class="cloze-number" data-testid="cloze-number">Q${questionNumber}</div>
          <div class="cloze-main">
            <div class="cloze-english">${clozeResult.display}</div>
            <div class="cloze-japanese">${escapeHtml(phrase.japanese)}</div>
          </div>
          ${phrase.situation ? `<div class="phrase-situation">【${escapeHtml(phrase.situation)}】</div>` : ''}
        </div>
        <div class="phrase-lines">
          ${generateBaselineGroup()}
        </div>
      </div>
    `;
  }

  html += '</div>';

  if (showAnswers) {
    html += '<div class="cloze-answers">';
    html += '<h4 class="cloze-answers-title">Answer Key</h4>';
    html += '<div class="cloze-answers-grid">';
    for (let i = 0; i < clozeResults.length; i++) {
      const answerList = escapeHtml(clozeResults[i].answers.join(', '));
      // 問題側と同じ番号を使う（ページごとに 1 から）
      html += `<div class="cloze-answer-item"><span class="cloze-answer-number" data-testid="cloze-answer-number">Q${i + 1}</span> ${answerList}</div>`;
    }
    html += '</div>';
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function extractPunctuation(token, cleanWord) {
  const lowerToken = token.toLowerCase();
  const lowerClean = cleanWord.toLowerCase();
  const wordIndex = lowerToken.indexOf(lowerClean);
  if (wordIndex < 0) {
    return { leading: '', trailing: token.substring(cleanWord.length) };
  }
  return {
    leading: token.substring(0, wordIndex),
    trailing: token.substring(wordIndex + cleanWord.length),
  };
}

// Difficulty presets controlling blank ratio and which kinds of words are
// preferred as blanks. Higher score = more likely to be picked.
const CLOZE_DIFFICULTY_PRESETS = {
  easy: { ratio: 0.2, sightScore: 10, contentScore: 0, otherScore: 0 },
  normal: { ratio: 0.3, sightScore: 6, contentScore: 3, otherScore: 1 },
  hard: { ratio: 0.5, sightScore: 3, contentScore: 8, otherScore: 1 },
};

// Per-mode difficulty presets. Each preset clamps the items-per-page upper
// bound and supplies default visibility flags. Existing user-controlled
// checkboxes still win — these only set defaults when the user has not
// explicitly toggled, or when difficulty is 'auto'.
const WORD_DIFFICULTY_PRESETS = {
  easy: { maxWords: 6, showSyllables: true, showJapanese: true },
  normal: { maxWords: 8, showSyllables: true, showJapanese: true },
  hard: { maxWords: 10, showSyllables: false, showJapanese: false },
};

const PHRASE_DIFFICULTY_PRESETS = {
  easy: { maxPhrases: 3, showTranslation: true, showSituation: true },
  normal: { maxPhrases: 4, showTranslation: true, showSituation: false },
  hard: { maxPhrases: 5, showTranslation: false, showSituation: false },
};

const SENTENCE_DIFFICULTY_PRESETS = {
  easy: { maxLength: 6, difficultyMax: 1, showJapanese: true },
  normal: { maxLength: 10, difficultyMax: 2, showJapanese: true },
  hard: { maxLength: 99, difficultyMax: 3, showJapanese: false },
};

function getClozeDifficultyPreset(difficulty) {
  return CLOZE_DIFFICULTY_PRESETS[difficulty] || CLOZE_DIFFICULTY_PRESETS.normal;
}

function getWordDifficultyPreset(difficulty) {
  return WORD_DIFFICULTY_PRESETS[difficulty] || WORD_DIFFICULTY_PRESETS.normal;
}

function getPhraseDifficultyPreset(difficulty) {
  return PHRASE_DIFFICULTY_PRESETS[difficulty] || PHRASE_DIFFICULTY_PRESETS.normal;
}

function getSentenceDifficultyPreset(difficulty) {
  return SENTENCE_DIFFICULTY_PRESETS[difficulty] || SENTENCE_DIFFICULTY_PRESETS.normal;
}

// Blanks are printed, photographed, and then read back by OCR / an LLM for
// grading. A run of underscores does not survive that trip: at print + camera
// resolution `___` and `_____` collapse into the same solid line, so the answer
// length — the main hint the exercise gives — is lost.
//
// The length is therefore encoded twice, because the two encodings fail in
// different ways and neither is free:
//   - one discrete box per missing letter, separated by a visible gap
//   - a printed digit next to the boxes
//
// Measured at ~130dpi with JPEG compression: boxes read 10/10 (word level),
// and an 11pt digit also read 10/10. An 8pt digit read 0/13 — at that size the
// parentheses merge into the digit and 6/8/0/9 become one blob, so the digit
// must stay near body size. Boxes can be miscounted by ±1 on long runs at
// full-page scale; the digit disambiguates those. The digit alone gives the
// reader nothing to check against, which the boxes provide.
//
// マスは枠だけで中身を持たないため、そのままでは支援技術に何も伝わらない。
// 従来のアンダースコアは「空所があること」と「その文字数」をテキストとして
// 持っていたので、その情報を視覚的に隠したテキストで補い、枠と数字は
// aria-hidden で読み上げ対象から外す（読み上げが二重になるのを防ぐ）。
function buildBlankBoxes(count) {
  const boxCount = Math.max(1, count);
  const boxes = Array.from(
    { length: boxCount },
    () => '<span class="cloze-box" aria-hidden="true"></span>'
  ).join('');
  const letterCount = `<span class="cloze-letter-count" aria-hidden="true">(${boxCount})</span>`;
  return `<span class="visually-hidden">［${boxCount}文字の空所］</span>${boxes}${letterCount}`;
}

function buildWordBlankSpan(cleanWord) {
  return `<span class="cloze-blank cloze-blank--word">${buildBlankBoxes(cleanWord.length)}</span>`;
}

function buildCharBlankSpan(count) {
  return `<span class="cloze-blank cloze-blank--char">${buildBlankBoxes(count)}</span>`;
}

function generateClozeText(text, blankType, difficulty = 'normal') {
  const words = text.split(/(\s+)/);
  const answers = [];
  const preset = getClozeDifficultyPreset(difficulty);

  if (blankType === 'char') {
    // Char-level: collect candidate words first, then keep only a difficulty-
    // dependent fraction. Selection within candidates is randomized so the same
    // sentence can produce different blanks across regenerations.
    const candidateIndexes = [];
    words.forEach((token, i) => {
      if (/^\s+$/.test(token)) return;
      const cleanWord = token.replace(/^[.,!?;:'"()]+|[.,!?;:'"()]+$/g, '');
      if (cleanWord.length < 3) return;
      candidateIndexes.push(i);
    });

    const charBlankRatio = { easy: 0.4, normal: 0.65, hard: 1.0 }[difficulty] ?? 0.65;
    const targetCount = Math.max(1, Math.round(candidateIndexes.length * charBlankRatio));
    const chosenIndexes = new Set(
      shuffleArray([...candidateIndexes]).slice(0, Math.min(targetCount, candidateIndexes.length))
    );

    const processed = words.map((token, i) => {
      if (/^\s+$/.test(token)) return escapeHtml(token);
      const cleanWord = token.replace(/^[.,!?;:'"()]+|[.,!?;:'"()]+$/g, '');
      if (cleanWord.length < 3 || !chosenIndexes.has(i)) return escapeHtml(token);

      const { leading, trailing } = extractPunctuation(token, cleanWord);
      const sightWord = SIGHT_WORD_MAP_DATA.get(cleanWord.toLowerCase());
      if (sightWord && (sightWord.blankType === 'char' || sightWord.blankType === 'both')) {
        const pattern = sightWord.phonicsPattern;
        const patternIndex = cleanWord.toLowerCase().indexOf(pattern.toLowerCase());
        if (patternIndex >= 0) {
          const prefix = cleanWord.substring(0, patternIndex);
          const blanked = buildCharBlankSpan(pattern.length);
          const suffix = cleanWord.substring(patternIndex + pattern.length);
          answers.push(pattern);
          return `${escapeHtml(leading)}<span class="cloze-blank-char">${escapeHtml(prefix)}${blanked}${escapeHtml(suffix)}</span>${escapeHtml(trailing)}`;
        }
      }

      if (cleanWord.length >= 4) {
        const midStart = Math.floor(cleanWord.length * 0.3);
        const midEnd = Math.ceil(cleanWord.length * 0.7);
        const blankedPart = cleanWord.substring(midStart, midEnd);
        const prefix = cleanWord.substring(0, midStart);
        const blanked = buildCharBlankSpan(midEnd - midStart);
        const suffix = cleanWord.substring(midEnd);
        answers.push(blankedPart);
        return `${escapeHtml(leading)}<span class="cloze-blank-char">${escapeHtml(prefix)}${blanked}${escapeHtml(suffix)}</span>${escapeHtml(trailing)}`;
      }

      return escapeHtml(token);
    });

    return { display: processed.join(''), answers };
  }

  // word-level blanks: score every candidate word by difficulty, randomize
  // within score tier, then take the top-N positions.
  const wordEntries = [];
  words.forEach((token, i) => {
    if (/^\s+$/.test(token)) return;
    const cleanWord = token.replace(/^[.,!?;:'"()]+|[.,!?;:'"()]+$/g, '');
    if (cleanWord.length < 2) return;
    const lower = cleanWord.toLowerCase();
    const isSight = SIGHT_WORD_SET_DATA.has(lower);
    // "Content word" ≈ non-sight word with substance: nouns/verbs/adjectives
    // typically ≥3 chars. Cheap heuristic; good enough for early-learner text.
    const isContent = !isSight && cleanWord.length >= 3;
    let baseScore;
    if (isSight) baseScore = preset.sightScore;
    else if (isContent) baseScore = preset.contentScore;
    else baseScore = preset.otherScore;
    wordEntries.push({
      token,
      index: i,
      cleanWord,
      score: baseScore + Math.random(),
    });
  });

  const totalWordCount = wordEntries.length;
  const maxBlanks = Math.max(1, Math.round(totalWordCount * preset.ratio));

  // Highest-score-first; ties broken by the random component already baked in.
  const ranked = [...wordEntries].sort((a, b) => b.score - a.score);
  // Filter out zero-score entries (e.g. easy mode has no sight words in the
  // sentence — the fallback below will still ensure at least one blank).
  const chosen = ranked.filter((e) => e.score >= 1).slice(0, maxBlanks);
  const chosenByIndex = new Map(chosen.map((e) => [e.index, e]));

  const processed = words.map((token, i) => {
    if (/^\s+$/.test(token)) return token;
    const entry = chosenByIndex.get(i);
    if (!entry) return escapeHtml(token);
    const { leading, trailing } = extractPunctuation(token, entry.cleanWord);
    answers.push(entry.cleanWord);
    return `${escapeHtml(leading)}${buildWordBlankSpan(entry.cleanWord)}${escapeHtml(trailing)}`;
  });

  // Fallback: if no candidate qualified (e.g. easy mode + sentence has zero
  // sight words), blank the middle content word so the exercise is non-empty.
  if (answers.length === 0 && wordEntries.length > 0) {
    const target = wordEntries[Math.floor(wordEntries.length / 2)];
    const { leading, trailing } = extractPunctuation(target.token, target.cleanWord);
    answers.push(target.cleanWord);
    processed[target.index] =
      `${escapeHtml(leading)}${buildWordBlankSpan(target.cleanWord)}${escapeHtml(trailing)}`;
  }

  return { display: processed.join(''), answers };
}

// Generic paged-unique sequence builder. Produces `perPage * pageCount` items
// where each contiguous page-sized window contains no duplicate keys (when
// source has at least `perPage` unique items). The `getKey` extractor lets
// callers use any item shape (default uses `item.english`).
//
// When the source pool is smaller than what all pages need, it reshuffles per
// page and tries to avoid items used on the previous page; within-page
// duplicates only occur if the pool itself is smaller than `perPage`.
function buildPagedUniqueSequence(source, perPage, pageCount, getKey) {
  if (!Array.isArray(source) || source.length === 0 || perPage <= 0 || pageCount <= 0) {
    return [];
  }

  const keyFn = typeof getKey === 'function' ? getKey : (item) => item?.english;

  const result = [];
  let prevPageKeys = new Set();

  for (let page = 0; page < pageCount; page++) {
    const pageItems = [];

    if (source.length >= perPage) {
      // Within-page dedup must be enforced even when the pool is "large enough"
      // because the source array can contain duplicate keys (e.g. a custom
      // example with the same English text as a built-in entry). Two-pass fill:
      // Pass 1 prefers fresh + unique-on-page, Pass 2 relaxes the cross-page
      // constraint while keeping within-page uniqueness.
      const usedKeysOnPage = new Set();
      const candidates = shuffleArray(source);
      for (const item of candidates) {
        if (pageItems.length >= perPage) break;
        const k = keyFn(item);
        if (!prevPageKeys.has(k) && !usedKeysOnPage.has(k)) {
          pageItems.push(item);
          usedKeysOnPage.add(k);
        }
      }
      if (pageItems.length < perPage) {
        const reshuffled = shuffleArray(source);
        for (const item of reshuffled) {
          if (pageItems.length >= perPage) break;
          const k = keyFn(item);
          if (!usedKeysOnPage.has(k)) {
            pageItems.push(item);
            usedKeysOnPage.add(k);
          }
        }
      }
      // If we still cannot fill a page, the source has fewer distinct keys than
      // `perPage`. Fall through to the small-pool branch behavior by cycling.
      if (pageItems.length < perPage) {
        const fillFrom = shuffleArray(source);
        let i = 0;
        while (pageItems.length < perPage) {
          pageItems.push(fillFrom[i % fillFrom.length]);
          i++;
        }
      }
    } else {
      // Pool smaller than perPage: take all of one shuffle, then top up with more
      // cycles. Within a single page items will be as unique as possible until
      // the pool is exhausted.
      const shuffled = shuffleArray(source);
      const cyclePool = [];
      const seenKeys = new Set();
      for (const item of shuffled) {
        const key = keyFn(item);
        if (seenKeys.has(key)) {
          continue;
        }
        seenKeys.add(key);
        cyclePool.push(item);
      }

      const pool = cyclePool.length > 0 ? cyclePool : shuffled;
      if (pool.length === 0) {
        continue;
      }

      while (pageItems.length < perPage) {
        for (const item of pool) {
          pageItems.push(item);
          if (pageItems.length >= perPage) {
            break;
          }
        }
      }
    }

    result.push(...pageItems);
    prevPageKeys = new Set(pageItems.map((p) => keyFn(p)));
  }

  return result;
}

// Builds a sequence of `perPage * pageCount` phrases where each contiguous
// page-sized window contains no duplicates (when source has at least `perPage`
// unique items). Thin wrapper around `buildPagedUniqueSequence` that keys on
// the English text of each phrase.
function buildClozePagedSequence(source, perPage, pageCount) {
  return buildPagedUniqueSequence(source, perPage, pageCount, (p) => p?.english);
}

function ensureClozeSequence(category, ageGroup, perPage, pageCount, phrases, difficulty) {
  const key = `${category}|${ageGroup}|${difficulty || 'auto'}`;
  const totalNeeded = perPage * pageCount;
  const fingerprint = phrases.map((phrase) => phrase?.english || '').join('|');
  const needsRefresh =
    clozeSequenceCache.key !== key ||
    clozeSequenceCache.perPage !== perPage ||
    clozeSequenceCache.pageCount !== pageCount ||
    clozeSequenceCache.sequence.length < totalNeeded ||
    clozeSequenceCache.fingerprint !== fingerprint;

  if (needsRefresh) {
    const sequence = buildClozePagedSequence(phrases, perPage, pageCount);

    clozeSequenceCache = {
      key,
      perPage,
      pageCount,
      fingerprint,
      sequence,
    };
  }

  return clozeSequenceCache.sequence;
}

// Phase 2: カスタム例文機能
function addCustomExample(english, japanese, category, ageGroup) {
  const normalizedCategory = category === 'all' ? 'daily' : category;
  const normalizedExample = normalizeCustomExample({
    english,
    japanese,
    category: VALID_CUSTOM_EXAMPLE_CATEGORIES.has(normalizedCategory)
      ? normalizedCategory
      : 'daily',
    ageGroup,
    difficulty: 1,
    custom: true,
  });

  if (!normalizedExample) {
    return;
  }

  setCustomExamples([...customExamples, normalizedExample]);
  saveCustomExamplesToStorage();
  renderCustomExamplesList();
  setCurrentExamples([]);
  resetSentenceCache();
  updatePreview();
}

// Phase 2: 例文カテゴリーフィルター（将来実装用）
// eslint-disable-next-line no-unused-vars
function filterExamplesByCategory(category) {
  const ageGroup = document.getElementById('ageGroup').value;
  const sentences = EXAMPLE_SENTENCES_BY_AGE[ageGroup] || EXAMPLE_SENTENCES_BY_AGE['7-9'];
  return sentences.filter((s) => s.category === category);
}
// コンテンツ統計を自動計算する関数
function updateContentStats() {
  // 単語の統計を計算
  CONTENT_STATS.words.total = 0;
  CONTENT_STATS.words.byCategory = {};
  CONTENT_STATS.words.byAge = { '4-6': 0, '7-9': 0, '10-12': 0 };

  Object.entries(WORD_LISTS).forEach(([category, ageData]) => {
    CONTENT_STATS.words.byCategory[category] = 0;
    Object.entries(ageData).forEach(([age, words]) => {
      const count = words.length;
      CONTENT_STATS.words.byCategory[category] += count;
      CONTENT_STATS.words.byAge[age] += count;
      CONTENT_STATS.words.total += count;
    });
  });

  // フレーズの統計を計算
  CONTENT_STATS.phrases.total = 0;
  CONTENT_STATS.phrases.byCategory = {};
  CONTENT_STATS.phrases.byAge = { '4-6': 0, '7-9': 0, '10-12': 0 };

  Object.entries(PHRASE_DATA).forEach(([category, ageData]) => {
    CONTENT_STATS.phrases.byCategory[category] = 0;
    Object.entries(ageData).forEach(([age, phrases]) => {
      const count = phrases.length;
      CONTENT_STATS.phrases.byCategory[category] += count;
      CONTENT_STATS.phrases.byAge[age] += count;
      CONTENT_STATS.phrases.total += count;
    });
  });

  // 例文の統計を計算
  CONTENT_STATS.examples.total = 0;
  CONTENT_STATS.examples.byAge = { '4-6': 0, '7-9': 0, '10-12': 0 };

  Object.entries(EXAMPLE_SENTENCES_BY_AGE).forEach(([age, examples]) => {
    const count = examples.length;
    CONTENT_STATS.examples.byAge[age] = count;
    CONTENT_STATS.examples.total += count;
  });

  return CONTENT_STATS;
}

// コンテンツ統計を表示する関数（開発者コンソールから使用可能）
// eslint-disable-next-line no-unused-vars
function displayContentStats() {
  updateContentStats();

  if (window.Debug) {
    window.Debug.log('CONTENT_STATS', '英語ノートメーカー コンテンツ統計', {
      lastUpdated: CONTENT_STATS.lastUpdated,
    });

    window.Debug.log('CONTENT_STATS', '単語コンテンツ', {
      total: CONTENT_STATS.words.total,
      byCategory: CONTENT_STATS.words.byCategory,
      byAge: CONTENT_STATS.words.byAge,
    });

    window.Debug.log('CONTENT_STATS', 'フレーズコンテンツ', {
      total: CONTENT_STATS.phrases.total,
      byCategory: CONTENT_STATS.phrases.byCategory,
      byAge: CONTENT_STATS.phrases.byAge,
    });

    window.Debug.log('CONTENT_STATS', '例文コンテンツ', {
      total: CONTENT_STATS.examples.total,
      byAge: CONTENT_STATS.examples.byAge,
    });

    window.Debug.log('CONTENT_STATS', 'アルファベット', {
      total: 52,
      detail: '大文字26 + 小文字26',
    });
  } else {
    // Fallback to console for non-debug environments
    // Debug utilities not loaded - console removed for production
  }
}

// レイアウト整合性チェック関数
window.checkLayoutConsistency = function () {
  if (window.Debug) window.Debug.log('LAYOUT_CHECK', 'レイアウト整合性チェックを開始します...');

  const results = {
    timestamp: new Date().toLocaleString(),
    checks: [],
    warnings: [],
    errors: [],
  };

  // プレビューと印刷の余白設定をチェック
  const printMediaQuery = Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules || []);
      } catch {
        return [];
      }
    })
    .find((rule) => rule.media && rule.media.mediaText === 'print');

  if (printMediaQuery) {
    const htmlRule = Array.from(printMediaQuery.cssRules).find(
      (rule) => rule.selectorText === 'html'
    );

    if (htmlRule && htmlRule.style.margin) {
      results.checks.push({
        item: '印刷用HTML余白',
        value: htmlRule.style.margin,
        status: 'OK',
      });
    }
  }

  // プレビューページのスタイルをチェック
  const previewModal = document.getElementById('printPreviewModal');
  if (previewModal) {
    const previewPages = previewModal.querySelectorAll('.a4-preview-page');
    previewPages.forEach((page, index) => {
      const computedStyle = window.getComputedStyle(page);
      results.checks.push({
        item: `プレビューページ${index + 1} padding`,
        value: computedStyle.padding,
        status: 'OK',
      });
    });
  }

  // ベースライン設定の一貫性チェック
  const baselineElements = document.querySelectorAll('.baseline');
  const lineHeightSettings = new Set();

  baselineElements.forEach((baseline) => {
    const parent = baseline.closest('.baseline-group, .line-group');
    if (parent) {
      const height = window.getComputedStyle(parent).height;
      lineHeightSettings.add(height);
    }
  });

  if (lineHeightSettings.size > 1) {
    results.warnings.push(
      '異なる行間設定が検出されました: ' + Array.from(lineHeightSettings).join(', ')
    );
  } else if (lineHeightSettings.size === 1) {
    results.checks.push({
      item: 'ベースライン行間',
      value: Array.from(lineHeightSettings)[0],
      status: 'Consistent',
    });
  }

  // CSS変数の設定確認
  const rootStyles = window.getComputedStyle(document.documentElement);
  const cssVars = ['--line-height', '--baseline-color', '--text-color'];
  cssVars.forEach((varName) => {
    const value = rootStyles.getPropertyValue(varName);
    if (value) {
      results.checks.push({
        item: `CSS変数 ${varName}`,
        value: value.trim(),
        status: 'Set',
      });
    } else {
      results.warnings.push(`CSS変数 ${varName} が設定されていません`);
    }
  });

  // 結果をコンソールに出力
  if (window.Debug) {
    window.Debug.log('LAYOUT_CHECK', 'レイアウト整合性チェック完了', results);

    if (results.errors.length > 0) {
      window.Debug.error('LAYOUT_CHECK', 'エラーが発見されました', { errors: results.errors });
    }

    if (results.warnings.length > 0) {
      window.Debug.warn('LAYOUT_CHECK', '警告が発見されました', { warnings: results.warnings });
    }

    if (results.errors.length === 0 && results.warnings.length === 0) {
      window.Debug.log('LAYOUT_CHECK', 'レイアウト整合性に問題は見つかりませんでした ✅');
    }
  }

  return results;
};

// 統一設定システムの検証機能
window.validateConfiguration = function () {
  if (window.Debug) window.Debug.log('CONFIG_CHECK', '統一設定システムの検証を開始します...');

  const results = {
    timestamp: new Date().toLocaleString(),
    validations: [],
    warnings: [],
    errors: [],
    settings: {},
  };

  // CSS変数の存在確認
  const rootStyle = getComputedStyle(document.documentElement);
  const requiredVars = [
    'margin-standard',
    'margin-debug',
    'margin-minimum',
    'line-height-standard',
    'line-height-small',
    'line-height-large',
    'baseline-color-screen',
    'baseline-color-print',
  ];

  requiredVars.forEach((varName) => {
    const value = rootStyle.getPropertyValue(`--${varName}`).trim();
    if (value) {
      results.settings[varName] = value;
      results.validations.push({
        item: `CSS変数 --${varName}`,
        value: value,
        status: '設定済み',
      });
    } else {
      results.errors.push(`必須CSS変数 --${varName} が設定されていません`);
    }
  });

  // 余白設定の妥当性チェック
  const marginStandard = rootStyle.getPropertyValue('--margin-standard').trim();
  if (marginStandard) {
    const match = marginStandard.match(/(\d+)mm\s+(\d+)mm/);
    if (match) {
      const [, vertical, horizontal] = match;
      const v = parseInt(vertical);
      const h = parseInt(horizontal);

      if (v < 3) results.warnings.push(`標準余白の縦方向が小さすぎます: ${v}mm (推奨: 3mm以上)`);
      if (h < 8) results.warnings.push(`標準余白の横方向が小さすぎます: ${h}mm (推奨: 8mm以上)`);
      if (v > 20) results.warnings.push(`標準余白の縦方向が大きすぎます: ${v}mm (推奨: 20mm以下)`);
      if (h > 20) results.warnings.push(`標準余白の横方向が大きすぎます: ${h}mm (推奨: 20mm以下)`);

      results.validations.push({
        item: '標準余白設定',
        value: `${v}mm x ${h}mm`,
        status: v >= 3 && h >= 8 && v <= 20 && h <= 20 ? '適切' : '要確認',
      });
    } else {
      results.errors.push('標準余白の形式が正しくありません（例: 5mm 10mm）');
    }
  }

  // 行高設定の一貫性チェック
  const lineHeights = ['small', 'standard', 'large']
    .map((size) => {
      const value = rootStyle.getPropertyValue(`--line-height-${size}`).trim();
      const match = value.match(/(\d+)mm/);
      return match ? { size, value: parseInt(match[1]) } : null;
    })
    .filter(Boolean);

  if (lineHeights.length === 3) {
    const [small, standard, large] = lineHeights.map((h) => h.value);
    if (small >= standard) results.warnings.push('小行高が標準行高以上になっています');
    if (standard >= large) results.warnings.push('標準行高が大行高以上になっています');

    results.validations.push({
      item: '行高の段階設定',
      value: `${small}mm → ${standard}mm → ${large}mm`,
      status: small < standard && standard < large ? '正常' : '要確認',
    });
  }

  // 設定の統計情報
  const configStats = {
    totalVariables: Object.keys(results.settings).length,
    validCount: results.validations.length,
    warningCount: results.warnings.length,
    errorCount: results.errors.length,
  };

  // 結果出力
  if (window.Debug) {
    window.Debug.log('CONFIG_CHECK', '設定検証完了', { stats: configStats });

    if (results.errors.length > 0) {
      window.Debug.error('CONFIG_CHECK', '設定エラーが発見されました', { errors: results.errors });
    }

    if (results.warnings.length > 0) {
      window.Debug.warn('CONFIG_CHECK', '設定警告が発見されました', { warnings: results.warnings });
    }

    if (results.errors.length === 0 && results.warnings.length === 0) {
      window.Debug.log('CONFIG_CHECK', '統一設定システムは正常です ✅', {
        validations: results.validations.length,
      });
    }

    // 設定値一覧
    window.Debug.log('CONFIG_CHECK', '現在の設定値', results.settings);
  }

  return { ...results, stats: configStats };
};
