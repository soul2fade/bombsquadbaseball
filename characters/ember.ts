import { Character } from './index';

export const ember: Character = {
  id: 'ember',
  name: 'Ember',
  role: 'pitcher',
  unlockCondition: {
    type: 'wins_at_stadium',
    stadiumId: 'volcano',
    count: 3,
  },
  specialAbility: {
    id: 'molten_fastball',
    name: 'Molten Fastball',
    description: 'Fastballs heat up after the eruption warning — extra velocity late in games.',
    effect: 'pitch_speed_boost',
    modifier: 0.12,
  },
  appearance: {
    face: 'embers_in_hair_glowing_eyes',
    glove: 'charred_black_leather',
    cleats: 'lava_crusted',
    jersey: 'crimson_with_flame_trim',
    colorPrimary: '#950101',
    colorSecondary: '#FFB703',
  },
  position: 'RF',
  defensiveStats: { range: 70, reactionMs: 180, armStrength: 82 },
};
