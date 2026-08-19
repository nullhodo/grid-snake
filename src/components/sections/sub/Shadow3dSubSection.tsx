import { BoxIcon } from "lucide-react";
import type React from "react";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../../types/sketch";

interface Props {
  params: SketchParameters;
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
  hideBorderTop?: boolean;
}

export const Shadow3dSubSection: React.FC<Props> = ({
  params,
  onParamChange,
  hideBorderTop,
}) => {
  return (
    <div
      className={`${
        hideBorderTop ? "" : "pt-2 border-t border-gray-200"
      } space-y-2.5`}
    >
      <div
        className="flex items-center justify-between"
        title="外郭線・芯・罫線それぞれの内部にリッチな立体陰影・ハイライト・ベベルを適用します（仮想の高さ: 外郭線 ＞ 芯 ＞ 罫線）"
      >
        <div className="flex items-center gap-1.5">
          <BoxIcon className="w-3.5 h-3.5 text-gray-700" />
          <span className="text-gray-700 text-xs font-medium">
            立体・内部シャドウ (3Dインナー)
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={params.show3dShadow || false}
            className="sr-only peer"
            onChange={(e) =>
              onParamChange("show3dShadow", e.target.checked)
            }
          />
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>

      {params.show3dShadow && (
        <div className="space-y-2.5 pt-1 bg-gray-50/70 p-2 rounded border border-gray-200">
          <div className="flex items-center justify-between text-[10px] text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
            <span>固定の仮想高さ:</span>
            <span className="font-semibold text-gray-700">
              外郭線 ＞ 芯 ＞ 罫線
            </span>
          </div>

          {/* 深さ / 盛り上がり感 */}
          <div
            className="space-y-1"
            title="立体感の深さ・盛り上がり度合いを調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-depth">立体深度 (Depth)</label>
              <span className="text-gray-900">
                {Math.round((params.shadowDepth3d ?? 0.6) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-depth"
              min="0.1"
              max="1.0"
              step="0.05"
              value={params.shadowDepth3d ?? 0.6}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "shadowDepth3d",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>

          {/* 光源角度 */}
          <div
            className="space-y-1"
            title="光が差し込む角度（0°〜360°）を調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-light-angle">
                光源角度 (Light Angle)
              </label>
              <span className="text-gray-900">
                {params.lightAngle3d ?? 315}°
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-light-angle"
              min="0"
              max="360"
              step="5"
              value={params.lightAngle3d ?? 315}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "lightAngle3d",
                  Number.parseInt(e.target.value, 10),
                )
              }
            />
          </div>

          {/* 内部シャドウ強度 */}
          <div
            className="space-y-1"
            title="図形内部に落ちる陰影の濃さを調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-shadow-intensity">
                内部シャドウ強度 (Shadow)
              </label>
              <span className="text-gray-900">
                {Math.round((params.shadowIntensity3d ?? 0.65) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-shadow-intensity"
              min="0.0"
              max="1.0"
              step="0.05"
              value={params.shadowIntensity3d ?? 0.65}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "shadowIntensity3d",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>

          {/* ハイライト強度 */}
          <div
            className="space-y-1"
            title="尾根部分の光沢・ハイライトの強さを調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-highlight-intensity">
                ハイライト強度 (Highlight)
              </label>
              <span className="text-gray-900">
                {Math.round((params.highlightIntensity3d ?? 0.5) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-highlight-intensity"
              min="0.0"
              max="1.0"
              step="0.05"
              value={params.highlightIntensity3d ?? 0.5}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "highlightIntensity3d",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>

          {/* 丸み・ベベルスムーズさ */}
          <div
            className="space-y-1"
            title="エッジの丸み・ベベルのスムーズさを調整します"
          >
            <div className="flex justify-between text-gray-600 font-medium text-[10px]">
              <label htmlFor="slider-3d-bevel-smoothness">
                丸み・ベベル (Smoothness)
              </label>
              <span className="text-gray-900">
                {Math.round((params.bevelSmoothness3d ?? 0.5) * 100)}%
              </span>
            </div>
            <input
              type="range"
              id="slider-3d-bevel-smoothness"
              min="0.1"
              max="1.0"
              step="0.05"
              value={params.bevelSmoothness3d ?? 0.5}
              className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "bevelSmoothness3d",
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
