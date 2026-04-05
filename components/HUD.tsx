'use client';

import { useGameStore } from '@/lib/store';
import BettingPanel from './BettingPanel';
import ActionPanel from './ActionPanel';
import ResultPanel from './ResultPanel';
import CountDisplay from './CountDisplay';
import SettingsPanel from './SettingsPanel';
import HandValue from './HandValue';
import BackgroundMusic from './BackgroundMusic';
import ShoeDisplay, { ShoeGuessPanel } from './ShoeDisplay';

export default function HUD() {
  const { playerCards, dealerCards, splitHands, phase, bankroll } = useGameStore();

  const showDealerAll = phase === 'result' || phase === 'dealer';

  return (
    <div className="hud">
      {/* Background music */}
      <BackgroundMusic />

      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-bankroll">
          <span className="bankroll-chip-icon">$</span>
          <span className="bankroll-value">{bankroll.toLocaleString()}</span>
        </div>
        <div className="hud-title">BlackJack Counter Pro</div>
        <SettingsPanel />
      </div>

      {/* Hand values overlay - positioned on the 3D scene */}
      <div className="hand-values">
        {dealerCards.length > 0 && (
          <div className="dealer-value-pos">
            <HandValue
              cards={dealerCards}
              label="Dealer"
              showAll={showDealerAll}
            />
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

      {/* Count display + shoe display - top right */}
      <div className="count-section">
        <ShoeDisplay />
        <CountDisplay />
      </div>

      {/* Bottom action area */}
      <div className="hud-bottom">
        <ShoeGuessPanel />
        <BettingPanel />
        <ActionPanel />
        <ResultPanel />
      </div>
    </div>
  );
}
