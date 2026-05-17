import { PitchType } from '../constants/gameRules';
import { TUNING } from '../constants/config';

export interface PitchResult {
  type: PitchType;
  speed: number;
  travelMs: number;
  locationX: number;
  inStrikeZone: boolean;
}

export interface PitchModifier {
  speedBoost?: number;
  accuracyBoost?: number;
}

export function throwPitch(type: PitchType, mod: PitchModifier = {}): PitchResult {
  const baseSpeedMap: Record<PitchType, number> = {
    fastball: TUNING.pitch.fastballSpeed,
    curve: TUNING.pitch.curveSpeed,
    slider: TUNING.pitch.sliderSpeed,
    changeup: TUNING.pitch.changeupSpeed,
  };

  const speed = baseSpeedMap[type] * (1 + (mod.speedBoost ?? 0));
  const travelMs = Math.max(450, 900 / speed);

  const jitter = TUNING.pitch.accuracyJitter * (1 - (mod.accuracyBoost ?? 0));
  const locationX = (Math.random() - 0.5) * 2 * jitter * 2;
  const inStrikeZone = Math.abs(locationX) < 0.18;

  return { type, speed, travelMs, locationX, inStrikeZone };
}
