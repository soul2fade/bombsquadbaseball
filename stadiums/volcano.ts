import { StadiumConfig } from './index';

export const volcanoStadium: StadiumConfig = {
  id: 'volcano',
  name: 'Volcano Diamond',
  description: 'Eruption imminent. Better hit fast.',
  palette: { sky: '#3D0000', grass: '#3F2511', dirt: '#6B2D1A', walls: '#950101' },
  quirk: {
    type: 'eruption_warning',
    config: { eruptionInning: 7, eruptionSpeedBoost: 0.2 },
  },
  ambientSound: 'assets/sounds/ambient/volcano_rumble.mp3',
  crowdChants: {},
  unlockCharacter: 'ember',
  unlockCondition: { type: 'wins_at_stadium', stadiumId: 'volcano', count: 3 },
  status: 'coming_soon',
};
