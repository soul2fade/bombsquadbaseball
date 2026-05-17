import { Character } from './index';

export const shadow: Character = {
  id: 'shadow',
  name: 'Shadow',
  role: 'pitcher',
  unlockCondition: {
    type: 'wins_at_stadium',
    stadiumId: 'nightgame',
    count: 3,
  },
  specialAbility: {
    id: 'blackout_slider',
    name: 'Blackout Slider',
    description: 'Sliders briefly dim the field as they reach the plate — late break, late read.',
    effect: 'reduce_batter_reaction_window',
    modifier: 0.1,
  },
  appearance: {
    face: 'hood_pulled_low_eyes_glow',
    glove: 'matte_black_unmarked',
    cleats: 'obsidian_black',
    jersey: 'dark_navy_no_number',
    colorPrimary: '#1B263B',
    colorSecondary: '#5DA9E9',
  },
  position: 'CF',
  defensiveStats: { range: 78, reactionMs: 160, armStrength: 75 },
};
