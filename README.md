# grid-snake

グリッド状にランダム生成された単一・複数のヘビ状パス (Connected Cell Snake) をリアルタイムにシミュレーション・描画し、6種の静止アーティスティック質感エフェクトや高解像度画像、MP4動画、SVGベクターとして出力できるWebアプリケーション。

## 目次

1. [概要](#概要)
2. [仕組み・技術スタック](#仕組み技術スタック)
   - [ディレクトリ構造](#ディレクトリ構造)
3. [実行方法](#実行方法)
4. [主な機能](#主な機能)
   - [質感エフェクト (Artistic Effects)](#質感エフェクト-artistic-effects)
   - [アニメーション & エクスポート](#アニメーション--エクスポート)

---

## 概要

`grid-snake` は、グリッド状に繋がる一筆書き状のヘビ（Snake）パスを自動生成するジェネラティブアートツールです。
洗練されたコントロールパネルからパラメータをリアルタイムにカスタマイズでき、アナログな質感表現（リソグラフ風印刷、和紙の質感、カラーディザリング、網点ハーフトーン、インク染み・滲み、フィルムグレイン）と組み合わせて魅力的なグラフィック作品を創出できます。

---

## 仕組み・技術スタック

- **フロントエンドライブラリ**: React 18, p5.js, Jotai (状態管理), Lucide React, Framer Motion, Tailwind CSS
- **書き出し / エクスポート**: mp4-muxer (WebCodecs MP4), p5.js-svg (SVG ベクター)
- **ビルドツール**: Vite, TypeScript
- **自動デプロイ**: GitHub Actions (GitHub Pages)

### ディレクトリ構造

```text
grid-snake
├── .github/workflows/deploy.yml   - GitHub Pages 自動デプロイワークフロー
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── src/
    ├── main.tsx                    - メインエントリー & p5.js ループ統合
    ├── index.css
    ├── types/
    │   └── sketch.ts               - パラメータ・パス・ランダム対象の型定義
    ├── constants/
    │   └── palettes.ts             - 厳選カラーパレット定義
    ├── state/
    │   └── sketchStore.ts          - Jotai 状態管理 & 履歴スタック
    ├── utils/
    │   ├── noiseUtils.ts           - 静止テクスチャ用決定論的 PRNG 擬似乱数
    │   └── randomizerUtils.ts      - スマートパラメータランダマイザー
    ├── core/
    │   ├── pathGenerator.ts        - 経路探査 & 余りセル自動探索アルゴリズム
    │   ├── renderers/              - 機能別モジュール化描画システム
    │   │   ├── risoRenderer.ts     - リソグラフ風印刷 (色版分けオフセット)
    │   │   ├── halftoneRenderer.ts - 角度付き回転網点ドットスクリーン
    │   │   ├── ditheringRenderer.ts - 8x8 Bayer Matrix カラーディザリング
    │   │   ├── inkBleedRenderer.ts - 毛細管浸透インク染み・滲み
    │   │   ├── paperTextureRenderer.ts - 凹凸紙・和紙の質感 & バンプ
    │   │   └── grainOverlay.ts     - フィルムグレインノイズ
    │   ├── recorder.ts             - MP4 動画自動エンコード録画
    │   └── exporter.ts             - 高解像度 JPG, SVG, JSON エクスポート
    └── components/
        ├── ControlPanel.tsx        - 左側メイン UI サイドバー
        ├── drawers/
        │   └── RandomTargetsDrawer.tsx - ランダム対象選択サイドドロワー
        └── sections/               - カテゴリ別分割 UI コンポーネント
            ├── ColorPaletteSection.tsx - 配色パレット & シャッフル
            ├── GridLayoutSection.tsx   - グリッド行列数 & シード
            ├── RenderingStyleSection.tsx - 描画スタイル & エフェクト
            └── OperationsSection.tsx   - 出力 & 自動ランダム / 録画
```

---

## 実行方法

| コマンド          | 実行内容                                     |
| ----------------- | -------------------------------------------- |
| `npm install`     | パッケージ依存関係のインストール             |
| `npm run dev`     | ローカル開発サーバーの起動 (Vite)            |
| `npm run build`   | TypeScript 型チェック & プロダクションビルド |
| `npm run preview` | ビルド成果物のプレビュー                     |

---

## 主な機能

### 🎨 描画スタイル & 質感エフェクト (Artistic Effects)

- **シェイプ & 先端角丸率**: コーナー部・一筆書き先端部の丸み率の滑らかなカスタマイズ
- **ヘビの太さ・外郭線太さ・芯の太さ**: 各層の線幅バランス・外郭線カラー表現
- **余り1x1セルの柔軟処理**: 「そのまま描画」「核と外郭線を持つ壊損ヘビセル描画」「余りが出ない完全探索」の自動切り替え
- **6種の静止アーティスティック・エフェクト**:
  - **フィルムグレイン (ざらつき質感)**: 映画フィルム風の紙・粒子グラデーション
  - **リソグラフ風印刷 (Risograph)**: 色版分けオブジェクト抽出と重ね刷り Spot Ink 版ズレ
  - **ハーフトーン (網点ドット)**: 回転角度付きレトロコミック風網点スクリーン
  - **ディザリング (Bayer Matrix)**: 8x8 マトリクスによる鮮やかなカラー減色表現
  - **インク染み・滲み (Ink Bleed)**: 輪郭エッジの毛細管現象インク滲み・吸水現象
  - **和紙の質感 (Paper Texture)**: 暖かみのある和紙・水彩紙の凹凸繊維感とバンプ陰影

### 🚀 アニメーション & エクスポート

- **滑らかな画面切り替え**: クロスフェード、スライド、ズーム、ワイプなどアニメーション表示
- **自動ランダム更新 & ループ MP4 録画**: 周期スライダー指定での全自動更新と指定Nループ録画
- **ランダム対象の個別選択ドロワー**: 左メイン UI と完全連動した直感的な対象選び
- **マルチフォーマット出力**: 2880x2880px 超高解像度 JPG、完全ベクター SVG、再生成用 JSON の一括出力
- **操作履歴**: `Ctrl+Z` (Undo) / `Ctrl+Y` (Redo) 完全対応
