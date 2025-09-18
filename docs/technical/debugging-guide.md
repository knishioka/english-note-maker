# 🐛 デバッグガイド - 英語罫線ノート作成ツール

このガイドでは、英語罫線ノート作成ツールの新しいデバッグシステムの使用方法を説明します。従来の `console.log` を置き換える構造化されたデバッグシステムと、Playwright MCP を使用した自動テストを活用します。

## 📋 目次

1. [概要](#概要)
2. [デバッグユーティリティの使用方法](#デバッグユーティリティの使用方法)
3. [デバッグパネルの使用](#デバッグパネルの使用)
4. [Playwright テストの実行](#playwright-テストの実行)
5. [パフォーマンス測定](#パフォーマンス測定)
6. [トラブルシューティング](#トラブルシューティング)
7. [ベストプラクティス](#ベストプラクティス)

## 概要

### 旧来の手法 vs 新しい手法

**従来の console.log デバッグ:**

```javascript
// 問題のあるアプローチ
console.log('ボタンがクリックされました');
console.log('要素の状態:', element.style.display);
```

**新しい構造化デバッグ:**

```javascript
// 改善されたアプローチ
Debug.logEvent('click', { id: 'previewBtn' }, { action: 'showPrintPreview' });
Debug.logElement('#printPreviewModal', '印刷プレビューモーダル');
```

### 主要な改善点

- **構造化ログ**: カテゴリー別の整理されたログ出力
- **パフォーマンス測定**: 自動的な処理時間測定
- **エラー追跡**: エラーと警告の自動収集
- **ビジュアルデバッグ**: 開発者パネルでの可視化
- **自動テスト**: Playwright による自動UI検証

## デバッグユーティリティの使用方法

### 基本的なログ出力

```javascript
// 情報ログ
Debug.log('CATEGORY', 'メッセージ', { data: 'value' });

// エラーログ
Debug.error('CATEGORY', 'エラーメッセージ', { error: errorObject });

// 警告ログ
Debug.warn('CATEGORY', '警告メッセージ', { context: 'details' });

// デバッグログ（開発環境のみ）
Debug.debug('CATEGORY', 'デバッグ情報', { state: currentState });
```

### カテゴリー別ログの例

**初期化ログ:**

```javascript
Debug.log('INIT', 'アプリケーション初期化完了');
```

**UI インタラクションログ:**

```javascript
Debug.logEvent('click', { id: 'previewBtn' }, { action: 'showPrintPreview' });
Debug.logElement('#printPreviewModal', '印刷プレビューモーダル');
```

**印刷関連ログ:**

```javascript
Debug.log('PRINT_PREVIEW', 'プレビュー生成開始', {
  pageCount: 1,
  lineHeight: '10mm',
});
```

**パフォーマンス測定:**

```javascript
Debug.startTimer('print-preview');
// 処理実行
Debug.endTimer('print-preview'); // 自動的に時間が記録される
```

### エラーハンドリング

```javascript
try {
  // 何らかの処理
} catch (error) {
  Debug.error('OPERATION', '処理中にエラーが発生', {
    error: error.message,
    stack: error.stack,
    context: { pageMode: 'preview' },
  });
}
```

## デバッグパネルの使用

### デバッグパネルの起動

1. **キーボードショートカット**: `Ctrl + Shift + D`
2. **手動実行**: ブラウザコンソールで `Debug.panel.show()`

### デバッグパネルの機能

**ページ状態の確認:**

- 現在の練習モード
- 罫線の高さ設定
- ページ数設定

**アクティブ要素の監視:**

- モーダルの表示状態
- プレビュー要素の数
- 現在フォーカスされている要素

**パフォーマンス情報:**

- メモリ使用量
- DOM ノード数
- 処理時間

**エラー・警告の一覧:**

- 収集されたエラーメッセージ
- 警告の詳細
- ログのエクスポート機能

### デバッグパネルのコントロール

- **状態更新**: リアルタイムでページ状態を更新
- **ログエクスポート**: JSON形式でログをダウンロード
- **ログクリア**: 収集されたログをクリア

## Playwright テストの実行

### 環境設定

```bash
# Playwright のインストール
npm run test:install

# 開発サーバーの起動（別ターミナル）
npm run dev

# サーバーの疎通確認
npm run server:check
```

### テストの実行方法

**基本的なテスト実行:**

```bash
# すべてのテストを実行
npm run test

# デバッグモードでテスト実行
npm run test:debug

# UI モードでテスト実行
npm run test:ui

# ヘッドありモードでテスト実行
npm run test:headed
```

**特定のテストファイルの実行:**

```bash
# 印刷プレビューのデバッグテストのみ実行
npx playwright test tests/e2e/debug-print-preview.spec.js
```

### テスト結果の確認

```bash
# テストレポートの表示
npm run test:reporter
```

### 利用可能なテストシナリオ

1. **印刷プレビューボタンの動作テスト**
2. **モーダルの表示・非表示テスト**
3. **CSS変数の検証テスト**
4. **イベントリスナーの確認テスト**
5. **レイアウト構造の検証テスト**
6. **パフォーマンス測定テスト**

## パフォーマンス測定

### 自動パフォーマンス測定

```javascript
// 自動的に測定される項目
Debug.startTimer('operation-name');
// 処理
Debug.endTimer('operation-name');

// 閾値チェック付きの測定
const duration = Debug.endTimer('slow-operation');
if (duration > 100) {
  Debug.warn('PERFORMANCE', '処理が遅いです', { duration });
}
```

### ページロード性能の測定

```javascript
// ページロード完了時に自動実行
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  Debug.log('PERFORMANCE', 'ページロード完了', {
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
    loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
  });
});
```

### メモリ使用量の監視

```javascript
// メモリ使用量の確認（Chrome のみ）
if (performance.memory) {
  Debug.log('PERFORMANCE', 'メモリ使用量', {
    used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB',
    total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + 'MB',
  });
}
```

## トラブルシューティング

### よくある問題と解決方法

**1. デバッグパネルが表示されない**

```javascript
// 手動でデバッグパネルを初期化
if (window.Debug) {
  Debug.panel.init();
  Debug.panel.show();
} else {
  console.error('Debug utilities not loaded');
}
```

**2. ログが表示されない**

```javascript
// デバッグユーティリティの状態確認
console.log('Debug available:', !!window.Debug);
console.log('Development mode:', window.Debug?.logger?.isDevelopment);
```

**3. Playwright テストが失敗する**

```bash
# サーバーが起動しているか確認
npm run server:check

# ブラウザの手動インストール
npx playwright install --with-deps
```

**4. パフォーマンス測定が動作しない**

```javascript
// Performance API の対応確認
console.log('Performance API:', !!window.performance);
console.log('Performance memory:', !!performance.memory);
```

### デバッグ情報の収集

**システム情報の確認:**

```javascript
Debug.log('SYSTEM', 'ブラウザ情報', {
  userAgent: navigator.userAgent,
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  url: window.location.href,
});
```

**エラーの詳細ログ:**

```javascript
window.addEventListener('error', (e) => {
  Debug.error('SYSTEM', 'JavaScript エラー', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno,
    stack: e.error?.stack,
  });
});
```

## ベストプラクティス

### 1. 適切なカテゴリーの使用

```javascript
// Good: 明確なカテゴリー
Debug.log('PRINT_PREVIEW', 'モーダル表示完了');
Debug.error('VALIDATION', 'フォーム検証エラー');

// Bad: 曖昧なカテゴリー
Debug.log('DEBUG', '何かが起こった');
```

### 2. 意味のあるデータの含有

```javascript
// Good: 有用な情報を含む
Debug.log('USER_ACTION', 'フレーズカテゴリー変更', {
  oldCategory: 'greetings',
  newCategory: 'school',
  timestamp: Date.now(),
});

// Bad: 情報が不足
Debug.log('USER_ACTION', 'カテゴリー変更');
```

### 3. パフォーマンス測定の活用

```javascript
// Good: 重要な処理の測定
Debug.startTimer('note-generation');
generateNotePage();
const duration = Debug.endTimer('note-generation');

// 閾値チェック
if (duration > 500) {
  Debug.warn('PERFORMANCE', 'ノート生成が遅い', { duration });
}
```

### 4. エラーハンドリングの統一

```javascript
// Good: 一貫したエラーハンドリング
function handlePrintPreview() {
  try {
    Debug.startTimer('print-preview');
    showPrintPreview();
    Debug.endTimer('print-preview');
  } catch (error) {
    Debug.error('PRINT_PREVIEW', '印刷プレビューエラー', {
      error: error.message,
      stack: error.stack,
      context: getCurrentState(),
    });
    throw error; // 必要に応じて再スロー
  }
}
```

### 5. プロダクション環境での配慮

```javascript
// デバッグコードは開発環境でのみ実行
if (window.Debug?.logger?.isDevelopment) {
  Debug.debug('INTERNAL', '詳細なデバッグ情報', largeObject);
}

// または条件付きログ
Debug.log('USER_ACTION', 'アクション実行', productionSafeData);
```

## 高度な使用方法

### カスタムデバッグカテゴリーの作成

```javascript
// 特定機能用のカスタムログ関数
const PhraseDebug = {
  log: (message, data) => Debug.log('PHRASE_PRACTICE', message, data),
  error: (message, data) => Debug.error('PHRASE_PRACTICE', message, data),
  performance: (operation, fn) => {
    Debug.startTimer(operation);
    const result = fn();
    Debug.endTimer(operation);
    return result;
  },
};

// 使用例
PhraseDebug.log('フレーズ選択完了', { category: 'greetings', count: 5 });
```

### デバッグ情報の永続化

```javascript
// ローカルストレージへのログ保存
const persistentLogger = {
  save: () => {
    const logs = Debug.logger.exportLogs();
    localStorage.setItem('debug-logs', JSON.stringify(logs));
  },
  load: () => {
    const stored = localStorage.getItem('debug-logs');
    return stored ? JSON.parse(stored) : null;
  },
  clear: () => {
    localStorage.removeItem('debug-logs');
  },
};
```

### Playwright との連携

```javascript
// テスト用のデバッグ情報露出
window.testUtils = {
  getDebugLogs: () => Debug.logger.exportLogs(),
  getElementState: (selector) => {
    const element = document.querySelector(selector);
    return element
      ? {
          visible: window.getComputedStyle(element).display !== 'none',
          rect: element.getBoundingClientRect(),
          classes: element.className,
        }
      : null;
  },
  simulateError: () => {
    Debug.error('TEST', 'テスト用エラー', { test: true });
  },
};
```

## まとめ

このデバッグシステムにより、以下の利点が得られます：

1. **効率的なデバッグ**: 構造化されたログで問題の特定が容易
2. **自動テスト**: Playwright による継続的な品質保証
3. **パフォーマンス監視**: リアルタイムな性能測定
4. **開発者体験向上**: 直感的なデバッグパネル

従来の `console.log` ベースのデバッグから、この新しいシステムに移行することで、より効果的で維持可能なデバッグワークフローを実現できます。
