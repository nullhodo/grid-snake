import { useAtom } from "jotai";
import { PaintbrushIcon } from "lucide-react";
import type React from "react";
import { sketchParamsAtom } from "../../state/sketchStore";
import type {
  SketchParamValue,
  SketchParameters,
} from "../../types/sketch";
import { ArtisticEffectsSubSection } from "./sub/ArtisticEffectsSubSection";
import { IsolatedCellSubSection } from "./sub/IsolatedCellSubSection";
import { RoundnessSubSection } from "./sub/RoundnessSubSection";
import { TransitionSubSection } from "./sub/TransitionSubSection";
import { TubeDimensionsSubSection } from "./sub/TubeDimensionsSubSection";

interface Props {
  onParamChange: (
    key: keyof SketchParameters,
    val: SketchParamValue,
  ) => void;
}

/**
 * Main Rendering Style Section component.
 * Assembles sub-section components for tube dimensions, roundness, transitions, artistic effects, and isolated cells.
 */
export const RenderingStyleSection: React.FC<Props> = ({
  onParamChange,
}) => {
  const [params] = useAtom(sketchParamsAtom);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <PaintbrushIcon className="w-4 h-4 text-gray-700" />
        <h3 className="text-sm font-semibold text-gray-900">
          描画スタイル設定
        </h3>
      </div>

      <RoundnessSubSection params={params} onParamChange={onParamChange} />
      <TubeDimensionsSubSection
        params={params}
        onParamChange={onParamChange}
      />
      <TransitionSubSection
        params={params}
        onParamChange={onParamChange}
      />
      <ArtisticEffectsSubSection
        params={params}
        onParamChange={onParamChange}
      />
      <IsolatedCellSubSection
        params={params}
        onParamChange={onParamChange}
      />
    </div>
  );
};
