import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../../constants/theme';

interface Props {
  active: boolean;
  travelMs: number;
  opacity?: number;
  onArrive?: () => void;
}

export function Ball({ active, travelMs, opacity = 1, onArrive }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = 0;
      progress.value = withTiming(
        1,
        { duration: travelMs, easing: Easing.in(Easing.quad) },
        (finished) => {
          if (finished && onArrive) runOnJS(onArrive)();
        }
      );
    } else {
      progress.value = 0;
    }
  }, [active, travelMs, progress, onArrive]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -200 * (1 - progress.value) },
      { scale: 0.6 + 0.5 * progress.value },
    ],
    opacity,
  }));

  if (!active) return null;
  return <Animated.View style={[styles.ball, animStyle]} />;
}

const styles = StyleSheet.create({
  ball: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ballWhite,
    borderWidth: 2,
    borderColor: colors.ballRed,
    alignSelf: 'center',
  },
});
