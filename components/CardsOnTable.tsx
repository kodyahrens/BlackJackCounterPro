'use client';

import { useGameStore } from '@/lib/store';
import Card3D from './Card3D';
import { BetDisplay } from './ChipStack';
import type { Card } from '@/lib/deck';

const CARD_SPACING = 0.36;

// Slight random-ish rotation per card slot (seeded by index for consistency)
function slotRotZ(index: number): number {
  const seed = [0.04, -0.03, 0.02, -0.05, 0.03, -0.02, 0.04][index % 7];
  return seed;
}

function playerCardPosition(index: number, total: number): [number, number, number] {
  const startX = -((total - 1) * CARD_SPACING) / 2;
  return [startX + index * CARD_SPACING, 0.04, 3.2];
}

function dealerCardPosition(index: number, total: number): [number, number, number] {
  const startX = -((total - 1) * CARD_SPACING) / 2;
  return [startX + index * CARD_SPACING, 0.04, -1.3];
}

function splitHandPosition(handIndex: number, cardIndex: number, total: number): [number, number, number] {
  const handOffsets = [-2.6, 2.6];
  const x = (handOffsets[handIndex] ?? 0) + (cardIndex - (total - 1) / 2) * CARD_SPACING * 0.85;
  return [x, 0.04, 3.2];
}

export default function CardsOnTable() {
  const { playerCards, dealerCards, splitHands, placedChips } = useGameStore();
  const showSplits = splitHands.length > 0;

  return (
    <group>
      {/* Dealer cards */}
      {dealerCards.map((card: Card, i: number) => (
        <Card3D
          key={card.id}
          card={card}
          position={dealerCardPosition(i, dealerCards.length)}
          rotationZ={slotRotZ(i)}
          delay={i * 0.12}
          animated
        />
      ))}

      {/* Player cards (main hand) */}
      {!showSplits && playerCards.map((card: Card, i: number) => (
        <Card3D
          key={card.id}
          card={card}
          position={playerCardPosition(i, playerCards.length)}
          rotationZ={slotRotZ(i + 2)}
          delay={0.25 + i * 0.12}
          animated
        />
      ))}

      {/* Split hands */}
      {showSplits && splitHands.map((hand, hIdx) =>
        hand.cards.map((card: Card, cIdx: number) => (
          <Card3D
            key={card.id}
            card={card}
            position={splitHandPosition(hIdx, cIdx, hand.cards.length)}
            rotationZ={slotRotZ(cIdx + hIdx)}
            delay={cIdx * 0.1}
            animated
          />
        ))
      )}

      {/* Bet chips — stacked by denomination */}
      {placedChips.length > 0 && (
        <BetDisplay placedChips={placedChips} position={[0, 0.02, 1.5]} />
      )}
    </group>
  );
}
