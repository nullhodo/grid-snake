import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { SlidersIcon, XIcon } from "lucide-react";
import type React from "react";
import { isPanelOpenAtom, recordingStateAtom } from "../state/sketchStore";
import type {
  BorderOptionKey,
  SketchParamValue,
  SketchParameters,
} from "../types/sketch";
import { RandomTargetsModal } from "./modals/RandomTargetsModal";
import { ColorPaletteSection } from "./sections/ColorPaletteSection";
import { ExportSection } from "./sections/ExportSection";
import { GridLayoutSection } from "./sections/GridLayoutSection";
import { GridLinesSection } from "./sections/GridLinesSection";
import { OperationsSection } from "./sections/OperationsSection";
import { RenderingStyleSection } from "./sections/RenderingStyleSection";

interface Props {
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
  onToggleBorderOption: (key: BorderOptionKey) => void;
  onApplyPalette: (idx: number) => void;
  onPickRandomPalette: () => void;
  onGenerateGradientTheme: (baseHex: string) => void;
  onRegeneratePaths: () => void;
  onRandomizeAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExportJpg: () => void;
  onExportSvg: () => void;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartNLoopRecord: () => void;
  onStopNLoopRecord: () => void;
}

export const ControlPanel: React.FC<Props> = ({
  onParamChange,
  onToggleBorderOption,
  onApplyPalette,
  onPickRandomPalette,
  onGenerateGradientTheme,
  onRegeneratePaths,
  onRandomizeAll,
  onUndo,
  onRedo,
  onExportJpg,
  onExportSvg,
  onStartRecord,
  onStopRecord,
  onImportJson,
  onStartNLoopRecord,
  onStopNLoopRecord,
}) => {
  const [isOpen, setIsOpen] = useAtom(isPanelOpenAtom);
  const [recordingState] = useAtom(recordingStateAtom);

  const formatTimer = (secs: number) => {
    const mins = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${mins}:${s}`;
  };

  return (
    <>
      {/* Recording Badge Overlay */}
      {recordingState.isRecording && (
        <div className="absolute top-6 right-6 bg-red-600/90 text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest flex items-center gap-2 shadow-lg backdrop-blur border border-red-400/30 animate-pulse z-50">
          <div className="w-3 h-3 rounded-full bg-white animate-ping" />
          REC <span>{formatTimer(recordingState.elapsedSeconds)}</span> (Press
          'S' to Stop)
        </div>
      )}

      {/* Floating Toggle Button on the Left */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="ツールウィンドウの表示/非表示 (Hキー)"
        className="absolute top-4 left-4 z-50 bg-gray-900/90 hover:bg-gray-800 text-gray-200 p-3 rounded-xl shadow-2xl backdrop-blur-md border border-gray-700/80 transition flex items-center gap-2 cursor-pointer"
      >
        <SlidersIcon className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-semibold">ツール設定</span>
      </button>

      {/* Sidebar Panel on the Left */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-4 left-4 bottom-4 w-96 bg-gray-900/90 backdrop-blur-md text-gray-200 rounded-2xl shadow-2xl border border-gray-800/80 flex flex-col z-40 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800/80 flex items-center justify-between bg-gray-900/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wide text-gray-200">
                  ツール設定
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar text-xs">
              <GridLayoutSection onParamChange={onParamChange} />
              <GridLinesSection
                onParamChange={onParamChange}
                onToggleBorderOption={onToggleBorderOption}
              />
              <ColorPaletteSection
                onApplyPalette={onApplyPalette}
                onPickRandomPalette={onPickRandomPalette}
                onGenerateGradientTheme={onGenerateGradientTheme}
                onParamChange={onParamChange}
              />
              <RenderingStyleSection onParamChange={onParamChange} />
              <OperationsSection
                onRegeneratePaths={onRegeneratePaths}
                onRandomizeAll={onRandomizeAll}
                onUndo={onUndo}
                onRedo={onRedo}
                onParamChange={onParamChange}
                onStartNLoopRecord={onStartNLoopRecord}
                onStopNLoopRecord={onStopNLoopRecord}
              />
              <ExportSection
                onExportJpg={onExportJpg}
                onExportSvg={onExportSvg}
                onStartRecord={onStartRecord}
                onStopRecord={onStopRecord}
                onImportJson={onImportJson}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selective Random Targets Modal */}
      <RandomTargetsModal />
    </>
  );
};
