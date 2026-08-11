import type { GridCell, PathChain } from "../types/sketch";

/**
 * Checks whether two grid cells are orthogonally adjacent (90-degree neighbors).
 */
export function areCellsAdjacent(cellA: GridCell, cellB: GridCell): boolean {
  const distanceColumn = Math.abs(cellA.columnIndex - cellB.columnIndex);
  const distanceRow = Math.abs(cellA.rowIndex - cellB.rowIndex);
  return (
    (distanceColumn === 1 && distanceRow === 0) ||
    (distanceColumn === 0 && distanceRow === 1)
  );
}

/**
 * Post-processor that strictly merges isolated 1x1 single cells (chain.length === 1)
 * into neighboring path chain HEADS or TAILS with orthogonal 90-degree adjacency.
 * Never inserts into interior nodes (to strictly prevent diagonal shortcut connections).
 */
export function mergeIsolatedSingleCells(chains: PathChain[]): PathChain[] {
  const resultChains = chains.map((c) => [...c]);

  // Repeated passes to merge isolated single cells into orthogonal head/tail ends of chains
  let mergedAny = true;
  while (mergedAny) {
    mergedAny = false;

    for (let i = 0; i < resultChains.length; i++) {
      if (resultChains[i].length !== 1) continue;

      const singleNode = resultChains[i][0];

      for (let j = 0; j < resultChains.length; j++) {
        if (i === j || resultChains[j].length < 1) continue;

        const targetChain = resultChains[j];
        const headCell = targetChain[0];
        const tailCell = targetChain[targetChain.length - 1];

        if (areCellsAdjacent(singleNode, headCell)) {
          targetChain.unshift(singleNode);
          resultChains[i] = [];
          mergedAny = true;
          break;
        }
        if (areCellsAdjacent(singleNode, tailCell)) {
          targetChain.push(singleNode);
          resultChains[i] = [];
          mergedAny = true;
          break;
        }
      }
    }
  }

  return resultChains.filter((c) => c.length > 0);
}
