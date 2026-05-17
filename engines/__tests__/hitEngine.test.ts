import { resolveSwing } from '../hitEngine';
import { PitchResult } from '../pitchEngine';
import { WindResult } from '../windEngine';

function fakePitch(): PitchResult {
  return { type: 'fastball', speed: 1.5, travelMs: 600, locationX: 0, inStrikeZone: true };
}

function noWind(): WindResult {
  return { state: 'calm', intensity: 0, driftX: 0, driftY: 0, visibilityReduction: 0 };
}

describe('resolveSwing extended fields', () => {
  it('returns landing, ballType, and airTimeMs when contact is made', () => {
    const pitch = fakePitch();
    const swing = { swung: true, swingAtMs: 600, pitchArrivalMs: 600 };
    const origRandom = Math.random;
    Math.random = () => 0.5;
    try {
      const r = resolveSwing(pitch, swing, noWind());
      expect(r.landing).toBeDefined();
      expect(r.landing).not.toBeNull();
      expect(typeof r.landing!.x).toBe('number');
      expect(typeof r.landing!.y).toBe('number');
      expect(['grounder', 'liner', 'fly']).toContain(r.ballType);
      expect(r.airTimeMs).toBeGreaterThan(0);
    } finally {
      Math.random = origRandom;
    }
  });

  it('returns landing null and airTimeMs 0 for a miss (no swing)', () => {
    const pitch = fakePitch();
    const swing = { swung: false, swingAtMs: 600, pitchArrivalMs: 600 };
    const r = resolveSwing(pitch, swing, noWind());
    expect(r.landing).toBeNull();
    expect(r.airTimeMs).toBe(0);
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
