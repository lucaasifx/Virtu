import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext';
import { getExerciseById } from '@/src/constants/exercises';

interface WorkoutEditModalProps {
    visible: boolean;
    onClose: () => void;
}

export function WorkoutEditModal({ visible, onClose }: WorkoutEditModalProps) {
    const { session, removeExercise } = useActiveWorkout();

    if (!session) return null;



    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />

                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Editar Treino</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={Colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.list}>
                        {session.exerciseOrder.map((exerciseId, index) => {
                            const exerciseDef = getExerciseById(exerciseId);
                            if (!exerciseDef) return null;

                            return (
                                <View key={exerciseId} style={styles.item}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemNumber}>{index + 1}</Text>
                                        <Text style={styles.itemName} numberOfLines={1}>{exerciseDef.name}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => removeExercise(exerciseId)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color={Colors.error} />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
        height: '60%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text.primary,
        fontFamily: 'Montserrat_800ExtraBold',
    },
    closeButton: {
        padding: 4,
        backgroundColor: Colors.surface,
        borderRadius: 16,
    },
    list: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    itemNumber: {
        fontSize: 14,
        color: Colors.gray[400],
        fontWeight: 'bold',
        width: 24,
    },
    itemName: {
        fontSize: 16,
        color: Colors.text.primary,
        fontWeight: '600',
        flex: 1,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 69, 58, 0.1)',
        borderRadius: 8,
    }
});
