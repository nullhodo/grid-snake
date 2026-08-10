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

export interface SketchParameters {
  gridRows: number;
  gridColumns: number;
  gridPadding: number;
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
  tubeWidthRatio: number;
  tubeInnerRatio: number;
  coreLineWidth: number;
  dotSize: number;
  autoHideDotsWhenRounded: boolean;
  debugMode: boolean;
  randomSeedValue: number;
}

export interface RandomTargets {
  gridSize: boolean;
  canvasPadding: boolean;
  palette: boolean;
  cornerRoundness: boolean;
  tipRoundness: boolean;
  tubeDimensions: boolean;
  coreLineWidth: boolean;
  dotSize: boolean;
  gridLineWidth: boolean;
  randomSeed: boolean;
}

export type SketchParamValue = number | boolean | string;

export type BorderOptionKey =
  | "showGridOuterBorder"
  | "showGridInnerHorizontal"
  | "showGridInnerVertical";
