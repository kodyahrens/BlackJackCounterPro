'use client';

import { useGameStore } from '@/lib/store';
import HandValue from './HandValue';

export default function HandValueOverlay() {
  const { playerCards, dealerCards, splitHands, phase } = useGameStore();
  const showDealerAll = phase === 'result' || phase === 'dealer';

  return (
    <div className="hand-values">
      {dealerCards.length > 0 && (
        <div className="dealer-value-pos">
          <HandValue cards={dealerCards} label="Dealer" showAll={showDealerAll} />
        </div>
      )}
      {playerCards.length > 0 && splitHands.length === 0 && (
        <div className="player-value-pos">
          <HandValue cards={playerCards} label="You" showAll />
        </div>
      )}
      {splitHands.map((hand, i) => (
        <div key={i} className={`split-value-pos split-value-${i}`}>
          <HandValue cards={hand.cards} label={`Hand ${i + 1}`} showAll />
        </div>
      ))}
    </div>
  );
}
