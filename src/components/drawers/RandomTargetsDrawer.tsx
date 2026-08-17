import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import {
  CheckSquareIcon,
  GridIcon,
  PaletteIcon,
  PaintbrushIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TableIcon,
  XIcon,
} from "lucide-react";
import React from "react";
import {
  isRandomTargetsModalOpenAtom,
  randomTargetsAtom,
} from "../../state/sketchStore";
import type { RandomTargets } from "../../types/sketch";

interface TargetGroup {
  title: string;
  icon: React.ReactNode;
  items: {
    key: keyof RandomTargets;
    label: string;
    desc: string;
    subGroup?: string;
  }[];
}

export const RandomTargetsDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useAtom(isRandomTargetsModalOpenAtom);
  const [randomTargets, setRandomTargets] = useAtom(randomTargetsAtom);

  const toggleTarget = (key: keyof RandomTargets) => {
    setRandomTargets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectAll = (enable: boolean) => {
    setRandomTargets({
      gridSize: enable,
      canvasPadding: enable,
      canvasAspectRatio: enable,
      palette: enable,
      paletteShuffle: enable,
      cornerRoundness: enable,
      tipRoundness: enable,
      tubeDimensions: enable,
      coreLineWidth: enable,
      dotSize: enable,
      autoHideDots: enable,
      gridLineWidth: enable,
      gridBorderOptions: enable,
      randomSeed: enable,
      transitionType: enable,
      grain: enable,
      isolatedCellMode: enable,
      riso: enable,
      halftone: enable,
      dithering: enable,
      inkBleed: enable,
      paperTexture: enable,
      cmyk: enable,
    });
  };

  const selectGroup = (keys: (keyof RandomTargets)[], enable: boolean) => {
    setRandomTargets((prev) => {
      const next = { ...prev };
      for (const k of keys) {
        next[k] = enable;
      }
      return next;
    });
  };

  const targetGroups: TargetGroup[] = [
    {
      title: "グリッド & レイアウト",
      icon: <TableIcon className="w-3.5 h-3.5" />,
      items: [
        {
          key: "gridSize",
          label: "グリッド行列数 (Rows & Columns)",
          desc: "4〜12行・列の分割数",
        },
        {
          key: "randomSeed",
          label: "パス再生成シード値",
          desc: "セル接続の一筆書きパターンの再構成",
        },
        {
          key: "canvasPadding",
          label: "キャンバス外周マージン率",
          desc: "描画エリアの外周余白",
        },
        {
          key: "canvasAspectRatio",
          label: "描画領域の上下比率 (縦横比)",
          desc: "アスペクト比 (0.5〜2.0) のランダム変更",
        },
      ],
    },
    {
      title: "グリッド罫線表示",
      icon: <GridIcon className="w-3.5 h-3.5" />,
      items: [
        {
          key: "gridLineWidth",
          label: "グリッド罫線の太さ",
          desc: "背景格子線の太さ",
        },
        {
          key: "gridBorderOptions",
          label: "グリッド線の表示構成",
          desc: "外周・内側・芯の表示トグル",
        },
      ],
    },
    {
      title: "カラーパレット & テーマ",
      icon: <PaletteIcon className="w-3.5 h-3.5" />,
      items: [
        {
          key: "palette",
          label: "カラーパレット選定",
          desc: "プリセット配色からのランダム選定",
        },
        {
          key: "paletteShuffle",
          label: "パレット内の配色シャッフル",
          desc: "選択中パレットの背景・外枠・芯線色の入れ替え",
        },
      ],
    },
    {
      title: "描画スタイル & 構造",
      icon: <PaintbrushIcon className="w-3.5 h-3.5" />,
      items: [
        {
          key: "cornerRoundness",
          label: "シェイプ角丸率 (%)",
          desc: "曲がり角の丸み率",
        },
        {
          key: "tipRoundness",
          label: "先端角丸率 (%)",
          desc: "一筆書き端部の丸み率",
        },
        {
          key: "tubeDimensions",
          label: "ヘビの太さ & 外郭線太さ",
          desc: "ヘビの外幅と外郭線幅の比率",
        },
        {
          key: "coreLineWidth",
          label: "芯の太さ",
          desc: "ヘビの中心軸（芯）の太さ",
        },
        {
          key: "dotSize",
          label: "セル中心ドットサイズ",
          desc: "グリッド中心白色ドットのサイズ",
        },
        {
          key: "autoHideDots",
          label: "角丸時のドット自動非表示",
          desc: "角丸化時の中心ドット自動ON/OFF",
        },
        {
          key: "transitionType",
          label: "切り替えアニメーション",
          desc: "トランジション (クロスフェード/スライド/ズーム/ワイプ) の変更",
        },
        {
          key: "grain",
          label: "フィルムグレイン (ざらつき)",
          desc: "フィルムノイズ/ざらつき質感ON/OFFと強度の変更",
          subGroup: "アーティスティック・エフェクト",
        },
        {
          key: "cmyk",
          label: "開発途中：CMYK印刷 (4色版ズレ)",
          desc: "4色分解・独立版ズレ係数と乗算重ね刷りのON/OFF",
          subGroup: "アーティスティック・エフェクト",
        },
        {
          key: "riso",
          label: "開発途中：リソグラフ風印刷 (Risograph)",
          desc: "色版ズレと乗算インクカスレノイズのON/OFF",
          subGroup: "アーティスティック・エフェクト",
        },
        {
          key: "halftone",
          label: "ハーフトーン (網点)",
          desc: "網点ドットスクリーンのON/OFFとサイズ",
          subGroup: "アーティスティック・エフェクト",
        },
        {
          key: "dithering",
          label: "ディザリング (Bayer Matrix)",
          desc: "レトロゲーム風ディザリング階調のON/OFF",
          subGroup: "アーティスティック・エフェクト",
        },
        {
          key: "inkBleed",
          label: "開発途中：インク染み・滲み (Ink Bleed)",
          desc: "輪郭のノイズ滲み・浸透ディスプレイスメントのON/OFF",
          subGroup: "アーティスティック・エフェクト",
        },
        {
          key: "paperTexture",
          label: "開発途中：和紙の質感",
          desc: "和紙の凸凹感と陰影のON/OFF",
          subGroup: "アーティスティック・エフェクト",
        },
        {
          key: "isolatedCellMode",
          label: "余った1x1セルの処理",
          desc: "余りセル描画 (そのまま / 細胞 / 余りなし探索)",
        },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -20, opacity: 0, scale: 0.96 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -20, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="w-80 h-full bg-white/95 backdrop-blur-md border border-gray-200 rounded-md shadow-xl flex flex-col text-gray-900 overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50/90">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-700">
              <SlidersHorizontalIcon className="w-4 h-4" />
              ランダム対象の選択
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-900 p-1 rounded hover:bg-gray-200/60 transition cursor-pointer"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto custom-scrollbar text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600 text-[11px] font-semibold">
                一括操作
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => selectAll(true)}
                  className="px-2 py-0.5 bg-white border border-gray-300 hover:bg-gray-100 text-emerald-700 rounded text-[11px] font-medium transition cursor-pointer shadow-sm"
                >
                  全選択
                </button>
                <button
                  type="button"
                  onClick={() => selectAll(false)}
                  className="px-2 py-0.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 rounded text-[11px] font-medium transition cursor-pointer shadow-sm"
                >
                  全解除
                </button>
              </div>
            </div>

            {/* Groups */}
            <div className="space-y-3">
              {targetGroups.map((group) => {
                const groupKeys = group.items.map((i) => i.key);
                const allSelected = groupKeys.every((k) => randomTargets[k]);

                return (
                  <div
                    key={group.title}
                    className="bg-gray-50/70 p-3 rounded-md border border-gray-200 space-y-2"
                  >
                    <div className="font-bold text-emerald-700 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        {group.icon}
                        {group.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => selectGroup(groupKeys, !allSelected)}
                        className="text-[10px] text-gray-600 hover:text-emerald-700 font-medium transition cursor-pointer"
                      >
                        {allSelected ? "解除" : "全選択"}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {group.items.map(({ key, label, desc, subGroup }, idx) => {
                        const isChecked = randomTargets[key];
                        const showSubHeader =
                          subGroup &&
                          (idx === 0 || group.items[idx - 1].subGroup !== subGroup);

                        return (
                          <React.Fragment key={key}>
                            {showSubHeader && (
                              <div className="pt-1.5 pb-0.5 px-1 font-semibold text-[11px] text-emerald-800 flex items-center gap-1.5 border-t border-gray-200 mt-2">
                                <SparklesIcon className="w-3 h-3 text-emerald-600" />
                                {subGroup}
                              </div>
                            )}
                            <label
                              className={`flex items-start gap-2.5 p-2 rounded border transition cursor-pointer select-none ${
                                isChecked
                                  ? "bg-emerald-50 border-emerald-500 text-gray-900"
                                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleTarget(key)}
                                className="sr-only"
                              />
                              <div
                                className={`w-3.5 h-3.5 mt-0.5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                                  isChecked
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "border-gray-300 bg-white"
                                }`}
                              >
                                {isChecked && (
                                  <CheckSquareIcon className="w-2.5 h-2.5" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-[11px]">
                                  {label}
                                </div>
                                <div className="text-[9.5px] text-gray-500 leading-tight">
                                  {desc}
                                </div>
                              </div>
                            </label>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50/90 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-1.5 rounded font-medium text-xs transition cursor-pointer shadow-sm"
            >
              閉じる
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
