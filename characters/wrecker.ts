import { Character } from './index';

export const wrecker: Character = {
  id: 'wrecker',
  name: 'Wrecker',
  role: 'batter',
  unlockCondition: {
    type: 'wins_at_stadium',
    stadiumId: 'demolition',
    count: 3,
  },
  specialAbility: {
    id: 'wrecking_swing',
    name: 'Wrecking Swing',
    description: 'Power swings get a bonus when the walls are short — bombs come easier.',
    effect: 'power_boost',
    modifier: 0.12,
  },
  appearance: {
    face: 'grinning_chin_scar',
    glove: 'studded_leather',
    cleats: 'steel_toed',
    jersey: 'torn_sleeves_red_stripes',
    colorPrimary: '#D62828',
    colorSecondary: '#FFB703',
  },
  position: '1B',
  defensiveStats: { range: 48, reactionMs: 280, armStrength: 65 },
};
