import { useAtom } from "jotai";
import {
  RotateCcwIcon,
  RotateCwIcon,
  RotateCwSquareIcon,
  SlidersIcon,
  SparklesIcon,
} from "lucide-react";
import type React from "react";
import {
  historyPointerAtom,
  historyStackAtom,
  sketchParamsAtom,
} from "../../state/sketchStore";
import type { SketchParamValue, SketchParameters } from "../../types/sketch";

interface Props {
  onRegeneratePaths: () => void;
  onRandomizeAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
}

export const OperationsSection: React.FC<Props> = ({
  onRegeneratePaths,
  onRandomizeAll,
  onUndo,
  onRedo,
  onParamChange,
}) => {
  const [params] = useAtom(sketchParamsAtom);
  const [historyStack] = useAtom(historyStackAtom);
  const [historyPointer] = useAtom(historyPointerAtom);

  const canUndo = historyPointer > 0;
  const canRedo = historyPointer < historyStack.length - 1;

  return (
    <div className="space-y-3 bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/30">
      <div className="font-bold text-emerald-400 flex items-center gap-2">
        <SlidersIcon className="w-4 h-4" /> 操作 &amp; デバッグ
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRegeneratePaths}
          title="新しいパス接続パターンを再生成します"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCwSquareIcon className="w-4 h-4" /> パス再生成
        </button>
        <button
          type="button"
          onClick={onRandomizeAll}
          title="すべてのパラメータをランダム設定します"
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <SparklesIcon className="w-4 h-4" /> 完全ランダム
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          title="前のパラメータ状態に戻します (Ctrl+Z)"
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCcwIcon className="w-3.5 h-3.5" /> Undo
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          title="進んだパラメータ状態に進めます (Ctrl+Y)"
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCwIcon className="w-3.5 h-3.5" /> Redo
        </button>
      </div>

      <div
        className="flex items-center justify-between pt-2 border-t border-gray-700/40"
        title="デバッグモード（セル番号、パス方向、インデックス表示）"
      >
        <span className="text-gray-300 font-medium">デバッグ表示</span>
        <label
          className="relative inline-flex items-center cursor-pointer select-none"
          title="デバッグ表示のON/OFF"
        >
          <input
            type="checkbox"
            checked={params.debugMode}
            className="sr-only peer"
            onChange={(e) => onParamChange("debugMode", e.target.checked)}
          />
          <div className="w-9 h-5 bg-gray-800 border border-gray-600/80 rounded-full peer peer-checked:bg-emerald-500 peer-checked:border-emerald-400 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-inner" />
        </label>
      </div>
    </div>
  );
};
