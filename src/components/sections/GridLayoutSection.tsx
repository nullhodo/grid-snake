import { useAtom } from "jotai";
import { TableIcon } from "lucide-react";
import type React from "react";
import { sketchParamsAtom } from "../../state/sketchStore";
import type { SketchParamValue, SketchParameters } from "../../types/sketch";

interface Props {
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
}

export const GridLayoutSection: React.FC<Props> = ({ onParamChange }) => {
  const [params] = useAtom(sketchParamsAtom);

  return (
    <div className="space-y-3 bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/30">
      <div className="font-bold text-emerald-400 flex items-center gap-2">
        <TableIcon className="w-4 h-4" /> グリッド &amp; レイアウト
      </div>

      <div className="space-y-1" title="グリッドの行数を変更します">
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-rows">行数 (Rows)</label>
          <span>{params.gridRows}</span>
        </div>
        <input
          type="range"
          id="slider-rows"
          min="2"
          max="24"
          value={params.gridRows}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("gridRows", Number.parseInt(e.target.value))
          }
        />
      </div>

      <div className="space-y-1" title="グリッドの列数を変更します">
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-columns">列数 (Columns)</label>
          <span>{params.gridColumns}</span>
        </div>
        <input
          type="range"
          id="slider-columns"
          min="2"
          max="24"
          value={params.gridColumns}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("gridColumns", Number.parseInt(e.target.value))
          }
        />
      </div>

      <div
        className="space-y-1"
        title="外周のマージン(パディング)割合を調節します"
      >
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-padding">キャンバスマージン</label>
          <span>{params.gridPadding.toFixed(2)}</span>
        </div>
        <input
          type="range"
          id="slider-padding"
          min="0.05"
          max="0.3"
          step="0.01"
          value={params.gridPadding}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("gridPadding", Number.parseFloat(e.target.value))
          }
        />
      </div>

      <div
        className="space-y-1"
        title="キャンバス内部描画領域の上下・左右アスペクト比を調節します"
      >
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-aspect-ratio">アスペクト比</label>
          <span>
            {params.canvasAspectRatio.toFixed(2)}
            {params.canvasAspectRatio === 1.0 ? " (1:1)" : ""}
          </span>
        </div>
        <input
          type="range"
          id="slider-aspect-ratio"
          min="0.5"
          max="2.0"
          step="0.05"
          value={params.canvasAspectRatio}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange(
              "canvasAspectRatio",
              Number.parseFloat(e.target.value),
            )
          }
        />
      </div>
    </div>
  );
};
