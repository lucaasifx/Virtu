import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText as Text } from '@/components/ui/ThemedText';
import { FontFamily } from '@/src/constants/theme';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Habit {
    id: number;
    label: string;
    icon: string;
    done: boolean;
    color: string;
    time: string;
    iconType: string;
}

interface HabitListProps {
    habits: Habit[];
    onToggleHabit: (id: number) => void;
}

export function HabitList({ habits, onToggleHabit }: HabitListProps) {
    return (
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.habitsSection}>
            <Text style={styles.habitsTitle}>ROTINA DIÁRIA</Text>

            {habits.map((habit) => (
                <TouchableOpacity
                    key={habit.id}
                    onPress={() => onToggleHabit(habit.id)}
                    activeOpacity={0.7}
                    style={[
                        styles.habitCard,
                        habit.done && styles.habitCardDone
                    ]}
                >
                    <View style={styles.habitLeft}>
                        <View style={[styles.habitIconBox, habit.done && styles.habitIconBoxDone]}>
                            <Ionicons
                                name={habit.icon as any}
                                size={20}
                                color={habit.done ? '#9CA3AF' : habit.color}
                            />
                        </View>
                        <View>
                            <Text style={[styles.habitLabel, habit.done && styles.habitLabelDone]}>{habit.label}</Text>
                            <Text style={styles.habitTime}>{habit.time}</Text>
                        </View>
                    </View>

                    <View style={[styles.checkRing, habit.done && styles.checkRingDone]}>
                        {habit.done && <Feather name="check" size={12} color="#FFF" strokeWidth={4} />}
                    </View>
                </TouchableOpacity>
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    habitsSection: {
        marginBottom: 32,
    },
    habitsTitle: {
        fontSize: 12,
        fontFamily: FontFamily.title.extraBold,
        color: '#111827',
        letterSpacing: 1.5,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    habitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    habitCardDone: {
        backgroundColor: '#F9FAFB',
        borderColor: '#F3F4F6',
        opacity: 0.6,
    },
    habitLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    habitIconBox: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
    },
    habitIconBoxDone: {
        backgroundColor: '#E5E7EB', // Gray 200
    },
    habitLabel: {
        fontSize: 14,
        fontFamily: FontFamily.body.semiBold,
        color: '#111827',
    },
    habitLabelDone: {
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    habitTime: {
        fontSize: 10,
        fontFamily: FontFamily.body.semiBold,
        color: '#9CA3AF',
        textTransform: 'uppercase',
    },
    checkRing: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkRingDone: {
        backgroundColor: '#22C55E',
        borderColor: '#22C55E',
    },
});
