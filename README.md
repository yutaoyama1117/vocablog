# VocabLog

動画・記事で出会った新出単語を記録・蓄積し、間隔反復（SRS）とSlack通知で定着させる語彙管理CLIです。

## セットアップ

```bash
# 1. 依存インストール
npm install

# 2. 環境変数を設定
cp .env.example .env
# .env を開いて SLACK_WEBHOOK_URL を設定する

# 3. データベースを初期化
node src/cli/index.js init

# 4. グローバルコマンドとして登録（任意）
npm link
# 以降 vocab コマンドで使えるようになる
```

> `npm link` せずに使う場合は、すべてのコマンドを  
> `node src/cli/index.js <command>` の形で実行してください。

---

## 主要コマンド

```bash
# 単語を登録（インタラクティブ）
vocab add

# 単語を登録（インライン）
vocab add --word "俯瞰" --reading "ふかん" --meaning "高い視点から全体を見ること" --tags "business"

# 英語単語を登録
vocab add --word "bottleneck" --language en --meaning "処理の制約になっている箇所"

# 単語一覧
vocab list
vocab list --tag business
vocab list --language en

# キーワード検索
vocab search 俯瞰

# 今日の復習リストを確認
vocab review

# SRSスコアを更新
vocab log <word_id> --quality 2   # ✅ 使えた
vocab log <word_id> --quality 1   # ❓ うろ覚え
vocab log <word_id> --quality 0   # 🔁 忘れた

# Slack通知をテスト送信
vocab notify --test

# 統計を表示
vocab stats
```

---

## SRSアルゴリズム（SM-2ベース）

| フィードバック | 間隔変化 | ease_factor |
|---|---|---|
| ✅ 使えた (quality=2) | × ease_factor | +0.1（上限3.5） |
| ❓ うろ覚え (quality=1) | × 0.8 | 変動なし |
| 🔁 忘れた (quality=0) | → 1日にリセット | -0.2（下限1.3） |

---

## Slack通知の設定

1. [Slack API](https://api.slack.com/apps) でアプリを作成（または既存アプリを使用）
2. **Incoming Webhooks** を有効化
3. 通知したいチャンネル（例: `#claude-word-input`）に Webhook URL を追加
4. `.env` の `SLACK_WEBHOOK_URL` に貼り付ける

### スケジューラーの起動

```bash
# 毎朝8時（JST）に自動通知（フォアグラウンドで起動）
npm start

# バックグラウンドで動かす場合（例: pm2 使用）
pm2 start npm --name vocablog -- start
```

---

## ディレクトリ構成

```
vocablog/
├── src/
│   ├── cli/
│   │   ├── index.js          # CLIエントリーポイント
│   │   └── commands/         # 各コマンド実装
│   ├── db/
│   │   ├── init.js           # DBセットアップ
│   │   ├── words.js          # words テーブルCRUD
│   │   └── reviews.js        # review_logs テーブルCRUD
│   ├── srs/
│   │   └── algorithm.js      # SM-2ベースのスコア計算
│   ├── slack/
│   │   ├── notify.js         # Webhook送信
│   │   └── blocks.js         # Block Kitテンプレート
│   └── scheduler/
│       └── cron.js           # 毎朝の自動通知
├── data/
│   └── vocablog.db           # SQLite（git管理外）
├── .env                      # 環境変数（git管理外）
├── .env.example
└── package.json
```
