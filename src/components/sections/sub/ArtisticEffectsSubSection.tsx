import { SparklesIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { SketchParamValue, SketchParameters } from "../../../types/sketch";
import { DitheringSubSection } from "./DitheringSubSection";
import { GrainSubSection } from "./GrainSubSection";
import { HalftoneSubSection } from "./HalftoneSubSection";
import { InkBleedSubSection } from "./InkBleedSubSection";
import { PaperTextureSubSection } from "./PaperTextureSubSection";
import { RisoSubSection } from "./RisoSubSection";

interface Props {
  params: SketchParameters;
  onParamChange: (key: keyof SketchParameters, val: SketchParamValue) => void;
}

/**
 * Grouped SubSection for all 6 static artistic texture effects:
 * Film Grain, Risograph, Halftone, Dithering, Ink Bleed, and Paper Texture.
 */
export const ArtisticEffectsSubSection: React.FC<Props> = ({
  params,
  onParamChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const activeEffectsCount = [
    params.showGrain,
    params.showRiso,
    params.showHalftone,
    params.showDithering,
    params.showInkBleed,
    params.showPaperTexture,
  ].filter(Boolean).length;

  return (
    <div className="pt-2 border-t border-gray-700/40 space-y-2">
      <div
        className="flex items-center justify-between cursor-pointer select-none py-1 group"
        onClick={() => setIsOpen(!isOpen)}
        title="フィルムグレインやリソグラフ、和紙の質感などの静止テクスチャエフェクトを設定します"
      >
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          <span className="text-gray-200 text-xs font-semibold group-hover:text-white transition-colors">
            アーティスティック・エフェクト
          </span>
          {activeEffectsCount > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-medium border border-emerald-500/40">
              {activeEffectsCount} ON
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="space-y-3.5 p-2.5 bg-gray-900/40 rounded-lg border border-gray-800/80">
          <GrainSubSection
            params={params}
            onParamChange={onParamChange}
            hideBorderTop={true}
          />
          <RisoSubSection params={params} onParamChange={onParamChange} />
          <HalftoneSubSection params={params} onParamChange={onParamChange} />
          <DitheringSubSection params={params} onParamChange={onParamChange} />
          <InkBleedSubSection params={params} onParamChange={onParamChange} />
          <PaperTextureSubSection params={params} onParamChange={onParamChange} />
        </div>
      )}
    </div>
  );
};
