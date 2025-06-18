#!/bin/bash

echo "🚀 英語罫線ノートPDFテストシステム"
echo "=================================="
echo ""

# 現在のディレクトリを保存
ORIGINAL_DIR=$(pwd)

# testディレクトリに移動
cd "$(dirname "$0")"

# 依存関係のチェック
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストールしています..."
    npm install
    echo ""
fi

# サーバーの起動
echo "🌐 開発サーバーを起動しています..."
npm run serve &
SERVER_PID=$!

# サーバーが起動するまで待機
echo "⏳ サーバーの起動を待っています..."
sleep 3

# サーバーが起動しているか確認
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ サーバーが正常に起動しました！"
    echo ""
    
    # PDFテストを実行
    echo "📋 PDFプレビューテストを実行中..."
    echo "=================================="
    node pdf-preview.js
    
    # テスト結果を表示
    echo ""
    echo "📊 テスト結果:"
    echo "-------------"
    ls -la pdf-output/*.pdf 2>/dev/null | wc -l | xargs echo "生成されたPDF数:"
    ls -la pdf-output/*.png 2>/dev/null | wc -l | xargs echo "生成されたスクリーンショット数:"
    
else
    echo "❌ サーバーの起動に失敗しました"
fi

# サーバーを停止
echo ""
echo "🛑 サーバーを停止しています..."
kill $SERVER_PID 2>/dev/null

# 元のディレクトリに戻る
cd "$ORIGINAL_DIR"

echo ""
echo "✨ テスト完了！"
echo "📁 出力ファイルは test/pdf-output/ ディレクトリを確認してください。"