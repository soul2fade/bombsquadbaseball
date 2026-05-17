import { AtBatResult } from '../constants/gameRules';

export interface GameSituation {
  balls: number;
  strikes: number;
  outs: number;
  inning: number;
  scoreDiff: number;
  basesLoaded: boolean;
  recentResults: AtBatResult[];
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  type: 'pitcher' | 'batter' | 'fielding';
  modifier: Record<string, number>;
  visualCue: string;
  soundCue: string;
}

export interface PowerUpTrigger {
  id: string;
  name: string;
  condition: (s: GameSituation) => boolean;
  powerUp: PowerUp;
}

export const POWER_UP_TRIGGERS: PowerUpTrigger[] = [
  {
    id: 'clutch_pitch',
    name: 'Clutch Pitch',
    condition: (s) => s.balls === 3 && s.strikes === 2 && s.outs === 2,
    powerUp: {
      id: 'clutch_pitch',
      name: 'Clutch Pitch',
      description: 'Full count, two outs — bring the heat.',
      type: 'pitcher',
      modifier: { speed: 0.12, accuracy: 0.08 },
      visualCue: 'clutch_badge_pulse',
      soundCue: 'fx/clutch_pitch_trigger.mp3',
    },
  },
  {
    id: 'heat_streak',
    name: 'Heat Streak',
    condition: (s) => {
      const last = s.recentResults.slice(-2);
      return last.length === 2 && last.every((r) => HIT_RESULTS.has(r));
    },
    powerUp: {
      id: 'heat_streak',
      name: 'Heat Streak',
      description: 'Two hits in a row — power swing unlocked.',
      type: 'batter',
      modifier: { powerSwing: 0.15 },
      visualCue: 'fire_streak_badge',
      soundCue: 'fx/heat_streak.mp3',
    },
  },
  {
    id: 'last_stand',
    name: 'Last Stand',
    condition: (s) => s.inning >= 9 && s.scoreDiff <= -1,
    powerUp: {
      id: 'last_stand',
      name: 'Last Stand',
      description: 'Ninth inning, down a run — every swing matters.',
      type: 'batter',
      modifier: { contactBoost: 0.1, powerSwing: 0.1 },
      visualCue: 'last_stand_glow',
      soundCue: 'fx/last_stand.mp3',
    },
  },
  {
    id: 'bases_loaded_heat',
    name: 'Bases Loaded',
    condition: (s) => s.basesLoaded,
    powerUp: {
      id: 'bases_loaded_heat',
      name: 'Bases Loaded',
      description: 'Pressure pitch — small velocity boost.',
      type: 'pitcher',
      modifier: { speed: 0.06 },
      visualCue: 'bases_loaded_badge',
      soundCue: 'fx/bases_loaded.mp3',
    },
  },
];

const HIT_RESULTS = new Set<AtBatResult>(['single', 'double', 'triple', 'home_run']);

export function getActivePowerUps(situation: GameSituation): PowerUp[] {
  return POWER_UP_TRIGGERS.filter((t) => t.condition(situation)).map((t) => t.powerUp);
}
