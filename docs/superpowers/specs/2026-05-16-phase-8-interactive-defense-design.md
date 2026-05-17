# Phase 8 — Interactive Defense

**Status:** Design approved, awaiting implementation plan
**Date:** 2026-05-16

## Problem

The game currently resolves at-bats with no visible defense. The field shows colored zones and base markers but no fielders. Hits resolve mathematically; the player sees a scoreboard tick but no spatial story for what just happened. This makes the game feel barren — "where are the players?" was the user's first reaction to the running build.

## Goals

- 9 fielders are visible on the field at their canonical positions
- Hits travel visibly to a landing point; the nearest fielder reacts
- Most plays auto-resolve (B3 hybrid model)
- Close plays trigger a quick-tap moment for the player to attempt the catch
- Unlocked characters appear at their designated position; remaining positions use generic backups
- No new art assets required (pure shape rendering)

## Non-Goals

- Sprite-based fielder art (Phase 9)
- Runner sprites animating between bases (Phase 10)
- Throwing the ball to other bases after fielding (deferred)
- Sound effects for catches/misses (Phase 11)
- Player-controlled defense for every play (rejected — B3 chosen over B2)
- Player-assigned lineup positions (rejected — E1 designated chosen over E2)

## Design

### Architecture

Three new files, one extension to an existing engine, one component-orchestration change in the game screen.

- **`engines/fieldingEngine.ts`** (new) — pure functions, no React, no side effects:
  - `pickFielder(landing: Point, lineup: Lineup): FielderId`
  - `resolveCatch(fielder: FielderState, ball: BallTrajectory, rng: () => number): FieldingResult`
- **`engines/hitEngine.ts`** (extend) — `resolveSwing` now also returns `landing: Point`, `ballType: 'grounder'|'liner'|'fly'`, and `airTimeMs: number`
- **`components/game/Fielder.tsx`** (new) — renders a single fielder as a colored circle with position label overlay
- **`components/game/BallInFlight.tsx`** (new) — Reanimated component, animates ball from home plate to landing point along an arc
- **`components/game/CloseplayPrompt.tsx`** (new) — pulsing overlay on the targeted fielder with a shrinking-timer ring; emits `onTap(timing)` and `onTimeout()`
- **`app/game/[stadium].tsx`** (extend) — orchestrates the new sequence between existing pitch/swing logic and the existing scoreboard/state update

No new store. Lineup state lives in the existing `stores/gameStore.ts`.

### Fielder positions and visualization

9 canonical baseball positions, mapped to normalized coordinates on the field where (0,0) is home plate and (0,1) is dead center field:

| Position | x | y | Notes |
|---|---|---|---|
| P (Pitcher) | 0 | 0.25 | Mound |
| C (Catcher) | 0 | -0.05 | Behind plate |
| 1B | 0.45 | 0.32 | Right side of infield |
| 2B | 0.20 | 0.42 | Right of second |
| SS | -0.20 | 0.42 | Left of second |
| 3B | -0.45 | 0.32 | Left side of infield |
| LF | -0.55 | 0.85 | Left field |
| CF | 0.00 | 0.95 | Deep center |
| RF | 0.55 | 0.85 | Right field |

Each fielder rendered as a 24px circle with the position abbreviation (P, C, 1B, etc.) as overlay text. Color sourced from `Character.appearance.colorPrimary` when an unlocked character is slotted; generic backups render as `#666` (mid-gray) with white label.

Fielders animate from their home position toward the ball's landing point during the play, then return to home. Movement uses Reanimated `withTiming` interpolation.

### Hit-to-defense flow

```
Batter swings
  └─> hitEngine.resolveSwing → HitResult { contact, landing, ballType, airTimeMs }
        ├─> If foul/whiff/strike: skip defense, existing flow
        └─> Else:
              ├─> BallInFlight animates from home plate → landing over airTimeMs
              ├─> fieldingEngine.pickFielder(landing, lineup) → fielderId
              ├─> Fielder animates from home position → landing
              │     speed = (range / 100) * BASE_SPEED_PX_PER_MS
              ├─> Compare arrival times:
              │     |fielderArrival - ballArrival| < 250ms → close play
              │     fielderArrival < ballArrival - 250ms   → clean catch (out)
              │     fielderArrival > ballArrival + 250ms   → clean miss (hit)
              ├─> If close play:
              │     pause animation ~600ms
              │     CloseplayPrompt renders on fielder
              │     onTap(timing) or onTimeout() resolves outcome
              ├─> Resolve outcome:
              │     caught → out, advance count
              │     hit → bases based on hitDepth (shallow=1B, mid=1B/2B, deep=2B/3B)
              └─> Existing runner/score update logic runs
```

### Quick-tap interaction

- **Total window:** 600ms after the prompt appears
- **Inner sweet spot:** 200ms (centered) — perfect tap = guaranteed catch regardless of base catch probability
- **Outer band:** 400ms — tap counts as success if the fielder's underlying catch probability was already ≥50%; otherwise miss
- **No tap (timeout):** 50/50 coin flip — engagement bonus discouraging zoning out
- **Miss penalty:** the hit advances one extra base versus the equivalent clean miss (single becomes double, etc.). Caps at triple — never converts into a home run

Visual: shrinking concentric ring on the targeted fielder. Inner ring marks the sweet spot. No haptics this phase — `expo-haptics` is not currently a dependency and adding it for one tap effect is not worth the dep weight. Revisit if/when haptics get added for other reasons (likely Phase 11 polish pass).

### Data shape changes

**`Character`** (in `characters/index.ts`) gains two optional fields:

```ts
interface Character {
  // ...existing fields
  position?: 'P' | 'C' | '1B' | '2B' | 'SS' | '3B' | 'LF' | 'CF' | 'RF';
  defensiveStats?: {
    range: number;        // 0-100, affects movement speed
    reactionMs: number;   // 0-500, lower = faster to start moving
    armStrength: number;  // 0-100, used in future throw-out phase, harmless now
  };
}
```

The 7 existing characters get reasonable defaults set in their data files. Dusty is already `role: 'pitcher'` → assigned `position: 'P'`. The other 6 get positions distributed across the field to maximize visible unlock impact.

**`HitResult`** (in `engines/hitEngine.ts`) gains:

```ts
interface HitResult {
  // ...existing fields
  landing: { x: number; y: number };  // x: -1..1 (left..right), y: 0..1 (shallow..deep)
  ballType: 'grounder' | 'liner' | 'fly';
  airTimeMs: number;                  // total time ball is in the air
}
```

**`FieldingResult`** (new, in `engines/fieldingEngine.ts`):

```ts
interface FieldingResult {
  outcome: 'caught' | 'hit';
  isCloseplay: boolean;
  fielderId: Position;
  hitDepth?: 'shallow' | 'mid' | 'deep';  // only when outcome === 'hit'
}
```

**`gameStore`** gains a `lineup` field, computed at game start from `progressStore.unlockedCharacters`:

```ts
type Lineup = Record<Position, CharacterId | 'generic'>;
// e.g. { P: 'dusty', C: 'generic', '1B': 'generic', '2B': 'spring', ... }
```

Generic backup defensive stats live as constants in `fieldingEngine.ts`. Position-typical values (e.g., shortstops get higher range than first basemen) so the team is balanced even with no unlocks.

### Tests

- **`engines/fieldingEngine.test.ts`**: pickFielder for hits landing in each of the 9 canonical zones; resolveCatch at varying fielder-to-landing distances; close-play threshold detection (±250ms edge cases); seeded RNG for deterministic catch outcomes
- **`engines/hitEngine.test.ts`** (extend): landing point derivation for various contact qualities, swing directions, and wind conditions; ballType classification (grounder/liner/fly) thresholds; airTimeMs ranges
- **Integration** (lightweight): scripted at-bat with seeded RNG verifying that a hit toward `{x: -0.4, y: 0.4}` is fielded by SS and produces the expected outcome

Repo has no test runner configured yet. Implementation plan will add **Jest + `jest-expo` preset** as part of this phase — zone math and threshold detection are exactly the kind of code where unit tests pay back the ~15 min of setup cost.

## Risks & mitigations

- **Risk:** Reanimated worklets misbehave on Android dev client. The Phase 7 era hit a worklets-related Gradle build failure (commit `96c8316`).
  **Mitigation:** Render fielder movement using `useSharedValue` + `withTiming`, following the same pattern the existing pitch/swing animation uses. If worklets misbehave, fall back to `Animated` from `react-native` (no worklet runtime required).
- **Risk:** 9 fielders rendering on a small phone screen become visually cluttered.
  **Mitigation:** 24px circles fit comfortably; if testing reveals crowding, label positioning can be removed (rely on color + position memory).
- **Risk:** Close-play tap moment feels punishing if it fires too often.
  **Mitigation:** ±250ms threshold tunable in `fieldingEngine.ts` constants. Plan will instrument logging during testing so we can confirm frequency is reasonable (~30% of in-play hits).

## What "done" looks like

- 9 visible fielders on the field at all times during a game
- Hits visibly travel to a landing point along an arc
- The correct fielder visibly moves to attempt the catch
- Close plays render a tap target; the user can tap and either succeed or fail
- Unlocked characters appear at their designated positions with their colors
- All new engine functions have unit tests; integration test verifies one full at-bat scenario
- App still builds for web (Netlify deploy) and Android (EAS dev build)
- No regression in existing pitch/swing/scoreboard behavior
