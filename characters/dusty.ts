import { Character } from './index';

export const dusty: Character = {
  id: 'dusty',
  name: 'Dusty',
  role: 'pitcher',
  unlockCondition: {
    type: 'wins_at_stadium',
    stadiumId: 'sandstorm',
    count: 3,
  },
  specialAbility: {
    id: 'sand_spray',
    name: 'Sand Spray',
    description: 'Fastball has a late sand visual effect — harder to read at the plate.',
    effect: 'reduce_batter_reaction_window',
    modifier: 0.08,
  },
  appearance: {
    face: 'squinting_eyes_only_visible',
    mask: 'bandana_across_nose_mouth',
    glove: 'worn_leather_cracked_dusty',
    cleats: 'orange_sand_caked',
    jersey: 'faded_sun_worn',
    colorPrimary: '#D4A96A',
    colorSecondary: '#8B6914',
  },
  position: 'P',
  defensiveStats: { range: 55, reactionMs: 220, armStrength: 70 },
};
