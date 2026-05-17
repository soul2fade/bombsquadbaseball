import { StadiumConfig } from './index';

export const nightgameStadium: StadiumConfig = {
  id: 'nightgame',
  name: 'Night Game Arena',
  description: 'The lights flicker. Anything can happen in the dark.',
  palette: { sky: '#0B132B', grass: '#1C3B2A', dirt: '#3A2E1E', walls: '#1B263B' },
  quirk: {
    type: 'lights_flicker',
    config: { flickerChancePerPitch: 0.08, flickerDurationMs: 1200 },
  },
  ambientSound: 'assets/sounds/ambient/night_crickets.mp3',
  crowdChants: {},
  unlockCharacter: 'shadow',
  unlockCondition: { type: 'wins_at_stadium', stadiumId: 'nightgame', count: 3 },
  status: 'coming_soon',
};
