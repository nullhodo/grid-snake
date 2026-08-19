import { atom } from "jotai";
import { DEFAULT_SKETCH_PARAMETERS } from "../constants/palettes";
import type {
  PathChain,
  RandomTargets,
  SketchParameters,
} from "../types/sketch";

const DEFAULT_RANDOM_TARGETS: RandomTargets = {
  gridSize: true,
  canvasPadding: false,
  canvasAspectRatio: false,
  palette: true,
  paletteShuffle: true,
  cornerRoundness: true,
  tipRoundness: true,
  tubeDimensions: true,
  coreLineWidth: true,
  dotSize: true,
  autoHideDots: false,
  gridLineWidth: true,
  gridBorderOptions: false,
  randomSeed: true,
  transitionType: false,
  grain: false,
  shadow3d: false,
  isolatedCellMode: false,
  riso: false,
  halftone: false,
  dithering: false,
  inkBleed: false,
  paperTexture: false,
  cmyk: false,
};

export const sketchParamsAtom = atom<SketchParameters>(
  DEFAULT_SKETCH_PARAMETERS,
);
export const pathChainsAtom = atom<PathChain[]>([]);

export const historyStackAtom = atom<SketchParameters[]>([
  JSON.parse(JSON.stringify(DEFAULT_SKETCH_PARAMETERS)),
]);
export const historyPointerAtom = atom<number>(0);

export const isPanelOpenAtom = atom<boolean>(true);

export interface RecordingState {
  isRecording: boolean;
  elapsedSeconds: number;
  isLoopMode?: boolean;
  currentLoop?: number;
  totalLoops?: number;
  loopIntervalMs?: number;
}

export const recordingStateAtom = atom<RecordingState>({
  isRecording: false,
  elapsedSeconds: 0,
  isLoopMode: false,
  currentLoop: 1,
  totalLoops: 1,
  loopIntervalMs: 2000,
});

export const randomTargetsAtom = atom<RandomTargets>(
  DEFAULT_RANDOM_TARGETS,
);
export const isRandomTargetsModalOpenAtom = atom<boolean>(false);

export const autoRandomIntervalMsAtom = atom<number>(2000);
export const isAutoRandomActiveAtom = atom<boolean>(false);

export const targetLoopsCountAtom = atom<number>(10);
export const isLoopRecordingActiveAtom = atom<boolean>(false);
