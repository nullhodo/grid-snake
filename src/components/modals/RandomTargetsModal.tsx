import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { CheckSquareIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import type React from "react";
import {
  isRandomTargetsModalOpenAtom,
  randomTargetsAtom,
} from "../../state/sketchStore";
import type { RandomTargets } from "../../types/sketch";

export const RandomTargetsModal: React.FC = () => {
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
      palette: enable,
      cornerRoundness: enable,
      tipRoundness: enable,
      tubeDimensions: enable,
      coreLineWidth: enable,
      dotSize: enable,
      gridLineWidth: enable,
      randomSeed: enable,
    });
  };

  const targetLabels: {
    key: keyof RandomTargets;
    label: string;
    desc: string;
  }[] = [
    {
      key: "gridSize",
      label: "グリッド行列数 (Rows & Columns)",
      desc: "4〜12行・列のグリッド分割数",
    },
    {
      key: "randomSeed",
      label: "パス再生成シード値",
      desc: "セル接続の一筆書きパターンの再構成",
    },
    {
      key: "palette",
      label: "カラーパレット選定",
      desc: "9種類の配色パレットからのランダム選定",
    },
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
      label: "チューブ太さ & 空洞サイズ",
      desc: "外郭チューブ幅とインナーくり抜き比率",
    },
    {
      key: "coreLineWidth",
      label: "芯線の太さ",
      desc: "パスの中心線の太さ",
    },
    {
      key: "dotSize",
      label: "セル中心ドットサイズ",
      desc: "グリッド中心白色ドットのサイズ",
    },
    {
      key: "gridLineWidth",
      label: "グリッド罫線の太さ",
      desc: "背景格子線の太さ",
    },
    {
      key: "canvasPadding",
      label: "キャンバス外周マージン率",
      desc: "描画エリアの外周余白",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-gray-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/80">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                <SlidersHorizontalIcon className="w-4 h-4" />
                ランダム変更の対象設定
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[65vh] custom-scrollbar text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                <span className="text-gray-400 text-[11px]">
                  全選択 / 全解除
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => selectAll(true)}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded text-[11px] font-medium transition cursor-pointer"
                  >
                    すべて選択
                  </button>
                  <button
                    type="button"
                    onClick={() => selectAll(false)}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded text-[11px] font-medium transition cursor-pointer"
                  >
                    すべて解除
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {targetLabels.map(({ key, label, desc }) => {
                  const isChecked = randomTargets[key];
                  return (
                    <label
                      key={key}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? "bg-emerald-950/40 border-emerald-500/50 text-gray-100"
                          : "bg-gray-800/40 border-gray-800/80 text-gray-400 hover:bg-gray-800/80"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTarget(key)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "border-gray-600 bg-gray-800"
                        }`}
                      >
                        {isChecked && <CheckSquareIcon className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="font-semibold text-xs">{label}</div>
                        <div className="text-[10px] text-gray-400">{desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer"
              >
                決定
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
