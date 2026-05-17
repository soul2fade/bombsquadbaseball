import { UnlockCondition } from '../stadiums';
import { dusty } from './dusty';
import { buckshot } from './buckshot';
import { mirage } from './mirage';
import { shadow } from './shadow';
import { wrecker } from './wrecker';
import { spring } from './spring';
import { summit } from './summit';
import { phantom } from './phantom';
import { ember } from './ember';

export type TeamId =
  | 'dust_devils'
  | 'midnight_owls'
  | 'wreckers'
  | 'bouncers'
  | 'sky_high_yetis'
  | 'phantoms'
  | 'magma_crew';

export interface TeamMeta {
  id: TeamId;
  name: string;
  stadiumId: string;
  homeFieldPassive: string;
  colorPrimary: string;
  colorSecondary: string;
}

export const TEAMS: Record<TeamId, TeamMeta> = {
  dust_devils: {
    id: 'dust_devils',
    name: 'Dust Devils',
    stadiumId: 'sandstorm',
    homeFieldPassive: 'Sandstorms last one extra pitch when batting.',
    colorPrimary: '#8B6914',
    colorSecondary: '#D4A96A',
  },
  midnight_owls: {
    id: 'midnight_owls',
    name: 'Midnight Owls',
    stadiumId: 'nightgame',
    homeFieldPassive: 'No timing penalty for swings during light flickers.',
    colorPrimary: '#1B263B',
    colorSecondary: '#5DA9E9',
  },
  wreckers: {
    id: 'wreckers',
    name: 'Wreckers',
    stadiumId: 'demolition',
    homeFieldPassive: 'Wall-scrapers count as home runs.',
    colorPrimary: '#D62828',
    colorSecondary: '#FFB703',
  },
  bouncers: {
    id: 'bouncers',
    name: 'Bouncers',
    stadiumId: 'turfmonster',
    homeFieldPassive: 'Contact hits roll an extra base 25% of the time.',
    colorPrimary: '#39E75F',
    colorSecondary: '#283044',
  },
  sky_high_yetis: {
    id: 'sky_high_yetis',
    name: 'Sky High Yetis',
    stadiumId: 'mountain',
    homeFieldPassive: 'Foul balls have a chance to curve back fair.',
    colorPrimary: '#3A506B',
    colorSecondary: '#A0C4FF',
  },
  phantoms: {
    id: 'phantoms',
    name: 'Phantoms',
    stadiumId: 'haunted',
    homeFieldPassive: 'Runners phase through one tag per game.',
    colorPrimary: '#533483',
    colorSecondary: '#16213E',
  },
  magma_crew: {
    id: 'magma_crew',
    name: 'Magma Crew',
    stadiumId: 'volcano',
    homeFieldPassive: 'Fastballs gain heat every inning, not just after eruption.',
    colorPrimary: '#950101',
    colorSecondary: '#FFB703',
  },
};

export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  effect: string;
  modifier: number;
}

export interface CharacterAppearance {
  face: string;
  mask?: string;
  glove?: string;
  cleats?: string;
  jersey: string;
  colorPrimary: string;
  colorSecondary: string;
}

export interface Character {
  id: string;
  name: string;
  role: 'pitcher' | 'batter' | 'fielder' | 'utility';
  team?: TeamId;
  unlockCondition: UnlockCondition;
  specialAbility: SpecialAbility;
  appearance: CharacterAppearance;
}

export const CHARACTERS: Character[] = [
  dusty,
  buckshot,
  mirage,
  shadow,
  wrecker,
  spring,
  summit,
  phantom,
  ember,
];

export function getRoster(team: TeamId): Character[] {
  return CHARACTERS.filter((c) => c.team === team);
}

export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c])
);

export function getCharacter(id: string): Character | undefined {
  return CHARACTER_MAP[id];
}
