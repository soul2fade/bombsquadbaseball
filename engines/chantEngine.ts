export type ChantStyle = 'shout' | 'cheer' | 'moan' | 'roar';

export interface Chant {
  text: string;
  style?: ChantStyle;
  customizable?: boolean;
}

export type ChantSet = Record<string, Chant>;

export type ChantTrigger =
  | 'strikeout'
  | 'home_run'
  | 'full_count'
  | 'two_outs_bases_loaded'
  | 'comeback'
  | 'walkoff_win'
  | 'opponent_strikeout'
  | 'opponent_error'
  | 'close_call_plate'
  | 'sandstorm_trigger'
  | 'sandstorm_strikeout_in_storm'
  | 'sandstorm_hr_during_tailwind'
  | 'sandstorm_headwind_kills_fly'
  | 'calm_wind'
  | string;

export interface GameContext {
  teamName: string;
  currentPlayerName?: string;
  score: number;
  inning: number;
}

export interface ChantResult {
  text: string;
  duration: number;
  style: ChantStyle;
}

export const UNIVERSAL_CHANTS: ChantSet = {
  strikeout: { text: 'Sit down! Sit down!', style: 'shout', customizable: true },
  home_run: { text: 'BOMBS AWAY, [TEAM]!', style: 'roar', customizable: true },
  full_count: { text: 'Here we go now!', style: 'cheer', customizable: true },
  two_outs_bases_loaded: { text: 'Bring \'em home!', style: 'cheer', customizable: true },
  comeback: { text: 'We never quit!', style: 'shout', customizable: true },
  walkoff_win: { text: 'GAME OVER — [TEAM] WINS!', style: 'roar', customizable: true },
  opponent_strikeout: { text: 'Take a seat!', style: 'shout', customizable: true },
  opponent_error: { text: 'Butterfingers!', style: 'shout', customizable: true },
  close_call_plate: { text: 'Are you blind?!', style: 'shout', customizable: true },
};

export class ChantEngine {
  private universal: ChantSet;
  private stadium: ChantSet;
  private custom: ChantSet;

  constructor(stadium: ChantSet = {}, custom: ChantSet = {}, universal: ChantSet = UNIVERSAL_CHANTS) {
    this.universal = universal;
    this.stadium = stadium;
    this.custom = custom;
  }

  setCustomChants(custom: ChantSet) {
    this.custom = custom;
  }

  trigger(event: ChantTrigger, context: GameContext): ChantResult | null {
    const chant = this.custom[event] ?? this.stadium[event] ?? this.universal[event];
    if (!chant) return null;
    return {
      text: this.interpolate(chant.text, context),
      duration: 2500,
      style: chant.style ?? 'cheer',
    };
  }

  listTriggers(): { trigger: string; chant: Chant; source: 'universal' | 'stadium' | 'custom' }[] {
    const seen = new Map<string, { chant: Chant; source: 'universal' | 'stadium' | 'custom' }>();
    for (const [k, v] of Object.entries(this.universal)) seen.set(k, { chant: v, source: 'universal' });
    for (const [k, v] of Object.entries(this.stadium)) seen.set(k, { chant: v, source: 'stadium' });
    for (const [k, v] of Object.entries(this.custom)) seen.set(k, { chant: v, source: 'custom' });
    return Array.from(seen.entries()).map(([trigger, info]) => ({ trigger, ...info }));
  }

  private interpolate(text: string, ctx: GameContext): string {
    return text
      .replace(/\[TEAM\]/g, ctx.teamName)
      .replace(/\[PLAYER\]/g, ctx.currentPlayerName ?? 'him')
      .replace(/\[SCORE\]/g, String(ctx.score))
      .replace(/\[INNING\]/g, String(ctx.inning));
  }
}
