import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/src/constants/theme';
import SelectionHeader from '@/components/features/Workout/SelectionHeader';
import ExerciseList from '@/components/features/Workout/ExerciseList';
import { useWorkoutCreation } from '@/src/context/WorkoutContext';
import { EXERCISES_BY_GROUP } from '@/src/constants/exercises';
import { Button } from '@/components/ui/Button';

export default function ExerciseSelectionScreen() {
    const { groupIndex } = useLocalSearchParams<{ groupIndex: string }>();
    const index = parseInt(groupIndex || '0', 10);
    const { selectedGroups, toggleExerciseSelection, selections } = useWorkoutCreation();

    if (!selectedGroups || selectedGroups.length === 0 || index >= selectedGroups.length) {
        return null;
    }

    const currentGroup = selectedGroups[index];
    const exercises = EXERCISES_BY_GROUP[currentGroup] || [];
    const selectedIds = selections[currentGroup] || [];

    const [search, setSearch] = useState('');

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleNext = () => {
        const nextIndex = index + 1;
        if (nextIndex < selectedGroups.length)
            router.push({ pathname: "/workout/ExerciseSelection", params: { groupIndex: nextIndex } });
        else
            router.push('/workout/FinishSelection');
    };

    const groupNameMap: Record<string, string> = {
        CHEST: 'Peito',
        BACK: 'Costas',
        LEGS: 'Pernas',
        SHOULDERS: 'Ombros',
        BICEPS: 'Bíceps',
        TRICEPS: 'Tríceps',
        ABS: 'Abdômen',
        CARDIO: 'Cardio',
        FULL_BODY: 'Full Body',
        OTHER: 'Outros'
    };

    const title = groupNameMap[currentGroup] || currentGroup;

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <ExerciseList
                    exercises={filteredExercises}
                    selectedIds={selectedIds}
                    onToggle={(id) => toggleExerciseSelection(currentGroup, id)}
                    listHeaderComponent={
                        <SelectionHeader
                            title={title}
                            subtitle={`Selecione os exercícios de ${title.toLowerCase()}`}
                            placeholder="Buscar exercício..."
                            search={search}
                            onSearchChange={setSearch}
                        />
                    }
                />

                <View style={styles.footer}>
                    <Button
                        title={index === selectedGroups.length - 1 ? "INICIAR" : "AVANÇAR"}
                        onPress={handleNext}
                        disabled={selectedIds.length === 0}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    safeArea: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[100],
        backgroundColor: Colors.background,
    }
});
