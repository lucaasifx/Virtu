import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText as Text } from "@/components/ui/ThemedText";
import { Colors, Spacing } from "@/src/constants/theme";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useActiveWorkout, useWorkoutTimer } from '@/src/context/ActiveWorkoutContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExecutionHeaderProps {
    onEditPress: () => void;
}

export function ExecutionHeader({ onEditPress }: ExecutionHeaderProps) {
    const { isPaused } = useActiveWorkout();
    const { timerSeconds } = useWorkoutTimer();
    const insets = useSafeAreaInsets();

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
            <View style={styles.timerContainer}>
                <View style={styles.timeRow}>
                    <Ionicons name="stopwatch" size={16} color={Colors.primary} />
                    <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
                </View>
                {isPaused && (
                    <Text style={styles.pausedText}>PAUSADO</Text>
                )}
                {!isPaused && (
                    <Text style={styles.statusText}>EM ANDAMENTO</Text>
                )}
            </View>

            <TouchableOpacity style={styles.menuButton} onPress={onEditPress}>
                <MaterialCommunityIcons name="square-edit-outline" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        backgroundColor: Colors.background,
        position: 'relative',
    },
    timerContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text.primary,
        includeFontPadding: false,
    },
    statusText: {
        fontSize: 10,
        color: Colors.gray[500],
        marginTop: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pausedText: {
        fontSize: 10,
        color: Colors.error,
        marginTop: 4,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)'
    }
});
