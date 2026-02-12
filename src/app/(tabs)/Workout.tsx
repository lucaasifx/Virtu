import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, Entypo } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { useGamification } from '@/src/context/GamificationContext';
import { CategorySelector } from '@/components/features/Workout/CategorySelector';
import { WorkoutCard } from '@/components/features/Workout/WorkoutCard';
import { WorkoutHeader } from '@/components/features/Workout/WorkoutHeader';
import { FontFamily } from '@/src/constants/theme';

// --- TYPES & MOCKS ---
const CATEGORIES = ['Todos', 'Hipertrofia', 'Força', 'Cardio'];

const INITIAL_WORKOUTS = [
    {
        id: 1,
        title: 'Peitoral & Tríceps',
        category: 'Hipertrofia',
        duration: '55 min',
        exercises: 7,
        intensity: 'Alta',
        muscles: 'Peitoral • Tríceps • Ombro',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop',
        calories: '450'
    },
    {
        id: 2,
        title: 'Costas & Bíceps',
        category: 'Força',
        duration: '65 min',
        exercises: 6,
        intensity: 'Extrema',
        muscles: 'Dorsal • Bíceps • Antebraço',
        image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=2070&auto=format&fit=crop',
        calories: '520'
    },
];

export default function Workout() {
    const insets = useSafeAreaInsets();
    const { state, xpProgress, levelInfo } = useGamification();
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [workouts, setWorkouts] = useState(INITIAL_WORKOUTS);

    const filteredWorkouts = activeCategory === 'Todos'
        ? workouts
        : workouts.filter(w => w.category === activeCategory);

    const handleCreateRoutine = () => {
        router.push('/workout/Selection');
    };

    return (
        <View style={styles.container}>
            <Header
                stats={{
                    level: levelInfo?.level || 1,
                    streak: state?.streak || 0,
                    xp: xpProgress?.current || 0,
                    maxXp: xpProgress?.max || 100
                }}
            />

            <ScrollView contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 140 }]}>

                <WorkoutHeader />

                <CategorySelector
                    categories={CATEGORIES}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                />

                <View style={styles.cardsContainer}>
                    {filteredWorkouts.map((workout) => (
                        <WorkoutCard key={workout.id} workout={workout} />
                    ))}

                    <Pressable
                        onPress={handleCreateRoutine}
                        style={styles.createButton}
                    >
                        {({ pressed }) => (
                            <View style={[
                                styles.createButtonInner,
                                pressed && { borderColor: '#000' }
                            ]}>
                                <View style={[
                                    styles.plusIconCircle,
                                    pressed && { backgroundColor: '#FDCB13' }
                                ]}>
                                    <Entypo
                                        name="plus"
                                        size={24}
                                        color={pressed ? '#000' : '#9CA3AF'}
                                    />
                                </View>
                                <Text style={[
                                    styles.createButtonText,
                                    pressed && { color: '#000' }
                                ]}>
                                    Criar Nova Rotina
                                </Text>
                            </View>
                        )}
                    </Pressable>

                    {filteredWorkouts.length === 0 && (
                        <View style={styles.emptyState}>
                            <FontAwesome5 name="dumbbell" size={32} color="#D1D5DB" />
                            <Text style={styles.emptyText}>Nenhuma rotina encontrada</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 180,
    },
    headerSpacer: {
        height: 20
    },
    cardsContainer: {
        gap: 32,
    },
    createButton: {
        marginTop: 24,
    },
    createButtonInner: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 24,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        backgroundColor: '#FAFAFA',
        gap: 12,
    },
    plusIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        fontSize: 14,
        fontFamily: FontFamily.title.bold,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: FontFamily.body.medium,
        color: '#9CA3AF',
    },
});
