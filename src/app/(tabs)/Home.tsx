import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import { useGamification } from '@/src/context/GamificationContext';
import { Greetings } from '@/components/features/Home/Greetings';
import { CalendarStrip } from '@/components/features/Home/CalendarStrip';
import { DailyMissionCard } from '@/components/features/Home/DailyMissionCard';
import { HabitList } from '@/components/features/Home/HabitList';
import { CoachTip } from '@/components/ui/CoachTip';

const dailyHabits = [
    { id: 1, label: 'Tomar Creatina (5g)', icon: 'flash', done: true, color: '#EAB308', time: '08:00', iconType: 'Ionicons' },
    { id: 2, label: 'Beber 3L de Água', icon: 'water', done: false, color: '#3B82F6', time: 'Meta do dia', iconType: 'Ionicons' },
    { id: 3, label: 'Dormir 7h+', icon: 'moon', done: false, color: '#A855F7', time: '22:30', iconType: 'Ionicons' },
];

export default function Home() {
    const insets = useSafeAreaInsets();
    const [habits, setHabits] = useState(dailyHabits);
    const { state, xpProgress, levelInfo } = useGamification();

    const toggleHabit = (id: number) => {
        setHabits(habits.map(h => h.id === id ? { ...h, done: !h.done } : h));
    };

    return (
        <View style={styles.container}>
            <Header
                stats={{
                    level: levelInfo.level,
                    streak: state.streak,
                    xp: xpProgress.current,
                    maxXp: xpProgress.max
                }}
            />

            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 140 }]}
                showsVerticalScrollIndicator={false}
            >
                <Greetings />
                <CalendarStrip />
                <DailyMissionCard />

                <HabitList habits={habits} onToggleHabit={toggleHabit} />

                <CoachTip tip="A consistência supera a intensidade. Não importa o quão rápido você vai, desde que você não pare." />

                <View style={{ height: 150 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
});
