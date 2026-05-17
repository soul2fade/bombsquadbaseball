import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { WindResult } from '../../engines/windEngine';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { ProgressBar } from '../ui/ProgressBar';

interface Props {
  wind: WindResult | null;
}

const STATE_LABELS: Record<string, string> = {
  calm: 'CALM',
  crosswind_left: 'CROSSWIND ←',
  crosswind_right: 'CROSSWIND →',
  headwind: 'HEADWIND',
  tailwind: 'TAILWIND',
  sandstorm: 'SANDSTORM',
};

export function WindIndicator({ wind }: Props) {
  const opacity = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (!wind) return;
    opacity.value = withTiming(1, { duration: 450 });
    if (wind.state === 'sandstorm') {
      shake.value = withRepeat(
        withSequence(withTiming(-4, { duration: 60 }), withTiming(4, { duration: 60 })),
        6,
        true
      );
    } else {
      shake.value = 0;
    }
  }, [wind, opacity, shake]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: shake.value }],
  }));

  if (!wind) return null;

  const isStorm = wind.state === 'sandstorm';
  const isCalm = wind.state === 'calm';
  const arrowRotation = arrowAngleFor(wind);

  return (
    <Animated.View
      style={[
        styles.container,
        isStorm && styles.storm,
        isCalm && styles.calm,
        animStyle,
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.label, isStorm && styles.stormText]}>{STATE_LABELS[wind.state]}</Text>
        <Text style={[styles.arrow, { transform: [{ rotate: `${arrowRotation}deg` }] }]}>↑</Text>
      </View>
      <ProgressBar
        value={wind.intensity}
        color={isStorm ? colors.danger : isCalm ? colors.uiTextDim : colors.uiAccent}
        height={6}
      />
    </Animated.View>
  );
}

function arrowAngleFor(wind: WindResult): number {
  if (wind.state === 'crosswind_left') return -90;
  if (wind.state === 'crosswind_right') return 90;
  if (wind.state === 'headwind') return 180;
  if (wind.state === 'tailwind') return 0;
  return 0;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.uiPanel,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
    minWidth: 200,
  },
  storm: { backgroundColor: '#5B1A1A', borderWidth: 2, borderColor: colors.danger },
  calm: { opacity: 0.55 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.small, color: colors.uiText, fontWeight: '900', letterSpacing: 1 },
  stormText: { color: colors.danger },
  arrow: { color: colors.uiAccent, fontSize: 22, fontWeight: '900' },
});
