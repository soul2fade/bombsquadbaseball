import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { getCharacter } from '../../characters';
import { getStadium } from '../../stadiums';
import { useProgressStore } from '../../stores/progressStore';

export default function Results() {
  const router = useRouter();
  const { won, stadiumId, unlocked } = useLocalSearchParams<{
    won: string;
    stadiumId: string;
    unlocked?: string;
  }>();

  const isWin = won === '1';
  const stadium = getStadium(stadiumId ?? '');
  const unlockedIds = (unlocked ?? '').split(',').filter(Boolean);
  const unlockedChars = unlockedIds.map((id) => getCharacter(id)).filter(Boolean);
  const winsHere = useProgressStore((s) => s.stadiumWins[stadiumId ?? ''] ?? 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, isWin ? styles.win : styles.loss]}>
          {isWin ? 'VICTORY' : 'DEFEAT'}
        </Text>
        {stadium && <Text style={styles.stadium}>{stadium.name}</Text>}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Wins at this stadium</Text>
          <Text style={styles.statValue}>{winsHere}</Text>
        </View>

        {unlockedChars.length > 0 && (
          <View style={styles.unlockBox}>
            <Text style={styles.unlockTitle}>★ NEW UNLOCK ★</Text>
            {unlockedChars.map((c) => (
              <View key={c!.id} style={styles.charRow}>
                <View
                  style={[
                    styles.charSwatch,
                    { backgroundColor: c!.appearance.colorPrimary },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.charName}>{c!.name}</Text>
                  <Text style={styles.charDesc}>{c!.specialAbility.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Button title="Play Again" onPress={() => router.replace(`/game/${stadiumId}` as any)} />
          <Button title="Main Menu" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.uiBg },
  container: { padding: spacing.lg, gap: spacing.lg, alignItems: 'center' },
  title: { ...typography.display, fontSize: 56 },
  win: { color: colors.uiAccent },
  loss: { color: colors.danger },
  stadium: { ...typography.title, color: colors.uiText },
  statCard: {
    backgroundColor: colors.uiPanel,
    padding: spacing.lg,
    borderRadius: radii.md,
    alignItems: 'center',
    minWidth: 200,
  },
  statLabel: { ...typography.small, color: colors.uiTextDim },
  statValue: { ...typography.scoreboard, color: colors.uiAccent },
  unlockBox: {
    backgroundColor: colors.uiPanel,
    borderColor: colors.uiAccent,
    borderWidth: 2,
    padding: spacing.lg,
    borderRadius: radii.lg,
    width: '100%',
    gap: spacing.md,
  },
  unlockTitle: {
    ...typography.title,
    color: colors.uiAccent,
    textAlign: 'center',
    letterSpacing: 2,
  },
  charRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  charSwatch: { width: 60, height: 60, borderRadius: 30 },
  charName: { ...typography.title, color: colors.uiText },
  charDesc: { ...typography.small, color: colors.uiTextDim },
  actions: { width: '100%', gap: spacing.md },
});
