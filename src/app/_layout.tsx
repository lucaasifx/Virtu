import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { ThemeFonts, Colors } from "@/src/constants/theme";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActiveWorkoutProvider } from "@/src/context/ActiveWorkoutContext";
import { WorkoutProvider, useWorkoutCreation } from "@/src/context/WorkoutContext";
import { GamificationProvider } from "@/src/context/GamificationContext";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { ThemeProvider, useAppTheme } from "@/src/context/ThemeContext";
import { useDataSync } from "@/src/hooks/useDataSync";

SplashScreen.preventAutoHideAsync();

const DARK_SCREENS = ['FinishSelection', 'Countdown', 'Execution'];

function ActiveWorkoutBridge({ children }: { children: React.ReactNode }) {
  const { resetWorkout } = useWorkoutCreation();
  return (
    <ActiveWorkoutProvider onWorkoutEnd={resetWorkout}>
      {children}
    </ActiveWorkoutProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/Home');
    }
  }, [isLoading, router, segments, user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return <>{children}</>;
}

function DataSyncWrapper({ children }: { children: React.ReactNode }) {
  useDataSync();
  return <>{children}</>;
}

function AppContent({ isDarkScreen }: { isDarkScreen: boolean }) {
  const { resolvedTheme } = useAppTheme();
  const statusBarStyle = isDarkScreen || resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <>
      <StatusBar
        style={statusBarStyle}
        translucent
        backgroundColor="transparent"
      />
      <AuthProvider>
        <AuthGate>
          <GamificationProvider>
            <WorkoutProvider>
              <ActiveWorkoutBridge>
                <DataSyncWrapper>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  </Stack>
                </DataSyncWrapper>
              </ActiveWorkoutBridge>
            </WorkoutProvider>
          </GamificationProvider>
        </AuthGate>
      </AuthProvider>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...ThemeFonts,
    ...Ionicons.font,
    ...Feather.font,
  });

  const pathname = usePathname();

  const isDarkScreen = useMemo(() => {
    return DARK_SCREENS.some(screen => pathname.includes(screen));
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
      <ThemeProvider>
        <AppContent isDarkScreen={isDarkScreen} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
