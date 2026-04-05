'use client';

import { useGameStore } from '@/lib/store';
import { trueCount, hiLoValue } from '@/lib/hiLo';
import { decksRemaining } from '@/lib/deck';
import { useState } from 'react';

export default function CountDisplay() {
  const { settings, runningCount, shoe, totalDecks, updateSettings, phase } = useGameStore();
  const [revealed, setRevealed] = useState(false);

  const dr = decksRemaining(shoe, totalDecks);
  const tc = trueCount(runningCount, dr);

  const isVisible = settings.countMode === 'visible';
  const isHidden = settings.countMode === 'hidden';
  const isQuiz = settings.countMode === 'quiz';

  const showRunning = settings.countDisplay === 'running' || settings.countDisplay === 'both';
  const showTrue = settings.countDisplay === 'true' || settings.countDisplay === 'both';

  const countClass = runningCount > 2 ? 'count-positive' : runningCount < -2 ? 'count-negative' : 'count-neutral';

  return (
    <div className="count-display">
      <div className="count-header">
        <span className="count-title">Hi-Lo Count</span>
        <div className="count-mode-tabs">
          {(['hidden', 'visible', 'quiz'] as const).map((mode) => (
            <button
              key={mode}
              className={`count-mode-tab ${settings.countMode === mode ? 'active' : ''}`}
              onClick={() => {
                updateSettings({ countMode: mode });
                setRevealed(false);
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="count-values">
        {isVisible && (
          <>
            {showRunning && (
              <div className="count-item">
                <span className="count-label">Running</span>
                <span className={`count-number ${countClass}`}>{runningCount > 0 ? `+${runningCount}` : runningCount}</span>
              </div>
            )}
            {showTrue && (
              <div className="count-item">
                <span className="count-label">True</span>
                <span className={`count-number ${countClass}`}>{tc > 0 ? `+${tc}` : tc}</span>
              </div>
            )}
          </>
        )}

        {isHidden && (
          <div className="count-item">
            <button
              className="btn btn-reveal"
              onClick={() => setRevealed((v) => !v)}
            >
              {revealed ? 'Hide' : 'Check Count'}
            </button>
            {revealed && (
              <>
                {showRunning && (
                  <span className={`count-number ${countClass}`}>{runningCount > 0 ? `+${runningCount}` : runningCount}</span>
                )}
                {showTrue && (
                  <span className={`count-number ${countClass}`}>TC: {tc > 0 ? `+${tc}` : tc}</span>
                )}
              </>
            )}
          </div>
        )}

        {isQuiz && (phase === 'idle' || phase === 'result') && (
          <div className="count-item">
            <span className="count-label">Track it yourself!</span>
          </div>
        )}
      </div>

      <div className="count-footer">
        <span className="decks-remaining">{dr.toFixed(1)} decks remaining</span>
        <button
          className="count-display-toggle"
          onClick={() => updateSettings({
            countDisplay: settings.countDisplay === 'running' ? 'true' : settings.countDisplay === 'true' ? 'both' : 'running'
          })}
        >
          {settings.countDisplay === 'running' ? 'Running' : settings.countDisplay === 'true' ? 'True' : 'Both'} ↻
        </button>
      </div>
    </div>
  );
}
