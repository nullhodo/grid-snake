import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { CheckSquareIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import type React from "react";
import {
  isRandomTargetsModalOpenAtom,
  randomTargetsAtom,
} from "../../state/sketchStore";
import type { RandomTargets } from "../../types/sketch";

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
      desc: "プリセット配色からのランダム選定",
    },
    {
      key: "paletteShuffle",
      label: "パレット内の配色シャッフル",
      desc: "選択中パレットの背景・外枠・芯線色の割り当て入れ替え",
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
      key: "autoHideDots",
      label: "角丸時のドット自動非表示",
      desc: "角丸化時の中心ドット自動ON/OFF",
    },
    {
      key: "gridLineWidth",
      label: "グリッド罫線の太さ",
      desc: "背景格子線の太さ",
    },
    {
      key: "gridBorderOptions",
      label: "グリッド線の表示構成",
      desc: "外周・内側・チューブ芯の表示トグル",
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
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -20, opacity: 0, scale: 0.96 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -20, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="w-80 h-full bg-gray-900/90 backdrop-blur-md border border-gray-800/80 rounded-2xl shadow-2xl flex flex-col text-gray-200 overflow-hidden pointer-events-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800/80 flex items-center justify-between bg-gray-900/50">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
              <SlidersHorizontalIcon className="w-4 h-4" />
              ランダム対象パラメータ選択
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
          <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800/80">
              <span className="text-gray-400 text-[11px]">
                一括切り替え
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => selectAll(true)}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-emerald-400 rounded text-[11px] font-medium transition cursor-pointer"
                >
                  全選択
                </button>
                <button
                  type="button"
                  onClick={() => selectAll(false)}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded text-[11px] font-medium transition cursor-pointer"
                >
                  全解除
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {targetLabels.map(({ key, label, desc }) => {
                const isChecked = randomTargets[key];
                return (
                  <label
                    key={key}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition cursor-pointer select-none ${
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
                      className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                        isChecked
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : "border-gray-600 bg-gray-800"
                      }`}
                    >
                      {isChecked && <CheckSquareIcon className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className="font-semibold text-[11px]">{label}</div>
                      <div className="text-[10px] text-gray-400 leading-tight">
                        {desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-800/80 bg-gray-900/50 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
