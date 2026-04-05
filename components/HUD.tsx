'use client';

import { useGameStore } from '@/lib/store';
import BettingPanel from './BettingPanel';
import ActionPanel from './ActionPanel';
import ResultPanel from './ResultPanel';
import CountDisplay from './CountDisplay';
import SettingsPanel from './SettingsPanel';
import BackgroundMusic from './BackgroundMusic';
import ShoeDisplay, { ShoeGuessPanel } from './ShoeDisplay';

export default function HUD() {
  const { bankroll } = useGameStore();

  return (
    <div className="hud">
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

      {/* Count + Shoe — top right on desktop, inline on mobile */}
      <div className="count-section">
        <ShoeDisplay />
        <CountDisplay />
      </div>

      {/* Action controls */}
      <div className="hud-bottom">
        <ShoeGuessPanel />
        <BettingPanel />
        <ActionPanel />
        <ResultPanel />
      </div>
    </div>
  );
}
