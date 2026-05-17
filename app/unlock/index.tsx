import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { CHARACTERS } from '../../characters';
import { useProgressStore } from '../../stores/progressStore';
import { STADIUM_MAP } from '../../stadiums';

export default function UnlockGallery() {
  const unlockedIds = useProgressStore((s) => s.unlockedCharacters);
  const stadiumWins = useProgressStore((s) => s.stadiumWins);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>CHARACTER GALLERY</Text>
        <Text style={styles.sub}>Unlock characters by winning at their home stadium.</Text>
        {CHARACTERS.map((char) => {
          const unlocked = unlockedIds.includes(char.id);
          const cond = char.unlockCondition;
          const stadiumName = cond.stadiumId ? STADIUM_MAP[cond.stadiumId]?.name : '';
          const wins = cond.stadiumId ? stadiumWins[cond.stadiumId] ?? 0 : 0;
          return (
            <View
              key={char.id}
              style={[styles.card, !unlocked && styles.locked]}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: char.appearance.colorPrimary },
                  !unlocked && styles.swatchLocked,
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{unlocked ? char.name : '???'}</Text>
                <Text style={styles.role}>
                  {char.role.toUpperCase()} {unlocked && `• ${char.specialAbility.name}`}
                </Text>
                {unlocked ? (
                  <Text style={styles.desc}>{char.specialAbility.description}</Text>
                ) : (
                  <Text style={styles.desc}>
                    Win {cond.count} games at {stadiumName} ({wins}/{cond.count})
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.uiBg },
  container: { padding: spacing.lg, gap: spacing.md },
  heading: { ...typography.display, color: colors.uiAccent, fontSize: 28 },
  sub: { ...typography.small, color: colors.uiTextDim },
  card: {
    backgroundColor: colors.uiPanel,
    padding: spacing.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  locked: { opacity: 0.7 },
  swatch: { width: 70, height: 70, borderRadius: 35 },
  swatchLocked: { backgroundColor: colors.uiTextDim },
  name: { ...typography.title, color: colors.uiText },
  role: { ...typography.small, color: colors.uiAccent, letterSpacing: 1 },
  desc: { ...typography.small, color: colors.uiTextDim, marginTop: spacing.xs },
});
