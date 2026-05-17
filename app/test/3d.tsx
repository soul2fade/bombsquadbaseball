import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Character3DPreview } from '../../components/test/Character3DPreview';
import { colors, spacing, typography, radii } from '../../constants/theme';

export default function Test3DScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>3D PIPELINE TEST</Text>
      </View>
      <View style={styles.previewWrap}>
        <Character3DPreview />
      </View>
      <Text style={styles.hint}>Drag to rotate camera</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.uiBg, padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: {
    backgroundColor: colors.uiPanel,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
  },
  backText: { ...typography.body, color: colors.uiAccent, fontWeight: '700' },
  title: { ...typography.title, color: colors.uiText, letterSpacing: 2 },
  previewWrap: { flex: 1, borderRadius: radii.md, overflow: 'hidden' },
  hint: { ...typography.small, color: colors.uiTextDim, textAlign: 'center' },
});
