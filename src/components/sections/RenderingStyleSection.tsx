import { useAtom } from "jotai";
import { PaintbrushIcon } from "lucide-react";
import type React from "react";
import { sketchParamsAtom } from "../../state/sketchStore";
import type {
  IsolatedCellMode,
  SketchParamValue,
  SketchParameters,
  TransitionType,
} from "../../types/sketch";

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
          className="relative inline-flex items-center cursor-pointer select-none"
          title="シェイプ角丸率と先端角丸率を連動させます"
        >
          <input
            type="checkbox"
            checked={params.syncRoundness}
            className="sr-only peer"
            onChange={(e) => handleSyncToggle(e.target.checked)}
          />
          <div className="w-9 h-5 bg-gray-800 border border-gray-600/80 rounded-full peer peer-checked:bg-emerald-500 peer-checked:border-emerald-400 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-inner" />
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

      <div
        className="flex items-center justify-between pt-1"
        title="シェイプ角丸率が0%より大きいとき、チューブ芯からズレる中心ドットを自動的に非表示にします"
      >
        <span className="text-gray-300 text-xs font-normal">
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

      {/* Transition Animation Settings */}
      <div className="pt-2 border-t border-gray-700/40 space-y-2">
        <span className="text-gray-400 block font-medium text-[11px]">
          画面切り替えアニメーション (Transition)
        </span>
        <div
          className={`grid gap-2 ${
            params.transitionType !== "none" ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          <div title="切り替え時のトランジションパターンを選択します">
            <label
              className="text-gray-400 block text-[10px] mb-1"
              htmlFor="select-transition"
            >
              アニメーション
            </label>
            <select
              id="select-transition"
              value={params.transitionType || "fade"}
              onChange={(e) =>
                onParamChange(
                  "transitionType",
                  e.target.value as TransitionType,
                )
              }
              className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="none">無効 (即時更新)</option>
              <option value="fade">クロスフェード</option>
              <option value="slide">平坦スライド</option>
              <option value="swipeHorizontal">3Dスワイプ (水平)</option>
              <option value="swipeVertical">3Dスワイプ (垂直)</option>
              <option value="cubeHorizontal">3Dキューブ回転 (Y軸)</option>
              <option value="cubeVertical">3Dキューブ回転 (X軸)</option>
              <option value="zoom">ズームイン</option>
              <option value="wipe">円形ワイプ</option>
            </select>
          </div>
          {params.transitionType !== "none" && (
            <div title="アニメーションの再生時間を指定します">
              <div className="flex justify-between text-gray-400 text-[10px] mb-1">
                <label htmlFor="slider-transition-duration">再生時間</label>
                <span>{params.transitionDurationMs}ms</span>
              </div>
              <input
                type="range"
                id="slider-transition-duration"
                min="100"
                max="1000"
                step="50"
                value={params.transitionDurationMs || 400}
                className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer mt-1"
                onChange={(e) =>
                  onParamChange(
                    "transitionDurationMs",
                    Number.parseInt(e.target.value),
                  )
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Film Grain Texture Noise */}
      <div className="pt-2 border-t border-gray-700/40 space-y-2">
        <div
          className="flex items-center justify-between"
          title="グラフィックにフィルムグレイン（紙・粒子・砂目のざらついた有機的質感）を追加します"
        >
          <span className="text-gray-300 text-xs font-normal">
            フィルムグレイン (ざらつき質感)
          </span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={params.showGrain || false}
              className="sr-only peer"
              onChange={(e) => onParamChange("showGrain", e.target.checked)}
            />
            <div className="w-9 h-5 bg-gray-800 border border-gray-600/80 rounded-full peer peer-checked:bg-emerald-500 peer-checked:border-emerald-400 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-inner" />
          </label>
        </div>

        {params.showGrain && (
          <div
            className="space-y-1 pt-1"
            title="ざらつきの強さを調整します"
          >
            <div className="flex justify-between text-gray-400 text-[10px]">
              <label htmlFor="slider-grain-intensity">グレイン強度</label>
              <span>{Math.round((params.grainIntensity || 0.15) * 100)}%</span>
            </div>
            <input
              type="range"
              id="slider-grain-intensity"
              min="0.05"
              max="0.45"
              step="0.01"
              value={params.grainIntensity || 0.15}
              className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
              onChange={(e) =>
                onParamChange(
                  "grainIntensity",
                  Number.parseFloat(e.target.value),
                )
              }
            />
          </div>
        )}
      </div>

      {/* Isolated 1x1 Cell Handling */}
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
          <option value="none">1. そのまま (非表示/未描画)</option>
          <option value="renderCell">2. 1x1の細胞状チューブを描画</option>
          <option value="disallow">3. 余りが生まれない配置を自動探索</option>
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
    </div>
  );
};
