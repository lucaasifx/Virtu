import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from 'expo-navigation-bar';
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { ThemeFonts } from "@/src/constants/theme";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActiveWorkoutProvider } from "@/src/context/ActiveWorkoutContext";
import { WorkoutProvider } from "@/src/context/WorkoutContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...ThemeFonts,
    ...Ionicons.font,
  });

  const pathname = usePathname();

  useEffect(() => {
    const updateRootBackground = async () => {
      const isDarkScreen = pathname.includes('FinishSelection') ||
        pathname.includes('Countdown');

      await SystemUI.setBackgroundColorAsync(isDarkScreen ? 'black' : 'white');

      if (Platform.OS === 'android') {
        await NavigationBar.setButtonStyleAsync(isDarkScreen ? 'light' : 'dark');
      }
    };

    updateRootBackground();
  }, [pathname]);

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
