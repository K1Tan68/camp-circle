# GitHub リポジトリセットアップ

## 1. GitHub でリポジトリ作成
1. https://github.com/new にアクセス
2. Repository name: `camp-circle`
3. Description: `Momoyama Gakuin University Camping Circle website`
4. Public に設定
5. "Create repository" をクリック

## 2. リポジトリが作成されたら、以下のコマンドを実行（コンソール）

```bash
cd /home/user/camp-circle
git remote add origin https://github.com/YOUR_USERNAME/camp-circle.git
git branch -M main
git push -u origin main
```

※ `YOUR_USERNAME` を実際の GitHub ユーザー名に置き換え

## 3. Push 時に認証が必要
- パスワード＆ユーザー名の代わりに **Personal Access Token (PAT)** を使う
- または **SSH キー** でもOK

### Personal Access Token での push（簡単）
1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" → "repo" にチェック → Generate
3. トークンをコピー
4. Push 時に聞かれたら、パスワード欄に **トークンをペースト**

---

ここまで完了したら、コマンド実行の指示を出します。
