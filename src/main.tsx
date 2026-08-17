import { useAtom } from "jotai";
import p5 from "p5";
import p5Svg from "p5.js-svg";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { ControlPanel } from "./components/ControlPanel";
import { exportHighResImage, exportSvgGraphics } from "./core/exporter";
import { generateConnectedCellPaths } from "./core/pathGenerator";
import { VideoRecorderManager } from "./core/recorder";
import { renderDebugInformation, renderPathsGraphics } from "./core/renderer";
import { renderCmykPrintOverlay } from "./core/renderers/cmykRenderer";
import { renderDitheringOverlay } from "./core/renderers/ditheringRenderer";
import { renderGrainOverlay } from "./core/renderers/grainOverlay";
import { renderHalftoneScreenOverlay } from "./core/renderers/halftoneRenderer";
import { renderInkBleedOverlay } from "./core/renderers/inkBleedRenderer";
import { renderPaperTextureOverlay } from "./core/renderers/paperTextureRenderer";
import { renderRisoPrintOverlay } from "./core/renderers/risoRenderer";
import { renderTransition } from "./core/renderers/transitionRenderer";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
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

// Add [DEV] prefix to tab title in local development mode
if (import.meta.env.DEV && !document.title.startsWith("[DEV] ")) {
  document.title = `[DEV] ${document.title}`;
}

const App: React.FC = () => {
  const [params] = useAtom(sketchParamsAtom);
  const [pathChains, setPathChains] = useAtom(pathChainsAtom);
  const [, setRecordingState] = useAtom(recordingStateAtom);
  const [, setIsAutoRandomActive] = useAtom(isAutoRandomActiveAtom);
  const [, setIsLoopRecordingActive] = useAtom(isLoopRecordingActiveAtom);

  const p5InstanceRef = useRef<p5 | null>(null);
  const recorderRef = useRef<VideoRecorderManager | null>(null);
  const loopCountCounterRef = useRef(0);

  // Keep fresh references for use inside p5 draw closure
  const paramsRef = useRef(params);
  const pathChainsRef = useRef(pathChains);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);
  useEffect(() => {
    pathChainsRef.current = pathChains;
  }, [pathChains]);

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

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onRegeneratePaths: handleRegeneratePaths,
    onRandomizeAll: randomizeSelectedParameters,
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  // Mount p5.js instance
  useEffect(() => {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    const sketch = (p: p5) => {
      let prevBuffer: p5.Graphics | null = null;
      let currentBuffer: p5.Graphics | null = null;
      let transitionStartTime = 0;
      let lastRenderKey = "";

      p.setup = () => {
        const c = p.createCanvas(container.clientWidth, container.clientHeight);
        c.parent("canvas-container");
        p.frameRate(60);

        prevBuffer = p.createGraphics(
          container.clientWidth,
          container.clientHeight,
        );
        currentBuffer = p.createGraphics(
          container.clientWidth,
          container.clientHeight,
        );

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
        if (!currentBuffer || !prevBuffer) return;

        const currentParams = paramsRef.current;
        const currentPaths = pathChainsRef.current;

        // Render key to detect state updates
        const renderKey = JSON.stringify(currentParams) + currentPaths.length;

        if (renderKey !== lastRenderKey && lastRenderKey !== "") {
          // State changed -> copy currentBuffer to prevBuffer to begin transition
          prevBuffer.clear();
          prevBuffer.image(currentBuffer, 0, 0);
          transitionStartTime = Date.now();
        }
        lastRenderKey = renderKey;

        // Draw new state into currentBuffer
        currentBuffer.background(currentParams.backgroundColor);
        renderPathsGraphics(
          currentBuffer,
          currentBuffer.width,
          currentBuffer.height,
          currentParams,
          currentPaths,
        );

        if (currentParams.showGrain) {
          renderGrainOverlay(
            currentBuffer,
            currentBuffer.width,
            currentBuffer.height,
            currentParams.grainIntensity || 0.15,
          );
        }

        if (currentParams.showCmyk) {
          renderCmykPrintOverlay(
            p,
            currentBuffer,
            currentBuffer.width,
            currentBuffer.height,
            currentParams.cmykOffsetFactor !== undefined
              ? currentParams.cmykOffsetFactor
              : 0.35,
            currentParams.cmykIntensity !== undefined
              ? currentParams.cmykIntensity
              : 0.9,
            currentParams.backgroundColor,
          );
        }

        if (currentParams.showRiso) {
          renderRisoPrintOverlay(
            p,
            currentBuffer,
            currentBuffer.width,
            currentBuffer.height,
            currentParams.risoOffsetPx || 3,
            currentParams.risoIntensity || 0.25,
          );
        }

        if (currentParams.showHalftone) {
          renderHalftoneScreenOverlay(
            p,
            currentBuffer,
            currentBuffer.width,
            currentBuffer.height,
            currentParams.halftoneSize || 6,
            currentParams.halftoneAngle || 45,
          );
        }

        if (currentParams.showDithering) {
          renderDitheringOverlay(
            p,
            currentBuffer,
            currentBuffer.width,
            currentBuffer.height,
            currentParams.ditheringScale || 2,
            currentParams.ditheringLevels || 4,
          );
        }

        if (currentParams.showInkBleed) {
          renderInkBleedOverlay(
            p,
            currentBuffer,
            currentBuffer.width,
            currentBuffer.height,
            currentParams.inkBleedAmount || 4,
            currentParams.inkBleedRoughness || 0.4,
          );
        }

        if (currentParams.showPaperTexture) {
          renderPaperTextureOverlay(
            p,
            currentBuffer,
            currentBuffer.width,
            currentBuffer.height,
            currentParams.paperRoughness || 0.35,
            currentParams.paperColorDensity || 0.2,
          );
        }

        // Render transition animation onto main canvas
        const elapsed = Date.now() - transitionStartTime;
        const duration = Math.max(
          50,
          currentParams.transitionDurationMs || 400,
        );
        const progress = elapsed / duration;

        p.background(currentParams.backgroundColor);

        if (
          currentParams.transitionType &&
          currentParams.transitionType !== "none" &&
          progress < 1.0 &&
          transitionStartTime > 0
        ) {
          renderTransition(
            p,
            prevBuffer,
            currentBuffer,
            progress,
            currentParams.transitionType,
          );
        } else {
          p.image(currentBuffer, 0, 0);
        }

        if (currentParams.debugMode) {
          renderDebugInformation(
            p,
            p.width,
            p.height,
            currentParams,
            currentPaths,
          );
        }
      };

      p.windowResized = () => {
        if (container) {
          p.resizeCanvas(container.clientWidth, container.clientHeight);
          if (prevBuffer) {
            prevBuffer.resizeCanvas(
              container.clientWidth,
              container.clientHeight,
            );
          }
          if (currentBuffer) {
            currentBuffer.resizeCanvas(
              container.clientWidth,
              container.clientHeight,
            );
          }

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
