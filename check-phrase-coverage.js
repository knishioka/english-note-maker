// フレーズカバレッジチェック
const fs = require('fs');
const path = require('path');

// script.jsを読み込み
const scriptContent = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// PHRASE_DATAを抽出
const phraseDataMatch = scriptContent.match(/const PHRASE_DATA = ({[\s\S]*?});/);
if (!phraseDataMatch) {
  console.error('PHRASE_DATA not found');
  process.exit(1);
}

// 簡易的な解析（実際のJavaScriptコードから抽出）
console.log('📊 フレーズカテゴリー別の数量:\n');

const categories = [
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
];

const ageGroups = ['4-6', '7-9', '10-12'];

let totalPhrases = 0;
let displayedPhrases = 0;
const maxDisplayed = 4; // 現在の表示上限

categories.forEach((category) => {
  console.log(`\n【${category}】`);
  ageGroups.forEach((age) => {
    // カテゴリーと年齢でフレーズを検索
    const pattern = new RegExp(`${category}:[\\s\\S]*?"${age}":\\s*\\[([\\s\\S]*?)\\]`, 'g');
    const matches = scriptContent.match(pattern);

    if (matches) {
      // フレーズ数をカウント（english:の出現回数）
      const phrasePattern = new RegExp('english:\\s*"[^"]+"', 'g');
      const fullMatch = scriptContent.match(
        new RegExp(`${category}:[\\s\\S]*?"${age}":\\s*\\[([\\s\\S]*?)\\]`)
      );
      if (fullMatch) {
        const phraseMatches = fullMatch[1].match(phrasePattern);
        const count = phraseMatches ? phraseMatches.length : 0;

        if (count > 0) {
          const displayed = Math.min(count, maxDisplayed);
          const notDisplayed = Math.max(0, count - maxDisplayed);

          console.log(`  ${age}歳: ${count}個 (表示: ${displayed}個, 非表示: ${notDisplayed}個)`);

          totalPhrases += count;
          displayedPhrases += displayed;
        }
      }
    }
  });
});

console.log('\n========================================');
console.log(`📈 合計フレーズ数: ${totalPhrases}個`);
console.log(`✅ 表示されるフレーズ: ${displayedPhrases}個`);
console.log(`❌ 表示されないフレーズ: ${totalPhrases - displayedPhrases}個`);
console.log(`📊 カバー率: ${((displayedPhrases / totalPhrases) * 100).toFixed(1)}%`);
console.log('========================================');

console.log('\n💡 改善案:');
console.log('1. ランダム選択: 毎回異なる4つのフレーズを表示');
console.log('2. 複数ページ: 全フレーズを複数ページに分割');
console.log('3. シャッフルボタン: ユーザーが次のセットを選択可能');
console.log('4. フレーズ数増加: 1ページあたりの表示数を増やす（レイアウト調整必要）');
