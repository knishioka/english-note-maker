// コンテンツ整合性テスト

const fs = require('fs');
const path = require('path');

// scriptファイルを読み込み
const scriptPath = path.join(__dirname, '..', 'script.js');
const indexHtmlPath = path.join(__dirname, '..', 'index.html');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

// モジュール化されたデータファイルも読み込み
const wordListPath = path.join(__dirname, '..', 'src', 'data', 'word-lists.js');
const phraseDataPath = path.join(__dirname, '..', 'src', 'data', 'phrase-data.js');
const exampleDataPath = path.join(__dirname, '..', 'src', 'data', 'example-sentences.js');
const alphabetDataPath = path.join(__dirname, '..', 'src', 'data', 'alphabet-data.js');
const phonicsDataPath = path.join(__dirname, '..', 'src', 'data', 'phonics-data.js');

const wordListContent = fs.existsSync(wordListPath) ? fs.readFileSync(wordListPath, 'utf8') : '';
const phraseDataContent = fs.existsSync(phraseDataPath)
  ? fs.readFileSync(phraseDataPath, 'utf8')
  : '';
const exampleDataContent = fs.existsSync(exampleDataPath)
  ? fs.readFileSync(exampleDataPath, 'utf8')
  : '';
const alphabetDataContent = fs.existsSync(alphabetDataPath)
  ? fs.readFileSync(alphabetDataPath, 'utf8')
  : '';
const phonicsDataContent = fs.existsSync(phonicsDataPath)
  ? fs.readFileSync(phonicsDataPath, 'utf8')
  : '';

// 全コンテンツを統合
const allContent =
  scriptContent +
  indexHtmlContent +
  wordListContent +
  phraseDataContent +
  exampleDataContent +
  alphabetDataContent +
  phonicsDataContent;

// テスト結果を格納
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

// テスト関数
function test(name, condition, errorMessage) {
  if (condition) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    testResults.errors.push({ test: name, error: errorMessage });
    console.log(`❌ ${name}: ${errorMessage}`);
  }
}

// 1. 必須データ構造の存在確認（モジュール化対応）
console.log('\n📋 必須データ構造のチェック');

const hasImportReference = (modulePath, fallbackIdentifier) => {
  const patterns = [
    `import('${modulePath}')`,
    `import("${modulePath}")`,
    `import(\`${modulePath}\`)`,
  ];

  return (
    patterns.some((pattern) => scriptContent.includes(pattern)) ||
    scriptContent.includes(`const ${fallbackIdentifier}`)
  );
};

test(
  'WORD_LISTS の存在',
  scriptContent.includes('import { WORD_LISTS }') ||
    hasImportReference('./src/data/word-lists.js', 'WORD_LISTS'),
  'WORD_LISTS が定義されていません'
);
test(
  'PHRASE_DATA の存在',
  scriptContent.includes('import { PHRASE_DATA }') ||
    hasImportReference('./src/data/phrase-data.js', 'PHRASE_DATA'),
  'PHRASE_DATA が定義されていません'
);
test(
  'EXAMPLE_SENTENCES_BY_AGE の存在',
  scriptContent.includes('import { EXAMPLE_SENTENCES_BY_AGE }') ||
    hasImportReference('./src/data/example-sentences.js', 'EXAMPLE_SENTENCES_BY_AGE'),
  'EXAMPLE_SENTENCES_BY_AGE が定義されていません'
);
test(
  'ALPHABET_DATA の存在',
  scriptContent.includes('import { ALPHABET_DATA }') ||
    hasImportReference('./src/data/alphabet-data.js', 'ALPHABET_DATA'),
  'ALPHABET_DATA が定義されていません'
);
test(
  'PHONICS_DATA の存在',
  scriptContent.includes('import { PHONICS_DATA }') ||
    hasImportReference('./src/data/phonics-data.js', 'PHONICS_DATA'),
  'PHONICS_DATA が定義されていません'
);

// 2. 年齢グループの一貫性チェック
console.log('\n👶 年齢グループの一貫性チェック');
const ageGroups = ['4-6', '7-9', '10-12'];
ageGroups.forEach((age) => {
  test(
    `年齢グループ "${age}" の存在`,
    allContent.includes(`"${age}"`) || allContent.includes(`'${age}'`),
    `年齢グループ ${age} が見つかりません`
  );
});

// 3. 必須関数の存在確認
console.log('\n🔧 必須関数のチェック');
const requiredFunctions = [
  'updatePreview',
  'generateNormalPractice',
  'generateSentencePractice',
  'generateWordPractice',
  'generatePhonicsPractice',
  'generateAlphabetPractice',
  'generatePhrasePractice',
  'updateOptionsVisibility',
];

requiredFunctions.forEach((func) => {
  test(
    `関数 ${func} の存在`,
    scriptContent.includes(`function ${func}`) || scriptContent.includes(`const ${func}`),
    `関数 ${func} が見つかりません`
  );
});

// 4. 単語データの構造チェック
console.log('\n📝 単語データ構造のチェック');
const wordStructureRegex =
  /{\s*english:\s*["'][^"']+["'],\s*japanese:\s*["'][^"']+["'],\s*syllables:\s*["'][^"']+["']\s*}/;
test('単語データの構造', wordStructureRegex.test(allContent), '単語データの構造が正しくありません');

// 5. フレーズデータの構造チェック
console.log('\n💬 フレーズデータ構造のチェック');
const phraseStructureRegex =
  /english:\s*["'][^"']+["'][\s\S]*?japanese:\s*["'][^"']+["'][\s\S]*?situation:\s*["'][^"']+["']/;
test(
  'フレーズデータの構造',
  phraseStructureRegex.test(allContent),
  'フレーズデータの構造が正しくありません'
);

const phraseMetadataRegex = /\busageFrequency\b/;
test(
  'フレーズデータに使用頻度メタデータが含まれる',
  phraseMetadataRegex.test(phraseDataContent),
  'usageFrequency メタデータが追加されていません'
);

const phraseFocusMetadataRegex = /\bfocusWords\b/;
test(
  'フレーズデータに覚えたい単語メタデータが含まれる',
  phraseFocusMetadataRegex.test(phraseDataContent),
  'focusWords メタデータが追加されていません'
);

const phonicsPatternRegex = /\bdisplayPattern\b[\s\S]*?\bwords\b/;
test(
  'フォニックスデータの構造',
  phonicsPatternRegex.test(phonicsDataContent),
  'フォニックスデータの構造が正しくありません'
);

const phonicsPatternCount = (phonicsDataContent.match(/displayPattern:/g) || []).length;
test(
  'フォニックスパターンが8個以上ある',
  phonicsPatternCount >= 8,
  `フォニックスパターン数が不足しています: ${phonicsPatternCount}`
);

// 6. 例文データの構造チェック
console.log('\n📖 例文データ構造のチェック');
// More flexible regex that allows for multi-line formatting and any property order
const exampleStructureRegex =
  /english:\s*['"][^'"]+['"]\s*,[\s\S]*?japanese:\s*['"][^'"]+['"]\s*,[\s\S]*?category:\s*['"][^'"]+['"]\s*,[\s\S]*?difficulty:\s*\d+/;
test(
  '例文データの構造',
  exampleStructureRegex.test(allContent),
  '例文データの構造が正しくありません'
);

// 7. カテゴリーの存在確認
console.log('\n📁 カテゴリーの存在確認');
const expectedWordCategories = [
  'animals',
  'food',
  'colors',
  'numbers',
  'calendar',
  'school_items',
  'body_parts',
  'weather',
];
const expectedPhraseCategories = [
  'greetings',
  'self_introduction',
  'school',
  'shopping',
  'travel',
  'feelings',
  'daily_life',
];

expectedWordCategories.forEach((cat) => {
  test(
    `単語カテゴリー "${cat}"`,
    allContent.includes(`${cat}:`),
    `単語カテゴリー ${cat} が見つかりません`
  );
});

['at', 'an', 'ap', 'it', 'ig', 'op', 'ug', 'sh'].forEach((pattern) => {
  test(
    `フォニックスパターン "${pattern}"`,
    phonicsDataContent.includes(`${pattern}:`) || phonicsDataContent.includes(`'${pattern}'`),
    `フォニックスパターン ${pattern} が見つかりません`
  );
});

expectedPhraseCategories.forEach((cat) => {
  test(
    `フレーズカテゴリー "${cat}"`,
    allContent.includes(`${cat}:`),
    `フレーズカテゴリー ${cat} が見つかりません`
  );
});

// 8. イベントリスナーの確認
console.log('\n🎯 イベントリスナーのチェック');
const eventListeners = [
  'practiceMode',
  'ageGroup',
  'showExamples',
  'wordCategory',
  'phonicsPattern',
  'phraseCategory',
  'printBtn',
];

eventListeners.forEach((id) => {
  test(
    `イベントリスナー "${id}"`,
    scriptContent.includes(`getElementById('${id}')`) && scriptContent.includes('addEventListener'),
    `${id} のイベントリスナーが設定されていません`
  );
});

// 9. CSS クラスの使用確認
console.log('\n🎨 CSS クラスの使用確認');
const cssClasses = [
  'note-page',
  'baseline-group',
  'baseline',
  'example-sentence',
  'alphabet-grid',
  'phonics-item',
  'phrase-item',
];

cssClasses.forEach((cls) => {
  test(
    `CSS クラス "${cls}" の使用`,
    scriptContent.includes(cls),
    `CSS クラス ${cls} が使用されていません`
  );
});

// 10. 設定値の妥当性チェック
console.log('\n⚙️ 設定値の妥当性チェック');
// モジュール化後はCONFIGとしてインポートされている
const hasConfig = scriptContent.includes('CONFIG') || allContent.includes('CONFIG');
test('設定のインポート', hasConfig, '設定（CONFIG）がインポートされていません');
// 行高さと余白はCSSやHTMLで設定されるため、ここではインポートのみチェック

console.log('\n🧩 フォニックスUIのチェック');
test(
  'phonics モードの option',
  indexHtmlContent.includes('<option value="phonics">'),
  'phonics モードが index.html に追加されていません'
);
test(
  'phonics パターン selector',
  indexHtmlContent.includes('id="phonicsPattern"'),
  'phonicsPattern selector が index.html に追加されていません'
);

// テスト結果のサマリー
console.log('\n📊 テスト結果サマリー');
console.log(`合格: ${testResults.passed}`);
console.log(`失敗: ${testResults.failed}`);
console.log(`合計: ${testResults.passed + testResults.failed}`);

if (testResults.failed > 0) {
  console.log('\n❌ 失敗したテスト:');
  testResults.errors.forEach((error) => {
    console.log(`  - ${error.test}: ${error.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✅ すべてのテストに合格しました！');
  process.exit(0);
}
