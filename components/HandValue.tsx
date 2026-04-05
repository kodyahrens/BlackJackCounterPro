'use client';

import { handValue, isBust, isBlackjack } from '@/lib/deck';
import type { Card } from '@/lib/deck';

interface HandValueProps {
  cards: Card[];
  label: string;
  showAll?: boolean;
}

export default function HandValue({ cards, label, showAll = true }: HandValueProps) {
  const visibleCards = showAll ? cards : cards.filter((c) => c.faceUp);
  if (visibleCards.length === 0) return null;

  const { value, soft } = handValue(visibleCards);
  const bust = isBust(visibleCards) && showAll;
  const bj = isBlackjack(visibleCards) && showAll && cards.every((c) => c.faceUp);

  return (
    <div className="hand-value-badge">
      <span className="hand-value-label">{label}</span>
      <span className={`hand-value-number ${bust ? 'bust' : ''} ${bj ? 'blackjack' : ''}`}>
        {bj ? 'BJ!' : bust ? 'BUST' : `${soft && value <= 21 ? 'Soft ' : ''}${value}`}
      </span>
    </div>
  );
}
