import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../../constants/theme';

interface Props {
  swinging: boolean;
}

export function Batter({ swinging }: Props) {
  return (
    <View style={[styles.container, swinging && styles.swinging]}>
      <Text style={styles.body}>🏏</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  swinging: { transform: [{ rotate: '-15deg' }] },
  body: { fontSize: 48, color: colors.uiText },
});
