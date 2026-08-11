import type React from "react";
import type { SketchParamValue, SketchParameters } from "../../../types/sketch";

interface Props {
  params: SketchParameters;
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
}

export const InkBleedSubSection: React.FC<Props> = ({
  params,
  onParamChange,
}) => {
  return (
    <div className="pt-2 border-t border-gray-700/40 space-y-2">
      <div
        className="flex items-center justify-between"
        title="紙の繊維にインクが浸透・染み出したようなアナログ表現を追加します"
      >
        <span className="text-gray-300 text-xs font-normal">
          インク染み・滲み (Ink Bleed)
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.showInkBleed || false}
            className="sr-only peer"
            onChange={(e) => onParamChange("showInkBleed", e.target.checked)}
          />
          <div className="w-9 h-5 bg-gray-800 border border-gray-600/80 rounded-full peer peer-checked:bg-emerald-500 peer-checked:border-emerald-400 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-inner" />
        </label>
      </div>

      {params.showInkBleed && (
        <div className="space-y-2 pt-1">
          <div title="インクの滲み・輪郭の拡大幅を設定します">
            <div className="flex justify-between text-gray-400 text-[10px] mb-1">
              <label htmlFor="slider-ink-bleed-amount">滲み量 (Bleed Amount)</label>
              <span>{params.inkBleedAmount || 4}px</span>
            </div>
            <input
              type="range"
              id="slider-ink-bleed-amount"
              min="1"
              max="15"
              step="1"
              value={params.inkBleedAmount || 4}
              className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange("inkBleedAmount", Number.parseInt(e.target.value))
              }
            />
          </div>

          <div title="インク浸透のゆらぎ・荒さを設定します">
            <div className="flex justify-between text-gray-400 text-[10px] mb-1">
              <label htmlFor="slider-ink-bleed-roughness">浸透ゆらぎ・荒さ</label>
              <span>{Math.round((params.inkBleedRoughness || 0.4) * 100)}%</span>
            </div>
            <input
              type="range"
              id="slider-ink-bleed-roughness"
              min="0.1"
              max="1.0"
              step="0.05"
              value={params.inkBleedRoughness || 0.4}
              className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "inkBleedRoughness",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
