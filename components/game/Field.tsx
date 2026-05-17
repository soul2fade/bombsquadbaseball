import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StadiumConfig } from '../../stadiums';

interface Props {
  stadium: StadiumConfig;
  bases: [boolean, boolean, boolean];
  sandstormVisible?: boolean;
}

export function Field({ stadium, bases, sandstormVisible }: Props) {
  const { palette } = stadium;
  return (
    <View style={[styles.container, { backgroundColor: palette.sky }]}>
      <View style={[styles.outfield, { backgroundColor: palette.grass }]} />
      <View style={[styles.wall, { backgroundColor: palette.walls }]} />
      <View style={[styles.infield, { backgroundColor: palette.dirt }]}>
        <View style={[styles.baseFirst, bases[0] && styles.baseOccupied]} />
        <View style={[styles.baseSecond, bases[1] && styles.baseOccupied]} />
        <View style={[styles.baseThird, bases[2] && styles.baseOccupied]} />
        <View style={styles.homePlate} />
        <View style={[styles.pitchersMound, { backgroundColor: palette.dirt }]} />
      </View>
      {sandstormVisible && <View style={styles.sandstormOverlay} pointerEvents="none" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  outfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '20%',
  },
  wall: {
    position: 'absolute',
    top: '8%',
    left: '5%',
    right: '5%',
    height: 6,
    borderRadius: 3,
  },
  infield: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: '60%',
    transform: [{ rotate: '45deg' }],
  },
  pitchersMound: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    width: '20%',
    height: '20%',
    borderRadius: 999,
    opacity: 0.6,
  },
  baseFirst: {
    position: 'absolute',
    right: 0,
    top: '45%',
    width: 12,
    height: 12,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
  baseSecond: {
    position: 'absolute',
    top: 0,
    left: '45%',
    width: 12,
    height: 12,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
  baseThird: {
    position: 'absolute',
    left: 0,
    top: '45%',
    width: 12,
    height: 12,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
  baseOccupied: {
    backgroundColor: '#FFD23F',
    width: 16,
    height: 16,
  },
  homePlate: {
    position: 'absolute',
    bottom: 0,
    left: '45%',
    width: 12,
    height: 12,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
  sandstormOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(212, 169, 106, 0.7)',
  },
});
