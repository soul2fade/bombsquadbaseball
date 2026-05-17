import { Character } from './index';

export const phantom: Character = {
  id: 'phantom',
  name: 'Phantom',
  role: 'utility',
  unlockCondition: {
    type: 'wins_at_stadium',
    stadiumId: 'haunted',
    count: 3,
  },
  specialAbility: {
    id: 'ghost_assist',
    name: 'Ghost Assist',
    description: 'The ghost fielder shows up more often when you need an out.',
    effect: 'fielding_bonus',
    modifier: 0.1,
  },
  appearance: {
    face: 'translucent_pale_hollow_eyes',
    glove: 'spectral_white',
    cleats: 'floating_no_contact',
    jersey: 'tattered_purple_glow',
    colorPrimary: '#533483',
    colorSecondary: '#16213E',
  },
};
