# PDF プレビューテストシステム

英語罫線ノート作成アプリのPDF出力を自動的にテストするシステムです。

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
cd test
npm install
```

### 2. テストの実行

**ターミナル1でサーバーを起動:**
```bash
cd test
npm run serve
```

**ターミナル2でテストを実行:**
```bash
cd test
npm test
```

## 📋 テストケース

1. **normal-practice-default** - 通常練習（デフォルト設定）
2. **normal-practice-with-examples** - 通常練習（例文付き）
3. **sentence-practice-no-translation** - 文章練習（日本語訳なし）
4. **sentence-practice-with-translation** - 文章練習（日本語訳あり）
5. **word-practice** - 単語練習モード
6. **multi-page-test** - 複数ページ生成テスト
7. **small-line-height** - 小さい罫線高さ（8mm）
8. **large-line-height** - 大きい罫線高さ（12mm）

## 📁 出力ファイル

テスト実行後、`pdf-output`ディレクトリに以下のファイルが生成されます：

- `[テスト名].pdf` - 生成されたPDFファイル
- `[テスト名].png` - ページのスクリーンショット

## 🔍 品質検証

各テストケースで以下の項目が自動検証されます：

- 罫線の高さ（8-12mm）
- 罫線の間隔（1-5mm）
- ベースラインの太さ（1-2.5px）
- ページ余白（10-20mm）
- 例文のフォントサイズ（12-18pt）

## 🛠️ トラブルシューティング

### サーバーが起動しない場合

```bash
# ポートが使用中か確認
lsof -i :3000

# 別のポートで起動
http-server .. -p 8080 -c-1
```

### Puppeteerエラーの場合

```bash
# Chromiumの再インストール
node node_modules/puppeteer/install.js
```

## 📊 レポートの見方

テスト実行時のコンソール出力：

```
📄 Generating: normal-practice-default
   ✅ PDF saved: /path/to/pdf-output/normal-practice-default.pdf
   ✅ Screenshot saved: /path/to/pdf-output/normal-practice-default.png
   ✅ Validation: All checks passed
```

エラーがある場合：
```
   ⚠️  Validation: 1 errors, 2 warnings
      ❌ lineHeight: 7.5mm (期待値: 8-12mm)
```

## 🎯 使用例

### 特定の設定をテスト

`pdf-preview.js`の`TEST_CONFIGS`配列に新しいテストケースを追加：

```javascript
{
    name: 'custom-test',
    settings: {
        practiceMode: 'normal',
        showExamples: true,
        ageGroup: '7-9',
        lineHeight: '11',
        lineColor: 'blue',
        showHeader: true,
        pageCount: 2
    }
}
```

### バッチテスト

全てのテストケースを一度に実行して品質を確認できます。