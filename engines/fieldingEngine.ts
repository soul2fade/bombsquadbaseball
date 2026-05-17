import { Position, DefensiveStats } from '../characters';

export interface Point {
  x: number;
  y: number;
}

export const POSITIONS: Position[] = ['P', 'C', '1B', '2B', 'SS', '3B', 'LF', 'CF', 'RF'];

export const HOME_POSITIONS: Record<Position, Point> = {
  P:  { x:  0.00, y: 0.25 },
  C:  { x:  0.00, y: -0.05 },
  '1B': { x:  0.45, y: 0.32 },
  '2B': { x:  0.20, y: 0.42 },
  SS: { x: -0.20, y: 0.42 },
  '3B': { x: -0.45, y: 0.32 },
  LF: { x: -0.55, y: 0.85 },
  CF: { x:  0.00, y: 0.95 },
  RF: { x:  0.55, y: 0.85 },
};

export const GENERIC_DEFENSIVE_STATS: Record<Position, DefensiveStats> = {
  P:  { range: 50, reactionMs: 250, armStrength: 60 },
  C:  { range: 40, reactionMs: 240, armStrength: 75 },
  '1B': { range: 50, reactionMs: 260, armStrength: 60 },
  '2B': { range: 70, reactionMs: 180, armStrength: 65 },
  SS: { range: 75, reactionMs: 170, armStrength: 75 },
  '3B': { range: 55, reactionMs: 220, armStrength: 80 },
  LF: { range: 65, reactionMs: 190, armStrength: 65 },
  CF: { range: 75, reactionMs: 180, armStrength: 70 },
  RF: { range: 65, reactionMs: 190, armStrength: 75 },
};

export const CLOSE_PLAY_WINDOW_MS = 250;
export const TAP_WINDOW_MS = 600;
export const TAP_SWEET_SPOT_MS = 200;
export const BASE_FIELDER_SPEED_PX_PER_MS = 0.6;
