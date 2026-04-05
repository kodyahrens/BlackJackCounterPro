/**
 * Basic strategy for S17 (dealer stands on soft 17) + Hi-Lo deviations.
 * Dealer upcard index order: 2,3,4,5,6,7,8,9,10,A
 */

type Action = 'H' | 'S' | 'D' | 'P' | 'R' | 'DS';
// H=Hit  S=Stand  D=Double  P=Split  R=Surrender  DS=Double if allowed else Stand

export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

const DEALER_UPCARDS = ['2','3','4','5','6','7','8','9','10','A'];

// ── HARD TOTALS ──────────────────────────────────────────────────────────────
// Dealer:                        2    3    4    5    6    7    8    9   10    A
const HARD: Record<number, Action[]> = {
  8:  ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  9:  ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // Double vs 3-6
  10: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'], // Double vs 2-9
  11: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H'], // Double vs 2-10
  12: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'], // Stand vs 4-6
  13: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'], // Stand vs 2-6
  14: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  15: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'R', 'H'], // Surrender vs 10
  16: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'R', 'R', 'R'], // Surrender vs 9,10,A (NOT 8)
  17: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
};

// ── SOFT TOTALS ──────────────────────────────────────────────────────────────
// Value = Ace + other card (e.g. 13 = A+2, 18 = A+7)
// Dealer:                        2    3    4    5    6    7    8    9   10    A
const SOFT: Record<number, Action[]> = {
  13: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A+2: Double vs 5-6
  14: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A+3: Double vs 5-6
  15: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A+4: Double vs 4-6
  16: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A+5: Double vs 4-6
  17: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A+6: Double vs 3-6
  18: ['S', 'DS','DS','DS','DS','S', 'S', 'H', 'H', 'H'], // A+7: Stand vs 2,7,8 / Double vs 3-6 / Hit vs 9,10,A
  19: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], // A+8: Always stand
  20: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], // A+9: Always stand
};

// ── PAIRS ────────────────────────────────────────────────────────────────────
// Dealer:                         2    3    4    5    6    7    8    9   10    A
const PAIRS: Record<string, Action[]> = {
  'A':  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // Always split
  '2':  ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'], // Split vs 2-7
  '3':  ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'], // Split vs 2-7
  '4':  ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'], // Split vs 5-6
  '5':  ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'], // Never split — play as hard 10
  '6':  ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'], // Split vs 2-6
  '7':  ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'], // Split vs 2-7
  '8':  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // Always split
  '9':  ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'], // Split vs 2-6, 8-9
  '10': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], // Never split
};

// ── HI-LO DEVIATIONS (Illustrious 18 subset) ─────────────────────────────────
// Returns an override action when TC crosses a threshold, or null for base strategy.
function getDeviation(
  hardTotal: number,
  isSoft: boolean,
  isPair: boolean,
  pairRank: string,
  dealerUpcard: string,
  tc: number
): Action | null {
  // 16 vs 10: Stand if TC ≥ 0
  if (!isSoft && !isPair && hardTotal === 16 && dealerUpcard === '10') {
    return tc >= 0 ? 'S' : null;
  }
  // 15 vs 10: Stand if TC ≥ +4
  if (!isSoft && !isPair && hardTotal === 15 && dealerUpcard === '10') {
    return tc >= 4 ? 'S' : null;
  }
  // 10 vs 10 (pair): Double if TC ≥ +4
  if (isPair && pairRank === '10' && dealerUpcard === '10') {
    return tc >= 4 ? 'D' : null;
  }
  // 12 vs 3: Stand if TC ≥ +2
  if (!isSoft && !isPair && hardTotal === 12 && dealerUpcard === '3') {
    return tc >= 2 ? 'S' : null;
  }
  // 12 vs 2: Stand if TC ≥ +3
  if (!isSoft && !isPair && hardTotal === 12 && dealerUpcard === '2') {
    return tc >= 3 ? 'S' : null;
  }
  return null;
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────
export function getBasicStrategyAction(
  playerCards: { rank: string; faceUp: boolean }[],
  dealerUpcard: string,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean,
  tc: number = 0
): PlayerAction {
  const faceUp = playerCards.filter((c) => c.faceUp);
  if (faceUp.length < 2) return 'hit';

  const normalizedUpcard =
    ['J','Q','K'].includes(dealerUpcard) ? '10' : dealerUpcard;
  const dIdx = DEALER_UPCARDS.indexOf(normalizedUpcard);
  if (dIdx === -1) return 'hit';

  const ranks  = faceUp.map((c) => c.rank);
  const isPair = faceUp.length === 2 && ranks[0] === ranks[1];

  // ── Calculate total ──────────────────────────────────────────────────
  let total = 0;
  let aces  = 0;
  for (const r of ranks) {
    if (r === 'A') { total += 11; aces++; }
    else if (['J','Q','K'].includes(r)) total += 10;
    else total += parseInt(r, 10);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  const isSoft = aces > 0 && total <= 21;

  // Pair rank normalised
  const pairRank = isPair
    ? (['J','Q','K'].includes(ranks[0]) ? '10' : ranks[0])
    : '';

  function resolve(action: Action): PlayerAction {
    if (action === 'P') return canSplit  ? 'split'    : 'hit';
    if (action === 'D') return canDouble ? 'double'   : 'hit';
    if (action === 'DS') return canDouble ? 'double'  : 'stand';
    if (action === 'R') return canSurrender ? 'surrender' : (total >= 17 ? 'stand' : 'hit');
    if (action === 'S') return 'stand';
    return 'hit';
  }

  // ── Pairs ──────────────────────────────────────────────────────────────
  if (isPair && canSplit) {
    const dev = getDeviation(total, isSoft, true, pairRank, normalizedUpcard, tc);
    if (dev) return resolve(dev);
    const strategy = PAIRS[pairRank];
    if (strategy) {
      const a = strategy[dIdx];
      if (a !== 'P') return resolve(a);  // e.g. 5s → play as hard 10
      return 'split';
    }
  }

  // ── Soft hands ────────────────────────────────────────────────────────
  if (isSoft && faceUp.length === 2) {
    const strategy = SOFT[total];
    if (strategy) {
      const dev = getDeviation(total, true, false, '', normalizedUpcard, tc);
      const a = dev ?? strategy[dIdx];
      return resolve(a);
    }
  }

  // ── Hard hands ────────────────────────────────────────────────────────
  if (total <= 8)  return 'hit';
  if (total >= 17) return 'stand';

  const dev = getDeviation(total, false, false, '', normalizedUpcard, tc);
  if (dev) return resolve(dev);

  const strategy = HARD[total];
  if (!strategy) return total >= 17 ? 'stand' : 'hit';
  return resolve(strategy[dIdx]);
}

// ── Insurance recommendation ──────────────────────────────────────────────────
export function shouldTakeInsurance(tc: number): boolean {
  return tc >= 3;
}

export function actionLabel(action: PlayerAction): string {
  const map: Record<PlayerAction, string> = {
    hit:       'Hit',
    stand:     'Stand',
    double:    'Double Down',
    split:     'Split',
    surrender: 'Surrender',
  };
  return map[action];
}
