import { pickFielder, Point } from '../fieldingEngine';

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
