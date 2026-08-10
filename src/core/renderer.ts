import type p5 from "p5";
import type { PathChain, SketchParameters } from "../types/sketch";

export function renderPathsGraphics(
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

  targetGraphics.push();

  // Layer 0: Optional Grid Lines Rendering
  if (params.showGridLines) {
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

    if (params.showGridOuterBorder) {
      targetGraphics.rect(
        paddingHorizontal,
        paddingVertical,
        usableWidth,
        usableHeight,
      );
    }
  }

  const outerTubeStrokeWeight =
    Math.min(cellWidth, cellHeight) * params.tubeWidthRatio;
  const innerTubeStrokeWeight = outerTubeStrokeWeight * params.tubeInnerRatio;

  const roundJoin =
    (targetGraphics as unknown as { ROUND?: p5.STROKE_JOIN }).ROUND ||
    ("round" as p5.STROKE_JOIN);
  const buttCap =
    (targetGraphics as unknown as { SQUARE?: p5.STROKE_CAP }).SQUARE ||
    ("butt" as p5.STROKE_CAP);

  targetGraphics.strokeJoin(roundJoin);
  targetGraphics.strokeCap(buttCap);

  // Layer 1: Outer Envelope / Tube Boundary
  targetGraphics.noFill();
  targetGraphics.stroke(params.outlineColor);
  targetGraphics.strokeWeight(outerTubeStrokeWeight);

  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    drawChainLinePath(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      params.cornerRoundnessPercent,
    );
    drawPathEndCaps(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      outerTubeStrokeWeight,
      params.outlineColor,
      params.tipRoundnessPercent,
    );
  }

  // Layer 2: Inner Cavity Cutout
  targetGraphics.stroke(params.backgroundColor);
  targetGraphics.strokeWeight(innerTubeStrokeWeight);

  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    drawChainLinePath(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      params.cornerRoundnessPercent,
    );
    drawPathEndCaps(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      innerTubeStrokeWeight,
      params.backgroundColor,
      params.tipRoundnessPercent,
    );
  }

  // Layer 3: Core Central Axis Line
  targetGraphics.stroke(params.coreColor);
  targetGraphics.strokeWeight(params.coreLineWidth);

  for (
    let pathGroupIndex = 0;
    pathGroupIndex < pathGroupList.length;
    pathGroupIndex++
  ) {
    const currentChain = pathGroupList[pathGroupIndex];
    drawChainLinePath(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      params.cornerRoundnessPercent,
    );
    drawPathEndCaps(
      targetGraphics,
      currentChain,
      paddingHorizontal,
      paddingVertical,
      cellWidth,
      cellHeight,
      params.coreLineWidth,
      params.coreColor,
      params.tipRoundnessPercent,
    );
  }

  // Layer 4: Cell Center White Dots
  targetGraphics.noStroke();
  targetGraphics.fill(params.dotColor);

  if (params.dotSize > 0) {
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
        const centerPixelY =
          paddingVertical + (node.rowIndex + 0.5) * cellHeight;
        targetGraphics.circle(centerPixelX, centerPixelY, params.dotSize);
      }
    }
  }

  targetGraphics.pop();
}

function drawChainLinePath(
  targetGraphics: p5 | p5.Graphics,
  chainNodes: PathChain,
  paddingX: number,
  paddingY: number,
  cellW: number,
  cellH: number,
  roundnessPercent: number,
): void {
  if (chainNodes.length === 0) return;

  const roundnessFactor = roundnessPercent / 100.0;
  const maxCornerRadius = Math.min(cellW, cellH) * 0.45 * roundnessFactor;

  if (chainNodes.length === 1 || maxCornerRadius <= 0.001) {
    targetGraphics.beginShape();
    for (let nodeIndex = 0; nodeIndex < chainNodes.length; nodeIndex++) {
      const node = chainNodes[nodeIndex];
      const centerPixelX = paddingX + (node.columnIndex + 0.5) * cellW;
      const centerPixelY = paddingY + (node.rowIndex + 0.5) * cellH;
      targetGraphics.vertex(centerPixelX, centerPixelY);
    }
    targetGraphics.endShape();
    return;
  }

  targetGraphics.beginShape();

  const firstNode = chainNodes[0];
  const startX = paddingX + (firstNode.columnIndex + 0.5) * cellW;
  const startY = paddingY + (firstNode.rowIndex + 0.5) * cellH;
  targetGraphics.vertex(startX, startY);

  for (let nodeIndex = 1; nodeIndex < chainNodes.length - 1; nodeIndex++) {
    const previousNode = chainNodes[nodeIndex - 1];
    const currentNode = chainNodes[nodeIndex];
    const nextNode = chainNodes[nodeIndex + 1];

    const previousX = paddingX + (previousNode.columnIndex + 0.5) * cellW;
    const previousY = paddingY + (previousNode.rowIndex + 0.5) * cellH;
    const currentX = paddingX + (currentNode.columnIndex + 0.5) * cellW;
    const currentY = paddingY + (currentNode.rowIndex + 0.5) * cellH;
    const nextX = paddingX + (nextNode.columnIndex + 0.5) * cellW;
    const nextY = paddingY + (nextNode.rowIndex + 0.5) * cellH;

    const vectorInX = currentX - previousX;
    const vectorInY = currentY - previousY;
    const distanceIn = Math.sqrt(vectorInX * vectorInX + vectorInY * vectorInY);

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

    if (cornerRadius <= 0.001) {
      targetGraphics.vertex(currentX, currentY);
    } else {
      const cutInX = currentX - (vectorInX / distanceIn) * cornerRadius;
      const cutInY = currentY - (vectorInY / distanceIn) * cornerRadius;
      const cutOutX = currentX + (vectorOutX / distanceOut) * cornerRadius;
      const cutOutY = currentY + (vectorOutY / distanceOut) * cornerRadius;

      targetGraphics.vertex(cutInX, cutInY);
      targetGraphics.quadraticVertex(currentX, currentY, cutOutX, cutOutY);
    }
  }

  const lastNode = chainNodes[chainNodes.length - 1];
  const endX = paddingX + (lastNode.columnIndex + 0.5) * cellW;
  const endY = paddingY + (lastNode.rowIndex + 0.5) * cellH;
  targetGraphics.vertex(endX, endY);

  targetGraphics.endShape();
}

function drawPathEndCaps(
  targetGraphics: p5 | p5.Graphics,
  chainNodes: PathChain,
  paddingX: number,
  paddingY: number,
  cellW: number,
  cellH: number,
  currentStrokeWeight: number,
  currentColor: string,
  tipRoundnessPercent: number,
): void {
  if (chainNodes.length < 2) return;

  const tipRadius = (currentStrokeWeight / 2.0) * (tipRoundnessPercent / 100.0);

  targetGraphics.push();
  targetGraphics.fill(currentColor);
  targetGraphics.stroke(currentColor);
  targetGraphics.strokeWeight(0.5);

  const renderCapAtNode = (
    currentNode: PathChain[0],
    adjacentNode: PathChain[0],
  ) => {
    const currentX = paddingX + (currentNode.columnIndex + 0.5) * cellW;
    const currentY = paddingY + (currentNode.rowIndex + 0.5) * cellH;
    const adjacentX = paddingX + (adjacentNode.columnIndex + 0.5) * cellW;
    const adjacentY = paddingY + (adjacentNode.rowIndex + 0.5) * cellH;

    const vectorX = currentX - adjacentX;
    const vectorY = currentY - adjacentY;
    const angle = Math.atan2(vectorY, vectorX);

    targetGraphics.push();
    targetGraphics.translate(currentX, currentY);
    targetGraphics.rotate(angle);
    targetGraphics.rect(
      -0.5,
      -currentStrokeWeight / 2.0,
      currentStrokeWeight / 2.0 + 0.5,
      currentStrokeWeight,
      0,
      tipRadius,
      tipRadius,
      0,
    );
    targetGraphics.pop();
  };

  renderCapAtNode(chainNodes[0], chainNodes[1]);
  renderCapAtNode(
    chainNodes[chainNodes.length - 1],
    chainNodes[chainNodes.length - 2],
  );

  targetGraphics.pop();
}

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

        const handleInLength = cornerRadius * (1.0 - kappaConstant);
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
