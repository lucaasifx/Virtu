import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WorkoutExerciseListModal } from './WorkoutExerciseListModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

const { width } = Dimensions.get('window');

export function WorkoutPlayerBar() {
    const { isPaused, togglePause, nextExercise, finishWorkout, getActiveExercise, skipExercise } = useActiveWorkout();
    const insets = useSafeAreaInsets();
    const [showList, setShowList] = React.useState(false);
    const [showSkipConfirm, setShowSkipConfirm] = React.useState(false);

    const handleNext = () => {
        const currentExercise = getActiveExercise();
        if (currentExercise && currentExercise.sets.length === 0) {
            setShowSkipConfirm(true);
        } else {
            nextExercise();
        }
    };

    const handleConfirmSkip = () => {
        skipExercise();
        setShowSkipConfirm(false);
    };

    return (
        <>
            <View style={[styles.container, { bottom: Spacing.xs + insets.bottom }]}>

                <TouchableOpacity style={styles.leftContainer} onPress={() => setShowList(true)}>
                    <View style={styles.listIcon}>
                        <Ionicons name="list" size={20} color={Colors.gray[400]} />
                    </View>
                    <View>
                        <Text style={styles.workoutLabel}>TREINO A</Text>
                        <Text style={styles.workoutName}>Peitoral Completo</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.controlsContainer}>
                    <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
                        <Ionicons name="play-skip-forward" size={20} color={Colors.gray[400]} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.playButton} onPress={togglePause}>
                        <Ionicons
                            name={isPaused ? "play" : "pause"}
                            size={24}
                            color={Colors.background}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <WorkoutExerciseListModal
                visible={showList}
                onClose={() => setShowList(false)}
            />

            <ConfirmationModal
                visible={showSkipConfirm}
                title="Pular Exercício?"
                message="Você não registrou nenhuma série para este exercício. Deseja pular e deixá-lo como pendente/pulado?"
                confirmText="Sim, pular"
                cancelText="Cancelar"
                onConfirm={handleConfirmSkip}
                onClose={() => setShowSkipConfirm(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1A1A1A',
        marginHorizontal: Spacing.md,
        borderRadius: 30,
        padding: Spacing.sm,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xl,
        height: 70,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    listIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    workoutLabel: {
        fontSize: 10,
        color: Colors.primary,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    workoutName: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    controlButton: {
        padding: 5,
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
