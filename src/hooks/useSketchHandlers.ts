import { useAtom } from "jotai";
import p5 from "p5";
import type React from "react";
import { useEffect, useRef } from "react";
import { PALETTES } from "../constants/palettes";
import { parseJsonSettings } from "../core/exporter";
import { generateConnectedCellPaths } from "../core/pathGenerator";
import {
  autoRandomIntervalMsAtom,
  historyPointerAtom,
  historyStackAtom,
  isAutoRandomActiveAtom,
  isPanelOpenAtom,
  pathChainsAtom,
  randomTargetsAtom,
  sketchParamsAtom,
} from "../state/sketchStore";
import type {
  BorderOptionKey,
  SketchParamValue,
  SketchParameters,
  TransitionType,
} from "../types/sketch";

interface UseSketchHandlersResult {
  handleParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
  handleToggleBorderOption: (key: BorderOptionKey) => void;
  handleApplyPalette: (paletteIndex: number) => void;
  handlePickRandomPalette: () => void;
  handleShufflePaletteColors: () => void;
  handleGenerateGradientTheme: (baseHex: string) => void;
  handleRegeneratePaths: () => void;
  randomizeSelectedParameters: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleImportJson: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook that encapsulates all sketch parameter handlers,
 * randomization logic, undo/redo, and keyboard shortcuts.
 */
export function useSketchHandlers(
  p5InstanceRef: React.RefObject<p5 | null>,
): UseSketchHandlersResult {
  const [params, setParams] = useAtom(sketchParamsAtom);
  const [pathChains, setPathChains] = useAtom(pathChainsAtom);
  const [historyStack, setHistoryStack] = useAtom(historyStackAtom);
  const [historyPointer, setHistoryPointer] = useAtom(historyPointerAtom);
  const [, setIsPanelOpen] = useAtom(isPanelOpenAtom);

  const [randomTargets] = useAtom(randomTargetsAtom);
  const [intervalMs] = useAtom(autoRandomIntervalMsAtom);
  const [isAutoRandomActive] = useAtom(isAutoRandomActiveAtom);

  // Keep fresh references for use in closures (intervals, p5 draw)
  const paramsRef = useRef(params);
  const pathChainsRef = useRef(pathChains);
  const randomTargetsRef = useRef(randomTargets);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    pathChainsRef.current = pathChains;
  }, [pathChains]);

  useEffect(() => {
    randomTargetsRef.current = randomTargets;
  }, [randomTargets]);

  const updatePaths = (currentParams: SketchParameters) => {
    const newPaths = generateConnectedCellPaths(
      currentParams,
      p5InstanceRef.current || undefined,
    );
    setPathChains(newPaths);
    pathChainsRef.current = newPaths;
  };

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

  const handleShufflePaletteColors = () => {
    const palette = PALETTES[params.paletteIndex];
    let colors: string[] = [];

    if (palette && palette.colors.length > 0) {
      colors = palette.colors.map((c) => c.hex);
    } else {
      colors = Array.from(
        new Set([
          params.backgroundColor,
          params.outlineColor,
          params.coreColor,
          params.gridLineColor,
          params.dotColor,
        ]),
      );
    }

    if (colors.length === 0) return;

    const shuffled = [...colors];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const bg = shuffled[0];
    const outline = shuffled[1 % shuffled.length];
    const core = shuffled[2 % shuffled.length];
    const gridLine = shuffled[3 % shuffled.length];
    const dot = shuffled.length >= 5 ? shuffled[4] : "#FFFFFF";

    setParams((prev) => {
      const next: SketchParameters = {
        ...prev,
        backgroundColor: bg,
        outlineColor: outline,
        coreColor: core,
        gridLineColor: gridLine,
        dotColor: dot,
      };
      pushHistory(next);
      return next;
    });
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

  const randomizeSelectedParameters = () => {
    const p = p5InstanceRef.current || Math;
    const targets = randomTargetsRef.current;

    setParams((prev) => {
      const next: SketchParameters = { ...prev };
      let pathGridChanged = false;

      if (targets.gridSize) {
        next.gridRows = Math.floor(
          p.random ? p.random(4, 12) : 4 + Math.random() * 8,
        );
        next.gridColumns = Math.floor(
          p.random ? p.random(4, 12) : 4 + Math.random() * 8,
        );
        pathGridChanged = true;
      }

      if (targets.canvasPadding) {
        next.gridPadding = Number.parseFloat(
          (p.random
            ? p.random(0.08, 0.22)
            : 0.08 + Math.random() * 0.14
          ).toFixed(2),
        );
      }

      if (targets.canvasAspectRatio) {
        next.canvasAspectRatio = Number.parseFloat(
          (p.random
            ? p.random(0.6, 1.8)
            : 0.6 + Math.random() * 1.2
          ).toFixed(2),
        );
      }

      if (targets.palette) {
        const randomPaletteIdx = Math.floor(
          p.random
            ? p.random(PALETTES.length)
            : Math.random() * PALETTES.length,
        );
        const palette = PALETTES[randomPaletteIdx];
        if (palette && palette.colors.length > 0) {
          const colors = palette.colors.map((c) => c.hex);
          next.paletteIndex = randomPaletteIdx;
          next.backgroundColor = colors[0];
          next.outlineColor = colors[1] || colors[0];
          next.coreColor = colors[2] || colors[0];
          next.gridLineColor = colors[3] || colors[1] || colors[0];
        }
      }

      if (targets.paletteShuffle) {
        const palette = PALETTES[next.paletteIndex];
        let colors: string[] = [];

        if (palette && palette.colors.length > 0) {
          colors = palette.colors.map((c) => c.hex);
        } else {
          colors = Array.from(
            new Set([
              next.backgroundColor,
              next.outlineColor,
              next.coreColor,
              next.gridLineColor,
              next.dotColor,
            ]),
          );
        }

        if (colors.length > 0) {
          const shuffled = [...colors];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          next.backgroundColor = shuffled[0];
          next.outlineColor = shuffled[1 % shuffled.length];
          next.coreColor = shuffled[2 % shuffled.length];
          next.gridLineColor = shuffled[3 % shuffled.length];
          if (shuffled.length >= 5) {
            next.dotColor = shuffled[4];
          }
        }
      }

      if (targets.cornerRoundness) {
        next.cornerRoundnessPercent = Math.floor(
          p.random ? p.random(0, 101) : Math.random() * 101,
        );
      }

      if (targets.tipRoundness) {
        next.tipRoundnessPercent = next.syncRoundness
          ? next.cornerRoundnessPercent
          : Math.floor(p.random ? p.random(0, 101) : Math.random() * 101);
      }

      if (targets.tubeDimensions) {
        next.tubeWidthRatio = Number.parseFloat(
          (p.random ? p.random(0.4, 0.8) : 0.4 + Math.random() * 0.4).toFixed(
            2,
          ),
        );
        next.tubeInnerRatio = Number.parseFloat(
          (p.random ? p.random(0.7, 0.92) : 0.7 + Math.random() * 0.22).toFixed(
            2,
          ),
        );
      }

      if (targets.coreLineWidth) {
        next.coreLineWidth = Math.floor(
          p.random ? p.random(3, 14) : 3 + Math.random() * 11,
        );
      }

      if (targets.dotSize) {
        next.dotSize = Math.floor(
          p.random ? p.random(2, 9) : 2 + Math.random() * 7,
        );
      }

      if (targets.autoHideDots) {
        next.autoHideDotsWhenRounded = Math.random() > 0.5;
      }

      if (targets.transitionType) {
        const modes: TransitionType[] = [
          "fade",
          "slide",
          "swipeHorizontal",
          "swipeVertical",
          "zoom",
          "wipe",
        ];
        next.transitionType = modes[Math.floor(Math.random() * modes.length)];
      }

      if (targets.grain) {
        next.showGrain = Math.random() > 0.3;
        next.grainIntensity = Number.parseFloat(
          (0.08 + Math.random() * 0.25).toFixed(2),
        );
      }

      if (targets.gridLineWidth) {
        next.gridLineWidth = Math.floor(
          p.random ? p.random(1, 6) : 1 + Math.random() * 5,
        );
      }

      if (targets.gridBorderOptions) {
        next.showGridOuterBorder = Math.random() > 0.3;
        next.showGridInnerHorizontal = Math.random() > 0.4;
        next.showGridInnerVertical = Math.random() > 0.4;
        next.showGridCenterHorizontal = Math.random() > 0.7;
        next.showGridCenterVertical = Math.random() > 0.7;
      }

      if (targets.randomSeed) {
        next.randomSeedValue = Math.floor(Math.random() * 1000000);
        pathGridChanged = true;
      }

      if (pathGridChanged) {
        updatePaths(next);
      }

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


  // Keyboard shortcut registration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement).tagName;
      if (targetTag === "INPUT" || targetTag === "SELECT") return;

      const key = e.key.toLowerCase();
      if (key === "h") {
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

  // Periodic Auto-Randomization loop
  useEffect(() => {
    if (!isAutoRandomActive) return;
    const intervalId = setInterval(() => {
      randomizeSelectedParameters();
    }, intervalMs);
    return () => clearInterval(intervalId);
  }, [isAutoRandomActive, intervalMs]);

  return {
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
  };
}
