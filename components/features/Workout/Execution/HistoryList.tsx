import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { useActiveWorkout } from '@/src/context/ActiveWorkoutContext';

export function HistoryList() {
    const { getActiveExercise } = useActiveWorkout();
    const activeSession = getActiveExercise();

    if (!activeSession || activeSession.sets.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>HISTÓRICO RECENTE</Text>

            {activeSession.sets.map((set, index) => (
                <View key={set.id} style={styles.item}>
                    <View style={styles.leftSection}>
                        <View style={styles.setNumberBadge}>
                            <Text style={styles.setNumberText}>{index + 1}</Text>
                        </View>

                        <View style={styles.details}>
                            <Text style={styles.weightText}>{set.weight} <Text style={styles.unitText}>KG</Text></Text>
                            <Ionicons name="close" size={12} color={'black'} />
                            <Text style={styles.repsText}>{set.reps} <Text style={styles.unitText}>REPS</Text></Text>
                        </View>
                    </View>

                    <View style={styles.rightSection}>
                        <View style={styles.rpeStack}>
                            <Text style={styles.rpeLabel}>RPE</Text>
                            <Text style={styles.rpeValue}>{set.rpe}</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color={'black'} />
                    </View>
                </View>
            ))}
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
    item: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        padding: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    setNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    setNumberText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    weightText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    repsText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    unitText: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.6)',
        fontWeight: 'bold',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12, // Space between RPE and Checkmark
    },
    rpeStack: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
    },
    rpeLabel: {
        fontSize: 8,
        fontWeight: 'bold',
        color: 'rgba(0,0,0,0.6)',
        marginBottom: 2,
        textAlign: 'center',
    },
    rpeValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        lineHeight: 18,
        textAlign: 'center',
    }
});
