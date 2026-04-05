'use client';

import { useGameStore } from '@/lib/store';
import type { HandResult } from '@/lib/store';

const RESULT_CONFIG: Record<HandResult, { label: string; className: string; emoji: string }> = {
  win:          { label: 'You Win!',      className: 'result-win',       emoji: '🏆' },
  blackjack:    { label: 'Blackjack!',    className: 'result-blackjack', emoji: '⭐' },
  lose:         { label: 'Dealer Wins',   className: 'result-lose',      emoji: '💸' },
  bust:         { label: 'Bust!',         className: 'result-lose',      emoji: '💥' },
  push:         { label: 'Push',          className: 'result-push',      emoji: '🤝' },
  surrender:    { label: 'Surrendered',   className: 'result-surrender', emoji: '🏳️' },
  insurance_win:{ label: 'Insurance Win', className: 'result-win',       emoji: '🛡️' },
};

export default function ResultPanel() {
  const {
    phase,
    playerResult,
    splitHands,
    settings,
    runningCount,
    shoe,
    bankroll,
    currentBet,
    nextHand,
    insuranceResult,
    insuranceBet,
    quizAnswer,
    quizCorrect,
    submitQuizAnswer,
    totalDecks,
  } = useGameStore();

  const [quizInput, setQuizInput] = useState('');

  if (phase !== 'result') return null;

  const cfg = playerResult ? RESULT_CONFIG[playerResult] : null;
  const isQuizMode = settings.countMode === 'quiz';
  const showQuiz = isQuizMode && quizAnswer === undefined;

  return (
    <div className="result-panel">
      {/* Main hand result */}
      {cfg && (
        <div className={`result-badge ${cfg.className}`}>
          <span className="result-emoji">{cfg.emoji}</span>
          <span className="result-label">{cfg.label}</span>
        </div>
      )}

      {/* Split hand results */}
      {splitHands.length > 0 && (
        <div className="split-results">
          {splitHands.map((h, i) => {
            const scfg = h.result ? RESULT_CONFIG[h.result] : null;
            return scfg ? (
              <div key={i} className={`split-result-badge ${scfg.className}`}>
                Hand {i + 1}: {scfg.label}
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Insurance result */}
      {insuranceBet > 0 && (
        <div className={`insurance-result ${insuranceResult === 'win' ? 'result-win' : 'result-lose'}`}>
          Insurance: {insuranceResult === 'win' ? `+$${insuranceBet * 2}` : `-$${insuranceBet}`}
        </div>
      )}

      {/* Quiz mode */}
      {showQuiz && (
        <div className="quiz-section">
          <p className="quiz-prompt">What&apos;s the {settings.countDisplay === 'true' ? 'true' : 'running'} count?</p>
          <div className="quiz-input-row">
            <input
              type="number"
              className="quiz-input"
              value={quizInput}
              onChange={(e) => setQuizInput(e.target.value)}
              placeholder="Enter count..."
              autoFocus
            />
            <button
              className="btn btn-deal"
              onClick={() => submitQuizAnswer(parseFloat(quizInput))}
              disabled={quizInput === ''}
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Quiz result feedback */}
      {quizAnswer !== undefined && (
        <div className={`quiz-feedback ${quizCorrect ? 'correct' : 'incorrect'}`}>
          {quizCorrect ? '✓ Correct!' : `✗ Count was ${settings.countDisplay === 'true'
            ? (runningCount / (shoe.length / 52)).toFixed(1)
            : runningCount}`}
        </div>
      )}

      {/* Next hand button */}
      {(!showQuiz) && (
        <button className="btn btn-deal next-hand-btn" onClick={nextHand}>
          Next Hand
        </button>
      )}
    </div>
  );
}

// Need to import useState
import { useState } from 'react';
