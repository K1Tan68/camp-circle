# Vercel 環境変数設定手順

## 1. Vercel Dashboard を開く
https://vercel.com/dashboard → camp-circle プロジェクト → **Settings** → **Environment Variables**

## 2. 以下の環境変数を全て追加する

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `libsql://43fe5634-559e-49de-8e05-9961a76ce9ce-runable.aws-us-east-2.turso.io` |
| `DATABASE_AUTH_TOKEN` | `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzkzNzg1NDYsInAiOnsicnciOnsibnMiOlsiMDE5ZTRiMzktZTQwMS03NGNlLTk5YzItNDdkZjk0NmMwM2U3Il19fSwicmlkIjoiN2VhMTA0OTQtYzUyZS00OGE0LWE2ZWYtMDA5ODE4MWViOGQ0In0.xp3f4lAXDgi3okglDmtEo61JVHjCfoYS1Z7F9dqUT9H9Yssgkc1dg_WLo3-AEsZBItet043_g8x08FXHoTATAQ` |
| `S3_ENDPOINT` | `https://4e93db960a1c13ad600b2eb6eb1147c2.r2.cloudflarestorage.com` |
| `S3_BUCKET` | `43fe5634-559e-49de-8e05-9961a76ce9ce` |
| `S3_ACCESS_KEY_ID` | `84c077f478370d3d2d6a19fe743ee212` |
| `S3_SECRET_ACCESS_KEY` | `8482eee1ac52748d0f34647fb870741af659eaa2dbae279f9410d7274511f836` |
| `BETTER_AUTH_SECRET` | `WRwW3wx/IRQ5DeKa/BOYkbsPFNLTZoxSdLd4Tndxwvc=` |
| `WEBSITE_URL` | `https://camp-circle.vercel.app` |
| `RESEND_API_KEY` | `re_23i34MEW_FxbNmosezEYkpJSHKHkQqeLW` |

※ 各変数の Environment は **Production + Preview + Development** 全てにチェック

## 3. Vercel でビルドを再実行
Settings から「Redeploy」または GitHub に空コミット push

## 4. 動作確認
- https://camp-circle.vercel.app/api/health → `{"status":"ok"}` が返れば成功
- https://camp-circle.vercel.app/api/site-texts → テキスト一覧が返れば成功
- https://camp-circle.vercel.app/ → 公開サイト表示確認
- https://camp-circle.vercel.app/admin → 管理画面ログイン確認

## 補足: ビルドが動いていない場合
Vercel Dashboard → camp-circle → **Deployments** タブで最新のビルドログを確認。
エラーが出ていればログを共有してください。
