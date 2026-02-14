import { Stack } from "expo-router";

export default function WorkoutLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Selection" />
            <Stack.Screen name="ExerciseSelection" />
            <Stack.Screen name="FinishSelection" />
            <Stack.Screen name="Execution" />
            <Stack.Screen name="Summary" />
        </Stack>
    );
}
