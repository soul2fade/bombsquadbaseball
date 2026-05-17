import { StadiumConfig } from '../stadiums';
import { HitResult } from './hitEngine';
import { PitchModifier } from './pitchEngine';
import { AtBatResult } from '../constants/gameRules';

export interface QuirkPreEffects {
  visibilityReduction: number;
  pitchMod: PitchModifier;
  powerBoost: number;
  hrThresholdDelta: number;
  flickerActive: boolean;
  eruptionActive: boolean;
  triggerChants: string[];
}

const DEFAULT: QuirkPreEffects = {
  visibilityReduction: 0,
  pitchMod: {},
  powerBoost: 0,
  hrThresholdDelta: 0,
  flickerActive: false,
  eruptionActive: false,
  triggerChants: [],
};

export interface QuirkSituation {
  inning: number;
}

export function getQuirkPreEffects(
  stadium: StadiumConfig,
  situation: QuirkSituation
): QuirkPreEffects {
  const cfg = stadium.quirk.config;
  switch (stadium.quirk.type) {
    case 'wind_shift':
      return DEFAULT;

    case 'lights_flicker': {
      const chance = (cfg.flickerChancePerPitch as number) ?? 0.08;
      const flickerActive = Math.random() < chance;
      return {
        ...DEFAULT,
        flickerActive,
        visibilityReduction: flickerActive ? 0.65 : 0,
        triggerChants: flickerActive ? ['lights_flicker'] : [],
      };
    }

    case 'short_walls':
      return {
        ...DEFAULT,
        hrThresholdDelta: -0.12,
        powerBoost: 0.08,
      };

    case 'altitude_boost': {
      const mult = (cfg.distanceMultiplier as number) ?? 1.18;
      return {
        ...DEFAULT,
        powerBoost: mult - 1,
      };
    }

    case 'eruption_warning': {
      const eruptionInning = (cfg.eruptionInning as number) ?? 7;
      const speedBoost = (cfg.eruptionSpeedBoost as number) ?? 0.2;
      const active = situation.inning >= eruptionInning;
      return {
        ...DEFAULT,
        eruptionActive: active,
        pitchMod: active ? { speedBoost } : {},
        triggerChants: active && situation.inning === eruptionInning ? ['eruption_warning'] : [],
      };
    }

    case 'turf_bounce':
    case 'ghost_fielder':
      return DEFAULT;
  }
}

export function applyQuirkToHit(
  stadium: StadiumConfig,
  hit: HitResult
): { hit: HitResult; chants: string[] } {
  const cfg = stadium.quirk.config;
  const chants: string[] = [];

  if (stadium.quirk.type === 'turf_bounce' && hit.result === 'groundout') {
    const bounceChance = (cfg.bounceChance as number) ?? 0.45;
    if (Math.random() < bounceChance) {
      chants.push('turf_bounce_hit');
      return { hit: { ...hit, result: 'single' as AtBatResult }, chants };
    }
  }

  if (
    stadium.quirk.type === 'ghost_fielder' &&
    ['single', 'double', 'triple'].includes(hit.result)
  ) {
    const ghostChance = (cfg.appearanceChance as number) ?? 0.12;
    if (Math.random() < ghostChance) {
      chants.push('ghost_catch');
      return { hit: { ...hit, result: 'flyout' as AtBatResult }, chants };
    }
  }

  return { hit, chants };
}
