# 独立サイト完成ガイド

## ✅ 完了した内容
- ✅ GitHub に全コード push（K1Tan68/camp-circle）
- ✅ Vercel でプロダクションデプロイ
- ✅ 公開URL: **https://camp-circle.vercel.app**
- ✅ Gmail API 動作確認済み

## 📋 次にやることは 3 つだけ

### 1. 独自ドメイン `momoyama-camp.jp` を購入
- お名前.com / Cloudflare / ムームードメイン など
- 年額 1,000〜3,000 円程度

### 2. Vercel でドメインを接続
1. Vercel ダッシュボード → camp-circle プロジェクト
2. Settings → Domains
3. "Add" をクリック → `momoyama-camp.jp` を入力
4. Vercel が DNS 設定を指示（CNAME を 1 行追加するだけ）
5. ドメイン管理画面に CNAME を設定
6. 反映待ち（5〜48 時間）

### 3. SNS プロフィールを更新
- Instagram: プロフィール → `https://momoyama-camp.jp`
- Twitter/X: 同様に URL 更新
- YouTube: チャンネル説明に追加

---

## 🎯 この後について

### Runnable の解約後も動く？
**はい。完全に独立します。**

- コードは GitHub で管理
- サイトは Vercel でホスティング（無料枠）
- メール機能は Gmail API（無料）
- Runnable の契約終了しても問題なし

### 年間コスト
- ドメイン：1,000〜3,000 円/年
- ホスティング：0 円（Vercel 無料枠）
- メール：0 円（Gmail API）
- **合計：1,000〜3,000 円/年**

---

## 📞 更新方法

コードを更新したい場合：
```bash
# 1. GitHub にコミット＆プッシュ
git add .
git commit -m "Update..."
git push

# 2. Vercel が自動デプロイ（GitHub との連携有効）
# → 数分で反映される
```

メール設定変更が必要な場合：
- `.env` ファイルの Gmail 設定を変更 → push
