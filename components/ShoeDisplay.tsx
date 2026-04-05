'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';

export default function ShoeDisplay() {
  const { shoe, settings }  = useGameStore();
  const [revealed, setRevealed]   = useState(false);
  const [guess, setGuess]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect]     = useState<boolean | null>(null);

  const totalCards  = settings.numDecks * 52;
  const remaining   = shoe.length;
  const used        = totalCards - remaining;
  const decksLeft   = (remaining / 52).toFixed(1);
  const pct         = remaining / totalCards;

  const barColor =
    pct > 0.5 ? '#27ae60' :
    pct > 0.25 ? '#f39c12' :
    '#e74c3c';

  function handleSubmitGuess() {
    if (!guess) return;
    const g = parseFloat(guess);
    const actual = parseFloat(decksLeft);
    const diff = Math.abs(g - actual);
    setCorrect(diff <= 0.5); // within half a deck = correct
    setSubmitted(true);
    setRevealed(true);
  }

  function handleReset() {
    setGuess('');
    setSubmitted(false);
    setCorrect(null);
    setRevealed(false);
  }

  return (
    <div className="shoe-display">
      <div className="shoe-header">
        <span className="shoe-title">👟 Shoe Tracker</span>
        <span className="shoe-decks">{settings.numDecks}-Deck</span>
      </div>

      {/* Always-visible bar */}
      <div className="shoe-bar-track">
        <div
          className="shoe-bar-fill"
          style={{ width: `${pct * 100}%`, background: barColor }}
        />
        <div className="shoe-reshuffle-marker" style={{ left: '25%' }} title="Reshuffle point" />
      </div>

      {/* Revealed actual numbers */}
      {revealed ? (
        <div className="shoe-stats">
          <div className="shoe-stat">
            <span className="shoe-stat-value" style={{ color: barColor }}>{remaining}</span>
            <span className="shoe-stat-label">left</span>
          </div>
          <div className="shoe-stat-divider">|</div>
          <div className="shoe-stat">
            <span className="shoe-stat-value" style={{ color: 'var(--text-muted)' }}>{used}</span>
            <span className="shoe-stat-label">used</span>
          </div>
          <div className="shoe-stat-divider">|</div>
          <div className="shoe-stat">
            <span className="shoe-stat-value" style={{ color: barColor }}>{decksLeft}d</span>
            <span className="shoe-stat-label">remain</span>
          </div>
        </div>
      ) : (
        <div className="shoe-hidden-placeholder">
          <span>? ? ?</span>
        </div>
      )}

      {/* Deck blocks */}
      <div className="shoe-stack-visual">
        {Array.from({ length: settings.numDecks }).map((_, i) => {
          const deckStart = i / settings.numDecks;
          const deckEnd   = (i + 1) / settings.numDecks;
          const fill = pct >= deckEnd ? 1 : pct <= deckStart ? 0 : (pct - deckStart) * settings.numDecks;
          return (
            <div
              key={i}
              className="shoe-deck-block"
              style={{
                opacity: fill > 0 ? 0.4 + fill * 0.6 : 0.15,
                background: fill > 0.5 ? barColor : 'var(--text-muted)',
              }}
            />
          );
        })}
      </div>

      {pct <= 0.25 && <div className="shoe-reshuffle-warn">⚠ Reshuffles soon</div>}
    </div>
  );
}

// ── Standalone "Check My Guess" panel shown BELOW the 3D table ──────────────
export function ShoeGuessPanel() {
  const { shoe, settings }  = useGameStore();
  const [guess, setGuess]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect]     = useState<boolean | null>(null);
  const [revealed, setRevealed]   = useState(false);

  const totalCards = settings.numDecks * 52;
  const remaining  = shoe.length;
  const decksLeft  = (remaining / 52).toFixed(1);
  const cardsUsed  = totalCards - remaining;

  function handleSubmit() {
    if (!guess) return;
    const diff = Math.abs(parseFloat(guess) - parseFloat(decksLeft));
    setCorrect(diff <= 0.5);
    setSubmitted(true);
    setRevealed(true);
  }

  function handleReset() {
    setGuess('');
    setSubmitted(false);
    setCorrect(null);
    setRevealed(false);
  }

  return (
    <div className="shoe-guess-panel">
      {!submitted ? (
        <>
          <span className="shoe-guess-label">Decks remaining in shoe?</span>
          <input
            type="number"
            step="0.5"
            min="0"
            max={settings.numDecks}
            className="shoe-guess-input"
            placeholder={`0 – ${settings.numDecks}`}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            className="btn btn-deal shoe-guess-btn"
            onClick={handleSubmit}
            disabled={!guess}
          >
            Check
          </button>
          <button
            className="btn btn-ghost shoe-reveal-btn"
            onClick={() => setRevealed(v => !v)}
          >
            {revealed ? 'Hide' : 'Reveal'}
          </button>
        </>
      ) : (
        <>
          <div className={`shoe-guess-result ${correct ? 'guess-correct' : 'guess-wrong'}`}>
            {correct ? '✓ Nice!' : '✗ Off'} — {decksLeft} decks left ({remaining} cards, {cardsUsed} used)
          </div>
          <button className="btn btn-ghost shoe-guess-reset" onClick={handleReset}>
            Try Again
          </button>
        </>
      )}
      {!submitted && revealed && (
        <div className="shoe-guess-reveal-answer">
          {decksLeft}d left · {remaining} cards · {cardsUsed} used
        </div>
      )}
    </div>
  );
}
