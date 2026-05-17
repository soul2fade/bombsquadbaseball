import { ChantSet } from '../engines/chantEngine';
import { StadiumConfig } from './index';

export const nightgameChants: ChantSet = {
  lights_flicker: { text: 'WHO TURNED OUT THE LIGHTS?', style: 'shout', customizable: true },
  strikeout: { text: 'Caught napping in the dark!', style: 'shout', customizable: true },
  home_run: { text: 'CRUSHED IT — UNDER THE LIGHTS!', style: 'roar', customizable: true },
};

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
  crowdChants: nightgameChants,
  unlockCharacter: 'shadow',
  unlockCondition: { type: 'wins_at_stadium', stadiumId: 'nightgame', count: 3 },
  status: 'live',
};
