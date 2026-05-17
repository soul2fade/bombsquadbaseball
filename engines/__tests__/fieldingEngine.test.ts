import {
  pickFielder,
  resolveCatch,
  GENERIC_DEFENSIVE_STATS,
  Point,
  BallTrajectory,
  FielderState,
} from '../fieldingEngine';

const seededRng = (value: number) => () => value;

describe('pickFielder', () => {
  it.each([
    ['ground ball to short', { x: -0.25, y: 0.40 }, 'SS'],
    ['ground ball to second', { x: 0.18, y: 0.40 }, '2B'],
    ['line drive to first', { x: 0.45, y: 0.30 }, '1B'],
    ['line drive to third', { x: -0.45, y: 0.30 }, '3B'],
    ['fly to left', { x: -0.50, y: 0.80 }, 'LF'],
    ['fly to center', { x: 0.00, y: 0.90 }, 'CF'],
    ['fly to right', { x: 0.50, y: 0.80 }, 'RF'],
    ['comebacker to pitcher', { x: 0.00, y: 0.25 }, 'P'],
    ['weak grounder to catcher', { x: 0.00, y: 0.00 }, 'C'],
  ])('routes %s to %s', (_label, landing: Point, expectedFielder) => {
    expect(pickFielder(landing)).toBe(expectedFielder);
  });
});

describe('resolveCatch', () => {
  const ball: BallTrajectory = {
    landing: { x: 0, y: 0.95 },
    airTimeMs: 2000,
    ballType: 'fly',
  };

  it('clean catch when fielder is already at the landing point', () => {
    const fielder: FielderState = {
      position: 'CF',
      home: { x: 0, y: 0.95 },
      stats: GENERIC_DEFENSIVE_STATS.CF,
    };
    const result = resolveCatch(fielder, ball, seededRng(0.5));
    expect(result.outcome).toBe('caught');
    expect(result.isCloseplay).toBe(false);
  });

  it('clean miss when ball lands far from a slow fielder in too short a time', () => {
    const fielder: FielderState = {
      position: 'CF',
      home: { x: 0, y: 0 },
      stats: { range: 10, reactionMs: 500, armStrength: 50 },
    };
    const fastBall: BallTrajectory = {
      landing: { x: 0, y: 1.0 },
      airTimeMs: 300,
      ballType: 'liner',
    };
    const result = resolveCatch(fielder, fastBall, seededRng(0.5));
    expect(result.outcome).toBe('hit');
    expect(result.isCloseplay).toBe(false);
  });

  it('close play when fielder arrival is within window of ball arrival', () => {
    // CF at (0, 0.7) -> ball at (0, 0.92): distance 0.22 * 280 = 61.6 px
    // speed (75/100) * 0.6 = 0.45 px/ms -> travel ~137ms + reaction 180ms = 317ms arrival
    // ball at 350ms -> delta -33ms -> close play (within ±250 window)
    const fielder: FielderState = {
      position: 'CF',
      home: { x: 0, y: 0.7 },
      stats: GENERIC_DEFENSIVE_STATS.CF,
    };
    const closeBall: BallTrajectory = {
      landing: { x: 0, y: 0.92 },
      airTimeMs: 350,
      ballType: 'fly',
    };
    const result = resolveCatch(fielder, closeBall, seededRng(0.5));
    expect(result.isCloseplay).toBe(true);
  });

  it('clean miss returns hitDepth based on landing y', () => {
    const fielder: FielderState = {
      position: 'CF',
      home: { x: 0, y: 0 },
      stats: { range: 10, reactionMs: 500, armStrength: 50 },
    };
    const shallow = resolveCatch(
      fielder,
      { landing: { x: 0, y: 0.2 }, airTimeMs: 300, ballType: 'grounder' },
      seededRng(0.5)
    );
    const deep = resolveCatch(
      fielder,
      { landing: { x: 0, y: 0.95 }, airTimeMs: 300, ballType: 'fly' },
      seededRng(0.5)
    );
    expect(shallow.hitDepth).toBe('shallow');
    expect(deep.hitDepth).toBe('deep');
  });
});
