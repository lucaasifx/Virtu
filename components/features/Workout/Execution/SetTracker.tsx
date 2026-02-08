import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { RpeSlider } from './RpeSlider';
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext';
import * as Haptics from 'expo-haptics';

export const SetTracker = React.memo(function SetTracker() {
    const { getActiveExercise, logSet } = useActiveWorkout();
    const activeSession = getActiveExercise();

    const [weight, setWeight] = useState(20);
    const [reps, setReps] = useState(12);
    const [rpe, setRpe] = useState(8);


    const currentSetNumber = (activeSession?.sets.length || 0) + 1;
    const targetSets = activeSession?.targetSets || 4;
    const isExtraSet = currentSetNumber > targetSets;

    const handleIncrement = (type: 'weight' | 'reps', amount: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (type === 'weight') setWeight(prev => Math.max(0, prev + amount));
        else setReps(prev => Math.max(0, prev + amount));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerRef = React.useRef<any>(undefined);

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    const handleFinishSet = () => {
        if (isSubmitting) return;

        setIsSubmitting(true);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

        logSet(weight, reps, rpe);


        timerRef.current = setTimeout(() => {
            setIsSubmitting(false);
        }, 500);
    };

    const setDisplayText = isExtraSet
        ? `${currentSetNumber}ª Série (Bônus!)`
        : `Série ${currentSetNumber} de ${targetSets}`;

    return (
        <View style={styles.card}>

            <View style={styles.header}>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>FOCO</Text>
                </View>
                <Text style={styles.setTitle}>{setDisplayText}</Text>
                <View style={styles.historyContainer}>
                    <Text style={styles.historyLabel}>ANTERIOR</Text>
                    <Text style={styles.historyValue}>32kg x 10</Text>
                </View>
            </View>

            <View style={styles.inputsRow}>

                <View style={styles.controlGroup}>
                    <Text style={styles.inputLabel}>CARGA (KG)</Text>
                    <View style={styles.counterRow}>
                        <TouchableOpacity style={styles.roundButton} onPress={() => handleIncrement('weight', -1)}>
                            <Ionicons name="remove" size={24} color="black" />
                        </TouchableOpacity>

                        <Text style={styles.mainValue}>{weight}</Text>

                        <TouchableOpacity style={styles.roundButton} onPress={() => handleIncrement('weight', 1)}>
                            <Ionicons name="add" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>


                <View style={styles.controlGroup}>
                    <Text style={styles.inputLabel}>REPETIÇÕES</Text>
                    <View style={styles.counterRow}>
                        <TouchableOpacity style={styles.roundButton} onPress={() => handleIncrement('reps', -1)}>
                            <Ionicons name="remove" size={24} color="black" />
                        </TouchableOpacity>

                        <Text style={styles.mainValue}>{reps}</Text>

                        <TouchableOpacity style={styles.roundButton} onPress={() => handleIncrement('reps', 1)}>
                            <Ionicons name="add" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <RpeSlider value={rpe} onValueChange={setRpe} />

            <TouchableOpacity
                style={[styles.finishButton, isSubmitting && { opacity: 0.7 }]}
                onPress={handleFinishSet}
                disabled={isSubmitting}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text style={styles.finishButtonText}>{isSubmitting ? 'SALVANDO...' : 'CONCLUIR SÉRIE'}</Text>
                {!isSubmitting && <Ionicons name="checkmark" size={24} color={Colors.primary} />}
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: Spacing.lg,
        marginHorizontal: Spacing.md,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    tag: {
        backgroundColor: 'black',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        position: 'absolute',
        top: -40,
    },
    tagText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    setTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text.primary,
        fontFamily: 'Montserrat_800ExtraBold',
        marginTop: 20,
    },
    historyContainer: {
        alignItems: 'flex-end',
    },
    historyLabel: {
        fontSize: 10,
        color: Colors.gray[400],
        fontWeight: 'bold',
        marginBottom: 2,
    },
    historyValue: {
        fontSize: 14,
        color: Colors.text.primary,
        fontWeight: '600',
    },
    inputsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
        gap: Spacing.md,
    },
    controlGroup: {
        alignItems: 'center',
        flex: 1,
    },
    inputLabel: {
        fontSize: 10,
        color: Colors.gray[400],
        fontWeight: 'bold',
        marginBottom: Spacing.sm,
        letterSpacing: 1,
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roundButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text.primary,
        width: 50,
        textAlign: 'center',
        fontFamily: 'Montserrat_800ExtraBold',
    },
    finishButton: {
        backgroundColor: '#111111',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
        gap: 8,
    },
    finishButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    }
});
