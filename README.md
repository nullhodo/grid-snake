# grid-snake

グリッド状にランダム生成された単一・複数の蛇行パス(Connected Cell Snake)をリアルタイムにシミュレーション・描画し、高解像度画像やMP4動画・SVGベクターとして出力できるWebアプリケーション。

## 目次

1. [概要](#概要)
2. [仕組み](#仕組み)
   - [構造](#構造)
3. [実行方法](#実行方法)
4. [主な機能](#主な機能)

## 概要

`grid-snake` は、グリッド状に繋がる一筆書き状の serpentine パスを自動生成するジェネラティブアートツール。直感的なコントロールパネルから行数・列数、角丸率、色テーマ、外郭チューブ太さなどのパラメータをカスタマイズ可能。

## 仕組み

- 言語: TypeScript
- ライブラリ: React 18, p5.js, mp4-muxer, Jotai, Lucide React, Framer Motion, p5.js-svg
- ビルド: Vite
- パッケージマネージャー: pnpm
- リンター / フォーマッター: Biome
- クリーナップ検証: Knip

### 構造

```text
grid-snake
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── biome.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
├── README.md
├── output/                     - 生成画像・動画の保存用フォルダ
└── src/
    ├── main.tsx
    ├── index.css
    ├── types/
    │   └── sketch.ts           - スケッチパラメータやセル・パスの型定義
    ├── constants/
    │   └── palettes.ts         - プリセットカラーパレットデータ
    ├── state/
    │   └── sketchStore.ts      - Jotaiによる状態管理と履歴スタック
    ├── core/
    │   ├── pathGenerator.ts    - グリッドのセル非重複蛇行パス生成アルゴリズム
    │   ├── renderer.ts         - p5.js多層レイヤー描画処理
    │   ├── recorder.ts         - mp4-muxerを使用したWebCodecs MP4動画録画
    │   └── exporter.ts         - 高解像度JPG、SVGベクター、JSON設定出力
    └── components/
        ├── ControlPanel.tsx    - アニメーション付きUIサイドバー
        └── sections/           - 設定カテゴリごとの個別UIコンポーネント
```

## 実行方法

| コマンド | 実行内容 |
| -- | -- |
| `pnpm install` | パッケージのインストール |
| `pnpm dev` | 開発サーバーの起動 |
| `pnpm build` | 生産用ビルドの実行 |
| `pnpm preview` | ビルド成果物のプレビュー |
| `pnpm check` | Biomeによるリンター・フォーマットチェック |
| `pnpm format` | Biomeによる自動コードフォーマット |
| `pnpm knip` | 未使用ファイル・デッドコードの検出 |

## 主な機能

- パス自動生成: 行数・列数の自由な調整およびランダムシードによる一筆書き状パスの生成
- mp4-muxer によるMP4出力: ブラウザ上の Canvas 描画を WebCodecs API および mp4-muxer を使用して60fps MP4動画としてエンコード
- ベクターSVG保存: `p5.js-svg` を用いた解像度依存のないSVGベクターファイル出力
- 高解像度出力: レイアウト崩れのない 2880x2880px JPG画像と再現用 JSON 設定ファイルの同時出力
- 操作履歴: Ctrl+Z (Undo) / Ctrl+Y (Redo) によるパラメーターの進む・戻る操作
