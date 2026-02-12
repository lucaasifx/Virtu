import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ExerciseSession } from '@/src/types/execution';
import { MuscleGroup } from '@/src/types/workout';
import { getExerciseById } from '@/src/constants/exercises';

interface MuscleGroupSectionProps {
    group: MuscleGroup;
    exercises: ExerciseSession[];
    onMoveExercise: (exerciseId: string, direction: 'up' | 'down') => void;
    onMoveGroup: (direction: 'up' | 'down') => void;
    activeExerciseIndex: number;
    activeExerciseId?: string;
    globalStartIndex: number;
    isFirstGroup: boolean;
    isLastGroup: boolean;
}

export function MuscleGroupSection({
    group,
    exercises,
    onMoveExercise,
    onMoveGroup,
    activeExerciseIndex,
    activeExerciseId,
    globalStartIndex,
    isFirstGroup,
    isLastGroup
}: MuscleGroupSectionProps) {

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

    const groupDisplayName = groupNameMap[group] || group;

    const header = (
        <View style={styles.headerItemContainer}>
            <View style={styles.headerTitleContainer}>
                <MaterialCommunityIcons name="format-list-bulleted-type" size={14} color={Colors.primary} />
                <Text style={styles.headerTitle}>{groupDisplayName.toUpperCase()}</Text>
            </View>

            <View style={styles.headerControls}>
                <TouchableOpacity
                    onPress={() => onMoveGroup('up')}
                    disabled={isFirstGroup}
                    style={[styles.arrowButton, isFirstGroup && styles.arrowButtonDisabled]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="caret-up" size={20} color={isFirstGroup ? Colors.gray[500] : Colors.gray[300]} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onMoveGroup('down')}
                    disabled={isLastGroup}
                    style={[styles.arrowButton, isLastGroup && styles.arrowButtonDisabled]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="caret-down" size={20} color={isLastGroup ? Colors.gray[500] : Colors.gray[300]} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderExerciseItem = (item: ExerciseSession, index: number) => {
        const localIndex = index;
        const currentGlobalIndex = globalStartIndex + localIndex;

        const isCompleted = currentGlobalIndex < activeExerciseIndex;
        const isActiveItem = activeExerciseId ? item.exerciseId === activeExerciseId : (currentGlobalIndex === activeExerciseIndex);
        const isSkipped = item.skipped;

        const isFirstInGroup = index === 0;
        const isLastInGroup = index === exercises.length - 1;

        const exerciseDef = getExerciseById(item.exerciseId);
        const effectiveLocked = isCompleted || (isSkipped && currentGlobalIndex < activeExerciseIndex);

        let status = 'pending';
        if (isSkipped) status = 'skipped';
        else if (isCompleted) status = 'completed';
        else if (isActiveItem) status = 'active';

        return (
            <View
                key={item.exerciseId}
                style={[
                    styles.itemContainer,
                    isActiveItem && styles.activeBorder,
                    effectiveLocked && styles.lockedItem,
                    isSkipped && styles.skippedItem
                ]}
            >
                <View style={styles.itemContent}>
                    <View style={[styles.iconContainer, isActiveItem && { backgroundColor: Colors.primary }]}>
                        <MaterialCommunityIcons
                            name="dumbbell"
                            size={20}
                            color={isActiveItem ? '#000' : Colors.gray[400]}
                        />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={[styles.exerciseName, isActiveItem && { color: Colors.primary }, effectiveLocked && styles.textLocked]} numberOfLines={1}>
                            {exerciseDef?.name || 'Exercício'}
                        </Text>
                        <View style={styles.detailsRow}>
                            <Text style={styles.exerciseDetails}>{item.targetSets}x 8-12</Text>

                            {isActiveItem && (
                                <View style={styles.badgeActive}>
                                    <Text style={styles.badgeTextActive}>Agora</Text>
                                </View>
                            )}

                            {status === 'completed' && (
                                <View style={styles.badgeCompleted}>
                                    <Ionicons name="checkmark" size={12} color={Colors.primary} />
                                    <Text style={styles.badgeTextCompleted}>Concluído</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.handleContainer}>
                    {!effectiveLocked ? (
                        <View style={styles.arrowsContainer}>
                            <TouchableOpacity
                                onPress={() => onMoveExercise(item.exerciseId, 'up')}
                                disabled={isFirstInGroup || currentGlobalIndex <= activeExerciseIndex}
                                style={[styles.arrowButton, (isFirstInGroup || currentGlobalIndex <= activeExerciseIndex) && styles.arrowButtonDisabled]}
                                hitSlop={{ top: 15, bottom: 5, left: 15, right: 15 }}
                            >
                                <Ionicons name="caret-up" size={15} color={Colors.gray[300]} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => onMoveExercise(item.exerciseId, 'down')}
                                disabled={isLastInGroup}
                                style={[styles.arrowButton, isLastInGroup && styles.arrowButtonDisabled]}
                                hitSlop={{ top: 5, bottom: 15, left: 15, right: 15 }}
                            >
                                <Ionicons name="caret-down" size={15} color={Colors.gray[300]} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <Ionicons
                            name={isSkipped ? "play-skip-forward" : "lock-closed"}
                            size={18}
                            color={Colors.gray[500]}
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.sectionContainer}>
            {header}
            <View style={{ gap: 8 }}>
                {exercises.map((item, index) => renderExerciseItem(item, index))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginBottom: 20,
    },
    headerItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    headerControls: {
        flexDirection: 'row',
        gap: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1C1C1E',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2C2C2E',
    },
    activeBorder: {
        borderColor: Colors.primary,
        backgroundColor: '#222224',
    },
    lockedItem: {
        opacity: 0.6,
        backgroundColor: '#121212',
    },
    textLocked: {
        color: Colors.gray[500],
        textDecorationLine: 'line-through'
    },
    skippedItem: {
        opacity: 0.4,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#2C2C2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    exerciseDetails: {
        fontSize: 13,
        color: Colors.gray[400],
    },

    handleContainer: {
        paddingLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
        width: 48,
    },
    arrowsContainer: {
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    arrowButton: {
        padding: 8,
        backgroundColor: '#2A2A2A',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowButtonDisabled: {
        opacity: 0.2,
        backgroundColor: 'transparent',
    },

    badgeCompleted: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    badgeTextCompleted: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    badgeSkipped: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    badgeTextSkipped: {
        color: Colors.gray[400],
        fontSize: 10,
    },
    badgeActive: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeTextActive: {
        color: '#000000',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
