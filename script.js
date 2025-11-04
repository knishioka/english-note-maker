// === 英語罫線ノート作成スクリプト ===

// モジュールローダー（CommonJS互換のため動的インポートを使用）
let EXAMPLE_SENTENCES_BY_AGE = {};
let WORD_LISTS = {};
let ALPHABET_DATA = {};
let PHRASE_DATA = {};

let currentExamples = [];

let setCurrentExamplesImpl = (examples) => {
  currentExamples = Array.isArray(examples) ? examples : [];
};

let setCurrentExampleIndicesImpl = () => {};

const modulesReady = (async () => {
  const [exampleModule, wordModule, alphabetModule, phraseModule, appConfigModule] =
    await Promise.all([
      import('./src/data/example-sentences.js'),
      import('./src/data/word-lists.js'),
      import('./src/data/alphabet-data.js'),
      import('./src/data/phrase-data.js'),
      import('./src/models/app-config.js'),
    ]);

  EXAMPLE_SENTENCES_BY_AGE = exampleModule.EXAMPLE_SENTENCES_BY_AGE;
  WORD_LISTS = wordModule.WORD_LISTS;
  ALPHABET_DATA = alphabetModule.ALPHABET_DATA;
  PHRASE_DATA = phraseModule.PHRASE_DATA;

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
})();

function setCurrentExamples(examples) {
  setCurrentExamplesImpl(examples);
  currentExamples = Array.isArray(examples) ? examples : [];
}

function setCurrentExampleIndices(indices) {
  setCurrentExampleIndicesImpl(indices);
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
  'customExampleOptions',
  'alphabetOptions',
  'phraseOptions',
];

const PRACTICE_MODE_CONFIGS = {
  sentence: {
    sections: ['ageOptions', 'exampleOptions', 'translationOptions', 'customExampleOptions'],
    checkboxes: { showExamples: true, showTranslation: true },
  },
  word: {
    sections: ['ageOptions', 'wordOptions'],
    checkboxes: { showExamples: false, showTranslation: false },
  },
  alphabet: {
    sections: ['alphabetOptions'],
    checkboxes: { showExamples: false, showTranslation: false },
  },
  phrase: {
    sections: ['ageOptions', 'phraseOptions', 'translationOptions'],
    checkboxes: { showExamples: false, showTranslation: true },
  },
  default: {
    sections: [],
    checkboxes: { showExamples: false, showTranslation: false },
  },
};

const DEFAULT_PHRASE_COUNT = 12;
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

function init() {
  setupEventListeners();
  updateOptionsVisibility();
  updatePreview();
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
    addCustomExampleBtn: document.getElementById('addCustomExampleBtn'),
    alphabetType: document.getElementById('alphabetType'),
    showAlphabetExample: document.getElementById('showAlphabetExample'),
    phraseCategory: document.getElementById('phraseCategory'),
    showSituation: document.getElementById('showSituation'),
    shufflePhrasesBtn: document.getElementById('shufflePhrases'),
    previewBtn: document.getElementById('previewBtn'),
  };

  addEventListenerIfExists(elements.showExamples, 'change', updatePreview);
  addEventListenerIfExists(elements.showTranslation, 'change', updatePreview);
  addEventListenerIfExists(elements.refreshExamplesBtn, 'click', () => {
    shuffleCurrentExamples();
    updatePreview();
  });

  addEventListenerIfExists(elements.ageGroup, 'change', () => {
    setCurrentExampleIndices({});
    setCurrentExamples([]);
    updatePreview();
  });

  [elements.lineHeight, elements.lineColor, elements.showHeader].forEach((element) =>
    addEventListenerIfExists(element, 'change', updatePreview)
  );

  if (elements.pageCount) {
    addEventListenerIfExists(elements.pageCount, 'change', updatePreview);
    addEventListenerIfExists(elements.pageCount, 'input', updatePreview);
  }

  addEventListenerIfExists(elements.exampleCategory, 'change', () => {
    setCurrentExamples([]);
    updatePreview();
  });
  addEventListenerIfExists(elements.wordCategory, 'change', updatePreview);
  addEventListenerIfExists(elements.addCustomExampleBtn, 'click', handleAddCustomExample);
  addEventListenerIfExists(elements.alphabetType, 'change', updatePreview);
  addEventListenerIfExists(elements.showAlphabetExample, 'change', updatePreview);

  addEventListenerIfExists(elements.phraseCategory, 'change', () => {
    if (window.Debug) {
      window.Debug.log('PHRASE_CATEGORY', 'フレーズカテゴリーが変更されました', {
        newCategory: elements.phraseCategory ? elements.phraseCategory.value : undefined,
      });
    }
    updatePreview();
  });
  addEventListenerIfExists(elements.showSituation, 'change', updatePreview);

  addEventListenerIfExists(elements.shufflePhrasesBtn, 'click', () => {
    if (window.Debug) {
      window.Debug.log('PHRASE_SHUFFLE', 'フレーズをシャッフルします', {
        currentCategory: elements.phraseCategory ? elements.phraseCategory.value : undefined,
      });
    }
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
  const pageCount = parseInt(document.getElementById('pageCount').value) || 1;
  const notePreview = document.getElementById('notePreview');

  let html = '';

  for (let page = 0; page < pageCount; page++) {
    if (page > 0) {
      // プレビュー用のページ区切り（画面表示用）
      html += `
                <div class="page-separator">
                    <div class="page-separator-line"></div>
                    <div class="page-separator-text">ページ ${page + 1}</div>
                    <div class="page-separator-line"></div>
                </div>
            `;
      // 印刷用のページ区切り
      html += '<div style="page-break-before: always;"></div>';
    }
    html += generateNotePage(page + 1, pageCount);
  }

  notePreview.innerHTML = html;
}

// ノートページ生成
function generateNotePage(pageNumber, totalPages) {
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
    html += generateSentencePractice(showExamples, showTranslation, ageGroup);
  } else if (practiceMode === 'word') {
    html += generateWordPractice(ageGroup);
  } else if (practiceMode === 'alphabet') {
    html += generateAlphabetPractice(pageNumber);
  } else if (practiceMode === 'phrase') {
    html += generatePhrasePractice(showTranslation, ageGroup);
  } else {
    html += generateNormalPractice(showExamples, showTranslation, ageGroup);
  }

  html += '</div>';

  return html;
}

// 通常練習モード生成
function generateNormalPractice(showExamples, showTranslation, ageGroup) {
  let html = '';
  // 行高さに応じて最大行数を調整
  const lineHeight = parseInt(document.getElementById('lineHeight').value);
  const baseMaxLines = showExamples ? 12 : 14;
  const maxLines =
    lineHeight === 12
      ? Math.floor(baseMaxLines * 0.8)
      : lineHeight === 8
        ? Math.floor(baseMaxLines * 1.2)
        : baseMaxLines;

  if (showExamples) {
    const neededExamples = Math.floor(maxLines / 4);
    ensureExamples(neededExamples, ageGroup);
  }

  for (let i = 0; i < maxLines; i++) {
    const exampleIndex = Math.floor(i / 4);
    const shouldShowExample = showExamples && currentExamples[exampleIndex] && i % 4 === 0;

    if (shouldShowExample) {
      html += generateExampleSentence(currentExamples[exampleIndex], showTranslation);
    }

    html += generateBaselineGroup();

    if (i !== maxLines - 1) {
      html += '<div class="line-separator-small"></div>';
    }
  }

  return html;
}

// 文章練習モード生成
function generateSentencePractice(showExamples, showTranslation, ageGroup) {
  let html = '';
  // 行高さに応じて例文数を調整
  const lineHeight = parseInt(document.getElementById('lineHeight').value);
  const baseMaxExamples = showTranslation ? 4 : 5;
  const maxExamples =
    lineHeight === 12
      ? Math.floor(baseMaxExamples * 0.8)
      : lineHeight === 8
        ? Math.floor(baseMaxExamples * 1.2)
        : baseMaxExamples;

  ensureExamples(maxExamples, ageGroup);

  for (let i = 0; i < currentExamples.length; i++) {
    html += `
            <div class="sentence-practice-group">
                ${generateExampleSentence(currentExamples[i], showTranslation)}
                <div class="practice-lines">
                    ${generateBaselineGroup()}
                    <div class="line-separator"></div>
                    ${generateBaselineGroup()}
                </div>
            </div>
        `;
  }

  return html;
}

// Phase 2: 単語練習モード生成
function generateWordPractice(ageGroup) {
  let html = '<div class="word-practice">';

  // 単語カテゴリーを選択
  const category = document.getElementById('wordCategory').value || 'animals';
  const words =
    WORD_LISTS[category] && WORD_LISTS[category][ageGroup]
      ? WORD_LISTS[category][ageGroup]
      : WORD_LISTS['animals'][ageGroup] || WORD_LISTS['animals']['7-9'];

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

  html += `<h3 style="text-align: center; margin-bottom: 10mm;">Word Practice - ${categoryNames[category] || category}</h3>`;

  // 行高さに応じて単語数を調整
  const lineHeight = parseInt(document.getElementById('lineHeight').value);
  const maxWords = lineHeight === 12 ? 3 : lineHeight === 8 ? 5 : 4;
  const displayWords = words.slice(0, maxWords);

  for (const word of displayWords) {
    html += `
            <div class="word-practice-item" style="margin-bottom: ${lineHeight === 12 ? '18mm' : lineHeight === 8 ? '10mm' : '12mm'};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2mm;">
                    <span style="font-size: 16pt; font-weight: bold;">${word.english}</span>
                    <span style="font-size: 12pt; color: #666;">${word.syllables}</span>
                    <span style="font-size: 12pt; color: #666;">${word.japanese}</span>
                </div>
                ${generateBaselineGroup()}
                <div class="line-separator-small"></div>
                ${generateBaselineGroup()}
            </div>
        `;
  }

  html += '</div>';
  return html;
}

// ベースライングループ生成
function generateBaselineGroup() {
  return `
        <div class="baseline-group">
            <div class="baseline baseline--top"></div>
            <div class="baseline baseline--upper"></div>
            <div class="baseline baseline--lower"></div>
            <div class="baseline baseline--bottom"></div>
        </div>
    `;
}

// 例文表示生成
function generateExampleSentence(sentence, showTranslation) {
  const difficulty = '★'.repeat(sentence.difficulty || 1);
  return `
        <div class="example-sentence">
            <div class="example-english">
                ${sentence.english}
                <span style="font-size: 10pt; color: #999; margin-left: 5mm;">${difficulty}</span>
            </div>
            ${showTranslation ? `<div class="example-japanese">${sentence.japanese}</div>` : ''}
        </div>
    `;
}

// 例文を確保
function ensureExamples(count, ageGroup) {
  if (currentExamples.length !== count) {
    setCurrentExamples(getRandomExamples(count, ageGroup));
  }
}

// ランダムな例文を取得
function getRandomExamples(count, ageGroup) {
  const category = document.getElementById('exampleCategory').value || 'all';
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
  const shuffled = [...allSentences].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 現在の例文をシャッフル
function shuffleCurrentExamples() {
  setCurrentExamples([]);
}

// 印刷機能
function printNote() {
  // 印刷前にレイアウトチェックを実行
  if (window.LayoutValidator) {
    runLayoutTest();
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
      const rect = page.getBoundingClientRect();
      const heightInMm = rect.height / 3.7795275591;
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

  let letters = [];
  if (alphabetType === 'uppercase' || alphabetType === 'both') {
    letters = letters.concat(ALPHABET_DATA.uppercase);
  }
  if (alphabetType === 'lowercase' || alphabetType === 'both') {
    letters = letters.concat(ALPHABET_DATA.lowercase);
  }

  // 2列レイアウトで1ページに6文字（3行×2列）
  const lettersPerPage = 6;
  const startIndex = (pageNumber - 1) * lettersPerPage;
  const endIndex = startIndex + lettersPerPage;
  const currentPageLetters = letters.slice(startIndex, endIndex);

  // 空のページの場合は何も表示しない
  if (currentPageLetters.length === 0) {
    return '<div class="alphabet-practice"><p style="text-align: center; color: #999;">このページには表示する文字がありません</p></div>';
  }

  // 必要なページ数を自動計算して設定
  if (alphabetType === 'both' && pageNumber === 1) {
    const neededPages = Math.ceil(letters.length / lettersPerPage);
    const pageCountInput = document.getElementById('pageCount');
    if (pageCountInput && parseInt(pageCountInput.value) < neededPages) {
      if (window.Debug)
        window.Debug.info(
          'ALPHABET_PRACTICE',
          `アルファベット練習（両方）: ${neededPages}ページ必要です`
        );
      // ユーザーに通知
      setTimeout(() => {
        if (
          confirm(
            `全${letters.length}文字を表示するには${neededPages}ページ必要です。ページ数を${neededPages}に変更しますか？`
          )
        ) {
          pageCountInput.value = neededPages;
          updatePreview();
        }
      }, 100);
    }
  }

  let html = '<div class="alphabet-practice">';

  // タイトルにページ情報を追加
  const totalPages = Math.ceil(letters.length / lettersPerPage);
  html += `<h3 class="practice-title">Alphabet Practice ${totalPages > 1 ? `(${pageNumber}/${totalPages})` : ''}</h3>`;

  html += '<div class="alphabet-grid">';

  for (let i = 0; i < currentPageLetters.length; i++) {
    const item = currentPageLetters[i];
    const exampleHtml = showExample
      ? `
                        <div class="alphabet-example">
                            <span class="example-word">${item.example}</span>
                            <span class="example-meaning">(${item.japanese})</span>
                        </div>
                    `
      : '';

    html += `
            <div class="alphabet-grid-item">
                <div class="alphabet-header">
                    <span class="alphabet-letter">${item.letter}</span>
                    ${exampleHtml}
                </div>
                <div class="alphabet-lines">
                    ${generateBaselineGroup()}
                </div>
            </div>
        `;
  }

  html += '</div>'; // alphabet-grid
  html += '</div>'; // alphabet-practice
  return html;
}

// フレーズ練習モード生成
function generatePhrasePractice(showTranslation, ageGroup) {
  let html = '<div class="phrase-practice">';
  const phraseCategoryElement = document.getElementById('phraseCategory');
  const phraseCategory = (phraseCategoryElement && phraseCategoryElement.value) || 'greetings';
  const showSituation = Boolean(document.getElementById('showSituation')?.checked);

  if (window.Debug) {
    window.Debug.log('PHRASE_PRACTICE', 'フレーズ練習生成開始', {
      category: phraseCategory,
      ageGroup,
      showTranslation,
      showSituation,
    });
  }

  let allPhrases;
  if (PHRASE_DATA[phraseCategory]) {
    if (PHRASE_DATA[phraseCategory][ageGroup]) {
      allPhrases = PHRASE_DATA[phraseCategory][ageGroup];
    } else {
      const availableAges = Object.keys(PHRASE_DATA[phraseCategory]);
      const fallbackAge = availableAges.includes('7-9') ? '7-9' : availableAges[0];
      allPhrases = PHRASE_DATA[phraseCategory][fallbackAge] || [];
      if (window.Debug) {
        window.Debug.warn(
          'PHRASE_PRACTICE',
          `年齢グループ${ageGroup}のデータが見つからないため、代替を使用`,
          {
            requestedAge: ageGroup,
            usingAge: fallbackAge,
          }
        );
      }
    }
  } else {
    allPhrases = PHRASE_DATA.greetings?.[ageGroup] || PHRASE_DATA.greetings?.['7-9'] || [];
    if (window.Debug) {
      window.Debug.error(
        'PHRASE_PRACTICE',
        `カテゴリー${phraseCategory}が見つからないため、greetingsを使用`
      );
    }
  }

  const safePhrases = Array.isArray(allPhrases) ? allPhrases : [];

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

  const desiredCount = Math.min(DEFAULT_PHRASE_COUNT, safePhrases.length);
  const phrases = selectDiversePhrases(safePhrases, desiredCount);

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
      desiredCount,
      usageSummary,
      patternSummary,
      focusWords: Array.from(focusSummary).slice(0, 10),
    });
  }

  const categoryNames = {
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
  };

  const usageLabels = {
    core: 'よく使う',
    common: '日常',
    situational: '場面',
    critical: '緊急',
    specialized: 'トピック',
  };

  html += `<h3 class="practice-title practice-title--phrase">Phrase Practice - ${categoryNames[phraseCategory] || phraseCategory}</h3>`;
  html += '<div class="phrase-grid">';

  for (const phrase of phrases) {
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
                        ${showTranslation ? `<div class="phrase-japanese">${phrase.japanese}</div>` : ''}
                    </div>
                    ${showSituation && phrase.situation ? `<div class="phrase-situation">【${phrase.situation}】</div>` : ''}
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

// Phase 2: カスタム例文機能
function addCustomExample(english, japanese, category, ageGroup) {
  customExamples.push({
    english,
    japanese,
    category: category === 'all' ? 'daily' : category,
    ageGroup,
    difficulty: 2,
    custom: true,
  });
  setCurrentExamples([]);
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
