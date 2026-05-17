import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SandstormMode } from '../engines/windEngine';

export interface UserSettings {
  teamName: string;
  masterVolume: number;
  sfxVolume: number;
  crowdVolume: number;
  ambientVolume: number;
  difficulty: 'easy' | 'medium' | 'hard';
  sandstormMode: SandstormMode;
  kidFriendlyChants: boolean;
  highContrast: boolean;
  customChants: Record<string, string>;
}

interface SettingsActions {
  update: (patch: Partial<UserSettings>) => void;
  setCustomChant: (trigger: string, text: string) => void;
  resetCustomChant: (trigger: string) => void;
}

const DEFAULTS: UserSettings = {
  teamName: 'Sluggers',
  masterVolume: 0.8,
  sfxVolume: 0.9,
  crowdVolume: 0.7,
  ambientVolume: 0.6,
  difficulty: 'medium',
  sandstormMode: 'once_per_game',
  kidFriendlyChants: true,
  highContrast: false,
  customChants: {},
};

export const useSettingsStore = create<UserSettings & SettingsActions>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      update: (patch) => set((s) => ({ ...s, ...patch })),
      setCustomChant: (trigger, text) =>
        set((s) => ({ customChants: { ...s.customChants, [trigger]: text } })),
      resetCustomChant: (trigger) => {
        const next = { ...get().customChants };
        delete next[trigger];
        set({ customChants: next });
      },
    }),
    {
      name: 'slugger-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
