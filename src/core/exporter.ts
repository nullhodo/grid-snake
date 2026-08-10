import type p5 from "p5";
import type { PathChain, SketchParameters } from "../types/sketch";
import { getFormattedDate } from "../utils/date";
import { renderPathsGraphics } from "./renderer";

/**
 * Exports high-resolution image scaled properly without layout breaking, along with JSON
 */
export function exportHighResImage(
  p5Instance: p5,
  params: SketchParameters,
  pathGroupList: PathChain[],
  exportWidth = 2880,
  exportHeight = 2880,
): void {
  const timestampString = getFormattedDate();
  const filenameBase = `grid-snake_${timestampString}_${exportWidth}x${exportHeight}`;

  console.log(
    `[Export] Creating High-Res Offscreen Canvas: ${exportWidth}x${exportHeight}`,
  );

  const offscreenGraphics = p5Instance.createGraphics(
    exportWidth,
    exportHeight,
  );
  offscreenGraphics.background(params.backgroundColor);

  const currentCanvasWidth = p5Instance.width || 800;
  const scaleFactor = exportWidth / currentCanvasWidth;
  const scaledParams = JSON.parse(JSON.stringify(params)) as SketchParameters;

  scaledParams.coreLineWidth = params.coreLineWidth * scaleFactor;
  scaledParams.dotSize = params.dotSize * scaleFactor;
  scaledParams.gridLineWidth = params.gridLineWidth * scaleFactor;
  scaledParams.debugMode = false;

  renderPathsGraphics(
    offscreenGraphics,
    exportWidth,
    exportHeight,
    scaledParams,
    pathGroupList,
  );

  p5Instance.save(offscreenGraphics, `${filenameBase}.jpg`);
  offscreenGraphics.remove();

  downloadJsonParameters(scaledParams, `${filenameBase}.json`);
}

/**
 * Exports vector graphics as SVG file using p5.js SVG renderer capabilities
 */
export function exportSvgGraphics(
  p5Instance: p5,
  params: SketchParameters,
  pathGroupList: PathChain[],
  canvasWidth = 1200,
  canvasHeight = 1200,
): void {
  const timestampString = getFormattedDate();
  const filenameBase = `grid-snake_${timestampString}_vector`;

  console.log(
    `[Export SVG] Rendering SVG graphics: ${canvasWidth}x${canvasHeight}`,
  );

  const svgRendererMode =
    (p5Instance as unknown as { SVG?: p5.RENDERER }).SVG ||
    ("svg" as p5.RENDERER);
  const svgGraphics = p5Instance.createGraphics(
    canvasWidth,
    canvasHeight,
    svgRendererMode,
  );

  svgGraphics.background(params.backgroundColor);
  const scaledParams = JSON.parse(JSON.stringify(params)) as SketchParameters;
  scaledParams.debugMode = false;

  renderPathsGraphics(
    svgGraphics,
    canvasWidth,
    canvasHeight,
    scaledParams,
    pathGroupList,
  );

  p5Instance.save(svgGraphics, `${filenameBase}.svg`);
  svgGraphics.remove();
}

/**
 * Formats parameters into standard JSON and downloads it
 */
function downloadJsonParameters(
  params: SketchParameters,
  filename?: string,
): void {
  const timestampString = getFormattedDate();
  const targetFilename = filename || `grid-snake_${timestampString}.json`;
  const jsonContentString = JSON.stringify(params, null, 2);

  const blob = new Blob([jsonContentString], { type: "application/json" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = targetFilename;
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);

  console.log(`[Export] Saved parameters to JSON: ${targetFilename}`);
}

/**
 * Parses uploaded JSON file to restore sketch parameters
 */
export function parseJsonSettings(rawText: string): SketchParameters {
  return JSON.parse(rawText) as SketchParameters;
}
