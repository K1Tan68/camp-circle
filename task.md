# camp-circle 管理画面拡張タスク

## 目標
公開サイト + 独立管理画面に分割。UIでコンテンツ編集（ファイル編集不要）。

## アーキテクチャ
- 公開サイト: momoyama-camp.jp（表示のみ）
- 管理画面: admin.momoyama-camp.jp（認証 + CRUD）※同リポジトリ、Vercel別プロジェクトでデプロイ
- バックエンド: 同じHono API共有
- DB: Turso (libsql)

## 認証
- メール+パスワード（better-auth）
- 許可メールリスト方式: ki.ki.souta.kun@gmail.com / sygo0302513@gmail.com
- 後から管理画面でメール追加可能

## 機能要件
1. 活動スケジュール: 月ごと複数件、date+title+description、個別編集
2. ギャラリー: サークル企画の写真、複数アップロード、eventTitle+month+caption+location
3. 活動報告: メンバー個人記事、authorName+title+content+複数写真、月分類

## 進捗
- [x] schema.ts 拡張（events.date, photos.eventTitle/month, posts.authorName/month/photos, adminEmails テーブル）
- [x] events.ts ルート更新（date対応）
- [x] photos.ts ルート更新（eventTitle/month + PUT追加）
- [x] posts.ts ルート更新（authorName/month/photos対応）
- [x] admin.ts ルート更新（allowed-emails CRUD）
- [x] auth.ts フック（許可メールチェック + editor自動付与）
- [x] seed.ts（初期管理者メール登録）
- [x] 管理画面UI: スケジュールPanel（date追加）
- [x] 管理画面UI: ギャラリーPanel（月ごと + 複数アップロード + 企画名）
- [x] 管理画面UI: 活動報告Panel（複数写真 + 著者名 + 月）
- [x] 管理画面UI: メールアドレス管理Panel
- [x] tsc エラーチェック通過
- [ ] DBマイグレーション（新カラム追加）← 進行中
- [ ] 公開サイト: スケジュール/ギャラリー/活動報告 表示更新
- [ ] ローカル起動テスト
- [ ] GitHub push + Vercel デプロイ
- [ ] ドメイン設定（後でユーザー対応）

## 注意
- NO RunableAI edits — 全て手動ファイル編集
- 既存の admin/index.tsx は850行、PhotosPanel/PostsPanel あり → 拡張する
