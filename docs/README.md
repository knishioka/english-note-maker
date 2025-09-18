# 📚 英語罫線ノート作成アプリ - ドキュメント一覧

## 🗂️ ドキュメント構成

### 📋 計画・仕様書

- **[開発ロードマップ](plans/development-roadmap.md)** - 今後の機能追加計画とリリーススケジュール
- **[機能要件書](specifications/feature-requirements.md)** - 詳細な機能要件と非機能要件

### 🛠️ 技術ドキュメント

- **[PDF印刷技術ガイド](technical/pdf-printing-tips.md)** - ブラウザネイティブ印刷の実装詳細
- **[デプロイメント・運用ガイド](technical/deployment-guide.md)** 🆕 - GitHub Pages展開と品質管理
- **[印刷品質保証ガイド](technical/print-quality-assurance.md)** 🆕 - レイアウト検証と自動チェック

### 🧪 テスト・検証

- **[テストシナリオ](testing/test-scenarios.md)** - 機能テストケースと検証チェックリスト

### 🏠 プロジェクトルート

- **[CLAUDE.md](../CLAUDE.md)** - AI開発ガイド（コーディング規約・重要事項）
- **[README.md](../README.md)** - プロジェクト概要とクイックスタート

## 🎯 ドキュメントの目的

### 開発者向け

1. **品質保証**: 印刷レイアウトの自動検証
2. **運用管理**: デプロイと監視の自動化
3. **拡張性**: 新機能追加のガイドライン

### 利用者向け

1. **使い方**: 基本操作と印刷手順
2. **トラブルシューティング**: よくある問題の解決
3. **カスタマイズ**: 設定変更の方法

## 📊 重要な数値基準

### レイアウト基準

- **罫線高さ**: 8-12mm（推奨10mm）
- **余白**: 10-20mm（推奨10mm）
- **1ページ行数**: 15-20行

### 品質基準

- **印刷成功率**: 95%以上
- **A4適合率**: 100%
- **可読性スコア**: 80点以上

## 🔍 クイックリファレンス

### よく参照される情報

#### サーバー起動確認

```bash
# ポート3000で確認
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# 結果が200ならOK
```

#### 印刷品質チェック

```javascript
// ブラウザコンソールで実行
const validator = new LayoutValidator();
validator.generateReport();
```

#### GitHub Pagesデプロイ

```bash
# mainブランチにプッシュで自動デプロイ
git push origin main

# 公開URL
https://knishioka.github.io/english-note-maker/
```

## 📝 ドキュメント更新履歴

### 2025年6月18日

- ✅ デプロイメント・運用ガイド追加
- ✅ 印刷品質保証ガイド追加
- ✅ 自動検証スクリプト実装
- ✅ ドキュメント一覧（本ファイル）作成

### 今後の予定

- 📅 ユーザーマニュアル作成
- 📅 API仕様書（将来の拡張用）
- 📅 パフォーマンスチューニングガイド

## 🤝 貢献方法

ドキュメントの改善提案は以下の方法で：

1. **Issue作成**: 不明点や改善案
2. **Pull Request**: 直接編集して提案
3. **Discussion**: アイデアの議論

## 📞 関連リンク

- [GitHubリポジトリ](https://github.com/knishioka/english-note-maker)
- [ライブデモ](https://knishioka.github.io/english-note-maker/)
- [問題報告](https://github.com/knishioka/english-note-maker/issues)
