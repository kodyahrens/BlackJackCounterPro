'use client';

import { useGameStore } from '@/lib/store';

const MIN_BET = 5;
const MAX_BET = 50;

const CHIPS = [
  { value: 5,  className: 'chip-red'   },
  { value: 10, className: 'chip-blue'  },
  { value: 25, className: 'chip-green' },
  { value: 50, className: 'chip-black' },
];

export default function BettingPanel() {
  const { phase, processing, currentBet, bankroll, placedChips, placeBet, clearBet, deal } = useGameStore();

  if (phase !== 'idle') return null;

  const remaining = MAX_BET - currentBet;
  const canDeal = currentBet >= MIN_BET && bankroll >= currentBet;

  // Count how many of each denomination are already placed (for badge)
  const chipCounts = placedChips.reduce<Record<number, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="betting-panel">
      <div className="betting-header">
        <span className="bankroll-label">Bankroll</span>
        <span className="bankroll-amount">${bankroll.toLocaleString()}</span>
        <span className="bet-limits-label">Table: $5 – $50</span>
      </div>

      <div className="chip-tray">
        {CHIPS.map(({ value, className }) => {
          const wouldExceed = currentBet + value > MAX_BET;
          const cantAfford  = currentBet + value > bankroll;
          const disabled    = wouldExceed || cantAfford;
          const count       = chipCounts[value] ?? 0;

          return (
            <button
              key={value}
              className={`chip-btn ${className}`}
              onClick={() => placeBet(value)}
              disabled={disabled}
              title={disabled ? (wouldExceed ? `Max bet is $${MAX_BET}` : 'Insufficient funds') : `Add $${value}`}
            >
              <span className="chip-value">${value}</span>
              {count > 0 && (
                <span className="chip-count-badge">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bet-controls">
        <div className="current-bet">
          <span className="bet-label">Bet</span>
          <span className="bet-amount">${currentBet}</span>
          {currentBet > 0 && currentBet < MIN_BET && (
            <span className="bet-min-warn">min $5</span>
          )}
          {remaining > 0 && currentBet > 0 && (
            <span className="bet-remaining">/ $50 max</span>
          )}
        </div>
        <div className="bet-actions">
          <button className="btn btn-ghost" onClick={clearBet} disabled={currentBet === 0}>
            Clear
          </button>
          <button
            className="btn btn-deal"
            onClick={deal}
            disabled={!canDeal || processing}
          >
            Deal
          </button>
        </div>
      </div>
    </div>
  );
}
