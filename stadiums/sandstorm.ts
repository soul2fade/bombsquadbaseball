import { ChantSet } from '../engines/chantEngine';
import { StadiumConfig } from './index';

export const sandstormChants: ChantSet = {
  sandstorm_trigger: { text: "You can't see it! You can't see it!", style: 'shout', customizable: true },
  sandstorm_hr_during_tailwind: { text: "The wind carried it — WE'LL TAKE IT!", style: 'roar', customizable: true },
  sandstorm_strikeout_in_storm: { text: 'Blinded by the sand!', style: 'shout', customizable: true },
  full_count: { text: 'Dust it off! Dust it off!', style: 'cheer', customizable: true },
  calm_wind: { text: 'Nothing to hide behind now!', style: 'cheer', customizable: true },
  sandstorm_headwind_kills_fly: { text: 'The wind took it! The wind took it!', style: 'moan', customizable: true },
  walkoff_win: { text: 'Survived the storm!', style: 'roar', customizable: true },
};

export const sandstormStadium: StadiumConfig = {
  id: 'sandstorm',
  name: 'Sandstorm Stadium',
  description: 'The desert wind decides your fate.',
  palette: {
    sky: '#E8A87C',
    grass: '#8B7355',
    dirt: '#D4A96A',
    walls: '#8B6914',
  },
  quirk: {
    type: 'wind_shift',
    config: {
      weights: {
        calm: 0.30,
        crosswindLeft: 0.20,
        crosswindRight: 0.20,
        headwind: 0.15,
        tailwind: 0.10,
        sandstorm: 0.05,
      },
      sandstormModes: ['random', 'once_per_game'],
      defaultSandstormMode: 'once_per_game',
    },
  },
  ambientSound: 'assets/sounds/ambient/desert_wind_loop.mp3',
  crowdChants: sandstormChants,
  unlockCharacter: 'dusty',
  unlockCondition: {
    type: 'wins_at_stadium',
    stadiumId: 'sandstorm',
    count: 3,
  },
  status: 'live',
};
