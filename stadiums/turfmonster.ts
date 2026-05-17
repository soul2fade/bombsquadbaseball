import { StadiumConfig } from './index';

export const turfmonsterStadium: StadiumConfig = {
  id: 'turfmonster',
  name: 'Turf Monster',
  description: 'Bouncy artificial turf turns grounders into wild hops.',
  palette: { sky: '#5DA9E9', grass: '#39E75F', dirt: '#9B6A3F', walls: '#283044' },
  quirk: {
    type: 'turf_bounce',
    config: { bounceMultiplier: 1.6, bounceChance: 0.45 },
  },
  ambientSound: 'assets/sounds/ambient/stadium_default.mp3',
  crowdChants: {},
  unlockCharacter: 'spring',
  unlockCondition: { type: 'wins_at_stadium', stadiumId: 'turfmonster', count: 3 },
  status: 'coming_soon',
};
