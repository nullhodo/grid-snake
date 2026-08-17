import type p5 from "p5";
import { PALETTES } from "../constants/palettes";
import type {
  IsolatedCellMode,
  RandomTargets,
  SketchParameters,
  TransitionType,
} from "../types/sketch";

/**
 * Checks if a grid line combination matches a visually poor blacklisted pattern.
 */
export function isBlacklistedGridBorderCombination(opts: {
  showGridOuterBorder: boolean;
  showGridInnerHorizontal: boolean;
  showGridInnerVertical: boolean;
  showGridCenterHorizontal: boolean;
  showGridCenterVertical: boolean;
}): boolean {
  const {
    showGridOuterBorder,
    showGridInnerHorizontal,
    showGridInnerVertical,
    showGridCenterHorizontal,
    showGridCenterVertical,
  } = opts;

  // 1. 外周枠線 & 芯を通る水平線のみ
  if (
    showGridOuterBorder &&
    showGridCenterHorizontal &&
    !showGridInnerHorizontal &&
    !showGridInnerVertical &&
    !showGridCenterVertical
  ) {
    return true;
  }

  // 2. 外周枠線 & 芯を通る垂直線のみ
  if (
    showGridOuterBorder &&
    showGridCenterVertical &&
    !showGridInnerHorizontal &&
    !showGridInnerVertical &&
    !showGridCenterHorizontal
  ) {
    return true;
  }

  // 3. 外周枠線のみ
  if (
    showGridOuterBorder &&
    !showGridInnerHorizontal &&
    !showGridInnerVertical &&
    !showGridCenterHorizontal &&
    !showGridCenterVertical
  ) {
    return true;
  }

  // 4. 内側垂直線のみ
  if (
    showGridInnerVertical &&
    !showGridOuterBorder &&
    !showGridInnerHorizontal &&
    !showGridCenterHorizontal &&
    !showGridCenterVertical
  ) {
    return true;
  }

  return false;
}

/**
 * Computes randomized parameters based on selected target flags.
 */
export function buildRandomizedParameters(
  prevParams: SketchParameters,
  targets: RandomTargets,
  p5Instance?: p5,
): { nextParams: SketchParameters; pathGridChanged: boolean } {
  const next: SketchParameters = { ...prevParams };
  const p = p5Instance || ({} as p5);
  let pathGridChanged = false;

  if (targets.gridSize) {
    next.gridRows = Math.floor(
      p.random ? p.random(4, 17) : 4 + Math.random() * 13,
    );
    next.gridColumns = Math.floor(
      p.random ? p.random(4, 17) : 4 + Math.random() * 13,
    );
    pathGridChanged = true;
  }

  if (targets.canvasPadding) {
    next.gridPadding = Math.floor(
      p.random ? p.random(10, 81) : 10 + Math.random() * 71,
    );
  }

  if (targets.canvasAspectRatio) {
    const ratios = [1.0, 4 / 3, 3 / 4, 16 / 9, 9 / 16];
    next.canvasAspectRatio =
      ratios[Math.floor(Math.random() * ratios.length)];
  }

  if (targets.palette) {
    const randomPaletteIdx = Math.floor(
      p.random
        ? p.random(0, PALETTES.length)
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
      next.gridLineColor =
        shuffled.length >= 4 ? shuffled[3] : shuffled[1 % shuffled.length];
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
      (p.random ? p.random(0.4, 0.8) : 0.4 + Math.random() * 0.4).toFixed(2),
    );
    next.tubeInnerRatio = Number.parseFloat(
      (p.random ? p.random(0.7, 0.92) : 0.7 + Math.random() * 0.22).toFixed(2),
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
      "cubeHorizontal",
      "cubeVertical",
    ];
    next.transitionType = modes[Math.floor(Math.random() * modes.length)];
  }

  if (targets.grain) {
    next.showGrain = Math.random() > 0.3;
    next.grainIntensity = Number.parseFloat(
      (0.08 + Math.random() * 0.25).toFixed(2),
    );
  }

  if (targets.isolatedCellMode) {
    const cellModes: IsolatedCellMode[] = ["none", "renderCell", "disallow"];
    next.isolatedCellMode =
      cellModes[Math.floor(Math.random() * cellModes.length)];
  }

  if (targets.gridLineWidth) {
    next.gridLineWidth = Math.floor(
      p.random ? p.random(1, 6) : 1 + Math.random() * 5,
    );
  }

  if (targets.gridBorderOptions) {
    let borderOpts;
    let attempts = 0;
    do {
      borderOpts = {
        showGridOuterBorder: Math.random() > 0.3,
        showGridInnerHorizontal: Math.random() > 0.4,
        showGridInnerVertical: Math.random() > 0.4,
        showGridCenterHorizontal: Math.random() > 0.7,
        showGridCenterVertical: Math.random() > 0.7,
      };
      attempts++;
    } while (isBlacklistedGridBorderCombination(borderOpts) && attempts < 50);

    next.showGridOuterBorder = borderOpts.showGridOuterBorder;
    next.showGridInnerHorizontal = borderOpts.showGridInnerHorizontal;
    next.showGridInnerVertical = borderOpts.showGridInnerVertical;
    next.showGridCenterHorizontal = borderOpts.showGridCenterHorizontal;
    next.showGridCenterVertical = borderOpts.showGridCenterVertical;
  }

  if (targets.randomSeed) {
    next.randomSeedValue = Math.floor(Math.random() * 1000000);
    pathGridChanged = true;
  }

  if (targets.riso) {
    next.showRiso = Math.random() > 0.4;
    next.risoOffsetPx = Math.floor(1 + Math.random() * 6);
  }

  if (targets.halftone) {
    next.showHalftone = Math.random() > 0.4;
    next.halftoneSize = Math.floor(3 + Math.random() * 10);
  }

  if (targets.dithering) {
    next.showDithering = Math.random() > 0.4;
    next.ditheringScale = Math.floor(1 + Math.random() * 3);
  }

  if (targets.inkBleed) {
    next.showInkBleed = Math.random() > 0.4;
    next.inkBleedAmount = Math.floor(2 + Math.random() * 8);
  }

  if (targets.paperTexture) {
    next.showPaperTexture = Math.random() > 0.4;
    next.paperRoughness = Number.parseFloat((0.15 + Math.random() * 0.45).toFixed(2));
  }

  if (targets.cmyk) {
    next.showCmyk = Math.random() > 0.4;
    next.cmykOffsetFactor = Number.parseFloat((0.1 + Math.random() * 0.6).toFixed(2));
  }

  return { nextParams: next, pathGridChanged };
}
