import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Position } from '../../characters';

interface Props {
  position: Position;
  colorPrimary: string;
  fieldWidthPx: number;
  fieldHeightPx: number;
  homeX: number;
  homeY: number;
  targetX?: number;
  targetY?: number;
  durationMs?: number;
}

export function Fielder({
  position,
  colorPrimary,
  fieldWidthPx,
  fieldHeightPx,
  homeX,
  homeY,
  targetX,
  targetY,
  durationMs = 600,
}: Props) {
  const x = useSharedValue(homeX);
  const y = useSharedValue(homeY);

  React.useEffect(() => {
    x.value = withTiming(targetX ?? homeX, { duration: durationMs });
    y.value = withTiming(targetY ?? homeY, { duration: durationMs });
  }, [targetX, targetY, homeX, homeY, durationMs]);

  const style = useAnimatedStyle(() => {
    const left = ((x.value + 1) / 2) * fieldWidthPx - 12;
    const top = (1 - y.value) * fieldHeightPx - 12;
    return { transform: [{ translateX: left }, { translateY: top }] };
  });

  return (
    <Animated.View style={[styles.fielder, { backgroundColor: colorPrimary }, style]}>
      <Text style={styles.label}>{position}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fielder: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.4)',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
});
