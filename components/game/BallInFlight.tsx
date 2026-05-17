import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing, runOnJS } from 'react-native-reanimated';

interface Props {
  fieldWidthPx: number;
  fieldHeightPx: number;
  landingX: number;
  landingY: number;
  durationMs: number;
  onLanded?: () => void;
}

export function BallInFlight({
  fieldWidthPx,
  fieldHeightPx,
  landingX,
  landingY,
  durationMs,
  onLanded,
}: Props) {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: durationMs, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (finished && onLanded) {
          runOnJS(onLanded)();
        }
      }
    );
  }, [landingX, landingY, durationMs]);

  const style = useAnimatedStyle(() => {
    const startLeft = fieldWidthPx / 2 - 6;
    const startTop = fieldHeightPx - 30;
    const endLeft = ((landingX + 1) / 2) * fieldWidthPx - 6;
    const endTop = (1 - landingY) * fieldHeightPx - 6;
    const left = startLeft + (endLeft - startLeft) * progress.value;
    const top = startTop + (endTop - startTop) * progress.value;
    const arcHeight = 60 * Math.sin(Math.PI * progress.value);
    return { transform: [{ translateX: left }, { translateY: top - arcHeight }] };
  });

  return <Animated.View style={[styles.ball, style]} />;
}

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c00',
  },
});
