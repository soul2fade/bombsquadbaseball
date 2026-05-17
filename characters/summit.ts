import { Character } from './index';

export const summit: Character = {
  id: 'summit',
  name: 'Summit',
  role: 'batter',
  unlockCondition: {
    type: 'wins_at_stadium',
    stadiumId: 'mountain',
    count: 3,
  },
  specialAbility: {
    id: 'thin_air_drive',
    name: 'Thin Air Drive',
    description: 'Flyballs carry further at altitude — extra distance on every solid hit.',
    effect: 'power_boost',
    modifier: 0.1,
  },
  appearance: {
    face: 'sunburned_cheeks_goggle_tan',
    glove: 'fleece_lined_brown',
    cleats: 'snow_crusted',
    jersey: 'alpine_blue_with_peaks',
    colorPrimary: '#3A506B',
    colorSecondary: '#A0C4FF',
  },
  position: '3B',
  defensiveStats: { range: 62, reactionMs: 200, armStrength: 85 },
};
