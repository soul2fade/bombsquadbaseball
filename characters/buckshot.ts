import { Character } from './index';

export const buckshot: Character = {
  id: 'buckshot',
  name: 'Buckshot',
  role: 'batter',
  team: 'dust_devils',
  unlockCondition: {
    type: 'wins_at_stadium',
    stadiumId: 'sandstorm',
    count: 6,
  },
  specialAbility: {
    id: 'tumbleweed_drive',
    name: 'Tumbleweed Drive',
    description: 'Line drives bounce hard through the infield — singles roll into doubles when the wind is up.',
    effect: 'extra_base_in_wind',
    modifier: 0.2,
  },
  appearance: {
    face: 'grizzled_squint_one_eye_closed',
    mask: 'red_bandana_neck',
    glove: 'cracked_leather_studded',
    cleats: 'pointed_boot_spurs',
    jersey: 'pinstripe_brown_torn_sleeves',
    colorPrimary: '#8B6914',
    colorSecondary: '#D62828',
  },
};
