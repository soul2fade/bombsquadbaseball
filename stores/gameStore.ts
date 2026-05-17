import { create } from 'zustand';
import { AtBatResult } from '../constants/gameRules';
import { RULES } from '../constants/gameRules';
import { WindResult } from '../engines/windEngine';

export type Half = 'top' | 'bottom';

export interface GameState {
  stadiumId: string | null;
  teamName: string;
  opponentName: string;
  inning: number;
  half: Half;
  balls: number;
  strikes: number;
  outs: number;
  homeScore: number;
  awayScore: number;
  bases: [boolean, boolean, boolean];
  currentWind: WindResult | null;
  recentResults: AtBatResult[];
  gameOver: boolean;
  winner: 'home' | 'away' | null;
}

interface GameActions {
  startGame: (stadiumId: string, teamName: string, opponentName: string) => void;
  setWind: (wind: WindResult) => void;
  recordPitchResult: (result: AtBatResult) => void;
  resetCount: () => void;
  endGame: () => void;
}

const INITIAL_STATE: GameState = {
  stadiumId: null,
  teamName: 'Home',
  opponentName: 'Away',
  inning: 1,
  half: 'top',
  balls: 0,
  strikes: 0,
  outs: 0,
  homeScore: 0,
  awayScore: 0,
  bases: [false, false, false],
  currentWind: null,
  recentResults: [],
  gameOver: false,
  winner: null,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...INITIAL_STATE,

  startGame: (stadiumId, teamName, opponentName) =>
    set({ ...INITIAL_STATE, stadiumId, teamName, opponentName }),

  setWind: (wind) => set({ currentWind: wind }),

  resetCount: () => set({ balls: 0, strikes: 0 }),

  recordPitchResult: (result) => {
    const state = get();
    const next = applyResult(state, result);
    set(next);
  },

  endGame: () => {
    const { homeScore, awayScore } = get();
    set({
      gameOver: true,
      winner: homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : null,
    });
  },
}));

function advanceRunners(
  bases: [boolean, boolean, boolean],
  hitType: 'single' | 'double' | 'triple' | 'home_run' | 'walk'
): { bases: [boolean, boolean, boolean]; runs: number } {
  let [first, second, third] = bases;
  let runs = 0;

  const score = () => {
    runs += 1;
  };

  if (hitType === 'home_run') {
    if (first) score();
    if (second) score();
    if (third) score();
    score();
    return { bases: [false, false, false], runs };
  }

  if (hitType === 'triple') {
    if (first) score();
    if (second) score();
    if (third) score();
    return { bases: [false, false, true], runs };
  }

  if (hitType === 'double') {
    if (third) score();
    if (second) score();
    const newThird = first;
    return { bases: [false, true, newThird], runs };
  }

  if (hitType === 'single') {
    if (third) score();
    const newThird = second;
    const newSecond = first;
    return { bases: [true, newSecond, newThird], runs };
  }

  // walk
  if (first && second && third) {
    score();
    return { bases: [true, true, true], runs };
  }
  if (first && second) return { bases: [true, true, true], runs };
  if (first) return { bases: [true, true, third], runs };
  return { bases: [true, second, third], runs };
}

function applyResult(state: GameState, result: AtBatResult): Partial<GameState> {
  const offenseIsAway = state.half === 'top';
  const addRuns = (n: number) =>
    offenseIsAway ? { awayScore: state.awayScore + n } : { homeScore: state.homeScore + n };

  const recentResults = [...state.recentResults, result].slice(-5);

  switch (result) {
    case 'ball': {
      const balls = state.balls + 1;
      if (balls >= RULES.MAX_BALLS) {
        const { bases, runs } = advanceRunners(state.bases, 'walk');
        return {
          balls: 0,
          strikes: 0,
          bases,
          ...addRuns(runs),
          recentResults,
        };
      }
      return { balls, recentResults };
    }
    case 'strike': {
      const strikes = state.strikes + 1;
      if (strikes >= RULES.MAX_STRIKES) {
        return applyOut(state, recentResults);
      }
      return { strikes, recentResults };
    }
    case 'foul': {
      const strikes = Math.min(state.strikes + 1, RULES.MAX_STRIKES - 1);
      return { strikes, recentResults };
    }
    case 'strikeout':
      return applyOut(state, recentResults);
    case 'flyout':
    case 'groundout':
      return applyOut(state, recentResults);
    case 'walk': {
      const { bases, runs } = advanceRunners(state.bases, 'walk');
      return { balls: 0, strikes: 0, bases, ...addRuns(runs), recentResults };
    }
    case 'single':
    case 'double':
    case 'triple':
    case 'home_run': {
      const { bases, runs } = advanceRunners(state.bases, result);
      return { balls: 0, strikes: 0, bases, ...addRuns(runs), recentResults };
    }
  }
}

function applyOut(state: GameState, recentResults: AtBatResult[]): Partial<GameState> {
  const outs = state.outs + 1;
  if (outs >= RULES.MAX_OUTS) {
    return advanceHalf(state, recentResults);
  }
  return { outs, balls: 0, strikes: 0, recentResults };
}

function advanceHalf(state: GameState, recentResults: AtBatResult[]): Partial<GameState> {
  const nextHalf: Half = state.half === 'top' ? 'bottom' : 'top';
  const nextInning = state.half === 'bottom' ? state.inning + 1 : state.inning;

  const gameOver = nextInning > RULES.INNINGS;
  if (gameOver) {
    return {
      gameOver: true,
      winner:
        state.homeScore > state.awayScore ? 'home' : state.awayScore > state.homeScore ? 'away' : null,
      recentResults,
    };
  }

  return {
    outs: 0,
    balls: 0,
    strikes: 0,
    bases: [false, false, false],
    half: nextHalf,
    inning: nextInning,
    recentResults,
  };
}
