import { ChantSet } from '../engines/chantEngine';
import { StadiumConfig } from './index';

export const demolitionChants: ChantSet = {
  home_run: { text: 'BOOM! GOODBYE!', style: 'roar', customizable: true },
  strikeout: { text: 'Even short walls cannot save you!', style: 'shout', customizable: true },
};

export const demolitionStadium: StadiumConfig = {
  id: 'demolition',
  name: 'Homerun Demolition',
  description: 'Short walls. Easy bombs. Defense optional.',
  palette: { sky: '#FFB703', grass: '#588157', dirt: '#A47148', walls: '#D62828' },
  quirk: {
    type: 'short_walls',
    config: { wallDistanceModifier: 0.75 },
  },
  ambientSound: 'assets/sounds/ambient/stadium_default.mp3',
  crowdChants: demolitionChants,
  unlockCharacter: 'wrecker',
  unlockCondition: { type: 'wins_at_stadium', stadiumId: 'demolition', count: 3 },
  status: 'live',
};
