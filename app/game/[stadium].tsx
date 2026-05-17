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
import { Button } from '../../components/ui/Button';

type Phase = 'select_pitch' | 'pitching' | 'swing_window' | 'resolved';

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
  const pitchStartTimeRef = useRef<number>(0);

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
    rollNextWind();
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
      // mild — surface stadium-specific chant if exists
      if (stadium?.crowdChants['calm_wind']) triggerChant('calm_wind');
    }
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
    const result = throwPitch(type, pitcherBoost);
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
    if (!pitch || !game.currentWind) return;
    if (phase === 'resolved') return;
    const result = resolveSwing(pitch, swingInput, game.currentWind, batterBoost);
    setLastResult(result);
    game.recordPitchResult(result.result);
    setPhase('resolved');
    fireChantsForResult(result.result);
    if (result.result === 'home_run') recordHomerun();
    if (result.result === 'strikeout') recordStrikeout();
    setTimeout(() => {
      setBatterSwinging(false);
      setPitch(null);
      setLastResult(null);
      rollNextWind();
      setPhase('select_pitch');
    }, 1600);
  }

  function fireChantsForResult(result: AtBatResult) {
    const wind = game.currentWind;
    if (result === 'home_run') {
      if (wind?.state === 'tailwind') triggerChant('sandstorm_hr_during_tailwind');
      else triggerChant('home_run');
    }
    if (result === 'strikeout') {
      if (wind?.state === 'sandstorm') triggerChant('sandstorm_strikeout_in_storm');
      else triggerChant('strikeout');
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
  const ballOpacity = game.currentWind ? 1 - game.currentWind.visibilityReduction : 1;

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
        <Field stadium={stadium} bases={game.bases} sandstormVisible={showSandstorm} />
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
