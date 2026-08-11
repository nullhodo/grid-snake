import type p5 from "p5";
import type { GridCell, PathChain, SketchParameters } from "../types/sketch";
import { areCellsAdjacent, mergeIsolatedSingleCells } from "./pathMerger";

/**
 * Generates connected non-branching path chains using randomized growing walks.
 * Guarantees intricate serpentine curves, full grid coverage, and group lengths >= 2.
 * Strictly enforces orthogonal 90-degree grid adjacency (no diagonal shortcuts).
 */
function buildConnectedPaths(
  params: SketchParameters,
  seedValue: number,
  p5Instance?: p5,
): PathChain[] {
  const rowsCount = params.gridRows;
  const columnsCount = params.gridColumns;

  if (p5Instance && typeof p5Instance.randomSeed === "function") {
    p5Instance.randomSeed(seedValue);
  }

  const visitedGrid: boolean[][] = Array.from({ length: rowsCount }, () =>
    Array(columnsCount).fill(false),
  );
  let unvisitedCellsCount = rowsCount * columnsCount;
  const activeChainsList: PathChain[] = [];

  const getRandomValue = (min: number, max?: number): number => {
    if (p5Instance && typeof p5Instance.random === "function") {
      return p5Instance.random(min, max);
    }
    if (max === undefined) {
      return Math.random() * min;
    }
    return Math.random() * (max - min) + min;
  };

  while (unvisitedCellsCount > 0) {
    const availableStartCells: GridCell[] = [];
    for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columnsCount; columnIndex++) {
        if (!visitedGrid[rowIndex][columnIndex]) {
          availableStartCells.push({ columnIndex, rowIndex });
        }
      }
    }

    if (availableStartCells.length === 0) break;

    const startCell =
      availableStartCells[
        Math.floor(getRandomValue(availableStartCells.length))
      ];
    visitedGrid[startCell.rowIndex][startCell.columnIndex] = true;
    unvisitedCellsCount--;

    const currentChain: PathChain = [startCell];
    const maxChainLength = Math.floor(
      getRandomValue(
        3,
        Math.max(5, Math.floor(rowsCount * columnsCount * 0.25)),
      ),
    );

    let currentCell = startCell;
    while (currentChain.length < maxChainLength) {
      const neighbors = getUnvisitedNeighbors(
        currentCell,
        visitedGrid,
        rowsCount,
        columnsCount,
      );
      if (neighbors.length === 0) break;

      const nextCell = neighbors[Math.floor(getRandomValue(neighbors.length))];
      visitedGrid[nextCell.rowIndex][nextCell.columnIndex] = true;
      unvisitedCellsCount--;

      currentChain.push(nextCell);
      currentCell = nextCell;
    }

    activeChainsList.push(currentChain);
  }

  let solvedSingleCells = false;
  let safeguardCounter = 0;

  while (!solvedSingleCells && safeguardCounter < 200) {
    safeguardCounter++;
    const singleChainIndex = activeChainsList.findIndex(
      (chain) => chain.length === 1,
    );

    if (singleChainIndex === -1) {
      solvedSingleCells = true;
      break;
    }

    const singleCell = activeChainsList[singleChainIndex][0];
    let mergedSuccessfully = false;

    // Pass 1: Try attaching singleCell to head or tail of an existing chain
    for (
      let targetIndex = 0;
      targetIndex < activeChainsList.length;
      targetIndex++
    ) {
      if (targetIndex === singleChainIndex) continue;

      const targetChain = activeChainsList[targetIndex];
      const headCell = targetChain[0];
      const tailCell = targetChain[targetChain.length - 1];

      if (areCellsAdjacent(singleCell, headCell)) {
        targetChain.unshift(singleCell);
        activeChainsList.splice(singleChainIndex, 1);
        mergedSuccessfully = true;
        break;
      }
      if (areCellsAdjacent(singleCell, tailCell)) {
        targetChain.push(singleCell);
        activeChainsList.splice(singleChainIndex, 1);
        mergedSuccessfully = true;
        break;
      }
    }

    // Pass 2: Insert singleCell between nodeA and nodeB ONLY if orthogonal to BOTH
    if (!mergedSuccessfully) {
      for (
        let targetIndex = 0;
        targetIndex < activeChainsList.length;
        targetIndex++
      ) {
        if (targetIndex === singleChainIndex) continue;

        const targetChain = activeChainsList[targetIndex];
        if (targetChain.length < 2) continue;

        for (
          let nodeIndex = 0;
          nodeIndex < targetChain.length - 1;
          nodeIndex++
        ) {
          const nodeA = targetChain[nodeIndex];
          const nodeB = targetChain[nodeIndex + 1];

          if (
            areCellsAdjacent(singleCell, nodeA) &&
            areCellsAdjacent(singleCell, nodeB)
          ) {
            targetChain.splice(nodeIndex + 1, 0, singleCell);
            activeChainsList.splice(singleChainIndex, 1);
            mergedSuccessfully = true;
            break;
          }
        }
        if (mergedSuccessfully) break;
      }
    }

    if (!mergedSuccessfully) {
      break;
    }
  }

  const mergePasses = Math.floor(activeChainsList.length * 1.5);
  for (let passIndex = 0; passIndex < mergePasses; passIndex++) {
    if (activeChainsList.length <= 1) break;

    const indexA = Math.floor(getRandomValue(activeChainsList.length));
    const indexB = Math.floor(getRandomValue(activeChainsList.length));
    if (indexA === indexB) continue;

    const chainA = activeChainsList[indexA];
    const chainB = activeChainsList[indexB];

    const headA = chainA[0];
    const tailA = chainA[chainA.length - 1];
    const headB = chainB[0];
    const tailB = chainB[chainB.length - 1];

    let mergedChainResult: PathChain | null = null;
    if (areCellsAdjacent(tailA, headB)) {
      mergedChainResult = chainA.concat(chainB);
    } else if (areCellsAdjacent(tailA, tailB)) {
      mergedChainResult = chainA.concat(chainB.slice().reverse());
    } else if (areCellsAdjacent(headA, headB)) {
      mergedChainResult = chainA.slice().reverse().concat(chainB);
    } else if (areCellsAdjacent(headA, tailB)) {
      mergedChainResult = chainB.concat(chainA);
    }

    if (mergedChainResult !== null) {
      const higherIndex = Math.max(indexA, indexB);
      const lowerIndex = Math.min(indexA, indexB);
      activeChainsList.splice(higherIndex, 1);
      activeChainsList.splice(lowerIndex, 1);
      activeChainsList.push(mergedChainResult);
    }
  }

  return activeChainsList;
}

/**
 * Public generator function that generates path chains and enforces isolatedCellMode constraints.
 * If isolatedCellMode is 'disallow', retries with incremented seeds and applies post-process merge
 * until zero isolated 1x1 cells exist.
 */
export function generateConnectedCellPaths(
  params: SketchParameters,
  p5Instance?: p5,
): PathChain[] {
  let seedOffset = 0;
  const exp = params.disallowSearchLimitExponent ?? 3;
  const maxAttempts =
    params.isolatedCellMode === "disallow"
      ? Math.round(Math.pow(10, exp))
      : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentSeed = (params.randomSeedValue || 123456) + seedOffset * 10007;
    let chains = buildConnectedPaths(params, currentSeed, p5Instance);
    let isolatedCount = chains.filter((chain) => chain.length < 2).length;

    if (params.isolatedCellMode === "disallow" && isolatedCount > 0) {
      chains = mergeIsolatedSingleCells(chains);
      isolatedCount = chains.filter((chain) => chain.length < 2).length;
    }

    if (params.isolatedCellMode === "disallow") {
      console.log(
        `[PathGenerator] Attempt ${attempt + 1}/${maxAttempts} (seed=${currentSeed}): Isolated 1x1 cells = ${isolatedCount}`,
      );
    }

    if (
      params.isolatedCellMode !== "disallow" ||
      isolatedCount === 0 ||
      attempt === maxAttempts - 1
    ) {
      if (params.isolatedCellMode === "disallow" && isolatedCount > 0) {
        console.warn(
          `[PathGenerator] Enforcing final post-process merge to guarantee 0 isolated cells!`,
        );
        chains = mergeIsolatedSingleCells(chains);
      }
      return chains;
    }

    seedOffset++;
  }

  return [];
}

function getUnvisitedNeighbors(
  currentCell: GridCell,
  visitedGrid: boolean[][],
  rowsCount: number,
  columnsCount: number,
): GridCell[] {
  const neighborCellsList: GridCell[] = [];
  const directionOffsets = [
    { columnIndex: 0, rowIndex: -1 },
    { columnIndex: 0, rowIndex: 1 },
    { columnIndex: -1, rowIndex: 0 },
    { columnIndex: 1, rowIndex: 0 },
  ];

  for (
    let directionIndex = 0;
    directionIndex < directionOffsets.length;
    directionIndex++
  ) {
    const offset = directionOffsets[directionIndex];
    const targetColumnIndex = currentCell.columnIndex + offset.columnIndex;
    const targetRowIndex = currentCell.rowIndex + offset.rowIndex;

    if (
      targetColumnIndex >= 0 &&
      targetColumnIndex < columnsCount &&
      targetRowIndex >= 0 &&
      targetRowIndex < rowsCount &&
      !visitedGrid[targetRowIndex][targetColumnIndex]
    ) {
      neighborCellsList.push({
        columnIndex: targetColumnIndex,
        rowIndex: targetRowIndex,
      });
    }
  }

  return neighborCellsList;
}
