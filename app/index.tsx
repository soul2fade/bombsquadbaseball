import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../constants/theme';
import { Button } from '../components/ui/Button';
import { STADIUMS } from '../stadiums';
import { useSettingsStore } from '../stores/settingsStore';

export default function MainMenu() {
  const router = useRouter();
  const teamName = useSettingsStore((s) => s.teamName);
  const hasSeenOnboarding = useSettingsStore((s) => s.hasSeenOnboarding);

  useEffect(() => {
    if (!hasSeenOnboarding) router.replace('/onboarding');
  }, [hasSeenOnboarding, router]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>SLUGGER</Text>
          <Text style={styles.subtitle}>Project Baseball</Text>
        </View>

        <View style={styles.teamCard}>
          <Text style={styles.teamLabel}>YOUR TEAM</Text>
          <Text style={styles.teamName}>{teamName.toUpperCase()}</Text>
        </View>

        <Text style={styles.section}>PICK YOUR STADIUM</Text>
        <View style={styles.stadiumGrid}>
          {STADIUMS.map((stadium) => (
            <Pressable
              key={stadium.id}
              onPress={() =>
                stadium.status === 'live' && router.push(`/game/${stadium.id}` as any)
              }
              style={({ pressed }) => [
                styles.stadiumCard,
                { backgroundColor: stadium.palette.walls },
                stadium.status === 'coming_soon' && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.stadiumSwatch, { backgroundColor: stadium.palette.sky }]} />
              <Text style={styles.stadiumName}>{stadium.name}</Text>
              <Text style={styles.stadiumDesc} numberOfLines={2}>
                {stadium.description}
              </Text>
              {stadium.status === 'coming_soon' && (
                <Text style={styles.comingSoon}>COMING SOON</Text>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.actions}>
          <Link href="/unlock" asChild>
            <Button title="Character Gallery" variant="secondary" onPress={() => {}} />
          </Link>
          <Link href="/settings" asChild>
            <Button title="Settings" variant="secondary" onPress={() => {}} />
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.uiBg },
  container: { padding: spacing.lg, gap: spacing.lg },
  header: { alignItems: 'center', marginTop: spacing.md },
  title: { ...typography.display, color: colors.uiAccent, fontSize: 48 },
  subtitle: { ...typography.small, color: colors.uiTextDim, letterSpacing: 4 },
  teamCard: {
    backgroundColor: colors.uiPanel,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  teamLabel: { ...typography.small, color: colors.uiTextDim, letterSpacing: 2 },
  teamName: { ...typography.title, color: colors.uiText },
  section: { ...typography.small, color: colors.uiTextDim, letterSpacing: 2, marginTop: spacing.md },
  stadiumGrid: { gap: spacing.md },
  stadiumCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.xs,
    minHeight: 100,
  },
  stadiumSwatch: { width: 30, height: 30, borderRadius: 15, marginBottom: spacing.xs },
  stadiumName: { ...typography.title, color: colors.uiText, fontSize: 20 },
  stadiumDesc: { ...typography.small, color: colors.uiText, opacity: 0.85 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
  comingSoon: { ...typography.small, color: colors.uiAccent, letterSpacing: 2, marginTop: spacing.xs },
  actions: { gap: spacing.md, marginTop: spacing.md },
});
