import type React from "react";
import type { SketchParamValue, SketchParameters } from "../../../types/sketch";

interface Props {
  params: SketchParameters;
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
}

export const RoundnessSubSection: React.FC<Props> = ({
  params,
  onParamChange,
}) => {
  const handleCornerChange = (val: number) => {
    onParamChange("cornerRoundnessPercent", val);
    if (params.syncRoundness) {
      onParamChange("tipRoundnessPercent", val);
    }
  };

  return (
    <div className="space-y-2 pt-2 border-t border-gray-700/40">
      <div className="flex items-center justify-between">
        <label
          htmlFor="slider-corner-roundness"
          className="text-gray-300 text-xs font-medium"
        >
          シェイプ角丸率 (%)
        </label>
        <span className="text-gray-400 text-xs">
          {params.cornerRoundnessPercent}%
        </span>
      </div>
      <input
        type="range"
        id="slider-corner-roundness"
        min="0"
        max="100"
        step="1"
        value={params.cornerRoundnessPercent}
        className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
        onChange={(e) =>
          handleCornerChange(Number.parseInt(e.target.value))
        }
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="slider-tip-roundness"
            className="text-gray-300 text-xs font-medium"
          >
            先端角丸率 (%)
          </label>
          <span className="text-gray-400 text-xs">
            {params.tipRoundnessPercent}%
          </span>
        </div>
        <input
          type="range"
          id="slider-tip-roundness"
          min="0"
          max="100"
          step="1"
          disabled={params.syncRoundness}
          value={params.tipRoundnessPercent}
          className={`w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 ${
            params.syncRoundness
              ? "opacity-40 cursor-not-allowed"
              : "cursor-pointer"
          }`}
          onChange={(e) =>
            onParamChange(
              "tipRoundnessPercent",
              Number.parseInt(e.target.value),
            )
          }
        />
        <div className="flex items-center gap-1.5 pt-0.5">
          <input
            type="checkbox"
            id="checkbox-sync-roundness"
            checked={params.syncRoundness}
            className="rounded border-gray-700 text-emerald-500 focus:ring-emerald-500 bg-gray-900 h-3 w-3 cursor-pointer"
            onChange={(e) => {
              const checked = e.target.checked;
              onParamChange("syncRoundness", checked);
              if (checked) {
                onParamChange(
                  "tipRoundnessPercent",
                  params.cornerRoundnessPercent,
                );
              }
            }}
          />
          <label
            htmlFor="checkbox-sync-roundness"
            className="text-[11px] text-gray-400 cursor-pointer select-none"
          >
            シェイプ角丸率と同期
          </label>
        </div>
      </div>

      <div
        className="flex items-center justify-between pt-1"
        title="角丸化されている場合に、グリッドノードの中心ドットを自動で非表示にします"
      >
        <span className="text-gray-400 text-xs font-normal">
          角丸時にドット自動非表示
        </span>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.autoHideDotsWhenRounded}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("autoHideDotsWhenRounded", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-800 border border-gray-600/80 rounded-full peer peer-checked:bg-emerald-500 peer-checked:border-emerald-400 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-inner" />
        </label>
      </div>
    </div>
  );
};
