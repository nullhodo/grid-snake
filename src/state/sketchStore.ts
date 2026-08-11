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

export const recordingStateAtom = atom<{
  isRecording: boolean;
  elapsedSeconds: number;
}>({
  isRecording: false,
  elapsedSeconds: 0,
});

export const randomTargetsAtom = atom<RandomTargets>(DEFAULT_RANDOM_TARGETS);
export const isRandomTargetsModalOpenAtom = atom<boolean>(false);

export const autoRandomIntervalMsAtom = atom<number>(2000);
export const isAutoRandomActiveAtom = atom<boolean>(false);

export const targetLoopsCountAtom = atom<number>(10);
export const isLoopRecordingActiveAtom = atom<boolean>(false);
