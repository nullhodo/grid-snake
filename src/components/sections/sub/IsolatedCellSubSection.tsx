import type React from "react";
import type {
  IsolatedCellMode,
  SketchParamValue,
  SketchParameters,
} from "../../../types/sketch";

interface Props {
  params: SketchParameters;
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
}

export const IsolatedCellSubSection: React.FC<Props> = ({
  params,
  onParamChange,
}) => {
  return (
    <div
      className="pt-2 border-t border-gray-700/40 space-y-1.5"
      title="パスが通らない単一1x1セルの扱いを設定します"
    >
      <label
        className="text-gray-400 block font-medium text-[11px]"
        htmlFor="select-isolated-cell"
      >
        孤立1x1セルの処理
      </label>
      <select
        id="select-isolated-cell"
        value={params.isolatedCellMode || "renderCell"}
        onChange={(e) =>
          onParamChange(
            "isolatedCellMode",
            e.target.value as IsolatedCellMode,
          )
        }
        className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
      >
        <option value="none">そのまま (何も描画しない)</option>
        <option value="renderCell">1x1の円を描画</option>
        <option value="disallow">余りが生まれない配置を自動探索</option>
      </select>

      {params.isolatedCellMode === "disallow" && (
        <div
          className="space-y-1 pt-1"
          title="余りが生まれないパスを探索する試行上限回数を指数スケール（10ⁿ 回）で設定します"
        >
          <div className="flex justify-between text-gray-400 text-[10px]">
            <label htmlFor="slider-disallow-limit">自動探索上限回数</label>
            <span>
              {Math.round(
                Math.pow(10, params.disallowSearchLimitExponent || 3),
              ).toLocaleString()}
              回 (10
              <sup>{params.disallowSearchLimitExponent || 3}</sup>)
            </span>
          </div>
          <input
            type="range"
            id="slider-disallow-limit"
            min="1"
            max="5"
            step="0.5"
            value={params.disallowSearchLimitExponent || 3}
            className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
            onChange={(e) =>
              onParamChange(
                "disallowSearchLimitExponent",
                Number.parseFloat(e.target.value),
              )
            }
          />
        </div>
      )}
    </div>
  );
};
