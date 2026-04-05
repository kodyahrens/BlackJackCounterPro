export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  id: string;
}

export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export function cardValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

export function handValue(cards: Card[]): { value: number; soft: boolean } {
  let value = 0;
  let aces = 0;
  for (const card of cards) {
    if (!card.faceUp) continue;
    value += cardValue(card.rank);
    if (card.rank === 'A') aces++;
  }
  let soft = false;
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  if (aces > 0 && value <= 21) soft = true;
  return { value, soft };
}

export function isBust(cards: Card[]): boolean {
  return handValue(cards).value > 21;
}

export function isBlackjack(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const values = cards.map((c) => cardValue(c.rank));
  return (values[0] === 11 && values[1] === 10) || (values[0] === 10 && values[1] === 11);
}

export function buildShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        shoe.push({
          suit,
          rank,
          faceUp: false,
          id: `${d}-${suit}-${rank}-${Math.random().toString(36).slice(2)}`,
        });
      }
    }
  }
  return shuffleDeck(shoe);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function decksRemaining(shoe: Card[], totalDecks: number): number {
  return shoe.length / 52;
}
