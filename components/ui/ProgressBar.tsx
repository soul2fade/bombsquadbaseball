import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radii } from '../../constants/theme';

interface Props {
  value: number;
  max?: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, max = 1, color = colors.uiAccent, height = 8 }: Props) {
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.uiBg,
    borderRadius: radii.pill,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: radii.pill,
  },
});
