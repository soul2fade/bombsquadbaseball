import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

interface Props {
  throwing: boolean;
}

export function Pitcher({ throwing }: Props) {
  return (
    <View style={[styles.container, throwing && styles.throwing]}>
      <Text style={styles.body}>🧢</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  throwing: { transform: [{ rotate: '20deg' }] },
  body: { fontSize: 36, color: colors.uiText },
});
