import { ChantSet } from '../engines/chantEngine';
import { StadiumConfig } from './index';

export const mountainChants: ChantSet = {
  home_run: { text: 'THIN AIR — KISSES THE SKY!', style: 'roar', customizable: true },
  strikeout: { text: 'Got him at altitude!', style: 'shout', customizable: true },
};

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
  crowdChants: mountainChants,
  unlockCharacter: 'summit',
  unlockCondition: { type: 'wins_at_stadium', stadiumId: 'mountain', count: 3 },
  status: 'live',
};
