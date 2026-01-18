# 声優事務所変遷図（Voice Actor Agency Transition Map）

声優業界における事務所の統廃合の歴史と個々の声優の所属変遷を可視化するウェブアプリケーション。

## 概要

- **タイムライン表示**: 声優の所属変遷を時系列で可視化
- **ネットワーク図**: 事務所間の関係性（移籍、統廃合）を可視化
- **検索・フィルタ**: 声優・事務所の検索、年代フィルタリング
- **レスポンシブ対応**: デスクトップ・モバイル両対応

## 技術スタック

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **可視化**: D3.js
- **ホスティング**: GitHub Pages
- **CI/CD**: GitHub Actions

## ディレクトリ構成

```
voice-actor/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React コンポーネント
│   ├── lib/              # ユーティリティ・データ処理
│   └── types/            # TypeScript 型定義
├── data/
│   ├── agencies.json     # 事務所データ
│   ├── actors.json       # 声優データ
│   └── transitions.json  # 所属変遷データ
└── public/               # 静的アセット
```

## セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 静的エクスポート
pnpm export
```

## データ構造

### Agency（事務所）
- `id`: 一意識別子
- `name`: 事務所名
- `founded`: 設立年月
- `status`: active | dissolved | merged

### Actor（声優）
- `id`: 一意識別子
- `name`: 芸名
- `debutYear`: デビュー年
- `status`: active | retired | deceased

### Transition（所属変遷）
- `actorId`: 声優ID
- `agencyId`: 事務所ID
- `startDate`: 所属開始
- `endDate`: 所属終了

## ライセンス

MIT

## 貢献

データの修正・追加はGitHub Issueまたはプルリクエストでお願いします。
