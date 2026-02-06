import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/src/constants/theme';
import SelectionHeader from '@/components/features/Workout/SelectionHeader';
import ExerciseList from '@/components/features/Workout/ExerciseList';
import { useWorkoutCreation } from '@/src/context/WorkoutContext';
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext'; // Add import
import { EXERCISES_BY_GROUP } from '@/src/constants/exercises';
import { Button } from '@/components/ui/Button';
import { MuscleGroup } from '@/src/types/workout';

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function ExerciseSelectionScreen() {
    const params = useLocalSearchParams<{ groupIndex: string; mode?: string; muscleGroup?: string }>();
    const isEditMode = params.mode === 'edit';
    const groupIndex = parseInt(params.groupIndex || '0', 10);

    // Creation Context
    const { selectedGroups, toggleExerciseSelection, selections } = useWorkoutCreation();

    // Active Context
    const { session, toggleExercise } = useActiveWorkout();

    // Determine Group
    let currentGroup: MuscleGroup | null = null;

    if (isEditMode) {
        // In edit mode, we expect muscleGroup param
        if (params.muscleGroup) {
            currentGroup = params.muscleGroup as MuscleGroup;
        } else {
            // Fallback or error?
            currentGroup = MuscleGroup.CHEST; // Safe default?
        }
    } else {
        if (selectedGroups && selectedGroups.length > 0 && groupIndex < selectedGroups.length) {
            currentGroup = selectedGroups[groupIndex];
        }
    }

    if (!currentGroup) {
        // Handle case where state is missing (reload/deep link?)
        return <View style={styles.container} />;
    }

    const exercises = EXERCISES_BY_GROUP[currentGroup] || [];

    // Determine Selected IDs & Toggle Handler
    let selectedIds: string[] = [];
    let handleToggle = (id: string) => { };

    if (isEditMode) {
        if (session) {
            selectedIds = session.exercises
                .map(e => e.exerciseId);
            handleToggle = (id: string) => {
                const exerciseInSession = session.exercises.find(e => e.exerciseId === id);

                if (exerciseInSession && exerciseInSession.sets.length > 0) {
                    setPendingRemovalId(id);
                    setShowConfirmModal(true);
                } else
                    toggleExercise(id);
            };
        }
    } else {
        selectedIds = selections[currentGroup] || [];
        handleToggle = (id: string) => {
            if (currentGroup) toggleExerciseSelection(currentGroup, id);
        };
    }

    const [search, setSearch] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);

    const filteredExercises = exercises.filter(ex =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleNext = () => {
        if (isEditMode) {
            router.back();
            return;
        }

        const nextIndex = groupIndex + 1;
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
    const buttonTitle = isEditMode ? "VOLTAR AO TREINO" : (groupIndex === selectedGroups.length - 1 ? "INICIAR" : "AVANÇAR");

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <ExerciseList
                    exercises={filteredExercises}
                    selectedIds={selectedIds}
                    onToggle={handleToggle}
                    listHeaderComponent={
                        <SelectionHeader
                            title={title}
                            subtitle={isEditMode ? "Editando treino atual" : `Selecione os exercícios de ${title.toLowerCase()}`}
                            placeholder="Buscar exercício..."
                            search={search}
                            onSearchChange={setSearch}
                        />
                    }
                />

                <View style={styles.footer}>
                    <Button
                        title={buttonTitle}
                        onPress={handleNext}
                        disabled={!isEditMode && selectedIds.length === 0}
                    />
                </View>

                <ConfirmationModal
                    visible={showConfirmModal}
                    title="Remover exercício?"
                    message="Este exercício possui séries registradas que serão perdidas. Deseja continuar?"
                    confirmText="Remover"
                    cancelText="Cancelar"
                    onClose={() => {
                        setShowConfirmModal(false);
                        setPendingRemovalId(null);
                    }}
                    onConfirm={() => {
                        if (pendingRemovalId) {
                            toggleExercise(pendingRemovalId);
                        }
                        setShowConfirmModal(false);
                        setPendingRemovalId(null);
                    }}
                />
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
