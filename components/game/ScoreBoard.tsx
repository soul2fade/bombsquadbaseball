import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../constants/theme';

interface Props {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  inning: number;
  half: 'top' | 'bottom';
  balls: number;
  strikes: number;
  outs: number;
}

export function ScoreBoard({
  homeName,
  awayName,
  homeScore,
  awayScore,
  inning,
  half,
  balls,
  strikes,
  outs,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Team name={awayName} score={awayScore} active={half === 'top'} />
        <View style={styles.inningBox}>
          <Text style={styles.inningArrow}>{half === 'top' ? '▲' : '▼'}</Text>
          <Text style={styles.inning}>{inning}</Text>
        </View>
        <Team name={homeName} score={homeScore} active={half === 'bottom'} />
      </View>
      <View style={styles.count}>
        <Text style={styles.countText}>B {balls}</Text>
        <Text style={styles.countText}>S {strikes}</Text>
        <Text style={styles.countText}>O {outs}</Text>
      </View>
    </View>
  );
}

function Team({ name, score, active }: { name: string; score: number; active: boolean }) {
  return (
    <View style={[styles.team, active && styles.teamActive]}>
      <Text style={styles.teamName}>{name.toUpperCase()}</Text>
      <Text style={styles.teamScore}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.uiPanel,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center', padding: spacing.sm },
  teamActive: { backgroundColor: colors.uiBg, borderRadius: radii.sm },
  teamName: { ...typography.small, color: colors.uiTextDim },
  teamScore: { ...typography.scoreboard, color: colors.uiAccent },
  inningBox: { alignItems: 'center', paddingHorizontal: spacing.md },
  inning: { ...typography.title, color: colors.uiText },
  inningArrow: { color: colors.uiAccent, fontSize: 12 },
  count: { flexDirection: 'row', justifyContent: 'space-around' },
  countText: { ...typography.body, color: colors.uiText, fontWeight: '800' },
});
