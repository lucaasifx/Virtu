import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Spacing } from "@/src/constants/theme";
import { WorkoutSessionCard } from "@/components/features/Workout/WorkoutSessionCard";
import { WorkoutDTO } from "@/src/types/workout";

interface HistoryProps {
    workouts: WorkoutDTO[];
}

export function History({ workouts }: HistoryProps) {
    return (
        <View style={styles.container}>
            <Text variant="h2" style={styles.title}>Histórico Recente</Text>

            <View style={styles.list}>
                {workouts.map((workout) => (
                    <WorkoutSessionCard
                        key={workout.id}
                        workout={workout}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: Spacing.sm,
    },
    title: {
        marginBottom: Spacing.xs,
    },
    list: {
        gap: 0,
    }
});
