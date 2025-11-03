# AGENTS.md — english-note-maker リポジトリ運用ガイド / Repository Operations Guide

> **適用範囲 / Scope**
>
> - このファイルはリポジトリ直下にあるため、サブディレクトリを含む全ファイルに適用されます。
> - 将来 AGENTS.md を追加する場合は、より深い階層のファイルに対してその内容が優先される「近接優先ルール」を必ず明記してください。
> - 記載内容は安全で再現性のある開発作業を支援するためのベースラインであり、上位のポリシー（社内規定等）があればそちらを優先してください。

---

## 1. Overview（概要）

### 1.1 プロジェクトの目的 / Purpose

- **英語罫線ノート作成ツール**: 小学生〜中学生向けに 4 本線の英語練習用ノートを生成する SPA（Static Web App）。ブラウザのみで動作し、印刷または PDF として出力可能。
- **静的ホスティング**: GitHub Pages で配信、バックエンド無し。
- **学習支援**: 豊富な単語・フレーズコンテンツ（年齢別カテゴリ）、自動レイアウト検証ロジックを備える。

### 1.2 技術スタック / Tech Stack

- 言語: TypeScript + JavaScript
- ビルド: [Vite](https://vitejs.dev/) + `tsc`
- テスト: [Vitest](https://vitest.dev/)、Playwright（E2E）
- Lint/Format: ESLint、Prettier
- CI: GitHub Actions（`test.yml`, `static.yml`）

### 1.3 ディレクトリ構成 / Directory Map

```
english-note-maker/
├── index.html                # ルート SPA エントリーポイント
├── styles.css                # グローバル/印刷用スタイル
├── script.js                 # メイン UI ロジック
├── src/
│   └── quality-validator.js  # 印刷レイアウト検証ロジック
├── tests/
│   └── e2e/                  # Playwright シナリオ
├── test/                     # Node ベースのコンテンツ/レイアウト検証スクリプト
├── docs/                     # 詳細ドキュメント・調査ノート
├── playwright.config.js      # E2E 設定
├── vitest.config.ts          # Vitest 設定
├── tsconfig.json             # TypeScript 設定
└── .github/workflows/        # CI 定義（テスト、Pages デプロイ）
```

### 1.4 キーアセット / Key Artifacts

- `package.json`: npm スクリプト・依存管理
- `.husky/pre-commit`: lint-staged + 各種テストを実行するフック
- `playwright-report/`: E2E レポート出力先（生成物）
- `test-results/`: Playwright 実行時の成果物、Git 管理対象外

---

## 2. Setup（セットアップ）

### 2.1 必須ソフトウェア

- **Node.js 18.x**（CI 互換のため推奨、`package.json` の `engines` は `>=14` を示すが CI は Node 18）
- **npm 9.x 以降**（`package-lock.json` に合わせて npm を利用。pnpm / yarn は非推奨）
- Git, 任意のシェル（bash/zsh）、ブラウザ（Chrome/Edge/Safari）

### 2.2 推奨ツール

- `nvm` または `fnm` で Node バージョンを固定
- VS Code + 拡張機能（ESLint, Prettier, Playwright）
- PDF プレビュー可能なビューア（ブラウザまたは `pdfpc` 等）

### 2.3 セットアップ手順 / Setup Steps

```bash
# 1. Node バージョンを合わせる
nvm install 18 && nvm use 18

# 2. 依存をインストール
npm install

# 3. Playwright ブラウザを初回のみ導入
npx playwright install --with-deps

# 4. 開発サーバー起動（ホットリロード）
npm run dev
```

### 2.4 開発環境のヒント

- `.env` は使用していない。秘密情報を扱う場合は **必ず別管理** し、環境変数または Secret Manager を利用する。
- Git Hooks（Husky）は `npm install` 実行時に自動でセットアップされる。無効化は避ける（品質担保のため）。
- Playwright の `webServer` 設定により、ローカルでは `live-server` が自動起動する。既存ポート使用時は Runbook を参照。

---

## 3. Build / Lint / Typecheck / Test / E2E コマンド

| Category                | Primary Command         | Notes                                                          |
| ----------------------- | ----------------------- | -------------------------------------------------------------- |
| **Install**             | `npm install`           | 依存追加は要承認（Safety参照）                                 |
| **Dev Server**          | `npm run dev`           | Vite 開発サーバー。`--host` オプションで LAN 公開可            |
| **Legacy Dev**          | `npm run dev:legacy`    | `live-server` を使用した簡易確認                               |
| **Build**               | `npm run build`         | `tsc` → `vite build`。`dist/` に成果物                         |
| **Production Build**    | `npm run build:prod`    | `NODE_ENV=production` でビルド（CI 非使用）                    |
| **Preview**             | `npm run preview`       | ローカルで静的ビルドを確認                                     |
| **Typecheck**           | `npm run typecheck`     | `tsc --noEmit`（strictness は `tsconfig.json` 参照）           |
| **Lint**                | `npm run lint`          | ESLint (`eslint.config.js`) を全ファイルに実行                 |
| **Format (write)**      | `npm run format`        | Prettier。必要に応じ `lint-staged` が自動実行                  |
| **Unit/Test**           | `npm run test`          | Vitest（UI なし）。`npm run test:ui` でブラウザ UI             |
| **Coverage**            | `npm run test:coverage` | Vitest カバレッジ収集                                          |
| **Content Test**        | `npm run test:content`  | Node スクリプトでコンテンツ構造検証                            |
| **Layout Test**         | `npm run test:layout`   | A4 レイアウト検証スクリプト                                    |
| **E2E**                 | `npm run test:e2e`      | Playwright 全ブラウザ（Chromium/Firefox/WebKit/モバイル/印刷） |
| **E2E Headed**          | `npm run test:headed`   | Playwright を UI 表示モードで実行                              |
| **Server Health Check** | `npm run server:check`  | 3000 番ポートで HTTP ステータスを確認                          |
| **Validate**            | `npm run validate`      | `typecheck` → `lint` → `test:coverage` の順で一括実行          |
| **Clean**               | `npm run clean`         | `dist`, `coverage`, `.turbo` を削除                            |

> **補足**: `npm test`（`npm run test` と同義）は `.husky/pre-commit` 内でも利用されるため、ローカルでのコミット前に失敗するとコミットがブロックされます。

---

## 4. Runbook（よくあるエラーと対処）

### 4.1 Node バージョン不一致

- **症状**: `npm install` 時に `Unsupported engine`、または Vite 実行時に SyntaxError。
- **対応**: `node -v` を確認し、`nvm use 18` などで CI と揃える。`corepack` を使わず npm を利用。

### 4.2 Playwright ブラウザ未インストール

- **症状**: `npm run test:e2e` が `browserType.launch: Executable doesn't exist` で失敗。
- **対応**: `npx playwright install --with-deps` を実行。Linux では追加ライブラリを apt で導入する必要がある場合あり。

### 4.3 ポート競合（3000 番）

- **症状**: `npm run dev` または `npm run test:e2e` 起動時に「Address already in use」。
- **対応**: `lsof -i :3000` 等でプロセス確認し終了。代替ポートを利用する場合は `npm run dev -- --port=3001` と指定し、Playwright 実行前に `BASE_URL` を調整（`.env` 未使用のため `playwright.config.js` の `baseURL` を一時的に変更するときは PR には含めないこと）。

### 4.4 Husky フックでの失敗

- **症状**: コミットが拒否される。ログに `lint-staged`/`test:content` などの失敗が表示。
- **対応**: 失敗したコマンドを個別に再実行し修正。必要に応じ `npm run lint -- --fix`、`npm run format`、`npm run test:content` などで事前検証。

### 4.5 Vitest での DOM 依存エラー

- **症状**: `ReferenceError: document is not defined`。
- **対応**: `vitest.config.ts` で `environment: 'jsdom'` が設定されていることを確認。新規テスト作成時は `describe` 内で DOM 依存を避けるか `vi.stubGlobal` を活用。

### 4.6 GitHub Actions の HTML/CSS 検証失敗

- **症状**: `test.yml` 内の `html-validate`, `node -c` などが失敗。
- **対応**: ローカルで同等コマンドを実行して再現 (`npx html-validate index.html`, `node -c script.js`)。テンプレートリテラルの改行などに注意。

---

## 5. Safety & Permissions（操作ポリシー）

- **許可済み（要承認不要） / Allowed**
  - ファイルの閲覧、コメント、軽微なドキュメント更新
  - 単一ファイルまたはローカル限定のフォーマット/リンティング/型チェック実行
  - 単体テスト・一部コマンドの手動実行（`npm run test`, `npm run lint` など）
  - スクリーンショット取得、PR 作成、CI 再実行
- **要承認 / Requires Approval**
  - 依存の追加・更新（`package.json`/`package-lock.json` 書き換え）
  - 大規模リネーム、ファイル削除、アーキテクチャ変更
  - DB や外部サービスへの永続的な変更（本リポジトリでは通常無し）
  - Playwright の全ブラウザを伴う長時間 E2E を CI 以外で全量実行する場合
- **禁止 / Prohibited**
  - API キーなど秘密情報のコミット
  - 不要な依存・ロックファイル更新
  - 外部へのデータ送信、無断の計測ツール追加

---

## 6. Do / Don’t（推奨・非推奨パターン）

### 6.1 Do（推奨）

- 小さな差分で PR を作成し、影響範囲を明確化する
- 既存の npm スクリプトを再利用し、独自スクリプトは `package.json` に追加して共有
- CI と同じ Node バージョンでローカル検証する
- Playwright レポートや Vitest スナップショットの生成物はコミットしない
- ドキュメントから対象コードやテストへのリンクを併記してナビゲート可能にする

### 6.2 Don’t（非推奨）

- フレームワークを追加するなど、大きな依存変更を無断で行う
- 既存の UI をクラスコンポーネントへ書き換える（本プロジェクトはプレーン JS/TS で構築）
- `dist/`, `coverage/`, `test-results/` をコミットする
- `lint-staged` を回避するために Husky を削除または無効化する
- ESLint/Prettier 設定を個人都合で改変する（変更が必要な場合は議論と承認を得る）

---

## 7. PR / CI ルール

### 7.1 ブランチ命名 / Branch Naming

- 例: `feature/<summary>`, `fix/<issue-id>`, `chore/<task>`
- 自動生成タスクでは `chore/docs-agentsmd-YYYYMMDD` の形式を推奨

### 7.2 コミットメッセージ / Commit Messages

- [Conventional Commits](https://www.conventionalcommits.org/) を推奨（例: `feat: add printable PDF layout`、`fix: correct word list age range`）
- ドキュメント更新のみの場合は `docs:` プレフィックスを使用

### 7.3 必須ステータスチェック / Required Checks

- **Test Content and Layout**（`.github/workflows/test.yml`）
  - npm install → HTML/CSS/JS 構文検査 → Node ベースのコンテンツ/レイアウト検証
- **Deploy static content to Pages**（`.github/workflows/static.yml`）
  - main ブランチへの push 時に発火。PR では `pages-build-deployment` が参考ステータスとして表示される場合あり。

### 7.4 PR 作法 / Pull Request Etiquette

- タイトルに変更内容を簡潔に記載（例: `[fix] adjust phrase layout spacing`）
- 説明文には背景・変更内容・テスト結果（コマンド出力）を記載
- 画面変更がある場合はスクリーンショットを添付
- 依存追加や設定変更を含む場合はレビュアーに明示し承認を得る

### 7.5 コードレビューのポイント

- テンプレートリテラルでの HTML 生成は XSS を誘発しないように慎重に扱う
- 印刷関連の寸法（mm/px 変換）は `quality-validator` の制約を満たす必要がある
- Playwright テストは `tests/e2e` のコンベンションに従い、`data-testid` 属性の追加で安定性を確保

---

## 8. 受入基準 / Definition of Done

1. **ローカル検証**
   - 最低限 `npm run validate`（typecheck → lint → test:coverage）で成功すること
   - コンテンツ/レイアウト変更を伴う場合は `npm run test:content` と `npm run test:layout` を追加実行
   - E2E に影響する UI 変更時は `npm run test:e2e` を実行し、Playwright レポートを確認
2. **CI 合格**
   - GitHub Actions の `Test Content and Layout` が ✅ であること
   - （main マージ後に）`Deploy static content to Pages` が失敗していないこと
3. **コード品質**
   - ESLint/Prettier の警告なし（`npm run lint`、`npm run format`）
   - TypeScript 型エラーなし（`npm run typecheck`）
4. **ドキュメント**
   - 変更点に関する README / docs の更新が必要な場合は実施
   - コミットメッセージ・PR 説明に実行コマンドと結果を記載

---

## 9. 付録 / Appendix

### 9.1 参考リンク

- デモ: <https://knishioka.github.io/english-note-maker/>
- Playwright: <https://playwright.dev/>
- Vitest: <https://vitest.dev/>
- Vite: <https://vitejs.dev/>

### 9.2 用語集

- **4 本線ノート**: 上・中・中下・下の 4 本線で文字練習をサポートする罫線
- **lint-staged**: ステージされたファイルに限定してフォーマッタ/リンタを実行するツール
- **Husky**: Git Hooks 管理ツール。本プロジェクトでは pre-commit を制御

---

このガイドは継続的に更新してください。新しいワークフロー、依存、テスト戦略を追加する際は、本ファイルまたは該当ディレクトリ配下の AGENTS.md に追記し、近接優先ルールを忘れずに記載しましょう。
