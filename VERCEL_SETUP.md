# Vercel デプロイ設定手順

## 1. Vercel ダッシュボードにアクセス
https://vercel.com/dashboard

## 2. `camp-circle` プロジェクトを開く
新しく作成された `camp-circle` プロジェクトをクリック

## 3. GitHub を接続（重要）
- Settings → Git Integrations
- "Connect GitHub" をクリック
- K1Tan68/camp-circle リポジトリを選択

## 4. 環境変数を設定
Settings → Environment Variables に以下を追加：

```
GMAIL_USER=campmomoyama@gmail.com
GMAIL_APP_PASSWORD=<ローカルの .env からコピー>
GOOGLE_OAUTH_CLIENT_ID=<ローカルの .env からコピー>
GOOGLE_OAUTH_CLIENT_SECRET=<ローカルの .env からコピー>
GOOGLE_OAUTH_REFRESH_TOKEN=<ローカルの .env からコピー>
```

> ⚠️ 実際の値は `.env` ファイルに保存されています（Gitには含めません）。Vercelの管理画面に直接貼り付けてください。

各行ごとに "Add" をクリック

## 5. デプロイ実行
Deployments → "Redeploy" をクリック

## 6. カスタムドメイン設定（後でOK）
Domains → "Add" で `momoyama-camp.jp` を追加
DNS 設定は指示に従う

---

Web UI で上記を完了したら、デプロイが自動開始されます。
