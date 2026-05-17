export type WindState =
  | 'calm'
  | 'crosswind_left'
  | 'crosswind_right'
  | 'headwind'
  | 'tailwind'
  | 'sandstorm';

export interface WindResult {
  state: WindState;
  intensity: number;
  driftX: number;
  driftY: number;
  visibilityReduction: number;
}

export type SandstormMode = 'random' | 'once_per_game';

export interface WindWeights {
  calm: number;
  crosswindLeft: number;
  crosswindRight: number;
  headwind: number;
  tailwind: number;
  sandstorm: number;
}

export interface WindEngineConfig {
  sandstormMode: SandstormMode;
  weights: WindWeights;
}

const WEIGHT_TO_STATE: Record<keyof WindWeights, WindState> = {
  calm: 'calm',
  crosswindLeft: 'crosswind_left',
  crosswindRight: 'crosswind_right',
  headwind: 'headwind',
  tailwind: 'tailwind',
  sandstorm: 'sandstorm',
};

export class WindEngine {
  private sandstormMode: SandstormMode;
  private sandstormUsed = false;
  private weights: WindWeights;

  constructor(config: WindEngineConfig) {
    this.sandstormMode = config.sandstormMode;
    this.weights = { ...config.weights };
  }

  reset() {
    this.sandstormUsed = false;
  }

  getNextWindState(): WindResult {
    const state = this.rollWindState();
    return this.buildWindResult(state);
  }

  private rollWindState(): WindState {
    const useWeights =
      this.sandstormMode === 'once_per_game' && this.sandstormUsed
        ? this.weightsWithoutSandstorm()
        : this.weights;
    return this.weightedRandom(useWeights);
  }

  private weightsWithoutSandstorm(): WindWeights {
    const { sandstorm, ...rest } = this.weights;
    return { ...rest, sandstorm: 0, calm: rest.calm + sandstorm };
  }

  private buildWindResult(state: WindState): WindResult {
    switch (state) {
      case 'calm':
        return { state, intensity: 0, driftX: 0, driftY: 0, visibilityReduction: 0 };
      case 'crosswind_left':
        return { state, intensity: 0.5, driftX: -0.3, driftY: 0, visibilityReduction: 0.1 };
      case 'crosswind_right':
        return { state, intensity: 0.5, driftX: 0.3, driftY: 0, visibilityReduction: 0.1 };
      case 'headwind':
        return { state, intensity: 0.8, driftX: 0, driftY: -0.25, visibilityReduction: 0.15 };
      case 'tailwind':
        return { state, intensity: 0.8, driftX: 0, driftY: 0.2, visibilityReduction: 0 };
      case 'sandstorm':
        this.sandstormUsed = true;
        return {
          state,
          intensity: 1.0,
          driftX: Math.random() > 0.5 ? 0.4 : -0.4,
          driftY: -0.1,
          visibilityReduction: 0.85,
        };
    }
  }

  private weightedRandom(weights: WindWeights): WindState {
    const entries = Object.entries(weights) as [keyof WindWeights, number][];
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    const roll = Math.random() * total;
    let cumulative = 0;
    for (const [key, weight] of entries) {
      cumulative += weight;
      if (roll < cumulative) return WEIGHT_TO_STATE[key];
    }
    return 'calm';
  }
}
