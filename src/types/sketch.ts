export interface GridCell {
  columnIndex: number;
  rowIndex: number;
}

export type PathChain = GridCell[];

export interface ColorItem {
  name: string;
  hex: string;
  rgb: [number, number, number];
}

export interface Palette {
  title: string;
  comment: string;
  colors: ColorItem[];
}

export type TransitionType =
  | "none"
  | "fade"
  | "slide"
  | "zoom"
  | "wipe"
  | "swipeHorizontal"
  | "swipeVertical"
  | "cubeHorizontal"
  | "cubeVertical";

export type IsolatedCellMode = "none" | "renderCell" | "disallow";

export interface SketchParameters {
  gridRows: number;
  gridColumns: number;
  gridPadding: number;
  canvasAspectRatio: number;
  paletteIndex: number;
  backgroundColor: string;
  outlineColor: string;
  coreColor: string;
  dotColor: string;
  cornerRoundnessPercent: number;
  tipRoundnessPercent: number;
  syncRoundness: boolean;
  showGridLines: boolean;
  gridLineColor: string;
  gridLineWidth: number;
  showGridOuterBorder: boolean;
  showGridInnerHorizontal: boolean;
  showGridInnerVertical: boolean;
  showGridCenterHorizontal: boolean;
  showGridCenterVertical: boolean;
  tubeWidthRatio: number;
  tubeInnerRatio: number;
  coreLineWidth: number;
  dotSize: number;
  autoHideDotsWhenRounded: boolean;
  debugMode: boolean;
  randomSeedValue: number;
  transitionType: TransitionType;
  transitionDurationMs: number;
  showGrain: boolean;
  grainIntensity: number;
  isolatedCellMode: IsolatedCellMode;
}

export interface RandomTargets {
  gridSize: boolean;
  canvasPadding: boolean;
  canvasAspectRatio: boolean;
  palette: boolean;
  paletteShuffle: boolean;
  cornerRoundness: boolean;
  tipRoundness: boolean;
  tubeDimensions: boolean;
  coreLineWidth: boolean;
  dotSize: boolean;
  autoHideDots: boolean;
  gridLineWidth: boolean;
  gridBorderOptions: boolean;
  randomSeed: boolean;
  transitionType: boolean;
  grain: boolean;
  isolatedCellMode: boolean;
}

export type SketchParamValue = number | boolean | string;

export type BorderOptionKey =
  | "showGridOuterBorder"
  | "showGridInnerHorizontal"
  | "showGridInnerVertical"
  | "showGridCenterHorizontal"
  | "showGridCenterVertical";
