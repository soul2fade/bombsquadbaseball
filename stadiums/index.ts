import { ChantSet } from '../engines/chantEngine';
import { sandstormStadium } from './sandstorm';
import { nightgameStadium } from './nightgame';
import { demolitionStadium } from './demolition';
import { turfmonsterStadium } from './turfmonster';
import { mountainStadium } from './mountain';
import { hauntedStadium } from './haunted';
import { volcanoStadium } from './volcano';

export type QuirkType =
  | 'wind_shift'
  | 'lights_flicker'
  | 'short_walls'
  | 'turf_bounce'
  | 'altitude_boost'
  | 'ghost_fielder'
  | 'eruption_warning';

export interface StadiumQuirk {
  type: QuirkType;
  config: Record<string, unknown>;
}

export interface UnlockCondition {
  type: 'wins_at_stadium' | 'total_wins' | 'home_runs';
  stadiumId?: string;
  count: number;
}

export interface StadiumConfig {
  id: string;
  name: string;
  description: string;
  palette: {
    sky: string;
    grass: string;
    dirt: string;
    walls: string;
  };
  quirk: StadiumQuirk;
  ambientSound: string;
  crowdChants: ChantSet;
  unlockCharacter: string;
  unlockCondition: UnlockCondition;
  status: 'live' | 'coming_soon';
}

export const STADIUMS: StadiumConfig[] = [
  sandstormStadium,
  nightgameStadium,
  demolitionStadium,
  turfmonsterStadium,
  mountainStadium,
  hauntedStadium,
  volcanoStadium,
];

export const STADIUM_MAP: Record<string, StadiumConfig> = Object.fromEntries(
  STADIUMS.map((s) => [s.id, s])
);

export function getStadium(id: string): StadiumConfig | undefined {
  return STADIUM_MAP[id];
}
