# pptx-maker

DA研のための定例会資料作成支援ツール

## Frontend Migration

- 現行フロントエンドは Next.js 版の `/frontend-next` です
- 既存の `/frontend` (Vue + Quasar) は移行比較用のレガシー実装として保持しています

## Project Structure

- `/backend`
  - .pptx ファイル作成のための Python プロジェクト
- `/frontend-next`
  - UI や API/Firebase 連携のための Next.js プロジェクト（現行）
- `/frontend`
  - 旧 UI（Vue.js + Quasar）

## Deployment

- バックエンド
  - [AWS Lambda](https://aws.amazon.com/jp/lambda/)
    - 依存ライブラリ群を [zip](/backend/layer.zip) でまとめています（linux で pre-compile 済み）
      - レイヤとしてそのまま使用可

- フロントエンド
  - [GitHub Pages](https://docs.github.com/ja/pages/getting-started-with-github-pages/about-github-pages)
    - Next.js (`/frontend-next`) を static export した成果物が [GitHub Actions](https://github.co.jp/features/actions) によって自動でデプロイされます。詳しくは[ワークフロー](https://github.com/dakken205/pptx-maker/blob/main/.github/workflows/static.yml)を確認してください
  - [Firebase](https://firebase.google.com/)

## Author

- [Koyama Akiyuki](https://github.com/llillillj)
