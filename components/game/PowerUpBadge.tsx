import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PowerUp } from '../../engines/powerUpEngine';
import { colors, radii, spacing, typography } from '../../constants/theme';

interface Props {
  powerUp: PowerUp;
}

export function PowerUpBadge({ powerUp }: Props) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true
    );
  }, [pulse]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <Animated.View style={[styles.container, badgeColor(powerUp.id), animStyle]}>
      <Text style={styles.icon}>{badgeIcon(powerUp.id)}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{powerUp.name.toUpperCase()}</Text>
        <Text style={styles.desc} numberOfLines={1}>
          {powerUp.description}
        </Text>
      </View>
    </Animated.View>
  );
}

function badgeIcon(id: string): string {
  switch (id) {
    case 'clutch_pitch':
      return '⚡';
    case 'heat_streak':
      return '🔥';
    case 'last_stand':
      return '★';
    case 'bases_loaded_heat':
      return '◆';
    default:
      return '•';
  }
}

function badgeColor(id: string) {
  switch (id) {
    case 'clutch_pitch':
      return { backgroundColor: '#FFD23F', borderColor: '#A37800' };
    case 'heat_streak':
      return { backgroundColor: '#FF6B35', borderColor: '#7A2E0E' };
    case 'last_stand':
      return { backgroundColor: '#3DDC97', borderColor: '#0D6E45' };
    case 'bases_loaded_heat':
      return { backgroundColor: '#5DA9E9', borderColor: '#1F4E7D' };
    default:
      return { backgroundColor: colors.uiPanel, borderColor: colors.uiAccent };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    gap: spacing.sm,
  },
  icon: { fontSize: 22 },
  name: { ...typography.small, fontWeight: '900', color: colors.uiBg, letterSpacing: 1 },
  desc: { ...typography.small, color: colors.uiBg, opacity: 0.85 },
});
