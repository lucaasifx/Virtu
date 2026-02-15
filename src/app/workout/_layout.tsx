import React from "react";
import { Stack } from "expo-router";
import { ActiveWorkoutProvider } from "@/src/context/ActiveWorkoutContext";
import { useWorkoutCreation } from "@/src/context/WorkoutContext";

export default function WorkoutLayout() {
    const { resetWorkout } = useWorkoutCreation();

    return (
        <ActiveWorkoutProvider onWorkoutEnd={resetWorkout}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Selection" />
                <Stack.Screen name="ExerciseSelection" />
                <Stack.Screen name="FinishSelection" />
                <Stack.Screen name="Execution" />
                <Stack.Screen name="Summary" />
            </Stack>
        </ActiveWorkoutProvider>
    );
}
