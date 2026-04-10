# frontend-next

Next.js (App Router) を用いた `pptx-maker` の新フロントエンドです。

## 技術スタック

- Next.js 15 + React 18 + TypeScript
- Firebase Authentication / Cloud Firestore
- Day.js

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成し、値を設定してください。

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

3. 開発サーバ起動

```bash
npm run dev
```

## 機能

- メール/パスワードログイン
- Firestoreのリアルタイム同期 (`root/departments`)
- 部門別入力のロール制御 (`users/{email}.role`)
- 下書き保存
- バックエンド `/generate` へのPOSTでPowerPoint生成・ダウンロード

## デプロイ

GitHub Actions で `npm run build` を実行し、Next.js static export の成果物 (`out`) を GitHub Pages へ配置します。
