# pptx-maker リポジトリ調査レポート

作成日: 2026-04-09

## 1. 使用されている技術スタック

### 1.1 全体アーキテクチャ
- フロントエンド: Vue 3 + TypeScript + Quasar Framework (Viteベース)
- バックエンド: Python (AWS Lambda実行想定)
- 出力処理: python-pptx による `.pptx` 生成
- デプロイ: フロントは GitHub Pages、バックは AWS Lambda

### 1.2 フロントエンド技術
- 言語/フレームワーク: TypeScript, Vue 3 (`script setup`)
- UI: Quasar 2
- ルーティング: Vue Router 4
- HTTPクライアント: Axios
- 日付処理: Day.js (日本語ロケール)
- 認証/データ: Firebase Auth, Cloud Firestore
- ビルドツール: Quasar CLI with Vite (`@quasar/app-vite`)
- 品質管理: ESLint, Prettier, EditorConfig

### 1.3 バックエンド技術
- 言語: Python
- 実行基盤: AWS Lambda (`lambda_function.py`)
- プレゼン生成: `python-pptx` (`Presentation`, `Inches`, `Cm`, `Pt`)
- 応答形式: JSON (Base64エンコード済みPPTXを返却)

### 1.4 CI/CD・運用
- GitHub Actions: `main` への push を契機にフロントエンドをビルドして GitHub Pages へデプロイ
- Dependabot: npm依存関係 (`/frontend`) と GitHub Actions を自動更新

## 2. 使用されている外部サービス・API

### 2.1 外部サービス
- AWS Lambda
  - バックエンド関数の実行環境
- Firebase
  - Firebase Authentication: ログイン処理
  - Cloud Firestore: 部門報告内容/連絡事項/ユーザロールの保存・購読
- GitHub Pages
  - フロントエンド静的配信
- GitHub Actions
  - CI/CD実行
- Dependabot
  - 依存関係の定期更新

### 2.2 利用API（アプリ内）
- バックエンドHTTP API
  - `POST /generate` (フロントからAxios経由)
  - 入力: 日付、部門報告、連絡事項
  - 出力: Base64文字列化されたPPTXファイル本体とファイル名
- Firebase SDK API
  - Auth: `signInWithEmailAndPassword`, `setPersistence`, `signOut`
  - Firestore: `doc`, `getDoc`, `updateDoc`, `onSnapshot`

## 3. 各コンポーネントの関係性

### 3.1 システム全体のデータフロー

```text
[ユーザ]
   |
   v
[Frontend (Vue + Quasar)]
   | 1) Firestore購読/更新、Auth認証
   | 2) POST /generate
   v
[Backend API (AWS Lambda + python-pptx)]
   | 3) PPTXを生成してBase64で返却
   v
[Frontend]
   | 4) Blob化してブラウザダウンロード
   v
[ユーザ端末に .pptx 保存]
```

### 3.2 フロントエンド内の関係
- `App.vue`
  - ルートガードを定義し、`meta.requiresAuth` を見て未ログイン時に `/login` へ遷移
- `router/routes.ts`
  - `/` (認証必須) → `MainLayout.vue` + `IndexPage.vue`
  - `/login` (認証不要) → `LoginPage.vue`
- `MainLayout.vue`
  - 共通ヘッダ表示、ログアウト導線を提供
- `IndexPage.vue`
  - `ContentForm.vue` を配置
  - `update-dialog` イベントを受け取り、右側ドロワーに連絡事項の目次表示
- `ContentForm.vue`
  - 主機能コンポーネント
  - Firestoreから部門報告・連絡事項をリアルタイム購読
  - 下書き保存 (`updateDoc`)
  - PPTX発行 (`api.post('/generate')`)
- `boot/firebase.ts`
  - Firebaseアプリ/Auth/Firestore初期化
- `boot/axios.ts`
  - APIクライアント初期化 (`VITE_API_URL`)

### 3.3 バックエンド内の関係
- `lambda_function.py`
  - Lambdaエントリポイント
  - 入力JSONを受け取り、`src/pptx_helper.py` の関数を組み合わせてスライド生成
  - 出力PPTXをBase64化して返却
- `src/pptx_helper.py`
  - スライドのレイアウト・書式・本文挿入処理の実装
  - 開始スライド、目次、部門報告、連絡事項スライド作成を担当

## 4. 各ファイル・フォルダの役割（要約）

### 4.1 ルート
- `/backend`
  - PPTX生成Lambdaコード群
- `/frontend`
  - 入力UI・認証・Firestore連携・ダウンロード処理を持つSPA
- `README.md`
  - プロジェクト概要、構成、デプロイ先説明
- `components.md`
  - 要件メモ（機能要件ドラフト）
- `edit.md`
  - 編集中制御などの作業メモ
- `.github/workflows/static.yml`
  - GitHub Pagesデプロイ用ワークフロー
- `.github/dependabot.yml`
  - Dependabot更新ルール
- `.gitignore`
  - ルート無視設定

### 4.2 backend 配下
- `backend/lambda_function.py`
  - Lambdaハンドラ。PPTX生成フロー統括とレスポンス作成
- `backend/src/pptx_helper.py`
  - スライド作成・書式設定・各種セクション生成ロジック
- `backend/README.md`
  - API入出力例
- `backend/edit_process.md`
  - 連絡事項スライド追加ルールのメモ
- `backend/layer.zip`
  - Lambdaレイヤ用依存ライブラリ一式
- `backend/.gitignore`
  - backend専用無視設定

### 4.3 frontend 配下（主要）
- `frontend/package.json`
  - 依存ライブラリとnpm scripts定義
- `frontend/quasar.config.js`
  - Quasar/Viteビルド設定、boot登録、環境変数受け渡し
- `frontend/index.html`
  - SPAエントリHTMLテンプレート
- `frontend/postcss.config.cjs`
  - PostCSS/Autoprefixer設定
- `frontend/tsconfig.json`
  - TypeScriptコンパイル設定
- `frontend/README.md`
  - フロント開発手順
- `frontend/package-lock.json`
  - 依存関係ロックファイル

### 4.4 frontend/src 配下
- `frontend/src/App.vue`
  - ルートガード実装、`router-view`起点
- `frontend/src/router/routes.ts`
  - ルーティング定義
- `frontend/src/router/index.ts`
  - Routerインスタンス生成
- `frontend/src/layouts/MainLayout.vue`
  - 共通レイアウト（ヘッダ・ログアウト）
- `frontend/src/pages/IndexPage.vue`
  - 入力ページ本体、右ドロワー表示
- `frontend/src/pages/LoginPage.vue`
  - ログインフォーム
- `frontend/src/pages/ErrorNotFound.vue`
  - 404ページ
- `frontend/src/components/ContentForm.vue`
  - 日付/部門報告/連絡事項入力、保存、PPTX発行
- `frontend/src/components/model.ts`
  - 連絡事項型 (`Dialog`) 定義
- `frontend/src/boot/axios.ts`
  - Axiosインスタンス初期化
- `frontend/src/boot/firebase.ts`
  - Firebase初期化とAuth/Firestoreエクスポート
- `frontend/src/boot/.gitkeep`
  - 空ディレクトリ維持用
- `frontend/src/css/app.scss`
  - グローバルSCSSエントリ
- `frontend/src/css/quasar.variables.scss`
  - Quasarテーマ変数
- `frontend/src/env.d.ts`
  - `process.env`型宣言
- `frontend/src/quasar.d.ts`
  - Quasar型拡張参照
- `frontend/src/shims-vue.d.ts`
  - `.vue`モジュール型宣言

### 4.5 frontend/public・補助設定
- `frontend/public/icons/*`, `frontend/public/favicon.ico`
  - ファビコン等静的アセット
- `frontend/.vscode/extensions.json`
  - 推奨VS Code拡張
- `frontend/.vscode/settings.json`
  - ワークスペース設定
- `frontend/.eslintrc.cjs`, `frontend/.eslintignore`
  - ESLint設定
- `frontend/.prettierrc`
  - Prettier設定
- `frontend/.editorconfig`
  - エディタフォーマット方針
- `frontend/.npmrc`
  - npm/pnpm挙動調整
- `frontend/.gitignore`
  - frontend無視設定

## 5. 補足（構成妥当性）

依頼どおり、プロジェクトは大枠として `backend` と `frontend` の2層構成で成立している。実装上は、
- `frontend`: 認証・入力・保存・発行要求
- `backend`: PPTX生成

という責務分離が明確で、静的配信 + サーバレス関数の組み合わせになっている。