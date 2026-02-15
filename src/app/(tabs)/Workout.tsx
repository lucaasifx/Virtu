import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Entypo, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { useGamification } from '@/src/context/GamificationContext';
import { CategorySelector } from '@/components/features/Workout/CategorySelector';
import { WorkoutCard } from '@/components/features/Workout/WorkoutCard';
import { WorkoutHeader } from '@/components/features/Workout/WorkoutHeader';
import { Colors, FontFamily } from '@/src/constants/theme';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useWorkoutCreation } from '@/src/context/WorkoutContext';

const BASE_CATEGORIES = ['Todos', 'Hipertrofia', 'Força', 'Cardio', 'Funcional'];

export default function Workout() {
    const insets = useSafeAreaInsets();
    const { state, xpProgress, levelInfo } = useGamification();
    const { routines, queueRoutineStart, startRoutineEdit } = useWorkoutCreation();
    const [activeCategory, setActiveCategory] = useState('Todos');
    const categories = React.useMemo(() => {
        const dynamicCategories = Array.from(new Set(routines.map(routine => routine.category)));
        return Array.from(new Set([...BASE_CATEGORIES, ...dynamicCategories]));
    }, [routines]);

    const filteredWorkouts = activeCategory === 'Todos'
        ? routines
        : routines.filter(w => w.category === activeCategory);
    const isEmptyCategory = filteredWorkouts.length === 0;

    const handleCreateRoutine = () => {
        router.push('/workout/Selection');
    };

    const handlePlayRoutine = (routineId: string) => {
        queueRoutineStart(routineId);
        router.push({ pathname: '/workout/FinishSelection', params: { routineId } });
    };

    const handleEditRoutine = (routineId: string) => {
        const loaded = startRoutineEdit(routineId);
        if (!loaded) {
            return;
        }
        router.push({ pathname: '/workout/Selection', params: { mode: 'editRoutine', routineId } });
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

            <FlatList
                data={filteredWorkouts}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 140 }]}
                ListHeaderComponent={(
                    <>
                        <WorkoutHeader />
                        <CategorySelector
                            categories={categories}
                            activeCategory={activeCategory}
                            onSelectCategory={setActiveCategory}
                        />
                    </>
                )}
                renderItem={({ item: workout }) => (
                    <View style={styles.cardItem}>
                        <WorkoutCard
                            workout={{
                                id: workout.id,
                                title: workout.title,
                                category: workout.category,
                                duration: `${workout.estimatedMinutes} min`,
                                exercises: workout.exerciseCount,
                                muscles: workout.musclesLabel,
                                image: workout.image,
                            }}
                            onPlay={() => handlePlayRoutine(workout.id)}
                            onEdit={() => handleEditRoutine(workout.id)}
                        />
                    </View>
                )}
                ListEmptyComponent={isEmptyCategory ? (
                    <Animated.View entering={FadeInDown.duration(420)} style={styles.emptyStateCard}>
                        <Animated.View entering={ZoomIn.duration(420)} style={styles.emptyIconWrapper}>
                            <View style={[styles.bracket, styles.bracketTopLeft]} />
                            <View style={[styles.bracket, styles.bracketBottomRight]} />

                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="barbell-outline" size={40} color={Colors.primary} />
                            </View>

                            <View style={styles.emptyBadge}>
                                <Ionicons name="sparkles" size={14} color="#111827" />
                            </View>
                        </Animated.View>

                        <Text style={styles.emptyTitle}>SEM TREINOS NESSA CATEGORIA</Text>
                        <View style={styles.emptyDivider} />
                        <Text style={styles.emptyDescription}>
                            Monte uma rotina nova e preencha essa aba com progresso real.
                        </Text>
                    </Animated.View>
                ) : null}
                ListFooterComponent={(
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
                )}
            />
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
    cardItem: {
        marginBottom: 32,
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
    emptyStateCard: {
        marginTop: 8,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FCFCFC',
        alignItems: 'center',
        paddingVertical: 26,
        paddingHorizontal: 24,
    },
    emptyIconWrapper: {
        width: 108,
        height: 108,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    bracket: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    bracketTopLeft: {
        top: 0,
        left: 0,
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    bracketBottomRight: {
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
    },
    emptyIconCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyBadge: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    emptyTitle: {
        fontSize: 15,
        fontFamily: FontFamily.title.extraBold,
        color: '#111827',
        letterSpacing: 0.7,
        textAlign: 'center',
    },
    emptyDivider: {
        width: 56,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
        marginTop: 12,
    },
    emptyDescription: {
        marginTop: 12,
        textAlign: 'center',
        fontSize: 13,
        fontFamily: FontFamily.body.medium,
        color: '#6B7280',
        lineHeight: 20,
    },
});
