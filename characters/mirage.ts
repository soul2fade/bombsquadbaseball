import { Character } from './index';

export const mirage: Character = {
  id: 'mirage',
  name: 'Mirage',
  role: 'utility',
  team: 'dust_devils',
  unlockCondition: {
    type: 'home_runs',
    count: 10,
  },
  specialAbility: {
    id: 'vanishing_steal',
    name: 'Vanishing Steal',
    description: 'In low visibility, runners take an extra base — fielders can\'t see through the dust.',
    effect: 'baserunning_in_low_visibility',
    modifier: 1,
  },
  appearance: {
    face: 'small_sharp_grin_dust_streaks',
    mask: 'flowing_tan_scarf_over_nose',
    glove: 'thin_brown_speed_glove',
    cleats: 'low_cut_sand_runners',
    jersey: 'sleeveless_tan_with_lightning_stripe',
    colorPrimary: '#D4A96A',
    colorSecondary: '#E8A87C',
  },
};
