'use client';

import { useGameStore } from '@/lib/store';
import { getBasicStrategyAction, shouldTakeInsurance, actionLabel } from '@/lib/basicStrategy';
import { trueCount } from '@/lib/hiLo';
import { decksRemaining, handValue } from '@/lib/deck';
import { useState } from 'react';

export default function ActionPanel() {
  const {
    phase,
    processing,
    playerCards,
    dealerCards,
    splitHands,
    activeSplitIndex,
    bankroll,
    currentBet,
    runningCount,
    shoe,
    settings,
    hit,
    stand,
    double: doDouble,
    split,
    surrender,
    takeInsurance,
    declineInsurance,
  } = useGameStore();

  const [showHint, setShowHint] = useState(false);

  // True count for deviations
  const dr = decksRemaining(shoe, settings.numDecks);
  const tc = trueCount(runningCount, dr);

  if (phase === 'insurance') {
    const insHint = shouldTakeInsurance(tc);
    return (
      <div className="action-panel">
        <div className="insurance-prompt">
          <p className="insurance-title">Dealer shows Ace</p>
          <p className="insurance-sub">Take insurance? (½ of bet = ${Math.floor(currentBet / 2)})</p>
          {showHint && (
            <div className={`hint-badge ${insHint ? 'hint-take' : 'hint-skip'}`}>
              {insHint
                ? `✓ Take Insurance — TC is +${tc} (≥ +3)`
                : `✗ Skip Insurance — TC is ${tc < 0 ? tc : '+' + tc} (need ≥ +3)`}
            </div>
          )}
          <div className="action-row">
            <button className="btn btn-action insurance-take-btn" onClick={takeInsurance}>
              Take Insurance
            </button>
            <button className="btn btn-ghost" onClick={declineInsurance}>
              No Thanks
            </button>
          </div>
          <button className="btn btn-hint" onClick={() => setShowHint(v => !v)}>
            {showHint ? 'Hide Hint' : 'Count Hint'}
          </button>
        </div>
      </div>
    );
  }

  if (phase !== 'player' && phase !== 'split_player') return null;
  const disabled = processing;

  const activeCards = phase === 'split_player'
    ? splitHands[activeSplitIndex]?.cards ?? playerCards
    : playerCards;

  const dealerUpcard     = dealerCards.find((c) => c.faceUp);
  const dealerUpcardRank = dealerUpcard?.rank ?? '2';

  const canDouble   = activeCards.length === 2 && bankroll >= currentBet;
  const canSplit    = phase === 'player' && activeCards.length === 2 &&
                      activeCards[0].rank === activeCards[1].rank && bankroll >= currentBet;
  const canSurrender = phase === 'player' && activeCards.length === 2;

  const hint = getBasicStrategyAction(
    activeCards,
    dealerUpcardRank,
    canDouble,
    canSplit,
    canSurrender,
    tc
  );

  // Detect if a TC deviation changed the recommendation vs base strategy
  const baseHint = getBasicStrategyAction(
    activeCards,
    dealerUpcardRank,
    canDouble,
    canSplit,
    canSurrender,
    0
  );
  const isDeviation = hint !== baseHint;

  return (
    <div className="action-panel">
      {phase === 'split_player' && (
        <div className="split-indicator">
          Playing Hand {activeSplitIndex + 1} of {splitHands.length}
        </div>
      )}

      <div className="action-row">
        <button className="btn btn-action btn-hit" onClick={hit} disabled={disabled}>Hit</button>
        <button className="btn btn-action btn-stand" onClick={stand} disabled={disabled}>Stand</button>
        {canDouble && (
          <button className="btn btn-action btn-double" onClick={doDouble} disabled={disabled}>Double</button>
        )}
        {canSplit && (
          <button className="btn btn-action btn-split" onClick={split} disabled={disabled}>Split</button>
        )}
        {canSurrender && (
          <button className="btn btn-action btn-surrender" onClick={surrender} disabled={disabled}>Surrender</button>
        )}
      </div>

      <div className="hint-row">
        <button className="btn btn-hint" onClick={() => setShowHint((v) => !v)}>
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
        {showHint && (
          <div className="hint-badge">
            {isDeviation && <span className="hint-deviation-tag">TC Deviation</span>}
            Basic Strategy: <strong>{actionLabel(hint)}</strong>
            {isDeviation && (
              <span className="hint-deviation-note"> (TC {tc >= 0 ? '+' : ''}{tc})</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
