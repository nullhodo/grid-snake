import type p5 from "p5";
import type { SketchParameters } from "../../types/sketch";

/**
 * Draws all grid line overlays according to params.
 * Covers inner border lines, tube-centerline offset lines, and outer border.
 */
export function drawGridLines(
  targetGraphics: p5 | p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
): void {
  if (!params.showGridLines) return;

  const paddingHorizontal = canvasWidth * params.gridPadding;
  const paddingVertical = canvasHeight * params.gridPadding;

  const usableWidth = canvasWidth - paddingHorizontal * 2;
  const usableHeight = canvasHeight - paddingVertical * 2;

  const cellWidth = usableWidth / params.gridColumns;
  const cellHeight = usableHeight / params.gridRows;

  targetGraphics.stroke(params.gridLineColor);
  targetGraphics.strokeWeight(params.gridLineWidth);
  targetGraphics.noFill();

  if (params.showGridInnerHorizontal) {
    for (let rowIndex = 1; rowIndex < params.gridRows; rowIndex++) {
      const coordinateY = paddingVertical + rowIndex * cellHeight;
      targetGraphics.line(
        paddingHorizontal,
        coordinateY,
        paddingHorizontal + usableWidth,
        coordinateY,
      );
    }
  }

  if (params.showGridInnerVertical) {
    for (
      let columnIndex = 1;
      columnIndex < params.gridColumns;
      columnIndex++
    ) {
      const coordinateX = paddingHorizontal + columnIndex * cellWidth;
      targetGraphics.line(
        coordinateX,
        paddingVertical,
        coordinateX,
        paddingVertical + usableHeight,
      );
    }
  }

  if (params.showGridCenterHorizontal) {
    for (let rowIndex = 0; rowIndex < params.gridRows; rowIndex++) {
      const coordinateY = paddingVertical + (rowIndex + 0.5) * cellHeight;
      targetGraphics.line(
        paddingHorizontal,
        coordinateY,
        paddingHorizontal + usableWidth,
        coordinateY,
      );
    }
  }

  if (params.showGridCenterVertical) {
    for (
      let columnIndex = 0;
      columnIndex < params.gridColumns;
      columnIndex++
    ) {
      const coordinateX = paddingHorizontal + (columnIndex + 0.5) * cellWidth;
      targetGraphics.line(
        coordinateX,
        paddingVertical,
        coordinateX,
        paddingVertical + usableHeight,
      );
    }
  }

  if (params.showGridOuterBorder) {
    targetGraphics.rect(
      paddingHorizontal,
      paddingVertical,
      usableWidth,
      usableHeight,
    );
  }
}
