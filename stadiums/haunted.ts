import { ChantSet } from '../engines/chantEngine';
import { StadiumConfig } from './index';

export const hauntedChants: ChantSet = {
  ghost_catch: { text: 'A GHOST CAUGHT IT!', style: 'moan', customizable: true },
  home_run: { text: 'THROUGH THE PHANTOMS!', style: 'roar', customizable: true },
  strikeout: { text: 'Spooked at the plate!', style: 'shout', customizable: true },
};

export const hauntedStadium: StadiumConfig = {
  id: 'haunted',
  name: 'Haunted Ballpark',
  description: 'A ghost fielder appears at random. Did you see that?',
  palette: { sky: '#1A1A2E', grass: '#16213E', dirt: '#0F3460', walls: '#533483' },
  quirk: {
    type: 'ghost_fielder',
    config: { appearanceChance: 0.12 },
  },
  ambientSound: 'assets/sounds/ambient/haunted_whispers.mp3',
  crowdChants: hauntedChants,
  unlockCharacter: 'phantom',
  unlockCondition: { type: 'wins_at_stadium', stadiumId: 'haunted', count: 3 },
  status: 'live',
};
