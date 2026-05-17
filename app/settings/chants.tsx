import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../../constants/theme';
import { ChantEngine, UNIVERSAL_CHANTS } from '../../engines/chantEngine';
import { useSettingsStore } from '../../stores/settingsStore';
import { useChantUIStore } from '../../stores/chantStore';
import { STADIUMS } from '../../stadiums';

export default function ChantSettings() {
  const customChants = useSettingsStore((s) => s.customChants);
  const setCustomChant = useSettingsStore((s) => s.setCustomChant);
  const resetCustomChant = useSettingsStore((s) => s.resetCustomChant);
  const teamName = useSettingsStore((s) => s.teamName);
  const showChant = useChantUIStore((s) => s.show);

  const sections = useMemo(() => {
    const universal = Object.entries(UNIVERSAL_CHANTS).map(([trigger, chant]) => ({
      trigger,
      defaultText: chant.text,
      style: chant.style ?? 'cheer',
    }));
    const stadiumSections = STADIUMS.filter((s) => Object.keys(s.crowdChants).length > 0).map(
      (s) => ({
        name: s.name,
        items: Object.entries(s.crowdChants).map(([trigger, chant]) => ({
          trigger,
          defaultText: chant.text,
          style: chant.style ?? 'cheer',
        })),
      })
    );
    return { universal, stadiumSections };
  }, []);

  function preview(trigger: string, text: string, style: any) {
    const engine = new ChantEngine({}, { [trigger]: { text } });
    const result = engine.trigger(trigger, { teamName, score: 0, inning: 1 });
    if (result) showChant(result.text, style, 2000);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>UNIVERSAL CHANTS</Text>
        {sections.universal.map((item) => (
          <ChantRow
            key={item.trigger}
            trigger={item.trigger}
            defaultText={item.defaultText}
            currentText={customChants[item.trigger]}
            onChange={(text) => setCustomChant(item.trigger, text)}
            onReset={() => resetCustomChant(item.trigger)}
            onPreview={() =>
              preview(
                item.trigger,
                customChants[item.trigger] ?? item.defaultText,
                item.style
              )
            }
          />
        ))}
        {sections.stadiumSections.map((section) => (
          <View key={section.name}>
            <Text style={styles.sectionTitle}>{section.name.toUpperCase()} CHANTS</Text>
            {section.items.map((item) => (
              <ChantRow
                key={item.trigger}
                trigger={item.trigger}
                defaultText={item.defaultText}
                currentText={customChants[item.trigger]}
                onChange={(text) => setCustomChant(item.trigger, text)}
                onReset={() => resetCustomChant(item.trigger)}
                onPreview={() =>
                  preview(
                    item.trigger,
                    customChants[item.trigger] ?? item.defaultText,
                    item.style
                  )
                }
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ChantRowProps {
  trigger: string;
  defaultText: string;
  currentText?: string;
  onChange: (text: string) => void;
  onReset: () => void;
  onPreview: () => void;
}

function ChantRow({
  trigger,
  defaultText,
  currentText,
  onChange,
  onReset,
  onPreview,
}: ChantRowProps) {
  const [draft, setDraft] = useState(currentText ?? defaultText);
  const isCustom = currentText !== undefined && currentText !== defaultText;

  return (
    <View style={styles.row}>
      <Text style={styles.trigger}>{trigger.replace(/_/g, ' ').toUpperCase()}</Text>
      <TextInput
        value={draft}
        onChangeText={(text) => {
          setDraft(text);
          onChange(text);
        }}
        style={styles.input}
        placeholder={defaultText}
        placeholderTextColor={colors.uiTextDim}
        multiline
      />
      <View style={styles.actions}>
        <Pressable onPress={onPreview} style={styles.btn}>
          <Text style={styles.btnText}>Preview</Text>
        </Pressable>
        {isCustom && (
          <Pressable
            onPress={() => {
              setDraft(defaultText);
              onReset();
            }}
            style={[styles.btn, styles.ghost]}
          >
            <Text style={[styles.btnText, styles.ghostText]}>Reset</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.uiBg },
  container: { padding: spacing.md, gap: spacing.sm },
  sectionTitle: {
    ...typography.small,
    color: colors.uiTextDim,
    letterSpacing: 2,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  row: {
    backgroundColor: colors.uiPanel,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  trigger: { ...typography.small, color: colors.uiAccent, letterSpacing: 1, fontWeight: '900' },
  input: {
    backgroundColor: colors.uiBg,
    padding: spacing.sm,
    borderRadius: radii.sm,
    color: colors.uiText,
    minHeight: 44,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    backgroundColor: colors.uiAccent,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.uiTextDim },
  btnText: { ...typography.small, color: colors.uiBg, fontWeight: '800' },
  ghostText: { color: colors.uiTextDim },
});
