import { atom } from "jotai";
import { DEFAULT_SKETCH_PARAMETERS } from "../constants/palettes";
import type { PathChain, SketchParameters } from "../types/sketch";

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
