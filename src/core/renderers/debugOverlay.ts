import type p5 from "p5";
import type { PathChain, SketchParameters } from "../../types/sketch";

const KAPPA = 0.5522847498;

/**
 * Renders debug overlay information on top of the canvas.
 * Shows: grid cell coordinates, corner arc sectors with [r1, r2] radius labels,
 * and tip cap sector fan shapes with rtip labels.
 */
export function renderDebugInformation(
  targetGraphics: p5 | p5.Graphics,
  canvasWidth: number,
  canvasHeight: number,
  params: SketchParameters,
  pathGroupList: PathChain[],
): void {
  const paddingHorizontal = canvasWidth * params.gridPadding;
  const paddingVertical = canvasHeight * params.gridPadding;

  const usableWidth = canvasWidth - paddingHorizontal * 2;
  const usableHeight = canvasHeight - paddingVertical * 2;

  const cellWidth = usableWidth / params.gridColumns;
  const cellHeight = usableHeight / params.gridRows;

  const minCellDimension = Math.min(cellWidth, cellHeight);
  const outerTubeStrokeWeight = minCellDimension * params.tubeWidthRatio;
  const halfTubeWidth = outerTubeStrokeWeight / 2.0;

  const maxCornerRadius =
    (params.cornerRoundnessPercent / 100.0) * minCellDimension * 0.45;

  targetGraphics.push();

  // Subtle non-whitening grid line overlay
  targetGraphics.stroke(255, 255, 255, 25);
  targetGraphics.strokeWeight(1);
  targetGraphics.noFill();

  for (let rowIndex = 0; rowIndex < params.gridRows; rowIndex++) {
    for (let columnIndex = 0; columnIndex < params.gridColumns; columnIndex++) {
      const leftPixelX = paddingHorizontal + columnIndex * cellWidth;
      const topPixelY = paddingVertical + rowIndex * cellHeight;
      targetGraphics.rect(leftPixelX, topPixelY, cellWidth, cellHeight);

      targetGraphics.noStroke();
      targetGraphics.fill(255, 255, 255, 140);
      targetGraphics.textSize(10);
      if ("LEFT" in targetGraphics && "TOP" in targetGraphics) {
        targetGraphics.textAlign(
          targetGraphics.LEFT as p5.HORIZ_ALIGN,
          targetGraphics.TOP as p5.VERT_ALIGN,
        );
      }
      targetGraphics.text(
        `${columnIndex},${rowIndex}`,
        leftPixelX + 4,
        topPixelY + 4,
      );
    }
  }

  // 1. Corner Arc Sectors, Extended Radius Lines to Outer Boundary, and [r1, r2] Labels
  if (maxCornerRadius > 0.0001) {
    for (
      let pathGroupIndex = 0;
      pathGroupIndex < pathGroupList.length;
      pathGroupIndex++
    ) {
      const currentChain = pathGroupList[pathGroupIndex];
      for (
        let nodeIndex = 1;
        nodeIndex < currentChain.length - 1;
        nodeIndex++
      ) {
        const previousNode = currentChain[nodeIndex - 1];
        const currentNode = currentChain[nodeIndex];
        const nextNode = currentChain[nodeIndex + 1];

        const previousX =
          paddingHorizontal + (previousNode.columnIndex + 0.5) * cellWidth;
        const previousY =
          paddingVertical + (previousNode.rowIndex + 0.5) * cellHeight;
        const currentX =
          paddingHorizontal + (currentNode.columnIndex + 0.5) * cellWidth;
        const currentY =
          paddingVertical + (currentNode.rowIndex + 0.5) * cellHeight;
        const nextX =
          paddingHorizontal + (nextNode.columnIndex + 0.5) * cellWidth;
        const nextY = paddingVertical + (nextNode.rowIndex + 0.5) * cellHeight;

        const vectorInX = currentX - previousX;
        const vectorInY = currentY - previousY;
        const distanceIn = Math.sqrt(
          vectorInX * vectorInX + vectorInY * vectorInY,
        );

        const vectorOutX = nextX - currentX;
        const vectorOutY = nextY - currentY;
        const distanceOut = Math.sqrt(
          vectorOutX * vectorOutX + vectorOutY * vectorOutY,
        );

        const cornerRadius = Math.min(
          maxCornerRadius,
          distanceIn * 0.45,
          distanceOut * 0.45,
        );

        const unitInX = vectorInX / distanceIn;
        const unitInY = vectorInY / distanceIn;
        const unitOutX = vectorOutX / distanceOut;
        const unitOutY = vectorOutY / distanceOut;

        const tangentInX = currentX - unitInX * cornerRadius;
        const tangentInY = currentY - unitInY * cornerRadius;
        const tangentOutX = currentX + unitOutX * cornerRadius;
        const tangentOutY = currentY + unitOutY * cornerRadius;

        const handleInLength = cornerRadius * (1.0 - KAPPA);
        const controlInX = currentX - unitInX * handleInLength;
        const controlInY = currentY - unitInY * handleInLength;
        const controlOutX = currentX + unitOutX * handleInLength;
        const controlOutY = currentY + unitOutY * handleInLength;

        const arcCenterX =
          currentX - unitInX * cornerRadius + unitOutX * cornerRadius;
        const arcCenterY =
          currentY - unitInY * cornerRadius + unitOutY * cornerRadius;

        const r1 = cornerRadius;
        const r2 = cornerRadius + halfTubeWidth;

        const extendedInX = arcCenterX - unitOutX * r2;
        const extendedInY = arcCenterY - unitOutY * r2;
        const extendedOutX = arcCenterX + unitInX * r2;
        const extendedOutY = arcCenterY + unitInY * r2;

        if (cornerRadius > 0.0001) {
          // 1a. Semi-transparent Sector Wedge (扇形)
          targetGraphics.noStroke();
          targetGraphics.fill(0, 255, 255, 50);
          targetGraphics.beginShape();
          targetGraphics.vertex(arcCenterX, arcCenterY);
          targetGraphics.vertex(tangentInX, tangentInY);
          targetGraphics.bezierVertex(
            controlInX,
            controlInY,
            controlOutX,
            controlOutY,
            tangentOutX,
            tangentOutY,
          );
          targetGraphics.endShape(
            "CLOSE" in targetGraphics
              ? (targetGraphics.CLOSE as p5.CLOSE)
              : undefined,
          );
        }

        // 1b. Radius Lines extended out to Outer Boundary Line
        targetGraphics.stroke(0, 255, 255, 230);
        targetGraphics.strokeWeight(1.5);
        targetGraphics.line(arcCenterX, arcCenterY, extendedInX, extendedInY);
        targetGraphics.line(arcCenterX, arcCenterY, extendedOutX, extendedOutY);

        // 1c. Center Dot (扇形の中心点)
        targetGraphics.noStroke();
        targetGraphics.fill(255, 0, 255, 255);
        targetGraphics.circle(arcCenterX, arcCenterY, 6);

        // 1d. Radius Text Label: [r1, r2]
        targetGraphics.fill(0, 255, 255, 250);
        targetGraphics.textSize(10);
        if ("LEFT" in targetGraphics) {
          targetGraphics.textAlign(targetGraphics.LEFT as p5.HORIZ_ALIGN);
        }
        targetGraphics.text(
          `[r1=${Math.round(r1)}, r2=${Math.round(r2)}]`,
          arcCenterX + 6,
          arcCenterY - 4,
        );
      }
    }
  }

  // 2. Tip Roundness Sector Fan Shapes, Center Visualization & rtip Label
  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    if (currentChain.length < 2) continue;

    const renderCapDebug = (
      currentNode: PathChain[0],
      adjacentNode: PathChain[0],
    ) => {
      const currentX =
        paddingHorizontal + (currentNode.columnIndex + 0.5) * cellWidth;
      const currentY =
        paddingVertical + (currentNode.rowIndex + 0.5) * cellHeight;
      const adjacentX =
        paddingHorizontal + (adjacentNode.columnIndex + 0.5) * cellWidth;
      const adjacentY =
        paddingVertical + (adjacentNode.rowIndex + 0.5) * cellHeight;

      const vectorX = currentX - adjacentX;
      const vectorY = currentY - adjacentY;
      const angle = Math.atan2(vectorY, vectorX);

      const R = halfTubeWidth;
      const p = params.tipRoundnessPercent / 100.0;
      const rTip = R * p;
      const flatH = R * (1.0 - p);

      targetGraphics.push();
      targetGraphics.translate(currentX, currentY);
      targetGraphics.rotate(angle);

      if (rTip > 0.001) {
        const k = rTip * KAPPA;

        // Top Tip Sector Fan Wedge
        const topCenterX = R - rTip;
        const topCenterY = -flatH;
        targetGraphics.noStroke();
        targetGraphics.fill(255, 255, 0, 60);
        targetGraphics.beginShape();
        targetGraphics.vertex(topCenterX, topCenterY);
        targetGraphics.vertex(R - rTip, -R);
        targetGraphics.bezierVertex(R - rTip + k, -R, R, -flatH - k, R, -flatH);
        targetGraphics.endShape(
          "CLOSE" in targetGraphics
            ? (targetGraphics.CLOSE as p5.CLOSE)
            : undefined,
        );

        // Bottom Tip Sector Fan Wedge
        const bottomCenterX = R - rTip;
        const bottomCenterY = flatH;
        targetGraphics.fill(255, 255, 0, 60);
        targetGraphics.beginShape();
        targetGraphics.vertex(bottomCenterX, bottomCenterY);
        targetGraphics.vertex(R, flatH);
        targetGraphics.bezierVertex(R, flatH + k, R - rTip + k, R, R - rTip, R);
        targetGraphics.endShape(
          "CLOSE" in targetGraphics
            ? (targetGraphics.CLOSE as p5.CLOSE)
            : undefined,
        );

        // Radius lines & Center dots for Tip Caps
        targetGraphics.stroke(255, 255, 0, 230);
        targetGraphics.strokeWeight(1.2);
        targetGraphics.line(topCenterX, topCenterY, R - rTip, -R);
        targetGraphics.line(topCenterX, topCenterY, R, -flatH);

        targetGraphics.line(bottomCenterX, bottomCenterY, R, flatH);
        targetGraphics.line(bottomCenterX, bottomCenterY, R - rTip, R);

        targetGraphics.noStroke();
        targetGraphics.fill(255, 128, 0, 255);
        targetGraphics.circle(topCenterX, topCenterY, 5);
        targetGraphics.circle(bottomCenterX, bottomCenterY, 5);

        // Numerical Tip Radius Label
        targetGraphics.fill(255, 255, 0, 250);
        targetGraphics.textSize(9);
        if ("LEFT" in targetGraphics) {
          targetGraphics.textAlign(targetGraphics.LEFT as p5.HORIZ_ALIGN);
        }
        targetGraphics.text(
          `rtip=${Math.round(rTip)}`,
          topCenterX + 6,
          topCenterY - 4,
        );
      }

      targetGraphics.pop();
    };

    renderCapDebug(currentChain[0], currentChain[1]);
    renderCapDebug(
      currentChain[currentChain.length - 1],
      currentChain[currentChain.length - 2],
    );
  }

  // Path Node Labels
  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    for (let nodeIndex = 0; nodeIndex < currentChain.length; nodeIndex++) {
      const node = currentChain[nodeIndex];
      const centerPixelX =
        paddingHorizontal + (node.columnIndex + 0.5) * cellWidth;
      const centerPixelY = paddingVertical + (node.rowIndex + 0.5) * cellHeight;

      targetGraphics.noStroke();
      targetGraphics.fill(255, 255, 0, 220);
      targetGraphics.textSize(11);
      if ("CENTER" in targetGraphics) {
        targetGraphics.textAlign(
          targetGraphics.CENTER as p5.HORIZ_ALIGN,
          targetGraphics.CENTER as p5.VERT_ALIGN,
        );
      }
      targetGraphics.text(
        `P${pathGroupIndex}:${nodeIndex}`,
        centerPixelX,
        centerPixelY - 12,
      );
    }
  }

  targetGraphics.pop();
}
