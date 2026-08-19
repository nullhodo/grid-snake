# grid-snake

グリッド状にランダム生成されたヘビ状パスをリアルタイムに描画し、ファイルとして出力できるWebアプリケーション。

## 目次

1. [概要](#概要)
2. [仕組み](#仕組み)
   - [構造](#構造)
3. [実行方法](#実行方法)
4. [主な機能](#主な機能)

## 概要

`grid-snake` は、グリッド状に繋がる一筆書き状のヘビ状パスを自動生成するジェネラティブアートツールです。
直感的なコントロールパネルから行数・列数、角丸率、色テーマ、ヘビの太さ、外郭線太さ、芯の太さなどのパラメータをカスタマイズ可能。
内部シャドウや、エフェクト（フィルムグレイン、CMYK印刷、リソグラフ風印刷、網点ハーフトーン、カラーディザリング、インク染み・滲み、和紙の質感）と組み合わせてリッチなグラフィック表現を創出できます。

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
    ├── hooks/
    │   ├── useSketchHandlers.ts    - パラメータ操作・ランダム・履歴管理フック
    │   └── useKeyboardShortcuts.ts - ショートカットキー操作統合
    ├── utils/
    │   ├── noiseUtils.ts       - 静止テクスチャ用決定論的 PRNG 擬似乱数
    │   ├── randomizerUtils.ts  - スマートパラメータランダマイザー
    │   └── date.ts             - 出力ファイル名用フォーマット関数
    ├── core/
    │   ├── pathGenerator.ts    - 経路探査 & 余りセル自動探索アルゴリズム
    │   ├── pathMerger.ts       - 孤立セル自動結合アルゴリズム
    │   ├── recorder.ts         - mp4-muxerを使用したWebCodecs MP4動画録画
    │   ├── exporter.ts         - 高解像度JPG、SVGベクター、JSON設定出力
    │   └── renderers/          - 機能別モジュール化描画システム
    │       ├── tubeShape.ts        - ヘビ状パスおよび角丸ベジェ曲線描画
    │       ├── tubeCaps.ts         - 余りセルの孤立ノードおよびパス端点キャップ描画
    │       ├── gridLines.ts        - 背景グリッド罫線描画
    │       ├── layoutHelper.ts     - キャンバス領域・セル寸法計算ヘルパー
    │       ├── relief3dRenderer.ts - 内部シャドウ (外郭線＞芯＞罫線の仮想高さ・内部陰影)
    │       ├── transitionRenderer.ts - 画面切り替えアニメーション (クロスフェード、3D回転等)
    │       ├── cmykRenderer.ts     - CMYK 4色版ズレ印刷エフェクト
    │       ├── risoRenderer.ts     - リソグラフ風印刷 (色版分けオフセット)
    │       ├── halftoneRenderer.ts - 角度付き回転網点ドットスクリーン
    │       ├── ditheringRenderer.ts - 8x8 Bayer Matrix カラーディザリング
    │       ├── inkBleedRenderer.ts - 毛細管浸透インク染み・滲み
    │       ├── paperTextureRenderer.ts - 凹凸紙・和紙の質感 & バンプ
    │       ├── grainOverlay.ts     - フィルムグレインノイズ
    │       └── debugOverlay.ts     - デバッグ情報オーバーレイ
    └── components/
        ├── ControlPanel.tsx    - アニメーション付き左側UIサイドバー
        ├── RecordingOverlay.tsx - 録画中ステータスHUDオーバーレイ
        ├── overlays/
        │   └── LightAngleOverlay.tsx - 光源角度調整HUDコンパス
        ├── drawers/
        │   └── RandomTargetsDrawer.tsx - ランダム対象選択サイドドロワー
        └── sections/           - 設定カテゴリごとの個別UIコンポーネント
            ├── ColorPaletteSection.tsx - 配色パレット & シャッフル
            ├── GridLayoutSection.tsx   - グリッド行列数 & シード
            ├── GridLinesSection.tsx    - 罫線表示 & 構成設定
            ├── RenderingStyleSection.tsx - 描画スタイル & 内部シャドウ / エフェクト
            ├── OperationsSection.tsx   - 出力 & 自動ランダム / 録画
            └── sub/            - サブ設定UIアコーディオン
                ├── Shadow3dSubSection.tsx      - 内部シャドウ設定
                ├── ArtisticEffectsSubSection.tsx - テクスチャエフェクト設定
                ├── TransitionSubSection.tsx    - 切り替えアニメーション設定
                └── IsolatedCellSubSection.tsx  - 孤立セル処理設定
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
- 内部シャドウ: 「外郭線 > 芯 > 罫線」の仮想高さに基づき、図形外部ではなく図形内部に発生するリッチな陰影・ベベル・光沢ハイライトをリアルタイムレンダリング
- 光源角度HUDコンパス: 内部シャドウの光源角度スライダー操作時に、画面中央へ照射角度と太陽位置をアニメーション表示
- 7種の静止アーティスティック・エフェクト: フィルムグレイン、CMYK印刷、リソグラフ風印刷、網点ハーフトーン、カラーディザリング、インク染み・滲み、和紙の質感を適用可能
- 画面切り替えアニメーション（トランジション）: クロスフェード、ズームイン、円形ワイプ、スライド、3Dスワイプ、3Dキューブ回転による滑らかな遷移
- 孤立セル（余りセル）の処理モード: 経路外セルの通常描画、ドット化、非表示、および完全結合（自動探索）から選択可能
- ランダム対象の個別選択: ドロワーUIにより、行列数、パレット、角丸率、ヘビ太さ、立体・内部シャドウ、質感エフェクトなどランダム変更する対象を個別に選択設定可能
- 周期指定の自動ランダム更新: 200ms〜5000msのスライダー設定周期でパラメーターを自動ランダム更新
- Nループ指定の自動MP4録画: 指定したNループ分のランダム更新アニメーションを mp4-muxer / WebCodecs で自動撮影・出力
- パス自動生成: 行数・列数の自由な調整およびランダムシードによる一筆書き状パスの生成
- ベクターSVG保存: `p5.js-svg` を用いた解像度依存のないSVGベクターファイル出力
- 高解像度出力: レイアウト崩れのない 2880x2880px JPG画像と再現用 JSON 設定ファイルの同時出力
- 操作履歴: パラメーターの進む・戻る操作
