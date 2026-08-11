# grid-snake

グリッド状にランダム生成された単一・複数のヘビ状パス (Connected Cell Snake) をリアルタイムにシミュレーション・描画し、6種の静止アーティスティック質感エフェクトや高解像度画像、MP4動画、SVGベクターとして出力できるWebアプリケーション。

## 目次

1. [概要](#概要)
2. [仕組み](#仕組み)
   - [構造](#構造)
3. [実行方法](#実行方法)
4. [主な機能](#主な機能)

## 概要

`grid-snake` は、グリッド状に繋がる一筆書き状のヘビ (Snake) パスを自動生成するジェネラティブアートツール。直感的なコントロールパネルから行数・列数、角丸率、色テーマ、ヘビの太さ、外郭線太さ、芯の太さなどのパラメータをカスタマイズ可能。さらに6種のアーティスティック・エフェクト（リソグラフ風印刷、和紙の質感、カラーディザリング、網点ハーフトーン、インク染み・滲み、フィルムグレイン）と組み合わせてアナログなグラフィック表現を創出できます。

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
├── .github/
│   └── workflows/
│       └── deploy.yml          - GitHub Pages 自動デプロイワークフロー
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
    ├── main.tsx                - メインエントリー & p5.js ループ統合
    ├── index.css
    ├── types/
    │   └── sketch.ts           - スケッチパラメータやセル・パス、ランダム対象の型定義
    ├── constants/
    │   └── palettes.ts         - プリセットカラーパレットデータ
    ├── state/
    │   └── sketchStore.ts      - Jotaiによる状態管理と履歴スタック
    ├── utils/
    │   ├── noiseUtils.ts       - 静止テクスチャ用決定論的 PRNG 擬似乱数
    │   └── randomizerUtils.ts  - スマートパラメータランダマイザー
    ├── core/
    │   ├── pathGenerator.ts    - 経路探査 & 余りセル自動探索アルゴリズム
    │   ├── renderers/          - 機能別モジュール化描画システム
    │   │   ├── risoRenderer.ts     - リソグラフ風印刷 (色版分けオフセット)
    │   │   ├── halftoneRenderer.ts - 角度付き回転網点ドットスクリーン
    │   │   ├── ditheringRenderer.ts - 8x8 Bayer Matrix カラーディザリング
    │   │   ├── inkBleedRenderer.ts - 毛細管浸透インク染み・滲み
    │   │   ├── paperTextureRenderer.ts - 凹凸紙・和紙の質感 & バンプ
    │   │   └── grainOverlay.ts     - フィルムグレインノイズ
    │   ├── recorder.ts         - mp4-muxerを使用したWebCodecs MP4動画録画
    │   └── exporter.ts         - 高解像度JPG、SVGベクター、JSON設定出力
    └── components/
        ├── ControlPanel.tsx    - アニメーション付き左側UIサイドバー
        ├── drawers/
        │   └── RandomTargetsDrawer.tsx - ランダム対象選択サイドドロワー
        └── sections/           - 設定カテゴリごとの個別UIコンポーネント
            ├── ColorPaletteSection.tsx - 配色パレット & シャッフル
            ├── GridLayoutSection.tsx   - グリッド行列数 & シード
            ├── RenderingStyleSection.tsx - 描画スタイル & エフェクト
            └── OperationsSection.tsx   - 出力 & 自動ランダム / 録画
```

## 実行方法

| コマンド       | 実行内容                                  |
| -------------- | ----------------------------------------- |
| `pnpm install` | パッケージのインストール                  |
| `pnpm dev`     | 開発サーバーの起動                        |
| `pnpm build`   | 生産用ビルドの実行                        |
| `pnpm preview` | ビルド成果物のプレビュー                  |
| `pnpm check`   | Biomeによるリンター・フォーマットチェック |
| `pnpm format`  | Biomeによる自動コードフォーマット         |
| `pnpm knip`    | 未使用ファイル・デッドコードの検出        |

## 主な機能

- 左側UI配置: コントロールパネルを画面左側に配置し直感的なアクセシビリティを提供
- 6種の静止アーティスティック・エフェクト: リソグラフ風印刷、和紙の質感、カラーディザリング、網点ハーフトーン、インク染み・滲み、フィルムグレインを静止画表示(PRNG固定)で適用可能
- ランダム対象の個別選択: ドロワーUIにより、行列数、パレット、角丸率、ヘビ太さ、質感エフェクトなどランダム変更する対象を個別に選択設定可能
- 周期指定の自動ランダム更新: 200ms〜5000msのスライダー設定周期でパラメーターを自動ランダム更新
- Nループ指定の自動MP4録画: 指定したNループ分のランダム更新アニメーションを mp4-muxer / WebCodecs で自動撮影・出力
- パス自動生成: 行数・列数の自由な調整およびランダムシードによる一筆書き状パスの生成
- ベクターSVG保存: `p5.js-svg` を用いた解像度依存のないSVGベクターファイル出力
- 高解像度出力: レイアウト崩れのない 2880x2880px JPG画像と再現用 JSON 設定ファイルの同時出力
- 操作履歴: Ctrl+Z (Undo) / Ctrl+Y (Redo) によるパラメーターの進む・戻る操作
