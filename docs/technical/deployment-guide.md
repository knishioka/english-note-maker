# デプロイメント・運用ガイド

## 🌐 GitHub Pages デプロイメント

### 前提条件

- **フロントエンドのみで完結**: サーバーサイド処理なし
- **静的ファイルのみ**: HTML, CSS, JavaScript
- **外部API不要**: 完全オフライン動作可能

### デプロイ手順

1. **リポジトリ設定**

```bash
# GitHub Pages を有効化
# Settings → Pages → Source → Deploy from a branch
# Branch: main, Folder: / (root)
```

2. **公開URL**

```
https://knishioka.github.io/english-note-maker/
```

3. **更新方法**

```bash
# mainブランチにプッシュすると自動デプロイ
git add .
git commit -m "feat: 機能追加"
git push origin main
```

### デプロイ時の注意事項

#### ✅ 必須確認項目

- [ ] 相対パスの使用（絶対パスは避ける）
- [ ] HTTPSリソースのみ参照
- [ ] 外部依存なし（CDN不使用）
- [ ] ローカルストレージのみ使用

#### ❌ 避けるべきこと

- サーバーサイドAPI呼び出し
- 環境変数の使用
- 認証機能
- データベース連携

## 🖥️ 開発環境の管理

### ポート管理

```javascript
// package.json で明示的にポート指定
{
  "scripts": {
    "dev": "live-server --port=3000",
    "dev:alt": "live-server --port=8080"  // 代替ポート
  }
}
```

### サーバー起動確認スクリプト

```bash
#!/bin/bash
# check-server.sh

PORT=${1:-3000}  # デフォルト3000、引数で変更可能
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT)

if [ "$STATUS" = "200" ]; then
    echo "✅ Server is running on port $PORT"
else
    echo "❌ Server is not responding on port $PORT"
    echo "Starting server..."
    npm run dev &
    sleep 3
    # 再確認
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT)
    if [ "$STATUS" = "200" ]; then
        echo "✅ Server started successfully"
    else
        echo "❌ Failed to start server"
    fi
fi
```

### 開発時のチェックリスト

1. **サーバー起動前**
   - [ ] 既存プロセスの確認: `lsof -i :3000`
   - [ ] ポート競合の解決: `kill -9 $(lsof -t -i:3000)`

2. **サーバー起動後**
   - [ ] 疎通確認: `curl http://localhost:3000`
   - [ ] ブラウザアクセス確認
   - [ ] コンソールエラーチェック

## 🔍 品質管理の自動化

### レイアウト検証スクリプト

```javascript
// layout-validator.js

const validateLayout = () => {
  const checks = {
    lineHeight: {
      min: 8, // mm
      max: 12, // mm
      current: null,
      status: 'pending',
    },
    lineSpacing: {
      min: 1, // mm
      max: 5, // mm
      current: null,
      status: 'pending',
    },
    pageMargin: {
      min: 5, // mm
      max: 20, // mm
      current: null,
      status: 'pending',
    },
    linesPerPage: {
      min: 10,
      max: 30,
      current: null,
      status: 'pending',
    },
  };

  // 実際の値を測定
  const measureLayout = () => {
    const baselineGroup = document.querySelector('.baseline-group');
    const notePage = document.querySelector('.note-page');

    if (baselineGroup) {
      const computedStyle = window.getComputedStyle(baselineGroup);
      checks.lineHeight.current = parseFloat(computedStyle.height);
      checks.lineSpacing.current = parseFloat(computedStyle.marginBottom);
    }

    if (notePage) {
      const computedStyle = window.getComputedStyle(notePage);
      checks.pageMargin.current = parseFloat(computedStyle.padding);
    }

    const lineCount = document.querySelectorAll('.baseline-group').length;
    checks.linesPerPage.current = lineCount;
  };

  // 検証実行
  const validate = () => {
    measureLayout();

    Object.keys(checks).forEach((key) => {
      const check = checks[key];
      if (check.current !== null) {
        if (check.current >= check.min && check.current <= check.max) {
          check.status = 'pass';
        } else {
          check.status = 'fail';
        }
      }
    });

    return checks;
  };

  return validate();
};

// 自動検証の実行
window.addEventListener('load', () => {
  const results = validateLayout();
  console.table(results);

  // 問題があれば警告
  const hasFailure = Object.values(results).some((r) => r.status === 'fail');
  if (hasFailure) {
    console.warn('⚠️ レイアウト検証で問題が見つかりました');
  }
});
```

### 印刷品質チェッカー

```javascript
// print-quality-checker.js

const checkPrintQuality = () => {
  const issues = [];

  // 1. 細すぎる線のチェック
  const lines = document.querySelectorAll('.baseline');
  lines.forEach((line, index) => {
    const style = window.getComputedStyle(line);
    const borderWidth = parseFloat(style.borderBottomWidth);

    if (borderWidth < 0.5) {
      issues.push({
        type: 'warning',
        element: `baseline-${index}`,
        message: '線が細すぎる可能性があります（< 0.5px）',
      });
    }
  });

  // 2. 余白チェック
  const notePage = document.querySelector('.note-page');
  if (notePage) {
    const style = window.getComputedStyle(notePage);
    const padding = parseFloat(style.padding);

    if (padding < 10) {
      issues.push({
        type: 'error',
        element: 'note-page',
        message: '余白が小さすぎます（< 10mm）',
      });
    } else if (padding > 25) {
      issues.push({
        type: 'warning',
        element: 'note-page',
        message: '余白が大きすぎる可能性があります（> 25mm）',
      });
    }
  }

  // 3. フォントサイズチェック
  const examples = document.querySelectorAll('.example-english');
  examples.forEach((example, index) => {
    const style = window.getComputedStyle(example);
    const fontSize = parseFloat(style.fontSize);

    if (fontSize < 10) {
      issues.push({
        type: 'error',
        element: `example-${index}`,
        message: 'フォントが小さすぎます（< 10pt）',
      });
    }
  });

  // 4. ページ溢れチェック
  const pageHeight = 297; // A4 height in mm
  const contentHeight = document.querySelector('.note-page').scrollHeight / 3.7795275591; // px to mm

  if (contentHeight > pageHeight) {
    issues.push({
      type: 'error',
      element: 'page',
      message: `コンテンツがA4サイズを超えています（${Math.round(contentHeight)}mm）`,
    });
  }

  return issues;
};

// 印刷前の自動チェック
window.addEventListener('beforeprint', () => {
  const issues = checkPrintQuality();

  if (issues.length > 0) {
    console.group('🖨️ 印刷品質チェック結果');
    issues.forEach((issue) => {
      if (issue.type === 'error') {
        console.error(`❌ ${issue.element}: ${issue.message}`);
      } else {
        console.warn(`⚠️ ${issue.element}: ${issue.message}`);
      }
    });
    console.groupEnd();

    // エラーがある場合は確認
    const hasErrors = issues.some((i) => i.type === 'error');
    if (hasErrors) {
      if (!confirm('印刷品質に問題がある可能性があります。続行しますか？')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }
  } else {
    console.log('✅ 印刷品質チェック: 問題なし');
  }
});
```

## 📸 印刷プレビュー機能

### 仮想印刷プレビュー実装

```javascript
// print-preview.js

const createPrintPreview = () => {
  // プレビューモーダルの作成
  const modal = document.createElement('div');
  modal.id = 'print-preview-modal';
  modal.innerHTML = `
        <div class="print-preview-container">
            <div class="print-preview-header">
                <h3>印刷プレビュー</h3>
                <button id="close-preview">閉じる</button>
                <button id="actual-print">印刷する</button>
            </div>
            <div class="print-preview-content">
                <iframe id="print-preview-frame"></iframe>
            </div>
            <div class="print-preview-info">
                <p>用紙サイズ: A4</p>
                <p>余白: 10mm</p>
                <p id="page-count">ページ数: 1</p>
            </div>
        </div>
    `;

  // スタイル追加
  const style = document.createElement('style');
  style.textContent = `
        #print-preview-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            z-index: 9999;
        }
        
        .print-preview-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            width: 90%;
            height: 90%;
            max-width: 800px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
        }
        
        .print-preview-header {
            padding: 1rem;
            border-bottom: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .print-preview-content {
            flex: 1;
            padding: 1rem;
            overflow: auto;
            background: #f5f5f5;
        }
        
        #print-preview-frame {
            width: 100%;
            height: 100%;
            border: 1px solid #ddd;
            background: white;
        }
        
        .print-preview-info {
            padding: 1rem;
            border-top: 1px solid #ddd;
            font-size: 0.9rem;
            color: #666;
        }
    `;

  document.head.appendChild(style);
  document.body.appendChild(modal);

  // イベントハンドラ
  document.getElementById('close-preview').addEventListener('click', () => {
    modal.style.display = 'none';
  });

  document.getElementById('actual-print').addEventListener('click', () => {
    modal.style.display = 'none';
    window.print();
  });

  return {
    show: () => {
      // プレビュー用のコンテンツを生成
      const printContent = document.querySelector('.note-preview').innerHTML;
      const printStyles = Array.from(document.styleSheets)
        .map((sheet) => {
          try {
            return Array.from(sheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      const previewHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        ${printStyles}
                        @media screen {
                            body { margin: 0; }
                            .note-page { box-shadow: none !important; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `;

      const iframe = document.getElementById('print-preview-frame');
      iframe.srcdoc = previewHTML;

      modal.style.display = 'block';
    },
  };
};

// 印刷ボタンの置き換え
document.addEventListener('DOMContentLoaded', () => {
  const printPreview = createPrintPreview();
  const printBtn = document.getElementById('printBtn');

  if (printBtn) {
    printBtn.addEventListener('click', (e) => {
      e.preventDefault();
      printPreview.show();
    });
  }
});
```

## 🚨 運用時の注意事項

### デプロイ前チェックリスト

- [ ] ローカルでの動作確認
- [ ] 印刷プレビューの確認
- [ ] レイアウト自動検証の実行
- [ ] 全ブラウザでのテスト
- [ ] コンソールエラーなし

### 監視項目

1. **GitHub Pages ステータス**
   - Actions の成功確認
   - デプロイ完了通知

2. **アクセシビリティ**
   - Lighthouse スコア 90以上
   - 印刷品質の定期確認

### トラブルシューティング

| 問題                 | 原因           | 対処法            |
| -------------------- | -------------- | ----------------- |
| ページが表示されない | パス設定ミス   | 相対パスに修正    |
| 印刷レイアウト崩れ   | CSS未適用      | @media print 確認 |
| 文字化け             | フォント未対応 | Webフォント追加   |
