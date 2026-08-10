import { useAtom } from "jotai";
import { PaintbrushIcon } from "lucide-react";
import type React from "react";
import { sketchParamsAtom } from "../../state/sketchStore";
import type { SketchParamValue, SketchParameters } from "../../types/sketch";

interface Props {
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
}

export const RenderingStyleSection: React.FC<Props> = ({ onParamChange }) => {
  const [params] = useAtom(sketchParamsAtom);

  const handleCornerChange = (val: number) => {
    onParamChange("cornerRoundnessPercent", val);
    if (params.syncRoundness) {
      onParamChange("tipRoundnessPercent", val);
    }
  };

  const handleTipChange = (val: number) => {
    onParamChange("tipRoundnessPercent", val);
    if (params.syncRoundness) {
      onParamChange("cornerRoundnessPercent", val);
    }
  };

  const handleSyncToggle = (enabled: boolean) => {
    onParamChange("syncRoundness", enabled);
    if (enabled) {
      onParamChange("tipRoundnessPercent", params.cornerRoundnessPercent);
    }
  };

  return (
    <div className="space-y-3 bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/30">
      <div className="font-bold text-emerald-400 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <PaintbrushIcon className="w-4 h-4" /> 描画スタイル
        </span>
        <label
          className="relative inline-flex items-center cursor-pointer"
          title="シェイプ角丸率と先端角丸率を連動させます"
        >
          <input
            type="checkbox"
            checked={params.syncRoundness}
            className="sr-only peer"
            onChange={(e) => handleSyncToggle(e.target.checked)}
          />
          <div className="w-8 h-4.5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500" />
          <span className="ml-2 text-[11px] text-gray-300 font-normal">
            角丸率連動
          </span>
        </label>
      </div>

      <div
        className="space-y-1"
        title="シェイプ（曲がり角）の角丸率(0%=角張り、100%=完全丸み)を指定します"
      >
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-corner-roundness">シェイプ角丸率 (%)</label>
          <span>{params.cornerRoundnessPercent}%</span>
        </div>
        <input
          type="range"
          id="slider-corner-roundness"
          min="0"
          max="100"
          value={params.cornerRoundnessPercent}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) => handleCornerChange(Number.parseInt(e.target.value))}
        />
      </div>

      <div
        className="space-y-1"
        title="チューブの先端（一筆書きの端部）の角丸率(0%=平ら、100%=完全丸み)を指定します"
      >
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-tip-roundness">先端角丸率 (%)</label>
          <span>{params.tipRoundnessPercent}%</span>
        </div>
        <input
          type="range"
          id="slider-tip-roundness"
          min="0"
          max="100"
          value={params.tipRoundnessPercent}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) => handleTipChange(Number.parseInt(e.target.value))}
        />
      </div>

      <div className="space-y-1" title="外郭チューブの太さを設定します">
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-tube-width">チューブ太さ</label>
          <span>{params.tubeWidthRatio.toFixed(2)}</span>
        </div>
        <input
          type="range"
          id="slider-tube-width"
          min="0.2"
          max="0.9"
          step="0.01"
          value={params.tubeWidthRatio}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("tubeWidthRatio", Number.parseFloat(e.target.value))
          }
        />
      </div>

      <div
        className="space-y-1"
        title="チューブの内側の隙間(くり抜き)サイズを設定します"
      >
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-inner-width">インナー空洞サイズ</label>
          <span>{params.tubeInnerRatio.toFixed(2)}</span>
        </div>
        <input
          type="range"
          id="slider-inner-width"
          min="0.5"
          max="0.95"
          step="0.01"
          value={params.tubeInnerRatio}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("tubeInnerRatio", Number.parseFloat(e.target.value))
          }
        />
      </div>

      <div className="space-y-1" title="中心線の太さを設定します">
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-core-width">芯線の太さ</label>
          <span>{params.coreLineWidth}</span>
        </div>
        <input
          type="range"
          id="slider-core-width"
          min="1"
          max="20"
          value={params.coreLineWidth}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("coreLineWidth", Number.parseInt(e.target.value))
          }
        />
      </div>

      <div className="space-y-1" title="セルの中心ドットの大きさを設定します">
        <div className="flex justify-between text-gray-400">
          <label htmlFor="slider-dot-size">中心ドットサイズ</label>
          <span>{params.dotSize}</span>
        </div>
        <input
          type="range"
          id="slider-dot-size"
          min="0"
          max="15"
          value={params.dotSize}
          className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
          onChange={(e) =>
            onParamChange("dotSize", Number.parseInt(e.target.value))
          }
        />
      </div>
    </div>
  );
};
