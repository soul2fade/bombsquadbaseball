export const RULES = {
  MAX_BALLS: 4,
  MAX_STRIKES: 3,
  MAX_OUTS: 3,
  INNINGS: 9,
  BASES: 3,
} as const;

export type PitchType = 'fastball' | 'curve' | 'slider' | 'changeup';

export const PITCH_TYPES: PitchType[] = ['fastball', 'curve', 'slider', 'changeup'];

export type SwingTiming = 'early' | 'perfect' | 'late' | 'miss';

export type AtBatResult =
  | 'strike'
  | 'ball'
  | 'foul'
  | 'strikeout'
  | 'walk'
  | 'single'
  | 'double'
  | 'triple'
  | 'home_run'
  | 'flyout'
  | 'groundout';

export const HIT_RESULTS: AtBatResult[] = ['single', 'double', 'triple', 'home_run'];
export const OUT_RESULTS: AtBatResult[] = ['strikeout', 'flyout', 'groundout'];
