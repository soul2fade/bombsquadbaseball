import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProgressStore } from '../../stores/progressStore';

export default function Profile() {
  const router = useRouter();
  const teamName = useSettingsStore((s) => s.teamName);
  const update = useSettingsStore((s) => s.update);
  const reset = useProgressStore((s) => s.reset);

  const [draft, setDraft] = useState(teamName);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>TEAM NAME</Text>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Sluggers"
          placeholderTextColor={colors.uiTextDim}
          maxLength={20}
        />
        <Button
          title="Save"
          onPress={() => {
            update({ teamName: draft.trim() || 'Sluggers' });
            router.back();
          }}
        />
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>DANGER ZONE</Text>
          <Button
            title="Reset All Progress"
            variant="secondary"
            onPress={() => reset()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.uiBg },
  container: { padding: spacing.lg, gap: spacing.md },
  label: { ...typography.small, color: colors.uiTextDim, letterSpacing: 2 },
  input: {
    backgroundColor: colors.uiPanel,
    padding: spacing.md,
    borderRadius: radii.md,
    color: colors.uiText,
    fontSize: 20,
  },
  dangerZone: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.md,
    borderColor: colors.danger,
    borderWidth: 1,
    gap: spacing.sm,
  },
  dangerTitle: { ...typography.small, color: colors.danger, letterSpacing: 2 },
});
