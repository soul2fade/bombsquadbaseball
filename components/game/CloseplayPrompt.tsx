import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { TAP_WINDOW_MS, TAP_SWEET_SPOT_MS } from '../../engines/fieldingEngine';

interface Props {
  fieldWidthPx: number;
  fieldHeightPx: number;
  targetX: number;
  targetY: number;
  onResult: (success: boolean) => void;
}

export function CloseplayPrompt({ fieldWidthPx, fieldHeightPx, targetX, targetY, onResult }: Props) {
  const startedAtRef = React.useRef<number>(Date.now());
  const scale = useSharedValue(1);
  const resolvedRef = React.useRef(false);

  React.useEffect(() => {
    startedAtRef.current = Date.now();
    resolvedRef.current = false;
    scale.value = 1;
    scale.value = withTiming(0, { duration: TAP_WINDOW_MS });
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        onResult(Math.random() < 0.5);
      }
    }, TAP_WINDOW_MS);
    return () => clearTimeout(timeout);
  }, []);

  const handleTap = () => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    const elapsed = Date.now() - startedAtRef.current;
    const centerOfSweet = (TAP_WINDOW_MS - TAP_SWEET_SPOT_MS) / 2 + TAP_SWEET_SPOT_MS / 2;
    const fromCenter = Math.abs(elapsed - centerOfSweet);
    const success = fromCenter <= TAP_SWEET_SPOT_MS / 2;
    onResult(success);
  };

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const left = ((targetX + 1) / 2) * fieldWidthPx - 30;
  const top = (1 - targetY) * fieldHeightPx - 30;

  return (
    <View style={[styles.wrap, { left, top }]}>
      <Pressable onPress={handleTap} style={styles.pressable}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <View style={styles.center}>
          <Text style={styles.text}>TAP</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', width: 60, height: 60 },
  pressable: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFD23F',
  },
  center: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,210,63,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 11, fontWeight: '800', color: '#000' },
});
