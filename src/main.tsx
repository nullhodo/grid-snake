import { useAtom } from "jotai";
import p5 from "p5";
import p5Svg from "p5.js-svg";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import { ControlPanel } from "./components/ControlPanel";
import { PALETTES } from "./constants/palettes";

import {
  exportHighResImage,
  exportSvgGraphics,
  parseJsonSettings,
} from "./core/exporter";
import { generateConnectedCellPaths } from "./core/pathGenerator";
import { VideoRecorderManager } from "./core/recorder";
import { renderDebugInformation, renderPathsGraphics } from "./core/renderer";
import "./index.css";
import {
  historyPointerAtom,
  historyStackAtom,
  isPanelOpenAtom,
  pathChainsAtom,
  recordingStateAtom,
  sketchParamsAtom,
} from "./state/sketchStore";
import type {
  BorderOptionKey,
  SketchParamValue,
  SketchParameters,
} from "./types/sketch";

// Initialize p5 SVG plugin
p5Svg(p5);

const App: React.FC = () => {
  const [params, setParams] = useAtom(sketchParamsAtom);
  const [pathChains, setPathChains] = useAtom(pathChainsAtom);
  const [historyStack, setHistoryStack] = useAtom(historyStackAtom);
  const [historyPointer, setHistoryPointer] = useAtom(historyPointerAtom);
  const [, setIsPanelOpen] = useAtom(isPanelOpenAtom);
  const [, setRecordingState] = useAtom(recordingStateAtom);

  const p5InstanceRef = useRef<p5 | null>(null);
  const recorderRef = useRef<VideoRecorderManager | null>(null);

  // Refs to maintain fresh state inside p5 draw loop closure
  const paramsRef = useRef(params);
  const pathChainsRef = useRef(pathChains);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    pathChainsRef.current = pathChains;
  }, [pathChains]);

  // Synchronize path generation when grid size or seed changes
  const updatePaths = (currentParams: SketchParameters) => {
    const newPaths = generateConnectedCellPaths(
      currentParams,
      p5InstanceRef.current || undefined,
    );
    setPathChains(newPaths);
    pathChainsRef.current = newPaths;
  };

  // Push parameter state into undo/redo history stack
  const pushHistory = (newParams: SketchParameters) => {
    setHistoryStack((prev) => {
      const sliced = prev.slice(0, historyPointer + 1);
      const updated = [...sliced, JSON.parse(JSON.stringify(newParams))];
      if (updated.length > 50) updated.shift();
      return updated;
    });
    setHistoryPointer((prev) => Math.min(prev + 1, 49));
  };

  const handleParamChange = (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => {
    setParams((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "gridRows" || key === "gridColumns") {
        updatePaths(next);
      }
      pushHistory(next);
      return next;
    });
  };

  const handleToggleBorderOption = (key: BorderOptionKey) => {
    setParams((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      pushHistory(next);
      return next;
    });
  };

  const handleApplyPalette = (paletteIndex: number) => {
    const palette = PALETTES[paletteIndex];
    if (!palette || palette.colors.length === 0) return;

    const colors = palette.colors.map((c) => c.hex);
    const bg = colors[0];
    const objectCandidates = colors.slice(1);

    let outline = "#22c55e";
    let core = "#ef4444";
    let gridLine = "#475569";

    if (objectCandidates.length >= 3) {
      outline = objectCandidates[0];
      core = objectCandidates[1];
      gridLine = objectCandidates[2];
    } else if (objectCandidates.length === 2) {
      outline = objectCandidates[0];
      core = objectCandidates[1];
      gridLine = objectCandidates[0];
    } else if (objectCandidates.length === 1) {
      outline = objectCandidates[0];
      core = "#FFFFFF";
      gridLine = objectCandidates[0];
    }

    setParams((prev) => {
      const next: SketchParameters = {
        ...prev,
        paletteIndex,
        backgroundColor: bg,
        outlineColor: outline,
        coreColor: core,
        gridLineColor: gridLine,
        dotColor: "#FFFFFF",
      };
      pushHistory(next);
      return next;
    });
  };

  const handlePickRandomPalette = () => {
    const randomIndex = Math.floor(Math.random() * PALETTES.length);
    handleApplyPalette(randomIndex);
  };

  const handleGenerateGradientTheme = (baseHex: string) => {
    if (!p5InstanceRef.current) return;
    const p = p5InstanceRef.current;

    p.push();
    p.colorMode(p.HSB, 360, 100, 100);
    const baseCol = p.color(baseHex);
    const baseHue = p.hue(baseCol);
    const baseSat = p.saturation(baseCol);
    const baseBright = p.brightness(baseCol);

    const bgHex = p
      .color(baseHue, Math.max(10, baseSat * 0.25), 12)
      .toString("#rrggbb");
    const outlineHex = p
      .color(
        baseHue,
        Math.min(100, baseSat * 1.1),
        Math.min(100, Math.max(70, baseBright)),
      )
      .toString("#rrggbb");
    const coreHex = p
      .color((baseHue + 35) % 360, Math.min(100, baseSat * 1.2), 95)
      .toString("#rrggbb");
    const gridLineHex = p
      .color(baseHue, Math.max(15, baseSat * 0.4), 35)
      .toString("#rrggbb");
    p.pop();

    setParams((prev) => {
      const next: SketchParameters = {
        ...prev,
        backgroundColor: bgHex,
        outlineColor: outlineHex,
        coreColor: coreHex,
        gridLineColor: gridLineHex,
        dotColor: "#FFFFFF",
      };
      pushHistory(next);
      return next;
    });
  };

  const handleRegeneratePaths = () => {
    const seed = Math.floor(Math.random() * 1000000);
    setParams((prev) => {
      const next = { ...prev, randomSeedValue: seed };
      updatePaths(next);
      pushHistory(next);
      return next;
    });
  };

  const handleRandomizeAll = () => {
    if (!p5InstanceRef.current) return;
    const p = p5InstanceRef.current;

    const rows = Math.floor(p.random(4, 12));
    const cols = Math.floor(p.random(4, 12));
    const cornerRoundness = Math.floor(p.random(0, 101));
    const tipRoundness = params.syncRoundness
      ? cornerRoundness
      : Math.floor(p.random(0, 101));
    const seed = Math.floor(Math.random() * 1000000);
    const randomPaletteIdx = Math.floor(Math.random() * PALETTES.length);

    setParams((prev) => {
      const next: SketchParameters = {
        ...prev,
        gridRows: rows,
        gridColumns: cols,
        cornerRoundnessPercent: cornerRoundness,
        tipRoundnessPercent: tipRoundness,
        tubeWidthRatio: Number.parseFloat(p.random(0.4, 0.8).toFixed(2)),
        tubeInnerRatio: Number.parseFloat(p.random(0.7, 0.9).toFixed(2)),
        coreLineWidth: Math.floor(p.random(3, 12)),
        dotSize: Math.floor(p.random(2, 8)),
        gridLineWidth: Math.floor(p.random(1, 6)),
        randomSeedValue: seed,
        paletteIndex: randomPaletteIdx,
      };
      updatePaths(next);
      pushHistory(next);
      return next;
    });
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const prevPointer = historyPointer - 1;
      const targetState = historyStack[prevPointer];
      setHistoryPointer(prevPointer);
      setParams(targetState);
      updatePaths(targetState);
    }
  };

  const handleRedo = () => {
    if (historyPointer < historyStack.length - 1) {
      const nextPointer = historyPointer + 1;
      const targetState = historyStack[nextPointer];
      setHistoryPointer(nextPointer);
      setParams(targetState);
      updatePaths(targetState);
    }
  };

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

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const importedParams = parseJsonSettings(raw);
        setParams(importedParams);
        updatePaths(importedParams);
        pushHistory(importedParams);
      } catch (err) {
        console.error("[JSON Import Error]", err);
        alert(
          "JSONファイルの読み込みに失敗しました。正しいフォーマットかご確認ください。",
        );
      }
    };
    reader.readAsText(file);
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement).tagName;
      if (targetTag === "INPUT" || targetTag === "SELECT") return;

      const key = e.key.toLowerCase();
      if (key === "r") {
        handleStartRecord();
      } else if (key === "s") {
        handleStopRecord();
      } else if (key === "h") {
        setIsPanelOpen((prev) => !prev);
      } else if (e.ctrlKey && key === "z") {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyPointer, historyStack, setIsPanelOpen]);

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
        onGenerateGradientTheme={handleGenerateGradientTheme}
        onRegeneratePaths={handleRegeneratePaths}
        onRandomizeAll={handleRandomizeAll}
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
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
