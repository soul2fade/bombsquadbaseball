import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, CHARACTERS } from '../characters';

export interface PlayerProgress {
  stadiumWins: Record<string, number>;
  unlockedCharacters: string[];
  totalGamesPlayed: number;
  totalHomeruns: number;
  totalStrikeouts: number;
  perfectGames: number;
  achievements: string[];
}

interface ProgressActions {
  recordWin: (stadiumId: string) => Character[];
  recordLoss: () => void;
  recordHomerun: () => void;
  recordStrikeout: () => void;
  recordPerfectGame: () => void;
  reset: () => void;
}

const DEFAULTS: PlayerProgress = {
  stadiumWins: {},
  unlockedCharacters: [],
  totalGamesPlayed: 0,
  totalHomeruns: 0,
  totalStrikeouts: 0,
  perfectGames: 0,
  achievements: [],
};

export function checkUnlocks(progress: PlayerProgress, characters: Character[]): Character[] {
  return characters.filter((char) => {
    if (progress.unlockedCharacters.includes(char.id)) return false;
    const cond = char.unlockCondition;
    if (cond.type === 'wins_at_stadium' && cond.stadiumId) {
      return (progress.stadiumWins[cond.stadiumId] ?? 0) >= cond.count;
    }
    if (cond.type === 'total_wins') {
      const total = Object.values(progress.stadiumWins).reduce((a, b) => a + b, 0);
      return total >= cond.count;
    }
    if (cond.type === 'home_runs') {
      return progress.totalHomeruns >= cond.count;
    }
    return false;
  });
}

export const useProgressStore = create<PlayerProgress & ProgressActions>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      recordWin: (stadiumId) => {
        const state = get();
        const stadiumWins = {
          ...state.stadiumWins,
          [stadiumId]: (state.stadiumWins[stadiumId] ?? 0) + 1,
        };
        const totalGamesPlayed = state.totalGamesPlayed + 1;
        const newProgress: PlayerProgress = {
          ...state,
          stadiumWins,
          totalGamesPlayed,
        };
        const newlyUnlocked = checkUnlocks(newProgress, CHARACTERS);
        const unlockedCharacters = [
          ...state.unlockedCharacters,
          ...newlyUnlocked.map((c) => c.id),
        ];
        set({ stadiumWins, totalGamesPlayed, unlockedCharacters });
        return newlyUnlocked;
      },
      recordLoss: () => set((s) => ({ totalGamesPlayed: s.totalGamesPlayed + 1 })),
      recordHomerun: () => set((s) => ({ totalHomeruns: s.totalHomeruns + 1 })),
      recordStrikeout: () => set((s) => ({ totalStrikeouts: s.totalStrikeouts + 1 })),
      recordPerfectGame: () => set((s) => ({ perfectGames: s.perfectGames + 1 })),
      reset: () => set(DEFAULTS),
    }),
    {
      name: 'slugger-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
