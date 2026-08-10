import { useAtom } from "jotai";
import { CheckIcon, GridIcon, XIcon } from "lucide-react";
import type React from "react";
import { sketchParamsAtom } from "../../state/sketchStore";
import type {
  BorderOptionKey,
  SketchParamValue,
  SketchParameters,
} from "../../types/sketch";

interface Props {
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
  onToggleBorderOption: (key: BorderOptionKey) => void;
}

export const GridLinesSection: React.FC<Props> = ({
  onParamChange,
  onToggleBorderOption,
}) => {
  const [params] = useAtom(sketchParamsAtom);

  return (
    <div className="space-y-3 bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/30">
      <div className="font-bold text-emerald-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <GridIcon className="w-4 h-4" /> グリッド罫線表示
        </span>
        <label
          className="relative inline-flex items-center cursor-pointer"
          title="グリッド罫線を描画するかの全体スイッチ"
        >
          <input
            type="checkbox"
            checked={params.showGridLines}
            className="sr-only peer"
            onChange={(e) => onParamChange("showGridLines", e.target.checked)}
          />
          <div className="w-8 h-4.5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500" />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div title="罫線の描画色を指定します">
          <label
            className="text-gray-400 block text-[10px] mb-1"
            htmlFor="color-grid-line"
          >
            罫線の色
          </label>
          <input
            type="color"
            id="color-grid-line"
            value={params.gridLineColor}
            className="w-full h-7 rounded border border-gray-700 bg-transparent cursor-pointer"
            onChange={(e) => onParamChange("gridLineColor", e.target.value)}
          />
        </div>
        <div title="罫線の太さを設定します">
          <div className="flex justify-between text-gray-400 text-[10px] mb-1">
            <label htmlFor="slider-grid-line-width">罫線太さ</label>
            <span>{params.gridLineWidth}</span>
          </div>
          <input
            type="range"
            id="slider-grid-line-width"
            min="1"
            max="10"
            value={params.gridLineWidth}
            className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer mt-1"
            onChange={(e) =>
              onParamChange("gridLineWidth", Number.parseInt(e.target.value))
            }
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-700/40">
        <span className="text-gray-400 block text-[11px] font-medium">
          表示位置の個別トグル設定
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onToggleBorderOption("showGridOuterBorder")}
            title="キャンバス外周の枠線を描画"
            className={`px-2 py-1 rounded border text-[11px] flex items-center justify-between transition ${
              params.showGridOuterBorder
                ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                : "bg-gray-800 text-gray-500 border-gray-700 opacity-60"
            }`}
          >
            <span>外周枠線</span>
            {params.showGridOuterBorder ? (
              <CheckIcon className="w-3 h-3 text-emerald-400" />
            ) : (
              <XIcon className="w-3 h-3 text-gray-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onToggleBorderOption("showGridInnerHorizontal")}
            title="内側の水平罫線を描画"
            className={`px-2 py-1 rounded border text-[11px] flex items-center justify-between transition ${
              params.showGridInnerHorizontal
                ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                : "bg-gray-800 text-gray-500 border-gray-700 opacity-60"
            }`}
          >
            <span>内側水平線</span>
            {params.showGridInnerHorizontal ? (
              <CheckIcon className="w-3 h-3 text-emerald-400" />
            ) : (
              <XIcon className="w-3 h-3 text-gray-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onToggleBorderOption("showGridInnerVertical")}
            title="内側の垂直罫線を描画"
            className={`px-2 py-1 rounded border text-[11px] flex items-center justify-between transition ${
              params.showGridInnerVertical
                ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                : "bg-gray-800 text-gray-500 border-gray-700 opacity-60"
            }`}
          >
            <span>内側垂直線</span>
            {params.showGridInnerVertical ? (
              <CheckIcon className="w-3 h-3 text-emerald-400" />
            ) : (
              <XIcon className="w-3 h-3 text-gray-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
