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
    <div className="space-y-3 bg-gray-800/40 p-3.5 rounded-xl border border-gray-700/30">
      <div className="font-bold text-emerald-400 flex items-center gap-2">
        <SlidersIcon className="w-4 h-4" /> 操作 &amp; 自動ランダム制御
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRegeneratePaths}
          title="新しいパス接続パターンを再生成します"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
        >
          <RotateCwSquareIcon className="w-4 h-4" /> パス再生成
        </button>
        <button
          type="button"
          onClick={onRandomizeAll}
          title="選択された対象パラメータをランダム設定します"
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
        >
          <DicesIcon className="w-4 h-4" /> ランダム実行
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsTargetsModalOpen((prev) => !prev)}
        title="ランダム化対象の選択ドロワーを右側に開閉します"
        className={`w-full py-1.5 rounded-lg border transition flex items-center justify-center gap-1.5 cursor-pointer text-xs ${
          isTargetsModalOpen
            ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-300 font-medium shadow-sm"
            : "bg-gray-800 hover:bg-gray-700/80 text-gray-300 hover:text-white border-gray-700/80"
        }`}
      >
        <SlidersHorizontalIcon className="w-3.5 h-3.5 text-emerald-400" />
        ランダム対象パラメータの選択 {isTargetsModalOpen ? "◀" : "▶"}
      </button>

      {/* Auto Random Interval Slider & Switch */}
      <div className="space-y-2 pt-2 border-t border-gray-700/40">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium text-xs">
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
            <div className="w-9 h-5 bg-gray-800 border border-gray-600/80 rounded-full peer peer-checked:bg-emerald-500 peer-checked:border-emerald-400 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4 shadow-inner" />
          </label>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-gray-400 text-[11px]">
            <label htmlFor="slider-interval-ms">更新周期 (ms)</label>
            <span>
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
            className="w-full accent-emerald-500 bg-gray-700 rounded-lg h-1.5 cursor-pointer"
            onChange={(e) => setIntervalMs(Number.parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Exact N-Loop MP4 Recording */}
      <div className="space-y-2 pt-2 border-t border-gray-700/40">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-300 font-medium">Nループ指定 MP4録画</span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-[11px]">ループ数:</span>
            <select
              value={targetLoops}
              onChange={(e) => setTargetLoops(Number.parseInt(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-xs text-gray-200 cursor-pointer"
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
            className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-xs cursor-pointer animate-pulse"
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
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            <VideoIcon className="w-4 h-4 text-purple-200" />
            <PlayIcon className="w-3 h-3 text-purple-200 -ml-1" />
            {targetLoops} ループ分を自動録画 (MP4)
          </button>
        )}
      </div>

      {/* Undo / Redo */}
      <div className="flex gap-2 pt-2 border-t border-gray-700/40">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          title="前のパラメータ状態に戻します (Ctrl+Z)"
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-xs"
        >
          <RotateCcwIcon className="w-3.5 h-3.5" /> Undo
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          title="進んだパラメータ状態に進めます (Ctrl+Y)"
          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-200 py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed text-xs"
        >
          <RotateCwIcon className="w-3.5 h-3.5" /> Redo
        </button>
      </div>

      {/* Debug Toggle */}
      <div
        className="flex items-center justify-between pt-2 border-t border-gray-700/40"
        title="デバッグモード（セル番号、パス方向、インデックス表示）"
      >
        <span className="text-gray-300 font-medium text-xs">デバッグ表示</span>
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
