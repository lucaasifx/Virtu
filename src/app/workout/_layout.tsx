import { Stack } from "expo-router";
import { WorkoutProvider } from "@/src/context/WorkoutContext";

export default function WorkoutLayout() {
    return (
        <WorkoutProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Selection" />
                <Stack.Screen name="ExerciseSelection" />
                <Stack.Screen name="FinishSelection" />
                <Stack.Screen name="Execution" />
            </Stack>
        </WorkoutProvider>
    );
}
