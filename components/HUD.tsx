'use client';

import { useState } from 'react';
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
  const [showShoe,  setShowShoe]  = useState(false);
  const [showCount, setShowCount] = useState(false);

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

      {/* ── Desktop: always-visible panels (top-right absolute) ── */}
      <div className="count-section desktop-only">
        <ShoeDisplay />
        <CountDisplay />
      </div>

      {/* ── Mobile: toggle buttons row ── */}
      <div className="mobile-toggles">
        <button
          className={`toggle-pill ${showShoe ? 'active' : ''}`}
          onClick={() => setShowShoe(v => !v)}
        >
          👟 Shoe {showShoe ? '▲' : '▼'}
        </button>
        <button
          className={`toggle-pill ${showCount ? 'active' : ''}`}
          onClick={() => setShowCount(v => !v)}
        >
          🃏 Hi-Lo {showCount ? '▲' : '▼'}
        </button>
      </div>

      {/* ── Mobile: expandable panels ── */}
      {showShoe && (
        <div className="mobile-expand">
          <ShoeDisplay />
          <ShoeGuessPanel />
        </div>
      )}
      {showCount && (
        <div className="mobile-expand">
          <CountDisplay />
        </div>
      )}

      {/* Action controls */}
      <div className="hud-bottom">
        {/* ShoeGuessPanel shown on desktop only (on mobile it's inside the expandable) */}
        <div className="desktop-only"><ShoeGuessPanel /></div>
        <BettingPanel />
        <ActionPanel />
        <ResultPanel />
      </div>
    </div>
  );
}
