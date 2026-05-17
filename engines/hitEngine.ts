import { AtBatResult, SwingTiming } from '../constants/gameRules';
import { TUNING } from '../constants/config';
import { WindResult } from './windEngine';
import { PitchResult } from './pitchEngine';

export interface SwingInput {
  swung: boolean;
  swingAtMs: number;
  pitchArrivalMs: number;
}

export interface BatterModifier {
  contactBoost?: number;
  powerBoost?: number;
}

export interface HitResult {
  result: AtBatResult;
  timing: SwingTiming;
  power: number;
  trajectoryX: number;
  trajectoryY: number;
}

export function resolveSwing(
  pitch: PitchResult,
  swing: SwingInput,
  wind: WindResult,
  mod: BatterModifier = {}
): HitResult {
  if (!swing.swung) {
    const result: AtBatResult = pitch.inStrikeZone ? 'strike' : 'ball';
    return { result, timing: 'miss', power: 0, trajectoryX: 0, trajectoryY: 0 };
  }

  const delta = Math.abs(swing.swingAtMs - swing.pitchArrivalMs);
  let timing: SwingTiming;
  if (delta <= TUNING.swing.perfectWindowMs / 2) timing = 'perfect';
  else if (delta <= TUNING.swing.goodWindowMs / 2) {
    timing = swing.swingAtMs < swing.pitchArrivalMs ? 'early' : 'late';
  } else {
    timing = 'miss';
  }

  if (timing === 'miss') {
    return { result: 'strike', timing, power: 0, trajectoryX: 0, trajectoryY: 0 };
  }

  const visibilityPenalty = wind.visibilityReduction * 0.4;
  const contact =
    TUNING.swing.contactBase +
    (mod.contactBoost ?? 0) -
    visibilityPenalty +
    (timing === 'perfect' ? 0.35 : 0.05);

  if (contact < 0.4) {
    return { result: 'foul', timing, power: contact, trajectoryX: 0, trajectoryY: 0 };
  }

  const basePower = TUNING.swing.powerBase + (mod.powerBoost ?? 0);
  const timingBonus = timing === 'perfect' ? 0.4 : 0.1;
  let power = basePower + timingBonus + (Math.random() * 0.1 - 0.05);

  power += wind.driftY;
  power = Math.max(0, Math.min(1.2, power));

  const trajectoryX = wind.driftX + (Math.random() - 0.5) * 0.3;
  const trajectoryY = power;

  let result: AtBatResult;
  if (power >= TUNING.hit.hrThreshold) result = 'home_run';
  else if (power >= TUNING.hit.tripleThreshold) result = 'triple';
  else if (power >= TUNING.hit.doubleThreshold) result = 'double';
  else if (power >= TUNING.hit.singleThreshold) result = 'single';
  else result = Math.random() > 0.5 ? 'flyout' : 'groundout';

  return { result, timing, power, trajectoryX, trajectoryY };
}
