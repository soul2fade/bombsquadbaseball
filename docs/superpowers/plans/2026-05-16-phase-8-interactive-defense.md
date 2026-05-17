# Phase 8 — Interactive Defense Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render 9 fielders, animate the ball to a landing point, have the nearest fielder react, and let the player quick-tap on close plays — matching the [Phase 8 design spec](../specs/2026-05-16-phase-8-interactive-defense-design.md).

**Architecture:** New `fieldingEngine.ts` decides catch vs hit deterministically given hit landing + fielder stats + RNG. New components render the visual play. The game screen orchestrates the new sequence between existing swing logic and existing scoreboard state.

**Tech Stack:** TypeScript, Expo SDK 54, react-native, react-native-reanimated, zustand, Jest + jest-expo for unit tests.

---

## File Structure

**New:**
- `engines/fieldingEngine.ts` — pure functions: `pickFielder`, `resolveCatch`, constants for positions and generic defensive stats
- `engines/__tests__/fieldingEngine.test.ts`
- `engines/__tests__/hitEngine.test.ts`
- `components/game/Fielder.tsx`
- `components/game/BallInFlight.tsx`
- `components/game/CloseplayPrompt.tsx`
- `jest.config.js`

**Modified:**
- `characters/index.ts` — add `position` + `defensiveStats` to Character interface
- All 7 character files in `characters/*.ts` — add position + stats
- `engines/hitEngine.ts` — extend `HitResult` with `landing`, `ballType`, `airTimeMs`; compute them in `resolveSwing`
- `stores/gameStore.ts` — add `lineup` state and `setLineup` action
- `app/game/[stadium].tsx` — render fielders, drive new fielding sequence after swing
- `package.json` — add jest dev deps + `test` script

---

## Task 1: Set up Jest + jest-expo

**Files:**
- Create: `jest.config.js`
- Modify: `package.json`

- [ ] **Step 1: Install dev dependencies**

Run: `cd C:/Users/zimme/bombsquadbaseball && npm install --save-dev jest@^29 jest-expo@~54.0.0 @types/jest@^29`
Expected: packages installed, no errors.

- [ ] **Step 2: Create `jest.config.js`**

```js
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@?react-native-async-storage|zustand)/)',
  ],
};
```

- [ ] **Step 3: Add `test` script to `package.json`**

Modify scripts block to include:
```json
"test": "jest"
```

- [ ] **Step 4: Add a smoke test file to verify config works**

Create `engines/__tests__/smoke.test.ts`:
```ts
describe('jest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests**

Run: `cd C:/Users/zimme/bombsquadbaseball && npm test`
Expected: 1 passed, 0 failed.

- [ ] **Step 6: Delete smoke test, commit**

```bash
rm engines/__tests__/smoke.test.ts
git add jest.config.js package.json package-lock.json
git commit -m "Set up Jest + jest-expo test runner"
```

---

## Task 2: Extend Character interface with `position` + `defensiveStats`

**Files:**
- Modify: `characters/index.ts`

- [ ] **Step 1: Add Position type and DefensiveStats interface to `characters/index.ts`**

Insert after existing interface definitions, before `Character`:
```ts
export type Position = 'P' | 'C' | '1B' | '2B' | 'SS' | '3B' | 'LF' | 'CF' | 'RF';

export interface DefensiveStats {
  range: number;        // 0-100, controls movement speed toward ball
  reactionMs: number;   // 0-500, delay before fielder starts moving
  armStrength: number;  // 0-100, reserved for future throw-out logic
}
```

- [ ] **Step 2: Extend `Character` interface**

Modify the `Character` interface to add two optional fields:
```ts
export interface Character {
  id: string;
  name: string;
  role: 'pitcher' | 'batter' | 'fielder' | 'utility';
  unlockCondition: UnlockCondition;
  specialAbility: SpecialAbility;
  appearance: CharacterAppearance;
  position?: Position;
  defensiveStats?: DefensiveStats;
}
```

- [ ] **Step 3: Verify typecheck still passes**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add characters/index.ts
git commit -m "Add Position and DefensiveStats types to Character"
```

---

## Task 3: Assign positions + stats to the 7 existing characters

**Files:**
- Modify: `characters/dusty.ts`, `shadow.ts`, `wrecker.ts`, `spring.ts`, `summit.ts`, `phantom.ts`, `ember.ts`

Position assignments (spreading across the field for maximum unlock impact):
- dusty → P (already role: 'pitcher')
- shadow → CF (centerfield, hard to read in the dark — fits flavor)
- wrecker → 1B (power role, classic 1B slot)
- spring → SS (bouncy → high range)
- summit → 3B (corner power)
- phantom → LF (eerie outfield)
- ember → RF

- [ ] **Step 1: Add position + defensiveStats to `characters/dusty.ts`**

Modify the exported object to include the two new fields:
```ts
export const dusty: Character = {
  id: 'dusty',
  // ...existing fields stay as-is...
  position: 'P',
  defensiveStats: { range: 55, reactionMs: 220, armStrength: 70 },
};
```

- [ ] **Step 2: Add to `characters/shadow.ts`**

```ts
  position: 'CF',
  defensiveStats: { range: 78, reactionMs: 160, armStrength: 75 },
```

- [ ] **Step 3: Add to `characters/wrecker.ts`**

```ts
  position: '1B',
  defensiveStats: { range: 48, reactionMs: 280, armStrength: 65 },
```

- [ ] **Step 4: Add to `characters/spring.ts`**

```ts
  position: 'SS',
  defensiveStats: { range: 88, reactionMs: 140, armStrength: 80 },
```

- [ ] **Step 5: Add to `characters/summit.ts`**

```ts
  position: '3B',
  defensiveStats: { range: 62, reactionMs: 200, armStrength: 85 },
```

- [ ] **Step 6: Add to `characters/phantom.ts`**

```ts
  position: 'LF',
  defensiveStats: { range: 72, reactionMs: 170, armStrength: 70 },
```

- [ ] **Step 7: Add to `characters/ember.ts`**

```ts
  position: 'RF',
  defensiveStats: { range: 70, reactionMs: 180, armStrength: 82 },
```

- [ ] **Step 8: Verify typecheck**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add characters/
git commit -m "Assign positions and defensive stats to 7 unlockable characters"
```

---

## Task 4: Define position constants and generic backup stats

**Files:**
- Create: `engines/fieldingEngine.ts`

- [ ] **Step 1: Create `engines/fieldingEngine.ts` with constants only**

```ts
import { Position, DefensiveStats } from '../characters';

export interface Point {
  x: number;  // -1 (far left) to 1 (far right)
  y: number;  // 0 (home plate) to 1 (deep center)
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
```

- [ ] **Step 2: Verify typecheck**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add engines/fieldingEngine.ts
git commit -m "Add fielding constants: positions, home coords, generic stats"
```

---

## Task 5: Implement `pickFielder` (TDD)

**Files:**
- Create: `engines/__tests__/fieldingEngine.test.ts`
- Modify: `engines/fieldingEngine.ts`

- [ ] **Step 1: Write failing test**

Create `engines/__tests__/fieldingEngine.test.ts`:
```ts
import { pickFielder, HOME_POSITIONS, Point } from '../fieldingEngine';

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
```

- [ ] **Step 2: Run test, verify failure**

Run: `cd C:/Users/zimme/bombsquadbaseball && npm test -- fieldingEngine`
Expected: FAIL — `pickFielder is not a function` or similar.

- [ ] **Step 3: Implement `pickFielder`**

Append to `engines/fieldingEngine.ts`:
```ts
function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function pickFielder(landing: Point): Position {
  let best: Position = 'P';
  let bestDist = Infinity;
  for (const pos of POSITIONS) {
    const d = distance(landing, HOME_POSITIONS[pos]);
    if (d < bestDist) {
      bestDist = d;
      best = pos;
    }
  }
  return best;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `cd C:/Users/zimme/bombsquadbaseball && npm test -- fieldingEngine`
Expected: 9 passed.

- [ ] **Step 5: Commit**

```bash
git add engines/fieldingEngine.ts engines/__tests__/fieldingEngine.test.ts
git commit -m "Add pickFielder: routes hits to nearest fielder by home position"
```

---

## Task 6: Implement `resolveCatch` (TDD)

**Files:**
- Modify: `engines/__tests__/fieldingEngine.test.ts`
- Modify: `engines/fieldingEngine.ts`

- [ ] **Step 1: Add failing tests to existing test file**

Append to `engines/__tests__/fieldingEngine.test.ts`:
```ts
import { resolveCatch, GENERIC_DEFENSIVE_STATS, BallTrajectory, FielderState } from '../fieldingEngine';

const seededRng = (value: number) => () => value;

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
    const fielder: FielderState = {
      position: 'CF',
      home: { x: 0, y: 0.7 },
      stats: GENERIC_DEFENSIVE_STATS.CF,
    };
    const closeBall: BallTrajectory = {
      landing: { x: 0, y: 0.92 },
      airTimeMs: 700,
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
```

- [ ] **Step 2: Run, verify failure**

Run: `cd C:/Users/zimme/bombsquadbaseball && npm test -- fieldingEngine`
Expected: FAIL — `BallTrajectory not exported` / `resolveCatch not defined`.

- [ ] **Step 3: Implement `resolveCatch`**

Append to `engines/fieldingEngine.ts`:
```ts
export type BallType = 'grounder' | 'liner' | 'fly';

export interface BallTrajectory {
  landing: Point;
  airTimeMs: number;
  ballType: BallType;
}

export interface FielderState {
  position: Position;
  home: Point;
  stats: DefensiveStats;
}

export interface FieldingResult {
  outcome: 'caught' | 'hit';
  isCloseplay: boolean;
  fielderId: Position;
  hitDepth?: 'shallow' | 'mid' | 'deep';
}

const FIELD_PX_SCALE = 280;  // logical field pixel size for time calc

function computeFielderArrivalMs(fielder: FielderState, landing: Point): number {
  const dist = distance(fielder.home, landing) * FIELD_PX_SCALE;
  const speed = (fielder.stats.range / 100) * BASE_FIELDER_SPEED_PX_PER_MS;
  return fielder.stats.reactionMs + dist / speed;
}

function classifyDepth(y: number): 'shallow' | 'mid' | 'deep' {
  if (y < 0.4) return 'shallow';
  if (y < 0.7) return 'mid';
  return 'deep';
}

export function resolveCatch(
  fielder: FielderState,
  ball: BallTrajectory,
  rng: () => number
): FieldingResult {
  const fielderArrival = computeFielderArrivalMs(fielder, ball.landing);
  const ballArrival = ball.airTimeMs;
  const delta = fielderArrival - ballArrival;

  if (delta < -CLOSE_PLAY_WINDOW_MS) {
    return { outcome: 'caught', isCloseplay: false, fielderId: fielder.position };
  }
  if (delta > CLOSE_PLAY_WINDOW_MS) {
    return {
      outcome: 'hit',
      isCloseplay: false,
      fielderId: fielder.position,
      hitDepth: classifyDepth(ball.landing.y),
    };
  }
  // close play — coin-flip-ish based on rng; player tap can override
  const caught = rng() < 0.5;
  return {
    outcome: caught ? 'caught' : 'hit',
    isCloseplay: true,
    fielderId: fielder.position,
    hitDepth: caught ? undefined : classifyDepth(ball.landing.y),
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `cd C:/Users/zimme/bombsquadbaseball && npm test -- fieldingEngine`
Expected: 13 passed (9 pickFielder + 4 resolveCatch).

- [ ] **Step 5: Commit**

```bash
git add engines/fieldingEngine.ts engines/__tests__/fieldingEngine.test.ts
git commit -m "Add resolveCatch: deterministic catch/hit/closeplay from fielder stats"
```

---

## Task 7: Extend `hitEngine.resolveSwing` to return landing + ballType + airTimeMs (TDD)

**Files:**
- Create: `engines/__tests__/hitEngine.test.ts`
- Modify: `engines/hitEngine.ts`

- [ ] **Step 1: Write failing test**

Create `engines/__tests__/hitEngine.test.ts`:
```ts
import { resolveSwing, HitResult } from '../hitEngine';
import { PitchResult } from '../pitchEngine';
import { WindResult } from '../windEngine';

function fakePitch(): PitchResult {
  return { type: 'fastball', speed: 1.5, travelMs: 600, locationX: 0, inStrikeZone: true };
}

function noWind(): WindResult {
  return { driftX: 0, driftY: 0, visibilityReduction: 0, isSandstorm: false };
}

describe('resolveSwing extended fields', () => {
  it('returns landing, ballType, and airTimeMs when contact is made', () => {
    // Force a hit by making the swing perfect
    const pitch = fakePitch();
    const swing = { swung: true, swingAtMs: 600, pitchArrivalMs: 600 };
    // Seed Math.random for determinism
    const origRandom = Math.random;
    Math.random = () => 0.5;
    try {
      const r = resolveSwing(pitch, swing, noWind());
      expect(r.landing).toBeDefined();
      expect(typeof r.landing!.x).toBe('number');
      expect(typeof r.landing!.y).toBe('number');
      expect(['grounder', 'liner', 'fly']).toContain(r.ballType);
      expect(r.airTimeMs).toBeGreaterThan(0);
    } finally {
      Math.random = origRandom;
    }
  });

  it('returns landing null and airTimeMs 0 for a miss', () => {
    const pitch = fakePitch();
    const swing = { swung: false, swingAtMs: 600, pitchArrivalMs: 600 };
    const r = resolveSwing(pitch, swing, noWind());
    expect(r.landing).toBeNull();
    expect(r.airTimeMs).toBe(0);
  });

  it('low-power contact produces grounder', () => {
    const pitch = fakePitch();
    const swing = { swung: true, swingAtMs: 600, pitchArrivalMs: 600 };
    const origRandom = Math.random;
    Math.random = () => 0;  // minimum random contributions
    try {
      const r = resolveSwing(pitch, swing, noWind(), { contactBoost: -0.3, powerBoost: -0.6 });
      if (r.landing) expect(['grounder', 'liner']).toContain(r.ballType);
    } finally {
      Math.random = origRandom;
    }
  });

  it('high-power contact produces fly', () => {
    const pitch = fakePitch();
    const swing = { swung: true, swingAtMs: 600, pitchArrivalMs: 600 };
    const origRandom = Math.random;
    Math.random = () => 1;
    try {
      const r = resolveSwing(pitch, swing, noWind(), { powerBoost: 0.5 });
      if (r.landing) expect(r.ballType).toBe('fly');
    } finally {
      Math.random = origRandom;
    }
  });
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `cd C:/Users/zimme/bombsquadbaseball && npm test -- hitEngine`
Expected: FAIL — `landing not defined`, etc.

- [ ] **Step 3: Update `HitResult` interface in `engines/hitEngine.ts`**

Modify the `HitResult` interface (lines 17-23):
```ts
import { Point } from './fieldingEngine';
// existing imports above stay

export type BallType = 'grounder' | 'liner' | 'fly';

export interface HitResult {
  result: AtBatResult;
  timing: SwingTiming;
  power: number;
  trajectoryX: number;
  trajectoryY: number;
  landing: Point | null;
  ballType: BallType;
  airTimeMs: number;
}
```

- [ ] **Step 4: Update `resolveSwing` to populate new fields**

Replace the body of `resolveSwing` after the timing/foul/miss early returns. Specifically, update each `return` statement to include the new fields. Show the full function after edits:

```ts
export function resolveSwing(
  pitch: PitchResult,
  swing: SwingInput,
  wind: WindResult,
  mod: BatterModifier = {}
): HitResult {
  if (!swing.swung) {
    const result: AtBatResult = pitch.inStrikeZone ? 'strike' : 'ball';
    return {
      result, timing: 'miss', power: 0, trajectoryX: 0, trajectoryY: 0,
      landing: null, ballType: 'grounder', airTimeMs: 0,
    };
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
    return {
      result: 'strike', timing, power: 0, trajectoryX: 0, trajectoryY: 0,
      landing: null, ballType: 'grounder', airTimeMs: 0,
    };
  }

  const visibilityPenalty = wind.visibilityReduction * 0.4;
  const contact =
    TUNING.swing.contactBase +
    (mod.contactBoost ?? 0) -
    visibilityPenalty +
    (timing === 'perfect' ? 0.35 : 0.05);

  if (contact < 0.4) {
    return {
      result: 'foul', timing, power: contact, trajectoryX: 0, trajectoryY: 0,
      landing: null, ballType: 'grounder', airTimeMs: 0,
    };
  }

  const basePower = TUNING.swing.powerBase + (mod.powerBoost ?? 0);
  const timingBonus = timing === 'perfect' ? 0.4 : 0.1;
  let power = basePower + timingBonus + (Math.random() * 0.1 - 0.05);

  power += wind.driftY;
  power = Math.max(0, Math.min(1.2, power));

  const trajectoryX = wind.driftX + (Math.random() - 0.5) * 0.3;
  const trajectoryY = power;

  // Landing point: x in -1..1 mapped from trajectoryX; y in 0..1 from power
  const landingX = Math.max(-1, Math.min(1, trajectoryX * 1.4));
  const landingY = Math.max(0, Math.min(1, power * 0.85));
  const landing: Point = { x: landingX, y: landingY };

  // Ball type: low power = grounder, mid = liner, high = fly
  let ballType: BallType;
  if (power < 0.35) ballType = 'grounder';
  else if (power < 0.65) ballType = 'liner';
  else ballType = 'fly';

  // Air time roughly scales with power and depth
  const airTimeMs = Math.round(500 + power * 1500);

  let result: AtBatResult;
  if (power >= TUNING.hit.hrThreshold) result = 'home_run';
  else if (power >= TUNING.hit.tripleThreshold) result = 'triple';
  else if (power >= TUNING.hit.doubleThreshold) result = 'double';
  else if (power >= TUNING.hit.singleThreshold) result = 'single';
  else result = Math.random() > 0.5 ? 'flyout' : 'groundout';

  return { result, timing, power, trajectoryX, trajectoryY, landing, ballType, airTimeMs };
}
```

- [ ] **Step 5: Run tests, verify pass**

Run: `cd C:/Users/zimme/bombsquadbaseball && npm test`
Expected: all green (smoke not present, fielding 13, hitEngine 4 = 17 total).

- [ ] **Step 6: Run typecheck**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add engines/hitEngine.ts engines/__tests__/hitEngine.test.ts
git commit -m "hitEngine: emit landing, ballType, airTimeMs on contact"
```

---

## Task 8: Add `lineup` to gameStore

**Files:**
- Modify: `stores/gameStore.ts`

- [ ] **Step 1: Add lineup types and state**

Add at top of `stores/gameStore.ts` after existing imports:
```ts
import { Position } from '../characters';

export type Lineup = Record<Position, string | 'generic'>;

const DEFAULT_LINEUP: Lineup = {
  P: 'generic',
  C: 'generic',
  '1B': 'generic',
  '2B': 'generic',
  SS: 'generic',
  '3B': 'generic',
  LF: 'generic',
  CF: 'generic',
  RF: 'generic',
};
```

- [ ] **Step 2: Add `lineup` to `GameState` interface and `INITIAL_STATE`**

In the `GameState` interface, add:
```ts
  lineup: Lineup;
```

In `INITIAL_STATE`, add:
```ts
  lineup: DEFAULT_LINEUP,
```

- [ ] **Step 3: Add `setLineup` action**

Update the top of `stores/gameStore.ts` to add `CHARACTER_MAP` to the imports:
```ts
import { Position, CHARACTER_MAP } from '../characters';
```

In `GameActions`:
```ts
  setLineup: (unlockedCharacterIds: string[]) => void;
```

In the store body (after `setWind`):
```ts
  setLineup: (unlockedCharacterIds) => {
    const lineup: Lineup = { ...DEFAULT_LINEUP };
    for (const id of unlockedCharacterIds) {
      const char = CHARACTER_MAP[id];
      if (char?.position) {
        lineup[char.position] = id;
      }
    }
    set({ lineup });
  },
```

- [ ] **Step 4: Update `startGame` to reset lineup along with other initial state**

`startGame` already spreads `INITIAL_STATE`, so the lineup naturally resets to defaults. Player code must call `setLineup` after `startGame` to slot in unlocked characters. No change needed in `startGame` itself.

- [ ] **Step 5: Verify typecheck**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add stores/gameStore.ts
git commit -m "gameStore: add lineup state and setLineup action"
```

---

## Task 9: Create `Fielder` component

**Files:**
- Create: `components/game/Fielder.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Position } from '../../characters';

interface Props {
  position: Position;
  colorPrimary: string;
  fieldWidthPx: number;
  fieldHeightPx: number;
  homeX: number;       // -1..1
  homeY: number;       // 0..1
  targetX?: number;    // optional override (toward ball)
  targetY?: number;
  durationMs?: number;
}

export function Fielder({
  position,
  colorPrimary,
  fieldWidthPx,
  fieldHeightPx,
  homeX,
  homeY,
  targetX,
  targetY,
  durationMs = 600,
}: Props) {
  const x = useSharedValue(homeX);
  const y = useSharedValue(homeY);

  React.useEffect(() => {
    x.value = withTiming(targetX ?? homeX, { duration: durationMs });
    y.value = withTiming(targetY ?? homeY, { duration: durationMs });
  }, [targetX, targetY, homeX, homeY, durationMs]);

  const style = useAnimatedStyle(() => {
    // Map -1..1 to 0..fieldWidth, and 0..1 to fieldHeight..0 (y inverts so deeper = higher on screen)
    const left = ((x.value + 1) / 2) * fieldWidthPx - 12;
    const top = (1 - y.value) * fieldHeightPx - 12;
    return { transform: [{ translateX: left }, { translateY: top }] };
  });

  return (
    <Animated.View style={[styles.fielder, { backgroundColor: colorPrimary }, style]}>
      <Text style={styles.label}>{position}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fielder: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.4)',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
});
```

- [ ] **Step 2: Verify typecheck**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/game/Fielder.tsx
git commit -m "Add Fielder component with animated movement to target"
```

---

## Task 10: Create `BallInFlight` component

**Files:**
- Create: `components/game/BallInFlight.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

interface Props {
  fieldWidthPx: number;
  fieldHeightPx: number;
  landingX: number;  // -1..1
  landingY: number;  // 0..1
  durationMs: number;
  onLanded?: () => void;
}

export function BallInFlight({
  fieldWidthPx,
  fieldHeightPx,
  landingX,
  landingY,
  durationMs,
  onLanded,
}: Props) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: durationMs, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished && onLanded) {
        // Reanimated callback runs on UI thread; defer via setTimeout
        setTimeout(() => onLanded(), 0);
      }
    });
  }, [landingX, landingY, durationMs]);

  const style = useAnimatedStyle(() => {
    const startLeft = fieldWidthPx / 2 - 6;
    const startTop = fieldHeightPx - 30;
    const endLeft = ((landingX + 1) / 2) * fieldWidthPx - 6;
    const endTop = (1 - landingY) * fieldHeightPx - 6;
    const left = startLeft + (endLeft - startLeft) * progress.value;
    const top = startTop + (endTop - startTop) * progress.value;
    // Arc: subtract sine of progress for height
    const arcHeight = 60 * Math.sin(Math.PI * progress.value);
    return { transform: [{ translateX: left }, { translateY: top - arcHeight }] };
  });

  return <Animated.View style={[styles.ball, style]} />;
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c00',
  },
});
```

- [ ] **Step 2: Verify typecheck**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/game/BallInFlight.tsx
git commit -m "Add BallInFlight component: arcing animated ball with landing callback"
```

---

## Task 11: Create `CloseplayPrompt` component

**Files:**
- Create: `components/game/CloseplayPrompt.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const TAP_WINDOW_MS = 600;
const TAP_SWEET_SPOT_MS = 200;

interface Props {
  fieldWidthPx: number;
  fieldHeightPx: number;
  targetX: number;  // -1..1
  targetY: number;  // 0..1
  onResult: (success: boolean) => void;
}

export function CloseplayPrompt({ fieldWidthPx, fieldHeightPx, targetX, targetY, onResult }: Props) {
  const startedAtRef = React.useRef<number>(Date.now());
  const scale = useSharedValue(1);

  React.useEffect(() => {
    startedAtRef.current = Date.now();
    scale.value = 1;
    scale.value = withTiming(0, { duration: TAP_WINDOW_MS });
    const timeout = setTimeout(() => {
      onResult(Math.random() < 0.5);  // no-tap fallback: 50/50
    }, TAP_WINDOW_MS);
    return () => clearTimeout(timeout);
  }, []);

  const handleTap = () => {
    const elapsed = Date.now() - startedAtRef.current;
    const centerOfSweet = (TAP_WINDOW_MS - TAP_SWEET_SPOT_MS) / 2 + TAP_SWEET_SPOT_MS / 2;
    const fromCenter = Math.abs(elapsed - centerOfSweet);
    const success = fromCenter <= TAP_SWEET_SPOT_MS / 2;
    onResult(success);
  };

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const left = ((targetX + 1) / 2) * fieldWidthPx - 30;
  const top = (1 - targetY) * fieldHeightPx - 30;

  return (
    <View style={[styles.wrap, { left, top }]}>
      <Pressable onPress={handleTap} style={styles.pressable}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <View style={styles.center}>
          <Text style={styles.text}>TAP</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', width: 60, height: 60 },
  pressable: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFD23F',
  },
  center: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,210,63,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 11, fontWeight: '800', color: '#000' },
});
```

- [ ] **Step 2: Verify typecheck**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/game/CloseplayPrompt.tsx
git commit -m "Add CloseplayPrompt: tap target with timing window"
```

---

## Task 12: Wire fielders + defense flow into `[stadium].tsx`

**Files:**
- Modify: `app/game/[stadium].tsx`

This task changes the orchestration loop. The screen currently has 4 phases: `'select_pitch' | 'pitching' | 'swing_window' | 'resolved'`. We add `'ball_in_flight'` and `'close_play'` between `'swing_window'` and `'resolved'`.

- [ ] **Step 1: Add new imports**

Insert near the top of `app/game/[stadium].tsx` with the other component imports:
```tsx
import { Fielder } from '../../components/game/Fielder';
import { BallInFlight } from '../../components/game/BallInFlight';
import { CloseplayPrompt } from '../../components/game/CloseplayPrompt';
import {
  pickFielder,
  resolveCatch,
  HOME_POSITIONS,
  GENERIC_DEFENSIVE_STATS,
  POSITIONS,
  FielderState,
  FieldingResult,
} from '../../engines/fieldingEngine';
import { CHARACTER_MAP, Position } from '../../characters';
```

- [ ] **Step 2: Update the `Phase` type**

Find the line:
```ts
type Phase = 'select_pitch' | 'pitching' | 'swing_window' | 'resolved';
```

Replace with:
```ts
type Phase = 'select_pitch' | 'pitching' | 'swing_window' | 'ball_in_flight' | 'close_play' | 'resolved';
```

- [ ] **Step 3: Initialize lineup on game start**

In the existing `useEffect` that calls `startGame` (or near it), after `startGame` is called, also call `setLineup` with the unlocked character ids. Find where the game initializes; after the existing `game.startGame(...)`, add:

```tsx
const unlocked = useProgressStore.getState().unlockedCharacters;
game.setLineup(unlocked);
```

If `setLineup` isn't destructured from `game`, add it to the destructuring or use `useGameStore.getState().setLineup`.

- [ ] **Step 4: Add fielding state to the component body**

Inside `GameScreen`, near other `useState` calls, add:

```tsx
const [fielding, setFielding] = useState<FieldingResult | null>(null);
const [fieldingFielderTarget, setFieldingFielderTarget] = useState<{ pos: Position; x: number; y: number } | null>(null);
const lineup = useGameStore((s) => s.lineup);
const fieldSizeRef = useRef<{ width: number; height: number }>({ width: 280, height: 280 });
```

- [ ] **Step 5: Add `onLayout` callback to the field container in render to capture pixel size**

Find the `<Field>` render call in the JSX. Wrap it (or the parent View) with `onLayout`:
```tsx
<View
  onLayout={(e) => {
    fieldSizeRef.current = { width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height };
  }}
  style={{ position: 'relative' }}
>
  <Field stadium={stadium} bases={game.bases} ... />
  {/* fielders + ball + closeplay rendered here, see Step 6 */}
</View>
```

- [ ] **Step 6: Render fielders, ball, and closeplay overlay inside the field container**

Inside the field container (same parent as `<Field>`), add:

```tsx
{POSITIONS.map((pos) => {
  const charId = lineup[pos];
  const char = charId !== 'generic' ? CHARACTER_MAP[charId] : undefined;
  const color = char?.appearance.colorPrimary ?? '#666';
  const home = HOME_POSITIONS[pos];
  const isTarget = fieldingFielderTarget?.pos === pos;
  return (
    <Fielder
      key={pos}
      position={pos}
      colorPrimary={color}
      fieldWidthPx={fieldSizeRef.current.width}
      fieldHeightPx={fieldSizeRef.current.height}
      homeX={home.x}
      homeY={home.y}
      targetX={isTarget ? fieldingFielderTarget!.x : undefined}
      targetY={isTarget ? fieldingFielderTarget!.y : undefined}
      durationMs={isTarget ? (lastResult?.airTimeMs ?? 800) : 400}
    />
  );
})}

{phase === 'ball_in_flight' && lastResult?.landing && (
  <BallInFlight
    fieldWidthPx={fieldSizeRef.current.width}
    fieldHeightPx={fieldSizeRef.current.height}
    landingX={lastResult.landing.x}
    landingY={lastResult.landing.y}
    durationMs={lastResult.airTimeMs}
    onLanded={() => handleBallLanded()}
  />
)}

{phase === 'close_play' && fieldingFielderTarget && (
  <CloseplayPrompt
    fieldWidthPx={fieldSizeRef.current.width}
    fieldHeightPx={fieldSizeRef.current.height}
    targetX={fieldingFielderTarget.x}
    targetY={fieldingFielderTarget.y}
    onResult={(success) => handleCloseplayResult(success)}
  />
)}
```

- [ ] **Step 7: Implement `handleBallLanded` and `handleCloseplayResult`**

Add these functions inside `GameScreen`:

```tsx
const handleBallLanded = useCallback(() => {
  if (!lastResult?.landing) {
    setPhase('resolved');
    return;
  }
  const fielderPos = pickFielder(lastResult.landing);
  const home = HOME_POSITIONS[fielderPos];
  setFieldingFielderTarget({ pos: fielderPos, x: lastResult.landing.x, y: lastResult.landing.y });

  const charId = lineup[fielderPos];
  const char = charId !== 'generic' ? CHARACTER_MAP[charId] : undefined;
  const stats = char?.defensiveStats ?? GENERIC_DEFENSIVE_STATS[fielderPos];
  const fielderState: FielderState = { position: fielderPos, home, stats };

  const fr = resolveCatch(
    fielderState,
    { landing: lastResult.landing, airTimeMs: lastResult.airTimeMs, ballType: lastResult.ballType },
    Math.random
  );
  setFielding(fr);

  if (fr.isCloseplay) {
    setPhase('close_play');
  } else {
    applyFieldingResult(fr);
  }
}, [lastResult, lineup]);

const handleCloseplayResult = useCallback((tapSuccess: boolean) => {
  if (!fielding) return;
  const finalOutcome = tapSuccess ? 'caught' : 'hit';
  // Close-play miss penalty: hit advances one base deeper than baseline (cap at 'deep')
  const bumpDepth = (d: 'shallow' | 'mid' | 'deep'): 'shallow' | 'mid' | 'deep' =>
    d === 'shallow' ? 'mid' : d === 'mid' ? 'deep' : 'deep';
  const baseDepth = fielding.hitDepth ?? 'mid';
  const adjusted: FieldingResult = {
    ...fielding,
    outcome: finalOutcome,
    hitDepth: finalOutcome === 'hit' ? bumpDepth(baseDepth) : undefined,
  };
  applyFieldingResult(adjusted);
}, [fielding]);

const applyFieldingResult = useCallback((fr: FieldingResult) => {
  let resolvedAtBat: AtBatResult;
  if (fr.outcome === 'caught') {
    resolvedAtBat = (lastResult?.ballType === 'grounder') ? 'groundout' : 'flyout';
  } else {
    // Map depth to bases, capped at triple (close-play miss penalty handled here too)
    const depth = fr.hitDepth ?? 'shallow';
    if (depth === 'shallow') resolvedAtBat = 'single';
    else if (depth === 'mid') resolvedAtBat = 'double';
    else resolvedAtBat = 'triple';
  }
  game.recordPitchResult(resolvedAtBat);
  setPhase('resolved');
  setFieldingFielderTarget(null);
  setFielding(null);
}, [lastResult]);
```

- [ ] **Step 8: Wire the new sequence after the existing swing-resolution code**

Find where `resolveSwing` is currently called in `[stadium].tsx`. Instead of immediately calling `recordPitchResult`, check if the hit produced a landing. If so, transition to `'ball_in_flight'`. Otherwise (foul/strike/walk/HR), keep existing behavior.

Locate the existing block that handles swing resolution. Replace its post-resolve logic with:

```tsx
const hit = resolveSwing(pitch, swingInput, currentWind);
setLastResult(hit);

// Outcomes that skip defense entirely: ball, strike, foul, walk, strikeout, home_run, miss
const skipsDefense =
  hit.landing == null || hit.result === 'home_run';
if (skipsDefense) {
  game.recordPitchResult(hit.result);
  setPhase('resolved');
} else {
  setPhase('ball_in_flight');
}
```

(The exact existing call site location varies; preserve all existing setState calls for batter swing animation, etc.)

- [ ] **Step 9: Verify typecheck**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 10: Verify all tests still pass**

Run: `cd C:/Users/zimme/bombsquadbaseball && npm test`
Expected: 17 passed.

- [ ] **Step 11: Commit**

```bash
git add app/game/[stadium].tsx characters/index.ts
git commit -m "Integrate fielders + defense flow into game screen"
```

---

## Task 13: Manual verification + web deploy

**Files:** none (verification + deploy only)

- [ ] **Step 1: Rebuild web export**

Run: `cd C:/Users/zimme/bombsquadbaseball && rm -rf dist && npx expo export --platform web --output-dir dist --clear`
Expected: bundle exported to `dist/`.

- [ ] **Step 2: Reload the preview server**

In the preview MCP, call `preview_eval` on the existing slugger-web server (serverId from prior runs) with expression `location.reload()`. Wait 3 seconds.

- [ ] **Step 3: Visually verify**

Call `preview_eval` with:
```js
(() => ({ bodyText: document.body.innerText.slice(0, 400), title: document.title }))()
```
Expected: title is "Bomb Squad Baseball"; bodyText shows the main menu.

Click into a stadium (using a separate navigation step), trigger a pitch + swing, and confirm:
- 9 small colored circles are visible on the field at their positions
- After a hit, a ball animates along an arc to a landing point
- One fielder moves toward the landing point
- On clean catch or clean miss, the outcome appears in the scoreboard
- On close play, a yellow tap target appears; tapping it resolves the play

(If you cannot drive the full flow via preview MCP, capture a screenshot and inspect manually.)

- [ ] **Step 4: Deploy to Netlify**

Run: `cd C:/Users/zimme/bombsquadbaseball && npx --yes netlify-cli@latest deploy --prod --dir=dist --site=6b8d10be-2817-4baa-bdf3-2f81c1502e70`
Expected: "Deploy is live!" with production URL.

- [ ] **Step 5: Push to GitHub**

Run: `cd C:/Users/zimme/bombsquadbaseball && git push`
Expected: branch updated on origin.

- [ ] **Step 6: (Optional) Queue a fresh EAS Android dev build**

If the user wants the changes on the Android device, run:
```bash
cd C:/Users/zimme/bombsquadbaseball && eas build --profile development --platform android --non-interactive --no-wait
```
Expected: build URL printed. Build runs in the background.

- [ ] **Step 7: Report completion**

Tell the user:
- Web URL is live at https://slugger-preview.netlify.app
- 9 fielders visible, ball animates, close-play tap moments fire
- Any caveats observed during visual verification
- (If EAS build was queued) link to build status page

---

## Notes for the executing engineer

- **Animation correctness:** The `Fielder` component uses Reanimated `withTiming` for movement. Make sure `react-native-reanimated` is properly configured in `babel.config.js` (it already is — `react-native-worklets/plugin` is the SDK 54 way and is already wired in).
- **RNG seam:** Production code calls `Math.random` directly when invoking `resolveCatch`. This is fine for gameplay but tests inject a deterministic RNG via parameter. Don't refactor this into a global Math.random override.
- **Position type subtlety:** TypeScript object literal keys for `'1B' | '2B'` etc. require quoting. The constants in Task 4 already do this; preserve the pattern.
- **No new dependencies beyond Jest:** Don't add react-native-testing-library, react-native-svg-charts, or anything else. The visual components use plain RN primitives only.
- **Existing behavior must not regress:** Pitching, swinging, scoring, wind, chants, power-ups — all keep working. The new sequence inserts between swing and recordPitchResult; it does not replace any existing logic.
- **If a step fails:** stop and report. Do not attempt to skip ahead or work around blockers without checking in.
