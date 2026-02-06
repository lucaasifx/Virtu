import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext';
import { getExerciseById } from '@/src/constants/exercises';

export function UpNextCard() {
    const { session, activeExerciseIndex, nextExercise } = useActiveWorkout();

    if (!session || activeExerciseIndex >= session.exercises.length - 1) return null;

    const nextExerciseId = session.exercises[activeExerciseIndex + 1].exerciseId;
    const nextExerciseDef = getExerciseById(nextExerciseId);

    if (!nextExerciseDef) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>A SEGUIR</Text>

            <TouchableOpacity style={styles.card} onPress={nextExercise}>
                <View style={styles.iconContainer}>
                    <Ionicons name="barbell" size={24} color={'black'} />
                </View>

                <View style={styles.details}>
                    <Text style={styles.exerciseName} numberOfLines={1}>
                        {nextExerciseDef.name}
                    </Text>
                    <Text style={styles.exerciseMeta}>
                        3 séries • 12-15 reps
                    </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    headerTitle: {
        fontSize: 12,
        color: Colors.gray[400],
        fontWeight: 'bold',
        marginBottom: Spacing.md,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    details: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 2,
    },
    exerciseMeta: {
        fontSize: 12,
        color: Colors.gray[500],
    }
});
