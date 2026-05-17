import { StadiumConfig } from './index';

export const mountainStadium: StadiumConfig = {
  id: 'mountain',
  name: 'Mountain Monsters',
  description: 'Thin air. Balls fly further. Pitchers beware.',
  palette: { sky: '#A0C4FF', grass: '#4A7C59', dirt: '#7A5C3E', walls: '#3A506B' },
  quirk: {
    type: 'altitude_boost',
    config: { distanceMultiplier: 1.18 },
  },
  ambientSound: 'assets/sounds/ambient/mountain_wind.mp3',
  crowdChants: {},
  unlockCharacter: 'summit',
  unlockCondition: { type: 'wins_at_stadium', stadiumId: 'mountain', count: 3 },
  status: 'coming_soon',
};
