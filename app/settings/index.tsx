import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { useSettingsStore } from '../../stores/settingsStore';

export default function Settings() {
  const settings = useSettingsStore();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Section title="GAMEPLAY">
          <Row label="Sandstorm Mode">
            <Chips
              options={[
                { id: 'once_per_game', label: 'Once per game' },
                { id: 'random', label: 'Random' },
              ]}
              value={settings.sandstormMode}
              onChange={(v) => settings.update({ sandstormMode: v as any })}
            />
          </Row>
          <Row label="Difficulty">
            <Chips
              options={[
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard' },
              ]}
              value={settings.difficulty}
              onChange={(v) => settings.update({ difficulty: v as any })}
            />
          </Row>
          <Row label="Kid-Friendly Chants">
            <Switch
              value={settings.kidFriendlyChants}
              onValueChange={(v) => settings.update({ kidFriendlyChants: v })}
            />
          </Row>
        </Section>

        <Section title="ACCESSIBILITY">
          <Row label="High Contrast">
            <Switch
              value={settings.highContrast}
              onValueChange={(v) => settings.update({ highContrast: v })}
            />
          </Row>
        </Section>

        <Section title="CUSTOMIZATION">
          <Link href="/settings/profile" asChild>
            <Pressable style={styles.link}>
              <Text style={styles.linkText}>Profile & Team Name</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Link>
          <Link href="/settings/chants" asChild>
            <Pressable style={styles.link}>
              <Text style={styles.linkText}>Crowd Chants</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Link>
          <Link href="/onboarding" asChild>
            <Pressable style={styles.link}>
              <Text style={styles.linkText}>Replay Tutorial</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Link>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          onPress={() => onChange(opt.id)}
          style={[styles.chip, value === opt.id && styles.chipActive]}
        >
          <Text style={[styles.chipText, value === opt.id && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.uiBg },
  container: { padding: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.small, color: colors.uiTextDim, letterSpacing: 2 },
  row: {
    backgroundColor: colors.uiPanel,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  rowLabel: { ...typography.body, color: colors.uiText },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.uiTextDim,
  },
  chipActive: { backgroundColor: colors.uiAccent, borderColor: colors.uiAccent },
  chipText: { ...typography.small, color: colors.uiTextDim, fontWeight: '700' },
  chipTextActive: { color: colors.uiBg },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.uiPanel,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  linkText: { ...typography.body, color: colors.uiText },
  chevron: { ...typography.title, color: colors.uiTextDim },
});
