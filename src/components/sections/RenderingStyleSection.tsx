import { useAtom } from "jotai";
import { PaintbrushIcon } from "lucide-react";
import type React from "react";
import { sketchParamsAtom } from "../../state/sketchStore";
import type { SketchParamValue, SketchParameters } from "../../types/sketch";
import { GrainSubSection } from "./sub/GrainSubSection";
import { IsolatedCellSubSection } from "./sub/IsolatedCellSubSection";
import { RisoSubSection } from "./sub/RisoSubSection";
import { RoundnessSubSection } from "./sub/RoundnessSubSection";
import { TransitionSubSection } from "./sub/TransitionSubSection";
import { TubeDimensionsSubSection } from "./sub/TubeDimensionsSubSection";

interface Props {
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
}

/**
 * Main Rendering Style Section component.
 * Assembles sub-section components for tube dimensions, roundness, transitions, grain, isolated cells, and riso.
 */
export const RenderingStyleSection: React.FC<Props> = ({ onParamChange }) => {
  const [params] = useAtom(sketchParamsAtom);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-gray-700/60 pb-2">
        <PaintbrushIcon className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-gray-100">描画スタイル設定</h3>
      </div>

      <RoundnessSubSection params={params} onParamChange={onParamChange} />
      <TubeDimensionsSubSection params={params} onParamChange={onParamChange} />
      <TransitionSubSection params={params} onParamChange={onParamChange} />
      <GrainSubSection params={params} onParamChange={onParamChange} />
      <RisoSubSection params={params} onParamChange={onParamChange} />
      <IsolatedCellSubSection params={params} onParamChange={onParamChange} />
    </div>
  );
};
