import { create } from 'zustand';

export interface ChantPopupState {
  id: number;
  text: string;
  style: 'shout' | 'cheer' | 'moan' | 'roar';
  expiresAt: number;
}

interface ChantUIState {
  active: ChantPopupState | null;
  show: (text: string, style: ChantPopupState['style'], durationMs: number) => void;
  clear: () => void;
}

let nextId = 1;

export const useChantUIStore = create<ChantUIState>((set) => ({
  active: null,
  show: (text, style, durationMs) => {
    const id = nextId++;
    set({ active: { id, text, style, expiresAt: Date.now() + durationMs } });
    setTimeout(() => {
      set((s) => (s.active?.id === id ? { active: null } : s));
    }, durationMs);
  },
  clear: () => set({ active: null }),
}));
