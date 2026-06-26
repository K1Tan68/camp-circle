# Vercel デプロイ作業ログ

## 目標
- /api/* Serverless Functions を動かす
- 環境変数を設定する
- https://camp-circle.vercel.app/ で完全動作

## 現状
- Vercel JS hash: B8z9HAKc (古い) → ローカル最新: DLAsMsRg
- /api/health → 404 (functions 未配備)
- git push は完了 (latest: eeeee32)
- Vercelのビルドが最新コミットを反映していない

## 問題の仮説
1. Vercel がGitHubの新しいコミットをトリガーしていない
2. ビルドは走っているがエラーで失敗している
3. functions の設定が正しくない

## 確認済み
- .vercel/project.json がルートにある → Vercelはルートをプロジェクトルートとして認識
- vercel.json にfunctionsを定義
- api/[...slug].ts が @hono/node-server の getRequestListener を使用

## 必要なアクション
- VERCEL_TOKEN が必要 (env var確認・設定)
- または Vercel Dashboard でビルドログ確認
- 必要な環境変数: DATABASE_URL, DATABASE_AUTH_TOKEN, S3_*, BETTER_AUTH_SECRET, RESEND_API_KEY, WEBSITE_URL

## ENV VARS 設定値 (from .env)
DATABASE_URL=libsql://43fe5634-559e-49de-8e05-9961a76ce9ce-runable.aws-us-east-2.turso.io
DATABASE_AUTH_TOKEN=eyJhbGc...
S3_ENDPOINT=https://4e93db960a1c13ad600b2eb6eb1147c2.r2.cloudflarestorage.com
S3_BUCKET=43fe5634-559e-49de-8e05-9961a76ce9ce
S3_ACCESS_KEY_ID=84c077f478370d3d2d6a19fe743ee212
S3_SECRET_ACCESS_KEY=8482eee1ac52748d0f34647fb870741af659eaa2dbae279f9410d7274511f836
BETTER_AUTH_SECRET=WRwW3wx/IRQ5DeKa/BOYkbsPFNLTZoxSdLd4Tndxwvc=
WEBSITE_URL=https://camp-circle.vercel.app
RESEND_API_KEY=re_23i34MEW_FxbNmosezEYkpJSHKHkQqeLW
