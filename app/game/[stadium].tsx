import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '../../constants/theme';
import { getStadium } from '../../stadiums';
import { WindEngine, WindResult, WindWeights } from '../../engines/windEngine';
import { ChantEngine } from '../../engines/chantEngine';
import { getActivePowerUps, PowerUp } from '../../engines/powerUpEngine';
import { throwPitch, PitchResult } from '../../engines/pitchEngine';
import { resolveSwing, HitResult } from '../../engines/hitEngine';
import {
  applyQuirkToHit,
  getQuirkPreEffects,
  QuirkPreEffects,
} from '../../engines/quirkEngine';
import { audioService } from '../../engines/audioService';
import { PITCH_TYPES, PitchType, AtBatResult } from '../../constants/gameRules';
import { TUNING } from '../../constants/config';

import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProgressStore } from '../../stores/progressStore';
import { useChantUIStore } from '../../stores/chantStore';

import { Field } from '../../components/game/Field';
import { ScoreBoard } from '../../components/game/ScoreBoard';
import { WindIndicator } from '../../components/game/WindIndicator';
import { ChantPopup } from '../../components/game/ChantPopup';
import { PowerUpBadge } from '../../components/game/PowerUpBadge';
import { Ball } from '../../components/game/Ball';
import { Pitcher } from '../../components/game/Pitcher';
import { Batter } from '../../components/game/Batter';
import { Fielder } from '../../components/game/Fielder';
import { BallInFlight } from '../../components/game/BallInFlight';
import { CloseplayPrompt } from '../../components/game/CloseplayPrompt';
import { Button } from '../../components/ui/Button';
import {
  pickFielder,
  resolveCatch,
  HOME_POSITIONS,
  GENERIC_DEFENSIVE_STATS,
  POSITIONS,
  FielderState,
  FieldingResult,
} from '../../engines/fieldingEngine';
import { CHARACTER_MAP, Position } from '../../characters';

type Phase = 'select_pitch' | 'pitching' | 'swing_window' | 'ball_in_flight' | 'close_play' | 'resolved';

export default function GameScreen() {
  const { stadium: stadiumId } = useLocalSearchParams<{ stadium: string }>();
  const router = useRouter();
  const stadium = useMemo(() => getStadium(stadiumId ?? ''), [stadiumId]);

  const settings = useSettingsStore();
  const game = useGameStore();
  const showChant = useChantUIStore((s) => s.show);
  const recordWin = useProgressStore((s) => s.recordWin);
  const recordLoss = useProgressStore((s) => s.recordLoss);
  const recordHomerun = useProgressStore((s) => s.recordHomerun);
  const recordStrikeout = useProgressStore((s) => s.recordStrikeout);

  const [phase, setPhase] = useState<Phase>('select_pitch');
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const [lastResult, setLastResult] = useState<HitResult | null>(null);
  const [batterSwinging, setBatterSwinging] = useState(false);
  const [quirk, setQuirk] = useState<QuirkPreEffects | null>(null);
  const [fielding, setFielding] = useState<FieldingResult | null>(null);
  const [fieldingTarget, setFieldingTarget] = useState<{ pos: Position; x: number; y: number } | null>(null);
  const [fieldSize, setFieldSize] = useState<{ width: number; height: number }>({ width: 280, height: 280 });
  const pitchStartTimeRef = useRef<number>(0);

  const lineup = useGameStore((s) => s.lineup);
  const setLineup = useGameStore((s) => s.setLineup);

  const windEngineRef = useRef<WindEngine | null>(null);
  const chantEngineRef = useRef<ChantEngine | null>(null);

  useEffect(() => {
    if (!stadium) return;
    const weights = (stadium.quirk.config?.weights as WindWeights) ?? {
      calm: 1,
      crosswindLeft: 0,
      crosswindRight: 0,
      headwind: 0,
      tailwind: 0,
      sandstorm: 0,
    };
    windEngineRef.current = new WindEngine({
      sandstormMode: settings.sandstormMode,
      weights,
    });
    chantEngineRef.current = new ChantEngine(
      stadium.crowdChants,
      Object.fromEntries(
        Object.entries(settings.customChants).map(([k, text]) => [k, { text, customizable: true }])
      )
    );
    game.startGame(stadium.id, settings.teamName, 'Visitors');
    setLineup(useProgressStore.getState().unlockedCharacters);
    audioService.init().then(() => {
      audioService.setMasterVolume(settings.masterVolume);
    });
    rollNextWind();
    rollNextQuirk();
    return () => {
      audioService.stopAmbient();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stadium?.id]);

  const situation = useMemo(
    () => ({
      balls: game.balls,
      strikes: game.strikes,
      outs: game.outs,
      inning: game.inning,
      scoreDiff:
        (game.half === 'top' ? game.awayScore - game.homeScore : game.homeScore - game.awayScore),
      basesLoaded: game.bases.every(Boolean),
      recentResults: game.recentResults,
    }),
    [game]
  );

  const activePowerUps: PowerUp[] = useMemo(() => getActivePowerUps(situation), [situation]);
  const pitcherBoost = activePowerUps
    .filter((p) => p.type === 'pitcher')
    .reduce((acc, p) => ({
      speedBoost: (acc.speedBoost ?? 0) + (p.modifier.speed ?? 0),
      accuracyBoost: (acc.accuracyBoost ?? 0) + (p.modifier.accuracy ?? 0),
    }), {} as { speedBoost?: number; accuracyBoost?: number });

  const batterBoost = activePowerUps
    .filter((p) => p.type === 'batter')
    .reduce((acc, p) => ({
      contactBoost: (acc.contactBoost ?? 0) + (p.modifier.contactBoost ?? 0),
      powerBoost: (acc.powerBoost ?? 0) + (p.modifier.powerSwing ?? 0),
    }), {} as { contactBoost?: number; powerBoost?: number });

  function rollNextWind() {
    if (!windEngineRef.current) return;
    const wind = windEngineRef.current.getNextWindState();
    game.setWind(wind);
    if (wind.state === 'sandstorm') {
      triggerChant('sandstorm_trigger');
    } else if (wind.state === 'calm') {
      if (stadium?.crowdChants['calm_wind']) triggerChant('calm_wind');
    }
  }

  function rollNextQuirk() {
    if (!stadium) return;
    const effects = getQuirkPreEffects(stadium, { inning: game.inning });
    setQuirk(effects);
    for (const chant of effects.triggerChants) triggerChant(chant);
  }

  function triggerChant(event: string) {
    if (!chantEngineRef.current) return;
    const result = chantEngineRef.current.trigger(event, {
      teamName: settings.teamName,
      score: game.half === 'top' ? game.awayScore : game.homeScore,
      inning: game.inning,
    });
    if (result) showChant(result.text, result.style, result.duration);
  }

  function pickPitch(type: PitchType) {
    if (phase !== 'select_pitch' || game.gameOver) return;
    const combinedPitcherMod = {
      speedBoost: (pitcherBoost.speedBoost ?? 0) + (quirk?.pitchMod.speedBoost ?? 0),
      accuracyBoost: (pitcherBoost.accuracyBoost ?? 0) + (quirk?.pitchMod.accuracyBoost ?? 0),
    };
    const result = throwPitch(type, combinedPitcherMod);
    setPitch(result);
    setPhase('pitching');
    pitchStartTimeRef.current = Date.now();
    setTimeout(() => setPhase('swing_window'), result.travelMs * 0.5);
    setTimeout(() => {
      if (!batterSwinging) {
        resolveAtBat({ swung: false, swingAtMs: 0, pitchArrivalMs: result.travelMs });
      }
    }, result.travelMs + TUNING.swing.goodWindowMs);
  }

  function swing() {
    if (phase !== 'swing_window' && phase !== 'pitching') return;
    if (!pitch) return;
    setBatterSwinging(true);
    const swingAtMs = Date.now() - pitchStartTimeRef.current;
    resolveAtBat({ swung: true, swingAtMs, pitchArrivalMs: pitch.travelMs });
  }

  function resolveAtBat(swingInput: { swung: boolean; swingAtMs: number; pitchArrivalMs: number }) {
    if (!pitch || !game.currentWind || !stadium) return;
    if (phase === 'resolved') return;

    const combinedBatterBoost = {
      contactBoost: batterBoost.contactBoost ?? 0,
      powerBoost: (batterBoost.powerBoost ?? 0) + (quirk?.powerBoost ?? 0),
    };

    const adjustedWind =
      quirk && quirk.visibilityReduction > game.currentWind.visibilityReduction
        ? { ...game.currentWind, visibilityReduction: quirk.visibilityReduction }
        : game.currentWind;

    const rawHit = resolveSwing(pitch, swingInput, adjustedWind, combinedBatterBoost);

    let hit = rawHit;
    if (quirk && quirk.hrThresholdDelta !== 0 && hit.timing !== 'miss') {
      const adjustedPower = hit.power - quirk.hrThresholdDelta;
      if (adjustedPower >= 0.85 && hit.result !== 'home_run') {
        hit = { ...hit, result: 'home_run', power: adjustedPower };
      }
    }

    const { hit: finalHit, chants: quirkChants } = applyQuirkToHit(stadium, hit);
    setLastResult(finalHit);
    for (const c of quirkChants) triggerChant(c);

    const skipsDefense = finalHit.landing == null || finalHit.result === 'home_run';
    if (skipsDefense) {
      game.recordPitchResult(finalHit.result);
      setPhase('resolved');
      fireChantsForResult(finalHit.result);
      if (finalHit.result === 'home_run') recordHomerun();
      if (finalHit.result === 'strikeout') recordStrikeout();
      scheduleNextAtBat();
    } else {
      setPhase('ball_in_flight');
    }
  }

  function scheduleNextAtBat() {
    setTimeout(() => {
      setBatterSwinging(false);
      setPitch(null);
      setLastResult(null);
      setFielding(null);
      setFieldingTarget(null);
      rollNextWind();
      rollNextQuirk();
      setPhase('select_pitch');
    }, 1600);
  }

  const handleBallLanded = useCallback(() => {
    if (!lastResult?.landing) {
      setPhase('resolved');
      scheduleNextAtBat();
      return;
    }
    const fielderPos = pickFielder(lastResult.landing);
    const home = HOME_POSITIONS[fielderPos];
    setFieldingTarget({ pos: fielderPos, x: lastResult.landing.x, y: lastResult.landing.y });

    const charId = lineup[fielderPos];
    const char = charId !== 'generic' ? CHARACTER_MAP[charId] : undefined;
    const stats = char?.defensiveStats ?? GENERIC_DEFENSIVE_STATS[fielderPos];
    const fielderState: FielderState = { position: fielderPos, home, stats };

    const fr = resolveCatch(
      fielderState,
      { landing: lastResult.landing, airTimeMs: lastResult.airTimeMs, ballType: lastResult.ballType },
      Math.random
    );
    setFielding(fr);

    if (fr.isCloseplay) {
      setPhase('close_play');
    } else {
      applyFieldingResult(fr);
    }
  }, [lastResult, lineup]);

  const handleCloseplayResult = useCallback((tapSuccess: boolean) => {
    if (!fielding) return;
    const finalOutcome = tapSuccess ? 'caught' : 'hit';
    const bumpDepth = (d: 'shallow' | 'mid' | 'deep'): 'shallow' | 'mid' | 'deep' =>
      d === 'shallow' ? 'mid' : d === 'mid' ? 'deep' : 'deep';
    const baseDepth = fielding.hitDepth ?? 'mid';
    const adjusted: FieldingResult = {
      ...fielding,
      outcome: finalOutcome,
      hitDepth: finalOutcome === 'hit' ? bumpDepth(baseDepth) : undefined,
    };
    applyFieldingResult(adjusted);
  }, [fielding]);

  const applyFieldingResult = useCallback((fr: FieldingResult) => {
    let resolvedAtBat: AtBatResult;
    if (fr.outcome === 'caught') {
      resolvedAtBat = lastResult?.ballType === 'grounder' ? 'groundout' : 'flyout';
    } else {
      const depth = fr.hitDepth ?? 'shallow';
      if (depth === 'shallow') resolvedAtBat = 'single';
      else if (depth === 'mid') resolvedAtBat = 'double';
      else resolvedAtBat = 'triple';
    }
    game.recordPitchResult(resolvedAtBat);
    fireChantsForResult(resolvedAtBat);
    setPhase('resolved');
    scheduleNextAtBat();
  }, [lastResult]);

  function fireChantsForResult(result: AtBatResult) {
    const wind = game.currentWind;
    if (result === 'home_run') {
      audioService.trigger('hit_tailwind_hr');
      audioService.trigger('crowd_roar');
      if (wind?.state === 'tailwind') triggerChant('sandstorm_hr_during_tailwind');
      else triggerChant('home_run');
    }
    if (result === 'strikeout') {
      audioService.trigger('crowd_cheer');
      if (wind?.state === 'sandstorm') triggerChant('sandstorm_strikeout_in_storm');
      else triggerChant('strikeout');
    }
    if (['single', 'double', 'triple'].includes(result)) {
      audioService.trigger(wind?.state === 'sandstorm' ? 'hit_muffled' : 'hit_normal');
    }
    if (result === 'flyout' && wind?.state === 'headwind') {
      triggerChant('sandstorm_headwind_kills_fly');
    }
    if (game.balls === 3 && game.strikes === 2) triggerChant('full_count');
  }

  useEffect(() => {
    if (game.gameOver) {
      const playerIsHome = true;
      const playerWon =
        (playerIsHome && game.winner === 'home') || (!playerIsHome && game.winner === 'away');
      if (playerWon && stadium) {
        const newlyUnlocked = recordWin(stadium.id);
        triggerChant('walkoff_win');
        router.replace({
          pathname: '/game/results',
          params: {
            won: '1',
            stadiumId: stadium.id,
            unlocked: newlyUnlocked.map((c) => c.id).join(','),
          },
        });
      } else {
        recordLoss();
        router.replace({
          pathname: '/game/results',
          params: { won: '0', stadiumId: stadium?.id ?? '' },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.gameOver]);

  if (!stadium) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Stadium not found.</Text>
        <Button title="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const showSandstorm = game.currentWind?.state === 'sandstorm';
  const showFlicker = !!quirk?.flickerActive;
  const showEruption = !!quirk?.eruptionActive;
  const baseVisibilityReduction = game.currentWind?.visibilityReduction ?? 0;
  const quirkVisibilityReduction = quirk?.visibilityReduction ?? 0;
  const ballOpacity = 1 - Math.max(baseVisibilityReduction, quirkVisibilityReduction);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <ScoreBoard
          homeName={settings.teamName}
          awayName="Visitors"
          homeScore={game.homeScore}
          awayScore={game.awayScore}
          inning={game.inning}
          half={game.half}
          balls={game.balls}
          strikes={game.strikes}
          outs={game.outs}
        />
      </View>

      <View style={styles.windRow}>
        <WindIndicator wind={game.currentWind} />
      </View>

      {activePowerUps.length > 0 && (
        <View style={styles.powerUpRow}>
          {activePowerUps.map((p) => (
            <PowerUpBadge key={p.id} powerUp={p} />
          ))}
        </View>
      )}

      <View style={styles.fieldContainer}>
        <View
          style={styles.fieldOverlayWrap}
          onLayout={(e) =>
            setFieldSize({
              width: e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
            })
          }
        >
          <Field
            stadium={stadium}
            bases={game.bases}
            sandstormVisible={showSandstorm}
            flickerVisible={showFlicker}
            eruptionVisible={showEruption}
          />
          {POSITIONS.map((pos) => {
            const charId = lineup[pos];
            const char = charId !== 'generic' ? CHARACTER_MAP[charId] : undefined;
            const color = char?.appearance.colorPrimary ?? '#666';
            const home = HOME_POSITIONS[pos];
            const isTarget = fieldingTarget?.pos === pos;
            return (
              <Fielder
                key={pos}
                position={pos}
                colorPrimary={color}
                fieldWidthPx={fieldSize.width}
                fieldHeightPx={fieldSize.height}
                homeX={home.x}
                homeY={home.y}
                targetX={isTarget ? fieldingTarget!.x : undefined}
                targetY={isTarget ? fieldingTarget!.y : undefined}
                durationMs={isTarget ? lastResult?.airTimeMs ?? 800 : 400}
              />
            );
          })}
          {phase === 'ball_in_flight' && lastResult?.landing && (
            <BallInFlight
              fieldWidthPx={fieldSize.width}
              fieldHeightPx={fieldSize.height}
              landingX={lastResult.landing.x}
              landingY={lastResult.landing.y}
              durationMs={lastResult.airTimeMs}
              onLanded={handleBallLanded}
            />
          )}
          {phase === 'close_play' && fieldingTarget && (
            <CloseplayPrompt
              fieldWidthPx={fieldSize.width}
              fieldHeightPx={fieldSize.height}
              targetX={fieldingTarget.x}
              targetY={fieldingTarget.y}
              onResult={handleCloseplayResult}
            />
          )}
        </View>
        <View style={styles.pitcherPos}>
          <Pitcher throwing={phase === 'pitching'} />
        </View>
        <View style={styles.ballLane}>
          <Ball
            active={phase === 'pitching' || phase === 'swing_window'}
            travelMs={pitch?.travelMs ?? 800}
            opacity={ballOpacity}
          />
        </View>
        <View style={styles.batterPos}>
          <Batter swinging={batterSwinging} />
        </View>
      </View>

      {lastResult && (
        <View style={styles.resultBanner}>
          <Text style={styles.resultText}>
            {formatResult(lastResult.result)} — {lastResult.timing.toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.controls}>
        {phase === 'select_pitch' && !game.gameOver && (
          <View style={styles.pitchButtons}>
            {PITCH_TYPES.map((type) => (
              <Pressable
                key={type}
                onPress={() => pickPitch(type)}
                style={({ pressed }) => [styles.pitchBtn, pressed && styles.pitchBtnPressed]}
              >
                <Text style={styles.pitchBtnText}>{type.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {(phase === 'pitching' || phase === 'swing_window') && (
          <Pressable onPress={swing} style={styles.swingBtn}>
            <Text style={styles.swingText}>SWING!</Text>
          </Pressable>
        )}
        {phase === 'resolved' && <Text style={styles.waiting}>...</Text>}
      </View>

      <ChantPopup />
    </SafeAreaView>
  );
}

function formatResult(r: AtBatResult): string {
  return r.replace(/_/g, ' ').toUpperCase();
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.uiBg, padding: spacing.md, gap: spacing.sm },
  topRow: {},
  windRow: { alignItems: 'flex-end' },
  powerUpRow: { gap: spacing.xs },
  fieldContainer: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
  },
  fieldOverlayWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  pitcherPos: { position: 'absolute', top: '35%', alignSelf: 'center' },
  ballLane: { position: 'absolute', top: '50%', alignSelf: 'center' },
  batterPos: { position: 'absolute', bottom: '10%', alignSelf: 'center' },
  resultBanner: {
    backgroundColor: colors.uiAccent,
    padding: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  resultText: { ...typography.title, color: colors.uiBg },
  controls: { minHeight: 90, justifyContent: 'center' },
  pitchButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  pitchBtn: {
    backgroundColor: colors.uiPanel,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.uiAccent,
    minWidth: 110,
    alignItems: 'center',
  },
  pitchBtnPressed: { opacity: 0.7 },
  pitchBtnText: { ...typography.body, color: colors.uiAccent, fontWeight: '900', letterSpacing: 1 },
  swingBtn: {
    backgroundColor: colors.ballRed,
    padding: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  swingText: { ...typography.display, color: colors.uiText, fontSize: 36 },
  waiting: { textAlign: 'center', color: colors.uiTextDim, fontSize: 24 },
  errorText: { ...typography.title, color: colors.danger, textAlign: 'center', padding: spacing.lg },
});
