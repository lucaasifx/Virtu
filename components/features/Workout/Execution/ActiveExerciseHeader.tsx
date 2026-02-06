import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext';
import { getExerciseById } from '@/src/constants/exercises';

export function ActiveExerciseHeader() {
    const { getActiveExercise } = useActiveWorkout();
    const activeSession = getActiveExercise();
    const exercise = activeSession ? getExerciseById(activeSession.exerciseId) : null;

    if (!exercise) return null;

    const parseName = (fullName: string) => {
        const parts = fullName.split('(');
        const title = parts[0].trim();
        const subtitle = parts.length > 1 ? `(${parts[1]}` : '';
        return { title, subtitle };
    };

    const { title, subtitle } = parseName(exercise.name);

    return (
        <View style={styles.container}>
            <Text variant="h1" style={styles.title}>{title}</Text>
            {!!subtitle && (
                <Text variant="h3" style={styles.subtitle}>{subtitle}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    title: {
        color: Colors.text.primary,
        fontSize: 32,
        lineHeight: 38,
        fontFamily: 'Montserrat_800ExtraBold',
    },
    subtitle: {
        color: Colors.gray[400],
        fontSize: 18,
        marginTop: 4,
        fontWeight: '500',
    }
});
