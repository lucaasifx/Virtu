import React, { useMemo } from 'react';
import { View, StyleSheet, Modal, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext';
import { ExerciseSession } from '@/src/types/execution';
import { getExerciseById } from '@/src/constants/exercises';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MuscleGroup } from '@/src/types/workout';
import { MuscleGroupSection } from './MuscleGroupSection';

interface WorkoutExerciseListModalProps {
    visible: boolean;
    onClose: () => void;
}

interface GroupSectionData {
    group: MuscleGroup;
    exercises: ExerciseSession[];
    startIndex: number;
}

export function WorkoutExerciseListModal({ visible, onClose }: WorkoutExerciseListModalProps) {
    const { session, updateExercises, moveGroup, reorderExercises, activeExerciseIndex } = useActiveWorkout();
    const insets = useSafeAreaInsets();

    if (!session) return null;

    const groups = useMemo(() => {
        const result: GroupSectionData[] = [];
        let currentGroup: MuscleGroup | null = null;
        let currentExercises: ExerciseSession[] = [];
        let groupStartIndex = 0;

        session.exerciseOrder.forEach((exerciseId, index) => {
            const ex = session.exercises[exerciseId];
            const def = getExerciseById(ex.exerciseId);
            const group = def?.muscleGroup ?? 'Outros' as MuscleGroup;

            if (group !== currentGroup) {
                if (currentGroup !== null) {
                    result.push({
                        group: currentGroup,
                        exercises: currentExercises,
                        startIndex: groupStartIndex
                    });
                }
                currentGroup = group;
                currentExercises = [ex];
                groupStartIndex = index;
            } else {
                currentExercises.push(ex);
            }
        });

        if (currentGroup !== null) {
            result.push({
                group: currentGroup,
                exercises: currentExercises,
                startIndex: groupStartIndex
            });
        }

        return result;
    }, [session.exercises, session.exerciseOrder]);

    const handleGroupMove = React.useCallback((group: MuscleGroup, direction: 'up' | 'down') => {
        moveGroup(group, direction);
    }, [moveGroup]);

    const handleMoveExercise = (exerciseId: string, direction: 'up' | 'down') => {
        const globalIndex = session.exerciseOrder.indexOf(exerciseId);
        if (globalIndex === -1) return;

        const targetIndex = direction === 'up' ? globalIndex - 1 : globalIndex + 1;

        if (targetIndex < 0 || targetIndex >= session.exerciseOrder.length) return;


        const exerciseDef = getExerciseById(session.exerciseOrder[globalIndex]);
        const targetExerciseDef = getExerciseById(session.exerciseOrder[targetIndex]);

        if (exerciseDef?.muscleGroup !== targetExerciseDef?.muscleGroup) {
            return;
        }

        reorderExercises(globalIndex, targetIndex);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            presentationStyle="overFullScreen"
            onRequestClose={onClose}
            transparent={true}
        >
            <View style={{ flex: 1, backgroundColor: '#000000' }}>
                <StatusBar barStyle="light-content" backgroundColor="#000000" />
                <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>

                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Lista de Treino</Text>
                            <Text style={styles.subtitle}>ORGANIZAR E VISUALIZAR</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.listContainer}>
                        <ScrollView
                            contentContainerStyle={{
                                paddingHorizontal: Spacing.md,
                                paddingBottom: insets.bottom + 20,
                            }}
                        >
                            {groups.map((groupData, index) => (
                                <MuscleGroupSection
                                    key={`${groupData.group}-${groupData.startIndex}`}
                                    group={groupData.group}
                                    exercises={groupData.exercises}
                                    activeExerciseIndex={activeExerciseIndex}
                                    activeExerciseId={session.exerciseOrder[activeExerciseIndex]}
                                    globalStartIndex={groupData.startIndex}
                                    isFirstGroup={index === 0}
                                    isLastGroup={index === groups.length - 1}
                                    onMoveGroup={(direction) => handleGroupMove(groupData.group, direction)}
                                    onMoveExercise={handleMoveExercise}
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111111',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 10,
        color: Colors.gray[400],
        fontWeight: '600',
        marginTop: 2,
        letterSpacing: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
    },
});