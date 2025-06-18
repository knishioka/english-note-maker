// レイアウト妥当性テスト

const fs = require('fs');
const path = require('path');

// CSSファイルを読み込み
const cssPath = path.join(__dirname, '..', 'styles.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// テスト結果
const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
};

// テスト関数
function test(name, condition, errorMessage, isWarning = false) {
    if (condition) {
        testResults.passed++;
        console.log(`✅ ${name}`);
    } else {
        if (isWarning) {
            testResults.warnings++;
            console.log(`⚠️  ${name}: ${errorMessage}`);
        } else {
            testResults.failed++;
            testResults.errors.push({ test: name, error: errorMessage });
            console.log(`❌ ${name}: ${errorMessage}`);
        }
    }
}

// CSSから値を抽出する関数
function extractCSSValue(pattern) {
    const match = cssContent.match(pattern);
    return match ? match[1] : null;
}

// 1. A4サイズ設定の確認
console.log('\n📄 A4サイズ設定のチェック');
test('@page size: A4 の設定', cssContent.includes('size: A4'), '@page で A4 サイズが設定されていません');
test('印刷時の余白設定', cssContent.includes('@page') && cssContent.includes('margin:'), '印刷時の余白が設定されていません');

// 2. 4本線ベースラインの設定確認
console.log('\n📏 4本線ベースラインのチェック');
const baselineClasses = ['baseline--top', 'baseline--upper', 'baseline--lower', 'baseline--bottom'];
baselineClasses.forEach(cls => {
    test(`ベースライン "${cls}" の定義`, cssContent.includes(`.${cls}`), `${cls} が定義されていません`);
});

// 3. 行高さの設定確認
console.log('\n📐 行高さ設定のチェック');
const lineHeightMatch = cssContent.match(/\.baseline-group\s*{[^}]*height:\s*(\d+)mm/);
if (lineHeightMatch) {
    const height = parseInt(lineHeightMatch[1]);
    test('行高さの範囲 (8-12mm)', height >= 8 && height <= 12, `行高さ ${height}mm は推奨範囲外です`);
} else {
    test('行高さの設定', false, '行高さが設定されていません');
}

// 4. 印刷用スタイルの確認
console.log('\n🖨️ 印刷用スタイルのチェック');
test('@media print の存在', cssContent.includes('@media print'), '印刷用スタイルが定義されていません');
test('.no-print クラスの非表示設定', cssContent.includes('.no-print') && cssContent.includes('display: none'), '.no-print の非表示設定がありません');

// 5. レスポンシブデザインの確認
console.log('\n📱 レスポンシブデザインのチェック');
test('@media (max-width の存在', cssContent.includes('@media (max-width'), 'レスポンシブデザインが設定されていません');

// 6. 必須CSSクラスの存在確認
console.log('\n🎨 必須CSSクラスのチェック');
const requiredClasses = [
    'note-page',
    'baseline-group',
    'baseline',
    'example-sentence',
    'example-english',
    'example-japanese',
    'controls',
    'preview',
    'btn--primary'
];

requiredClasses.forEach(cls => {
    test(`CSS クラス ".${cls}"`, cssContent.includes(`.${cls}`), `必須クラス .${cls} が見つかりません`);
});

// 7. 色の設定確認
console.log('\n🎨 色設定のチェック');
test('CSS変数 --baseline-color', cssContent.includes('--baseline-color'), 'ベースライン色の変数が設定されていません');
test('CSS変数 --primary-color', cssContent.includes('--primary-color'), 'プライマリ色の変数が設定されていません');

// 8. フォントサイズの確認
console.log('\n📝 フォントサイズのチェック');
const exampleFontMatch = cssContent.match(/\.example-english\s*{[^}]*font-size:\s*(\d+)pt/);
if (exampleFontMatch) {
    const fontSize = parseInt(exampleFontMatch[1]);
    test('例文フォントサイズ (12-18pt)', fontSize >= 12 && fontSize <= 18, `フォントサイズ ${fontSize}pt は推奨範囲外です`, true);
}

// 9. 余白設定の確認
console.log('\n📏 余白設定のチェック');
const marginMatch = cssContent.match(/\.note-page\s*{[^}]*padding:\s*(\d+)mm/);
if (marginMatch) {
    const margin = parseInt(marginMatch[1]);
    test('ページ余白 (10-20mm)', margin >= 10 && margin <= 20, `余白 ${margin}mm は推奨範囲外です`);
}

// 10. アルファベット練習用グリッドの確認
console.log('\n🔤 アルファベット練習レイアウトのチェック');
test('alphabet-grid クラス', cssContent.includes('.alphabet-grid'), 'アルファベットグリッドが定義されていません');
test('グリッドレイアウトの使用', cssContent.includes('display: grid') && cssContent.includes('grid-template-columns'), 'グリッドレイアウトが設定されていません');

// 11. ページ区切りの設定
console.log('\n📃 ページ区切り設定のチェック');
test('page-break-inside: avoid', cssContent.includes('page-break-inside: avoid'), 'ページ内改行防止が設定されていません');

// 12. 線の太さ設定
console.log('\n✏️ 線の太さ設定のチェック');
test('ベースライン太線の設定', cssContent.includes('baseline--lower') && cssContent.includes('2px'), 'ベースラインの太線が設定されていません');

// テスト結果のサマリー
console.log('\n📊 テスト結果サマリー');
console.log(`合格: ${testResults.passed}`);
console.log(`失敗: ${testResults.failed}`);
console.log(`警告: ${testResults.warnings}`);
console.log(`合計: ${testResults.passed + testResults.failed + testResults.warnings}`);

if (testResults.failed > 0) {
    console.log('\n❌ 失敗したテスト:');
    testResults.errors.forEach(error => {
        console.log(`  - ${error.test}: ${error.error}`);
    });
    process.exit(1);
} else if (testResults.warnings > 0) {
    console.log('\n⚠️  警告はありますが、テストは合格です');
    process.exit(0);
} else {
    console.log('\n✅ すべてのテストに合格しました！');
    process.exit(0);
}