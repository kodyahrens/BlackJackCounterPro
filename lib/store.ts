import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildShoe, Card, handValue, isBust, isBlackjack, decksRemaining } from './deck';
import { hiLoValue, trueCount } from './hiLo';

export type GamePhase =
  | 'idle'        // waiting to bet
  | 'dealing'     // cards being dealt (animation)
  | 'insurance'   // insurance prompt
  | 'player'      // player's turn
  | 'dealer'      // dealer's turn (auto-play)
  | 'result'      // hand resolved, showing result
  | 'split_player'; // playing split hand

export type CountMode = 'hidden' | 'visible' | 'quiz';
export type CountDisplay = 'running' | 'true' | 'both';
export type HandResult = 'win' | 'lose' | 'push' | 'blackjack' | 'bust' | 'surrender' | 'insurance_win';

export interface SplitHand {
  cards: Card[];
  bet: number;
  result?: HandResult;
  stood: boolean;
}

export interface GameSettings {
  numDecks: number;
  countMode: CountMode;
  countDisplay: CountDisplay;
}

export interface GameState {
  // Settings
  settings: GameSettings;

  // Shoe & counting
  shoe: Card[];
  runningCount: number;
  totalDecks: number;

  // Game state
  phase: GamePhase;
  playerCards: Card[];
  dealerCards: Card[];
  splitHands: SplitHand[];
  activeSplitIndex: number;

  // Betting
  bankroll: number;
  currentBet: number;
  placedChips: number[];   // ordered list of chip denominations clicked this hand
  chipSelection: number;

  // Results
  playerResult?: HandResult;
  insuranceBet: number;
  insuranceResult?: 'win' | 'lose';

  // Quiz mode
  quizAnswer?: number;
  quizCorrect?: boolean;

  // Stats
  stats: {
    handsPlayed: number;
    handsWon: number;
    handsLost: number;
    pushes: number;
    blackjacks: number;
    peakBankroll: number;
    correctCountGuesses: number;
    totalCountGuesses: number;
  };

  // Actions
  updateSettings: (s: Partial<GameSettings>) => void;
  placeBet: (amount: number) => void;
  clearBet: () => void;
  deal: () => void;
  hit: () => void;
  stand: () => void;
  double: () => void;
  split: () => void;
  surrender: () => void;
  takeInsurance: () => void;
  declineInsurance: () => void;
  submitQuizAnswer: (count: number) => void;
  nextHand: () => void;
  rebuildShoe: () => void;

  // Locks UI during card animations (1s after each action)
  processing: boolean;

  // Internal helpers
  _runDealer: () => void;
  _finalizeStats: (result: HandResult) => void;
}

const INITIAL_SETTINGS: GameSettings = {
  numDecks: 6,
  countMode: 'hidden',
  countDisplay: 'running',
};

const INITIAL_STATS = {
  handsPlayed: 0,
  handsWon: 0,
  handsLost: 0,
  pushes: 0,
  blackjacks: 0,
  peakBankroll: 1000,
  correctCountGuesses: 0,
  totalCountGuesses: 0,
};

const ACTION_DELAY = 1000; // ms pause after each card action

function drawCard(shoe: Card[], faceUp: boolean, rc: number): { card: Card; shoe: Card[]; rc: number } {
  const newShoe = [...shoe];
  const card = { ...newShoe.pop()!, faceUp };
  const newRc = faceUp ? rc + hiLoValue(card.rank) : rc;
  return { card, shoe: newShoe, rc: newRc };
}

function resolveHand(
  playerCards: Card[],
  dealerCards: Card[],
  bet: number
): { result: HandResult; payout: number } {
  const playerVal = handValue(playerCards).value;
  const dealerVal = handValue(dealerCards).value;
  const playerBJ = isBlackjack(playerCards);
  const dealerBJ = isBlackjack(dealerCards);

  if (playerBJ && dealerBJ) return { result: 'push', payout: bet };
  if (playerBJ) return { result: 'blackjack', payout: bet + Math.floor(bet * 1.5) };
  if (dealerBJ) return { result: 'lose', payout: 0 };
  if (isBust(playerCards)) return { result: 'bust', payout: 0 };
  if (isBust(dealerCards)) return { result: 'win', payout: bet * 2 };
  if (playerVal > dealerVal) return { result: 'win', payout: bet * 2 };
  if (playerVal < dealerVal) return { result: 'lose', payout: 0 };
  return { result: 'push', payout: bet };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      settings: INITIAL_SETTINGS,
      shoe: buildShoe(INITIAL_SETTINGS.numDecks),
      runningCount: 0,
      totalDecks: INITIAL_SETTINGS.numDecks,
      phase: 'idle',
      processing: false,
      playerCards: [],
      dealerCards: [],
      splitHands: [],
      activeSplitIndex: 0,
      bankroll: 1000,
      currentBet: 0,
      placedChips: [],
      chipSelection: 25,
      playerResult: undefined,
      insuranceBet: 0,
      insuranceResult: undefined,
      quizAnswer: undefined,
      quizCorrect: undefined,
      stats: INITIAL_STATS,

      updateSettings: (s) => {
        set((state) => ({ settings: { ...state.settings, ...s } }));
        if (s.numDecks) get().rebuildShoe();
      },

      placeBet: (amount) => {
        const { bankroll, currentBet, placedChips, phase } = get();
        if (phase !== 'idle') return;
        const MAX_BET = 50;
        // Don't add if it would exceed max or bankroll
        if (currentBet + amount > MAX_BET) return;
        if (currentBet + amount > bankroll) return;
        set({ currentBet: currentBet + amount, placedChips: [...placedChips, amount] });
      },

      clearBet: () => {
        if (get().phase !== 'idle') return;
        set({ currentBet: 0, placedChips: [] });
      },

      deal: () => {
        const { shoe, runningCount, currentBet, bankroll, settings } = get();
        const MIN_BET = 5;
        if (currentBet < MIN_BET || bankroll < currentBet) return;

        let s = [...shoe];
        let rc = runningCount;

        // Rebuild if shoe is running low (< 25%)
        if (s.length < settings.numDecks * 52 * 0.25) {
          s = buildShoe(settings.numDecks);
          rc = 0;
        }

        // Deal: p1, d1, p2, d2 (dealer 2nd card face down)
        const r1 = drawCard(s, true, rc);
        s = r1.shoe; rc = r1.rc;
        const r2 = drawCard(r1.shoe, true, rc);
        s = r2.shoe; rc = r2.rc;
        const r3 = drawCard(r2.shoe, true, rc);
        s = r3.shoe; rc = r3.rc;
        const r4 = drawCard(r3.shoe, false, rc); // dealer hole card
        s = r4.shoe; rc = r4.rc;

        const playerCards = [r1.card, r3.card];
        const dealerCards = [r2.card, r4.card];

        const newBankroll = bankroll - currentBet;
        let phase: GamePhase = 'player';

        // Check for insurance prompt
        if (r2.card.rank === 'A') {
          phase = 'insurance';
        }

        set({
          shoe: s,
          runningCount: rc,
          playerCards,
          dealerCards,
          splitHands: [],
          activeSplitIndex: 0,
          phase,
          bankroll: newBankroll,
          playerResult: undefined,
          insuranceBet: 0,
          insuranceResult: undefined,
          quizAnswer: undefined,
          quizCorrect: undefined,
          processing: true,
        });

        setTimeout(() => {
          if (isBlackjack(playerCards)) {
            get().stand();
          } else {
            set({ processing: false });
          }
        }, ACTION_DELAY);
      },

      takeInsurance: () => {
        const { currentBet, bankroll } = get();
        const insuranceBet = Math.floor(currentBet / 2);
        set({
          insuranceBet,
          bankroll: bankroll - insuranceBet,
          phase: 'player',
        });
        if (isBlackjack(get().playerCards)) get().stand();
      },

      declineInsurance: () => {
        set({ insuranceBet: 0, phase: 'player' });
        if (isBlackjack(get().playerCards)) get().stand();
      },

      hit: () => {
        const { shoe, runningCount, playerCards, splitHands, activeSplitIndex, phase } = get();
        if (phase !== 'player' && phase !== 'split_player') return;

        const { card, shoe: newShoe, rc } = drawCard(shoe, true, runningCount);

        if (phase === 'split_player') {
          const newSplits = splitHands.map((h, i) =>
            i === activeSplitIndex ? { ...h, cards: [...h.cards, card] } : h
          );
          const hand = newSplits[activeSplitIndex];
          set({ shoe: newShoe, runningCount: rc, splitHands: newSplits, processing: true });
          if (isBust(hand.cards)) {
            setTimeout(() => {
              if (activeSplitIndex < newSplits.length - 1) {
                set({ activeSplitIndex: activeSplitIndex + 1, processing: false });
              } else {
                set({ processing: false });
                get()._runDealer();
              }
            }, ACTION_DELAY);
          } else {
            setTimeout(() => set({ processing: false }), ACTION_DELAY);
          }
          return;
        }

        const newCards = [...playerCards, card];
        set({ shoe: newShoe, runningCount: rc, playerCards: newCards, processing: true });
        if (isBust(newCards) || handValue(newCards).value === 21) {
          setTimeout(() => {
            set({ processing: false });
            get()._runDealer();
          }, ACTION_DELAY);
        } else {
          setTimeout(() => set({ processing: false }), ACTION_DELAY);
        }
      },

      stand: () => {
        const { phase, splitHands, activeSplitIndex } = get();
        set({ processing: true });
        if (phase === 'split_player') {
          if (activeSplitIndex < splitHands.length - 1) {
            const newSplits = splitHands.map((h, i) =>
              i === activeSplitIndex ? { ...h, stood: true } : h
            );
            setTimeout(() => set({ splitHands: newSplits, activeSplitIndex: activeSplitIndex + 1, processing: false }), ACTION_DELAY);
          } else {
            const newSplits = splitHands.map((h, i) =>
              i === activeSplitIndex ? { ...h, stood: true } : h
            );
            setTimeout(() => {
              set({ splitHands: newSplits, processing: false });
              get()._runDealer();
            }, ACTION_DELAY);
          }
          return;
        }
        setTimeout(() => {
          set({ processing: false });
          get()._runDealer();
        }, ACTION_DELAY);
      },

      double: () => {
        const { shoe, runningCount, playerCards, bankroll, currentBet, phase } = get();
        if (phase !== 'player' || playerCards.length !== 2) return;
        const extraBet = Math.min(currentBet, bankroll);
        const { card, shoe: newShoe, rc } = drawCard(shoe, true, runningCount);
        const newCards = [...playerCards, card];
        set({
          shoe: newShoe,
          runningCount: rc,
          playerCards: newCards,
          bankroll: bankroll - extraBet,
          currentBet: currentBet + extraBet,
          processing: true,
        });
        setTimeout(() => {
          set({ processing: false });
          get()._runDealer();
        }, ACTION_DELAY);
      },

      split: () => {
        const { shoe, runningCount, playerCards, bankroll, currentBet, phase } = get();
        if (phase !== 'player' || playerCards.length !== 2) return;
        if (bankroll < currentBet) return;

        let s = [...shoe];
        let rc = runningCount;

        const r1 = drawCard(s, true, rc);
        s = r1.shoe; rc = r1.rc;
        const r2 = drawCard(r1.shoe, true, rc);
        s = r2.shoe; rc = r2.rc;

        const hand1: SplitHand = { cards: [playerCards[0], r1.card], bet: currentBet, stood: false };
        const hand2: SplitHand = { cards: [playerCards[1], r2.card], bet: currentBet, stood: false };

        set({
          shoe: s,
          runningCount: rc,
          splitHands: [hand1, hand2],
          activeSplitIndex: 0,
          phase: 'split_player',
          bankroll: bankroll - currentBet,
          processing: true,
        });
        setTimeout(() => set({ processing: false }), ACTION_DELAY);
      },

      surrender: () => {
        const { currentBet, bankroll, phase } = get();
        if (phase !== 'player') return;
        const refund = Math.floor(currentBet / 2);
        set({ processing: true });
        setTimeout(() => {
          set({ bankroll: bankroll + refund, playerResult: 'surrender', phase: 'result', processing: false });
          get()._finalizeStats('surrender');
        }, ACTION_DELAY);
      },

      submitQuizAnswer: (answer) => {
        const { runningCount, settings, shoe } = get();
        const dr = decksRemaining(shoe, settings.numDecks);
        const tc = trueCount(runningCount, dr);
        const correct = settings.countDisplay === 'true'
          ? answer === tc
          : answer === runningCount;
        set((state) => ({
          quizAnswer: answer,
          quizCorrect: correct,
          stats: {
            ...state.stats,
            totalCountGuesses: state.stats.totalCountGuesses + 1,
            correctCountGuesses: correct ? state.stats.correctCountGuesses + 1 : state.stats.correctCountGuesses,
          },
        }));
      },

      nextHand: () => {
        const { settings, bankroll, stats } = get();
        if (settings.countMode === 'quiz' && get().quizAnswer === undefined) return;
        set({
          phase: 'idle',
          playerCards: [],
          dealerCards: [],
          splitHands: [],
          activeSplitIndex: 0,
          playerResult: undefined,
          insuranceBet: 0,
          insuranceResult: undefined,
          quizAnswer: undefined,
          quizCorrect: undefined,
          currentBet: 0,
          placedChips: [],
          stats: {
            ...stats,
            peakBankroll: Math.max(stats.peakBankroll, bankroll),
          },
        });
      },

      rebuildShoe: () => {
        const { settings } = get();
        set({ shoe: buildShoe(settings.numDecks), runningCount: 0 });
      },

      // Internal dealer auto-play
      _runDealer: () => {
        const { dealerCards, shoe, runningCount, splitHands, currentBet, bankroll, insuranceBet } = get();

        // Flip hole card
        let dc = dealerCards.map((c, i) => (i === 1 ? { ...c, faceUp: true } : c));
        let s = [...shoe];
        let rc = runningCount;

        // Count the flipped hole card
        if (!dealerCards[1].faceUp) {
          rc += hiLoValue(dealerCards[1].rank);
        }

        // Dealer hits until >= 17 (stands on soft 17)
        let dv = handValue(dc);
        while (dv.value < 17 || (dv.value === 17 && dv.soft === false ? false : dv.value < 17)) {
          if (dv.value >= 17) break;
          const res = drawCard(s, true, rc);
          s = res.shoe; rc = res.rc;
          dc = [...dc, res.card];
          dv = handValue(dc);
        }

        // Resolve insurance
        const dealerBJ = isBlackjack(dc);
        let insurancePayout = 0;
        let insuranceResult: 'win' | 'lose' = 'lose';
        if (insuranceBet > 0) {
          if (dealerBJ) {
            insurancePayout = insuranceBet * 3; // 2:1 payout + return of bet
            insuranceResult = 'win';
          } else {
            insuranceResult = 'lose';
          }
        }

        // Resolve split hands
        let totalPayout = insurancePayout;
        let newSplits = splitHands;
        if (splitHands.length > 0) {
          newSplits = splitHands.map((h) => {
            const { result, payout } = resolveHand(h.cards, dc, h.bet);
            totalPayout += payout;
            return { ...h, result };
          });
        }

        // Resolve main hand
        const playerCards = get().playerCards;
        let playerResult: HandResult;
        if (get().playerResult === 'surrender') {
          playerResult = 'surrender';
        } else {
          const { result, payout } = resolveHand(playerCards, dc, currentBet);
          playerResult = result;
          totalPayout += payout;
        }

        const finalBankroll = bankroll + totalPayout;

        // Show dealer cards first, then pause before revealing result
        set({ dealerCards: dc, shoe: s, runningCount: rc, processing: true });
        setTimeout(() => {
          set({
            phase: 'result',
            playerResult,
            splitHands: newSplits,
            insuranceResult,
            bankroll: finalBankroll,
            processing: false,
          });
          get()._finalizeStats(playerResult);
        }, ACTION_DELAY);
      },

      _finalizeStats: (result: HandResult) => {
        set((state) => {
          const s = { ...state.stats };
          s.handsPlayed++;
          if (result === 'win' || result === 'blackjack') s.handsWon++;
          else if (result === 'lose' || result === 'bust') s.handsLost++;
          else if (result === 'push') s.pushes++;
          if (result === 'blackjack') s.blackjacks++;
          s.peakBankroll = Math.max(s.peakBankroll, state.bankroll);
          return { stats: s };
        });
      },
    } as GameState),
    {
      name: 'blackjack-pro-storage',
      partialize: (state) => ({
        bankroll: state.bankroll,
        settings: state.settings,
        stats: state.stats,
        runningCount: state.runningCount,
      }),
    }
  )
);
