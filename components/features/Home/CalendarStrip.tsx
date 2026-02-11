import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { FontFamily } from '@/src/constants/theme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';
import { useWorkoutStats } from '@/src/hooks/useWorkoutStats';
import { useFocusEffect } from 'expo-router';

export function CalendarStrip() {
    const { weeklyActivity, refresh } = useWorkoutStats();

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    return (
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.calendarContainer}>
            {weeklyActivity.map((d, i) => {
                const dayNumber = format(d.date, 'd');

                let status = 'future';
                if (d.hasWorkout) status = 'completed';
                else if (d.isToday) status = 'pending';
                else if (d.date < new Date() && !d.isToday) status = 'missed';

                return (
                    <View key={i} style={styles.dayColumn}>
                        <Text style={[styles.dayLabel, d.isToday && styles.dayLabelToday]}>{d.dayLabel}</Text>
                        <View style={[
                            styles.dayCircle,
                            d.isToday && styles.dayCircleToday,
                            status === 'completed' && !d.isToday && styles.dayCircleCompleted
                        ]}>
                            {d.isToday ? (
                                <Text style={styles.todayNumber}>{dayNumber}</Text>
                            ) : status === 'completed' ? (
                                <Feather name="check" size={16} color="#22C55E" strokeWidth={3} />
                            ) : (
                                <Text style={styles.dateNumber}>{dayNumber}</Text>
                            )}
                        </View>
                    </View>
                );
            })}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    calendarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    dayColumn: {
        alignItems: 'center',
        gap: 8,
    },
    dayLabel: {
        fontSize: 10,
        fontFamily: FontFamily.body.semiBold,
        color: '#4B5563',
        letterSpacing: 1,
    },
    dayLabelToday: {
        color: '#000',
    },
    dayCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayCircleToday: {
        backgroundColor: '#FDCB13',
        transform: [{ scale: 1.1 }],
        shadowColor: '#FDCB13',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    dayCircleCompleted: {
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    todayNumber: {
        fontSize: 12,
        fontFamily: FontFamily.title.extraBold,
        color: '#000',
    },
    dateNumber: {
        fontSize: 12,
        fontFamily: FontFamily.body.medium,
        color: '#4B5563',
    },
});
