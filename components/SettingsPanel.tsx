'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';

const DECK_OPTIONS = [1, 2, 4, 6, 8];

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { settings, stats, bankroll, updateSettings, rebuildShoe } = useGameStore();

  return (
    <>
      <button className="settings-btn" onClick={() => setOpen((v) => !v)} title="Settings">
        ⚙️
      </button>

      {open && (
        <div className="settings-overlay" onClick={() => setOpen(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>Settings & Stats</h2>
              <button className="settings-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="settings-section">
              <h3>Shoe</h3>
              <div className="settings-row">
                <span>Number of Decks</span>
                <div className="deck-options">
                  {DECK_OPTIONS.map((n) => (
                    <button
                      key={n}
                      className={`deck-btn ${settings.numDecks === n ? 'active' : ''}`}
                      onClick={() => {
                        updateSettings({ numDecks: n });
                        rebuildShoe();
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn btn-ghost shuffle-btn" onClick={rebuildShoe}>
                🔀 Shuffle New Shoe
              </button>
            </div>

            <div className="settings-section">
              <h3>Session Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Bankroll</span>
                  <span className="stat-value">${bankroll.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Peak</span>
                  <span className="stat-value">${stats.peakBankroll.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Hands</span>
                  <span className="stat-value">{stats.handsPlayed}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Win Rate</span>
                  <span className="stat-value">
                    {stats.handsPlayed > 0
                      ? `${Math.round((stats.handsWon / stats.handsPlayed) * 100)}%`
                      : '—'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Blackjacks</span>
                  <span className="stat-value">{stats.blackjacks}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Count Accuracy</span>
                  <span className="stat-value">
                    {stats.totalCountGuesses > 0
                      ? `${Math.round((stats.correctCountGuesses / stats.totalCountGuesses) * 100)}%`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>House Rules</h3>
              <ul className="house-rules-list">
                <li>✓ Dealer stands on soft 17</li>
                <li>✓ Blackjack pays 3:2</li>
                <li>✓ Insurance available (2:1)</li>
                <li>✓ Late surrender allowed</li>
                <li>✓ Double down on any 2 cards</li>
                <li>✓ Split up to 2 hands</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
