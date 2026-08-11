import { useAtom } from "jotai";
import p5 from "p5";
import p5Svg from "p5.js-svg";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { ControlPanel } from "./components/ControlPanel";
import {
  exportHighResImage,
  exportSvgGraphics,
} from "./core/exporter";
import { generateConnectedCellPaths } from "./core/pathGenerator";
import { VideoRecorderManager } from "./core/recorder";
import { renderDebugInformation, renderPathsGraphics } from "./core/renderer";
import { useSketchHandlers } from "./hooks/useSketchHandlers";
import "./index.css";
import {
  isAutoRandomActiveAtom,
  isLoopRecordingActiveAtom,
  pathChainsAtom,
  recordingStateAtom,
  sketchParamsAtom,
} from "./state/sketchStore";

// Initialize p5 SVG plugin
p5Svg(p5);

const App: React.FC = () => {
  const [params] = useAtom(sketchParamsAtom);
  const [pathChains, setPathChains] = useAtom(pathChainsAtom);
  const [, setRecordingState] = useAtom(recordingStateAtom);
  const [, setIsAutoRandomActive] = useAtom(isAutoRandomActiveAtom);
  const [isLoopRecordingActive, setIsLoopRecordingActive] = useAtom(isLoopRecordingActiveAtom);

  const p5InstanceRef = useRef<p5 | null>(null);
  const recorderRef = useRef<VideoRecorderManager | null>(null);
  const loopCountCounterRef = useRef(0);

  // Keep fresh references for use inside p5 draw closure
  const paramsRef = useRef(params);
  const pathChainsRef = useRef(pathChains);

  useEffect(() => { paramsRef.current = params; }, [params]);
  useEffect(() => { pathChainsRef.current = pathChains; }, [pathChains]);

  const {
    handleParamChange,
    handleToggleBorderOption,
    handleApplyPalette,
    handlePickRandomPalette,
    handleShufflePaletteColors,
    handleGenerateGradientTheme,
    handleRegeneratePaths,
    randomizeSelectedParameters,
    handleUndo,
    handleRedo,
    handleImportJson,
  } = useSketchHandlers(p5InstanceRef);

  const handleStartRecord = async () => {
    if (recorderRef.current) {
      await recorderRef.current.startRecording();
    }
  };

  const handleStopRecord = async () => {
    if (recorderRef.current) {
      await recorderRef.current.stopRecording();
    }
  };

  const handleStartNLoopRecord = async () => {
    if (recorderRef.current) {
      loopCountCounterRef.current = 0;
      setIsLoopRecordingActive(true);
      setIsAutoRandomActive(true);
      await recorderRef.current.startRecording();
    }
  };

  const handleStopNLoopRecord = async () => {
    setIsLoopRecordingActive(false);
    setIsAutoRandomActive(false);
    if (recorderRef.current) {
      await recorderRef.current.stopRecording();
    }
  };

  // Keyboard shortcuts for recording (R/S keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement).tagName;
      if (targetTag === "INPUT" || targetTag === "SELECT") return;

      const key = e.key.toLowerCase();
      if (key === "r") {
        handleStartRecord();
      } else if (key === "s") {
        if (isLoopRecordingActive) {
          handleStopNLoopRecord();
        } else {
          handleStopRecord();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoopRecordingActive]);


  // Mount p5.js instance
  useEffect(() => {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    const sketch = (p: p5) => {
      p.setup = () => {
        const c = p.createCanvas(container.clientWidth, container.clientHeight);
        c.parent("canvas-container");
        p.frameRate(60);

        recorderRef.current = new VideoRecorderManager(
          c.elt as HTMLCanvasElement,
          (recording, elapsedSeconds) => {
            setRecordingState({ isRecording: recording, elapsedSeconds });
          },
        );

        p5InstanceRef.current = p;
        const initialPaths = generateConnectedCellPaths(paramsRef.current, p);
        setPathChains(initialPaths);
        pathChainsRef.current = initialPaths;
      };

      p.draw = () => {
        p.background(paramsRef.current.backgroundColor);
        renderPathsGraphics(
          p,
          p.width,
          p.height,
          paramsRef.current,
          pathChainsRef.current,
        );

        if (paramsRef.current.debugMode) {
          renderDebugInformation(
            p,
            p.width,
            p.height,
            paramsRef.current,
            pathChainsRef.current,
          );
        }
      };

      p.windowResized = () => {
        if (container) {
          p.resizeCanvas(container.clientWidth, container.clientHeight);
          const pContainer = p as unknown as { canvas?: HTMLCanvasElement };
          if (recorderRef.current && pContainer.canvas) {
            recorderRef.current.setCanvas(pContainer.canvas);
          }
        }
      };
    };

    const p5Inst = new p5(sketch);

    return () => {
      p5Inst.remove();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950 flex">
      <div id="canvas-container" className="relative flex-1 h-full w-full" />
      <ControlPanel
        onParamChange={handleParamChange}
        onToggleBorderOption={handleToggleBorderOption}
        onApplyPalette={handleApplyPalette}
        onPickRandomPalette={handlePickRandomPalette}
        onShufflePaletteColors={handleShufflePaletteColors}
        onGenerateGradientTheme={handleGenerateGradientTheme}
        onRegeneratePaths={handleRegeneratePaths}
        onRandomizeAll={randomizeSelectedParameters}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExportJpg={() => {
          if (p5InstanceRef.current) {
            exportHighResImage(
              p5InstanceRef.current,
              paramsRef.current,
              pathChainsRef.current,
            );
          }
        }}
        onExportSvg={() => {
          if (p5InstanceRef.current) {
            exportSvgGraphics(
              p5InstanceRef.current,
              paramsRef.current,
              pathChainsRef.current,
            );
          }
        }}
        onStartRecord={handleStartRecord}
        onStopRecord={handleStopRecord}
        onImportJson={handleImportJson}
        onStartNLoopRecord={handleStartNLoopRecord}
        onStopNLoopRecord={handleStopNLoopRecord}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
