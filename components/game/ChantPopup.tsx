import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useChantUIStore } from '../../stores/chantStore';

export function ChantPopup() {
  const active = useChantUIStore((s) => s.active);
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withSequence(
        withTiming(1, { duration: 250 }),
        withDelay(active.expiresAt - Date.now() - 500, withTiming(0, { duration: 500 }))
      );
    } else {
      translateY.value = 60;
      opacity.value = 0;
    }
  }, [active, translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!active) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        active.style === 'roar' && styles.roar,
        active.style === 'moan' && styles.moan,
        animStyle,
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.text, active.style === 'roar' && styles.roarText]}>{active.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: colors.uiPanel,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.uiAccent,
    maxWidth: '90%',
  },
  roar: { backgroundColor: colors.uiAccent, borderColor: colors.ballRed },
  moan: { backgroundColor: '#3A2A1A' },
  text: {
    ...typography.title,
    color: colors.uiText,
    textAlign: 'center',
  },
  roarText: { color: colors.uiBg },
});
