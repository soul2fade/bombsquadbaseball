import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../constants/theme';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../stores/settingsStore';

interface Slide {
  title: string;
  body: string;
  accent: string;
  emoji: string;
}

const SLIDES: Slide[] = [
  {
    title: 'PLAY BALL',
    body: 'Tap a pitch to throw it. Tap SWING the moment the ball reaches the plate — perfect timing means perfect contact.',
    accent: colors.uiAccent,
    emoji: '⚾',
  },
  {
    title: 'STADIUMS HAVE PERSONALITY',
    body: 'Each ballpark plays differently. Sandstorms blow your fly balls off course. Mountain air carries them further. Watch the field — it tells you what to expect.',
    accent: '#FF6B35',
    emoji: '🏟',
  },
  {
    title: 'CLUTCH MOMENTS WIN GAMES',
    body: 'Full count with two outs unlocks a Clutch Pitch. Down a run in the 9th unlocks Last Stand. Pressure brings power-ups — use them.',
    accent: '#3DDC97',
    emoji: '⚡',
  },
  {
    title: 'UNLOCK YOUR ROSTER',
    body: 'Win 3 games at any stadium to unlock that park\'s home character. Each brings a unique pitching or hitting ability.',
    accent: '#5DA9E9',
    emoji: '★',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const update = useSettingsStore((s) => s.update);
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function next() {
    if (isLast) {
      update({ hasSeenOnboarding: true });
      router.replace('/');
    } else {
      setIndex((i) => i + 1);
    }
  }

  function skip() {
    update({ hasSeenOnboarding: true });
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.skipRow}>
        <Pressable onPress={skip} hitSlop={20}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.center}>
        <View style={[styles.emojiCircle, { backgroundColor: slide.accent }]}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>
        <Text style={[styles.title, { color: slide.accent }]}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index && [styles.dotActive, { backgroundColor: slide.accent }],
              ]}
            />
          ))}
        </View>
        <Button title={isLast ? "Let's play" : 'Next'} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.uiBg, padding: spacing.lg },
  skipRow: { alignItems: 'flex-end' },
  skip: { ...typography.body, color: colors.uiTextDim, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  emojiCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 80 },
  title: { ...typography.display, textAlign: 'center', letterSpacing: 2 },
  body: {
    ...typography.body,
    color: colors.uiText,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 340,
  },
  bottom: { gap: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.uiTextDim,
    opacity: 0.4,
  },
  dotActive: {
    opacity: 1,
    width: 28,
    borderRadius: 5,
  },
});
