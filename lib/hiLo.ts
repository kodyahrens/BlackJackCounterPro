import type { Rank } from './deck';

/** Hi-Lo count value for a given rank */
export function hiLoValue(rank: Rank): number {
  if (['2', '3', '4', '5', '6'].includes(rank)) return 1;
  if (['10', 'J', 'Q', 'K', 'A'].includes(rank)) return -1;
  return 0; // 7, 8, 9
}

export function trueCount(runningCount: number, decksRemaining: number): number {
  if (decksRemaining <= 0) return runningCount;
  return parseFloat((runningCount / decksRemaining).toFixed(1));
}
