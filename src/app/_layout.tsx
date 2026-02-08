import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo } from "react";
import { Platform } from "react-native";
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { ThemeFonts } from "@/src/constants/theme";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActiveWorkoutProvider } from "@/src/context/ActiveWorkoutContext";
import { WorkoutProvider } from "@/src/context/WorkoutContext";

SplashScreen.preventAutoHideAsync();

const DARK_SCREENS = ['FinishSelection', 'Countdown', 'Execution'];

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...ThemeFonts,
    ...Ionicons.font,
  });

  const pathname = usePathname();

  const isDarkScreen = useMemo(() => {
    return DARK_SCREENS.some(screen => pathname.includes(screen));
  }, [pathname]);

  useEffect(() => {
    const setupTransparentBars = async () => {
      await SystemUI.setBackgroundColorAsync(isDarkScreen ? 'black' : 'white');

      if (Platform.OS === 'android') {
        // Only set button style - edge-to-edge is configured via app.json plugin
        await NavigationBar.setButtonStyleAsync(isDarkScreen ? 'light' : 'dark');
      }
    };

    setupTransparentBars();
  }, [isDarkScreen]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        style={isDarkScreen ? 'light' : 'dark'}
        translucent
        backgroundColor="transparent"
      />
      <WorkoutProvider>
        <ActiveWorkoutProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ActiveWorkoutProvider>
      </WorkoutProvider>
    </GestureHandlerRootView>
  );
}
