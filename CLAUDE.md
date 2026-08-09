# CLAUDE.md - 英語罫線ノート作成ウェブアプリ開発ガイド

## 📚 プロジェクト概要

**プロジェクト名**: 英語罫線ノート作成ウェブアプリ
**バージョン**: v1.0.0
**最終更新**: 2025年6月
**実装完了率**: 0%（開発開始）

フロントエンドで完結する英語学習用罫線ノート作成システムです。A4印刷に最適化され、4本線のベースライン表示により美しいアルファベットの練習が可能。例文と日本語訳の表示機能も備えた教育現場向けツールです。

### 🎯 主要機能（実装予定）

- 🎯 **4本線ベースライン**: アルファベット練習に最適な罫線表示
- 📄 **A4印刷最適化**: 適切な余白とページ設定
- 📝 **例文表示**: 英語例文と日本語訳のオプション表示
- 🖨️ **PDF生成**: ブラウザネイティブ印刷機能活用
- ✏️ **手書き練習**: 美しいアルファベット練習に特化

## 開発規約

### コーディング規約

#### HTML/CSS/JavaScript

- HTML5セマンティック要素を使用
- CSS Grid/Flexboxを活用したレスポンシブデザイン
- ES6+モダンJavaScript使用
- 外部ライブラリは最小限に抑制

```javascript
// Good: モダンJavaScript
const createNotePage = (options = {}) => {
  const { showExamples = false, lineHeight = 8 } = options;
  return generatePageHTML(showExamples, lineHeight);
};

// Bad: 古い書き方
function createNotePage(options) {
  options = options || {};
  var showExamples = options.showExamples || false;
  // ...
}
```

#### CSS

- BEM記法またはCSS Modules使用
- 印刷用CSS（@media print）を重視
- CSS Custom Properties（CSS変数）を活用

```css
/* Good: CSS変数とBEM記法 */
:root {
  --line-height: 8mm;
  --baseline-color: #e0e0e0;
  --text-color: #333;
}

.note-page__line {
  height: var(--line-height);
  border-bottom: 1px solid var(--baseline-color);
}

.note-page__baseline {
  position: relative;
  border-bottom: 1px dotted var(--baseline-color);
}
```

#### 命名規則

- 関数・変数: camelCase
- 定数: UPPER_SNAKE_CASE
- CSS クラス: kebab-case（BEM記法）
- ファイル名: kebab-case

### 印刷最適化規約

#### A4サイズ設定

```css
@media print {
  @page {
    size: A4;
    margin: 0;
  }

  html {
    margin: 10mm 10mm; /* コンパクトな余白設定 */
  }

  .note-page {
    width: 100%;
    height: 100vh;
    page-break-after: always;
  }
}
```

#### 4本線ベースライン実装

```css
.baseline-group {
  height: 8mm; /* 標準的な英語練習用行間 */
  position: relative;
  margin-bottom: 2mm;
}

.baseline {
  position: absolute;
  width: 100%;
  border-bottom: 0.5px solid #d0d0d0;
}

.baseline--top {
  top: 0;
}
.baseline--upper {
  top: 25%;
}
.baseline--lower {
  top: 75%;
}
.baseline--bottom {
  top: 100%;
}
```

### Git規約

#### コミットメッセージ

```
<type>(<scope>): <subject>

<body>

<footer>
```

- type: feat, fix, docs, style, refactor, test, chore
- scope: page, print, baseline, examples
- subject: 変更内容の要約（50文字以内）

例:

```
feat(baseline): add 4-line baseline grid system

- Implement CSS-based 4-line system for alphabet practice
- Add customizable line height options
- Include dotted baseline guides

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 実装のコツ

### 印刷最適化（参考：数学プリント）

1. **ブラウザネイティブ印刷**: 外部ライブラリ不使用で軽量化
2. **動的レイアウト生成**: 印刷専用DOM構造の作成
3. **@pageルール活用**: margin: 0でブラウザ余白を無効化
4. **メディアクエリ**: 画面表示と印刷表示の切り分け

```javascript
// 印刷専用レイアウト生成
const generatePrintLayout = (options) => {
  const printContainer = document.createElement('div');
  printContainer.id = 'print-container';
  printContainer.style.minHeight = '100vh';
  printContainer.style.padding = '20mm';

  // 4本線ベースライン生成
  for (let i = 0; i < options.lineCount; i++) {
    const lineGroup = createBaselineGroup();
    printContainer.appendChild(lineGroup);
  }

  return printContainer;
};
```

### 4本線ベースライン実装

1. **標準サイズ**: 8mm行間（一般的な英語練習帳仕様）
2. **4本構成**:
   - 上線（大文字の頂点）
   - 中線上（小文字の頂点）
   - 中線下（ベースライン）
   - 下線（下降文字の底）
3. **視認性**: 薄いグレー（#d0d0d0）で印刷時に邪魔にならない

### 例文機能実装

1. **オプション表示**: チェックボックスで表示/非表示切り替え
2. **レイアウト**: 例文は罫線の上部に小さく表示
3. **日本語訳**: 例文の下または横に配置
4. **フォント**: 読みやすいサンセリフ体使用

```javascript
const exampleSentences = [
  {
    english: 'The quick brown fox jumps over the lazy dog.',
    japanese: '素早い茶色のキツネが怠惰な犬を飛び越える。',
  },
  {
    english: 'Practice makes perfect.',
    japanese: '練習は完璧を作る。',
  },
];

const renderExample = (sentence, showTranslation) => {
  return `
    <div class="example-sentence">
      <div class="example-english">${sentence.english}</div>
      ${showTranslation ? `<div class="example-japanese">${sentence.japanese}</div>` : ''}
    </div>
  `;
};
```

### 日本語表記のルール（年齢別）

学習者は日本語の訳・場面説明を読んでから英語を書く。読めない漢字が混ざると問題として
成立しないため、**日本語は対象年齢で必ず読める表記にそろえる**。判定ロジックと学年別漢字
配当表は `src/data/kanji-grade-levels.js`、検査は `test/japanese-age-level.test.js`。

| 年齢     | 使ってよい漢字         | 分かち書き | 例                                                                   |
| -------- | ---------------------- | ---------- | -------------------------------------------------------------------- |
| 4〜6歳   | なし（かな・カナのみ） | する       | `きょうは はれです。`                                                |
| 7〜9歳   | 小1〜小2（240字）      | しない     | `今日は 雨がふるかもしれません。` → `今日は雨がふるかもしれません。` |
| 10〜12歳 | 小1〜小4（約640字）    | しない     | `今週末、台風が来ます。`                                             |

- 上限を超える語は**かな書き**にする（例: 10-12歳は「感謝」→「かんしゃ」）。かな書きで
  読みにくくなる場合は、同じ意味で上限内の語に**言い換える**（例:「重要性」→「大切さ」）。
- 4-6歳はかなだけになるので文節ごとにスペースを入れる。7-9歳以上は教科書と同じく詰める。
- データを足すときは `npm test` で `test/japanese-age-level.test.js` を通すこと。

### 日本語文と英文の対応

穴埋め練習では日本語が唯一の手がかりになるため、**日本語から英文が一意に決まる**ように書く。

- 同じ年齢・カテゴリー・場面で、同じ日本語に複数の英文を割り当てない（テストで検出）。
- 単複・冠詞のずれに注意する。空所はマス目と数字で文字数を示すので、日本語が単数を
  想起させるのに答えが複数形だと文字数が合わずに解けなくなる。
  - 悪い例: `We should bring jackets.` /「ジャケットを持っていくべきです。」
  - 良い例: `We should bring a jacket.` /「ジャケットを1まいもっていきましょう。」

## 🔧 開発コマンド

```bash
# 開発環境
npm install          # 依存関係インストール
npm run dev         # 開発サーバー起動（localhost:3000）

# 品質チェック
npm run lint        # コード品質チェック
npm run test        # テスト実行（コンテンツ＋レイアウト）
npm run test:content # コンテンツ整合性テスト
npm run test:layout  # レイアウト妥当性テスト

# 本番ビルド
npm run build       # 静的ファイル最適化
```

### 🚨 開発時の重要な注意事項

#### 1. サーバー起動と疎通確認

- ユーザーに確認を求める前に、必ず開発サーバーが起動していることを確認する
- 疎通確認コマンド: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
- HTTPステータス200が返ることを確認してから案内する
- サーバー起動が必要な場合は `npm run dev &` でバックグラウンド実行
- **重要**: ポート番号（3000）は package.json の設定と一致させる

```bash
# サーバー起動と疎通確認の例
npm run dev &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# 200が返れば正常
```

#### 2. GitHub Pages デプロイメント

- **フロントエンドのみで完結**: サーバーサイド機能は使用不可
- 相対パスを使用（絶対パスは避ける）
- 外部API呼び出しなし
- LocalStorage のみ使用可能
- **公開URL**: https://knishioka.github.io/english-note-maker/

##### リリース後の確認手順

1. **GitHub Actions の確認**
   - https://github.com/knishioka/english-note-maker/actions でワークフローの成功を確認
   - `static.yml` (デプロイ) と `test.yml` (テスト) の両方がグリーンであること

2. **本番サイトの動作確認**

   ```bash
   # サイトの疎通確認
   curl -s -o /dev/null -w "%{http_code}" https://knishioka.github.io/english-note-maker/
   # 200が返れば正常
   ```

3. **ブラウザでの確認項目**
   - [ ] ページが正常に表示される
   - [ ] 練習モードの切り替えが動作する
   - [ ] プレビューが正しく更新される
   - [ ] 印刷ボタンで印刷ダイアログが開く
   - [ ] コンソールにエラーが出ていない

4. **印刷品質の確認**
   - [ ] 印刷プレビューでA4サイズに収まっている
   - [ ] 4本線が正しく表示されている
   - [ ] 余白が適切に設定されている

#### 3. 印刷品質の厳格な管理

- **レイアウト崩れの自動検知**: LayoutValidator クラスを使用
- **印刷プレビュー機能**: 実装必須
- **品質基準の遵守**:
  - 罫線高さ: 8-12mm
  - 余白: 10-20mm
  - A4サイズ1枚に収まること

```javascript
// 印刷前の品質チェック例
const validator = new LayoutValidator();
const report = validator.generateReport();
if (report.errors.length > 0) {
  console.error('印刷品質に問題があります');
}
```

## 📖 技術スタック

- **HTML5**: セマンティックマークアップ
- **CSS3**: Grid/Flexbox, CSS Variables, Media Queries
- **JavaScript ES6+**: モダンJavaScript、モジュール化
- **Print CSS**: ブラウザネイティブ印刷最適化
- **Live Server**: 開発用サーバー

## 📞 参考資料

### 必読ドキュメント

- **[ドキュメント一覧](./docs/README.md)** - 全ドキュメントの索引とクイックリファレンス
- **[デプロイメント・運用ガイド](./docs/technical/deployment-guide.md)** - GitHub Pages展開とサーバー管理
- **[印刷品質保証ガイド](./docs/technical/print-quality-assurance.md)** - レイアウト自動検証システム

### 技術仕様

- **[PDF印刷技術](./docs/technical/pdf-printing-tips.md)** - ブラウザネイティブ印刷の実装
- **[機能要件書](./docs/specifications/feature-requirements.md)** - 詳細な要件定義
- **[開発ロードマップ](./docs/plans/development-roadmap.md)** - 今後の開発計画
- **[テストシナリオ](./docs/testing/test-scenarios.md)** - 品質検証手順

## 📊 コンテンツ統計の確認

開発中のコンテンツ数を確認するには、ブラウザのコンソールで以下を実行：

```javascript
// コンテンツ統計を表示
displayContentStats();
```

これにより、単語・フレーズ・例文の総数とカテゴリー別・年齢別の内訳が表示されます。

## 🎯 開発優先度

### Phase 1: 基本機能（高優先度）

1. 4本線ベースライン表示
2. A4印刷対応
3. 基本的なページレイアウト

### Phase 2: 拡張機能（中優先度）

1. 例文表示機能
2. 日本語訳オプション
3. 行数・行間カスタマイズ

### Phase 3: 改善・最適化（低優先度）

1. ユーザビリティ向上
2. 追加的な練習機能
3. 印刷品質の微調整
