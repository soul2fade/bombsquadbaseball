import { UnlockCondition } from '../stadiums';
import { dusty } from './dusty';
import { shadow } from './shadow';
import { wrecker } from './wrecker';
import { spring } from './spring';
import { summit } from './summit';
import { phantom } from './phantom';
import { ember } from './ember';

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
  unlockCondition: UnlockCondition;
  specialAbility: SpecialAbility;
  appearance: CharacterAppearance;
}

export const CHARACTERS: Character[] = [
  dusty,
  shadow,
  wrecker,
  spring,
  summit,
  phantom,
  ember,
];

export const CHARACTER_MAP: Record<string, Character> = Object.fromEntries(
  CHARACTERS.map((c) => [c.id, c])
);

export function getCharacter(id: string): Character | undefined {
  return CHARACTER_MAP[id];
}
