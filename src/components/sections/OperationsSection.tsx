import { useAtom } from "jotai";
import {
  DicesIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  RotateCwSquareIcon,
  SlidersHorizontalIcon,
  SlidersIcon,
  SquareIcon,
  VideoIcon,
} from "lucide-react";
import type React from "react";
import {
  autoRandomIntervalMsAtom,
  historyPointerAtom,
  historyStackAtom,
  isAutoRandomActiveAtom,
  isLoopRecordingActiveAtom,
  isRandomTargetsModalOpenAtom,
  recordingStateAtom,
  sketchParamsAtom,
  targetLoopsCountAtom,
} from "../../state/sketchStore";
import type { SketchParamValue, SketchParameters } from "../../types/sketch";

interface Props {
  onRegeneratePaths: () => void;
  onRandomizeAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
  onStartNLoopRecord: () => void;
  onStopNLoopRecord: () => void;
}

export const OperationsSection: React.FC<Props> = ({
  onRegeneratePaths,
  onRandomizeAll,
  onUndo,
  onRedo,
  onParamChange,
  onStartNLoopRecord,
  onStopNLoopRecord,
}) => {
  const [params] = useAtom(sketchParamsAtom);
  const [historyStack] = useAtom(historyStackAtom);
  const [historyPointer] = useAtom(historyPointerAtom);

  const [isTargetsModalOpen, setIsTargetsModalOpen] = useAtom(
    isRandomTargetsModalOpenAtom,
  );
  const [intervalMs, setIntervalMs] = useAtom(autoRandomIntervalMsAtom);
  const [isAutoRandomActive, setIsAutoRandomActive] = useAtom(
    isAutoRandomActiveAtom,
  );
  const [targetLoops, setTargetLoops] = useAtom(targetLoopsCountAtom);
  const [isLoopRecordingActive] = useAtom(isLoopRecordingActiveAtom);
  const [recordingState] = useAtom(recordingStateAtom);

  const canUndo = historyPointer > 0;
  const canRedo = historyPointer < historyStack.length - 1;

  return (
    <div className="space-y-3 bg-gray-50/70 p-3.5 rounded-md border border-gray-200">
      <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
        <SlidersIcon className="w-4 h-4 text-gray-700" /> 操作 &amp; 自動ランダム制御
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRegeneratePaths}
          title="新しいパス接続パターンを再生成します"
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded font-medium transition flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm"
        >
          <RotateCwSquareIcon className="w-4 h-4" /> パス再生成
        </button>
        <button
          type="button"
          onClick={onRandomizeAll}
          title="選択された対象パラメータをランダム設定します"
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded font-medium transition flex items-center justify-center gap-1.5 cursor-pointer text-xs shadow-sm"
        >
          <DicesIcon className="w-4 h-4" /> ランダム実行
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsTargetsModalOpen((prev) => !prev)}
        title="ランダム化対象の選択ドロワーを右側に開閉します"
        className={`w-full py-1.5 rounded border transition flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
          isTargetsModalOpen
            ? "bg-gray-100 border-gray-400 text-gray-900 font-semibold shadow-inner ring-1 ring-gray-400/40"
            : "bg-white hover:bg-gray-100 text-gray-800 border-gray-300 shadow-sm font-medium"
        }`}
      >
        <SlidersHorizontalIcon className="w-3.5 h-3.5" />
        ランダム対象パラメータの選択 {isTargetsModalOpen ? "◀" : "▶"}
      </button>

      {/* Auto Random Interval Slider & Switch */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-semibold text-xs">
            自動ランダム更新
          </span>
          <label
            className="relative inline-flex items-center cursor-pointer select-none"
            title="指定ms周期で自動的にランダム更新を実行します"
          >
            <input
              type="checkbox"
              checked={isAutoRandomActive}
              className="sr-only peer"
              onChange={(e) => setIsAutoRandomActive(e.target.checked)}
            />
            <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
          </label>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-gray-600 font-medium text-[11px]">
            <label htmlFor="slider-interval-ms">更新周期 (ms)</label>
            <span className="text-gray-900">
              {intervalMs} ms ({(intervalMs / 1000).toFixed(1)}s)
            </span>
          </div>
          <input
            type="range"
            id="slider-interval-ms"
            min="200"
            max="5000"
            step="100"
            value={intervalMs}
            className="w-full accent-emerald-600 bg-gray-200 rounded h-1.5 cursor-pointer"
            onChange={(e) => setIntervalMs(Number.parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Exact N-Loop MP4 Recording */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-semibold">Nループ指定 MP4録画</span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-600 font-medium text-[11px]">ループ数:</span>
            <select
              value={targetLoops}
              onChange={(e) => setTargetLoops(Number.parseInt(e.target.value))}
              className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-900 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n} ループ ({((n * intervalMs) / 1000).toFixed(1)}s)
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoopRecordingActive ? (
          <button
            type="button"
            onClick={onStopNLoopRecord}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2 text-xs cursor-pointer animate-pulse shadow-sm"
          >
            <SquareIcon className="w-4 h-4 fill-white" />
            Nループ録画を停止 (録画中)
          </button>
        ) : (
          <button
            type="button"
            disabled={recordingState.isRecording}
            onClick={onStartNLoopRecord}
            title="指定したNループ分だけ自動ランダム更新しながらMP4動画を自動撮影します"
            className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-2 rounded font-medium transition flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <VideoIcon className="w-4 h-4" />
            <PlayIcon className="w-3 h-3 -ml-0.5" />
            {targetLoops} ループ分を自動録画 (MP4)
          </button>
        )}
      </div>

      {/* Undo / Redo */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          title="前のパラメータ状態に戻します (Ctrl+Z)"
          className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-800 border border-gray-300 py-1.5 rounded transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-xs font-medium shadow-sm"
        >
          <RotateCcwIcon className="w-3.5 h-3.5" /> Undo
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          title="進んだパラメータ状態に進めます (Ctrl+Y)"
          className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-40 text-gray-800 border border-gray-300 py-1.5 rounded transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-xs font-medium shadow-sm"
        >
          <RotateCwIcon className="w-3.5 h-3.5" /> Redo
        </button>
      </div>

      {/* Debug Toggle */}
      <div
        className="flex items-center justify-between pt-2 border-t border-gray-200"
        title="デバッグモード（セル番号、パス方向、インデックス表示）"
      >
        <span className="text-gray-700 font-semibold text-xs">デバッグ表示</span>
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
          <div className="w-9 h-5 bg-gray-200 border border-gray-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:border-emerald-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-sm" />
        </label>
      </div>
    </div>
  );
};
