import { Character } from './index';

export const spring: Character = {
  id: 'spring',
  name: 'Spring',
  role: 'fielder',
  unlockCondition: {
    type: 'wins_at_stadium',
    stadiumId: 'turfmonster',
    count: 3,
  },
  specialAbility: {
    id: 'bounce_reader',
    name: 'Bounce Reader',
    description: 'Reads bad hops before they land — turns turf bounces into outs more often.',
    effect: 'fielding_bonus',
    modifier: 0.15,
  },
  appearance: {
    face: 'wide_eyes_alert',
    glove: 'oversized_neon_green',
    cleats: 'spring_loaded_soles',
    jersey: 'lime_green_with_zigzag',
    colorPrimary: '#39E75F',
    colorSecondary: '#283044',
  },
};
