import { useEffect } from 'react';
import 'expo-dev-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.uiBg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.uiPanel },
          headerTintColor: colors.uiText,
          contentStyle: { backgroundColor: colors.uiBg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Slugger', headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="game/[stadium]" options={{ title: 'Play Ball', headerShown: false }} />
        <Stack.Screen name="game/results" options={{ title: 'Results' }} />
        <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
        <Stack.Screen name="settings/chants" options={{ title: 'Crowd Chants' }} />
        <Stack.Screen name="settings/profile" options={{ title: 'Profile' }} />
        <Stack.Screen name="unlock/index" options={{ title: 'Character Gallery' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
