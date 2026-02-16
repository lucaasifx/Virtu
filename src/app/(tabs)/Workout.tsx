import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
    ImageSourcePropType,
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
const CARD_ESTIMATED_HEIGHT = 308;

type WorkoutCardItem = {
    id: string;
    title: string;
    category: string;
    duration: string;
    exercises: number;
    muscles: string;
    image: ImageSourcePropType | string;
};

export default function Workout() {
    const insets = useSafeAreaInsets();
    const { state, xpProgress, levelInfo } = useGamification();
    const { routines, queueRoutineStart, startRoutineEdit } = useWorkoutCreation();
    const [activeCategory, setActiveCategory] = useState('Todos');

    const headerStats = React.useMemo(() => ({
        level: levelInfo?.level || 1,
        streak: state?.streak || 0,
        xp: xpProgress?.current || 0,
        maxXp: xpProgress?.max || 100
    }), [levelInfo?.level, state?.streak, xpProgress?.current, xpProgress?.max]);

    const workoutCardData = React.useMemo<WorkoutCardItem[]>(() => routines.map((workout) => ({
        id: workout.id,
        title: workout.title,
        category: workout.category,
        duration: `${workout.estimatedMinutes} min`,
        exercises: workout.exerciseCount,
        muscles: workout.musclesLabel,
        image: workout.image,
    })), [routines]);

    const categories = React.useMemo(() => {
        const dynamicCategories = Array.from(new Set(routines.map(routine => routine.category)));
        return Array.from(new Set([...BASE_CATEGORIES, ...dynamicCategories]));
    }, [routines]);

    const filteredWorkouts = React.useMemo(() => (
        activeCategory === 'Todos'
            ? workoutCardData
            : workoutCardData.filter(w => w.category === activeCategory)
    ), [activeCategory, workoutCardData]);

    const isEmptyCategory = filteredWorkouts.length === 0;

    const handleCreateRoutine = React.useCallback(() => {
        router.push('/workout/Selection');
    }, []);

    const handlePlayRoutine = React.useCallback((routineId: string) => {
        queueRoutineStart(routineId);
        router.push({ pathname: '/workout/FinishSelection', params: { routineId } });
    }, [queueRoutineStart]);

    const handleEditRoutine = React.useCallback((routineId: string) => {
        const loaded = startRoutineEdit(routineId);
        if (!loaded) {
            return;
        }
        router.push({ pathname: '/workout/Selection', params: { mode: 'editRoutine', routineId } });
    }, [startRoutineEdit]);

    const keyExtractor = React.useCallback((item: WorkoutCardItem) => item.id, []);

    const renderItem = React.useCallback(({ item: workout }: { item: WorkoutCardItem }) => (
        <View style={styles.cardItem}>
            <WorkoutCard
                workout={workout}
                onPlay={() => handlePlayRoutine(workout.id)}
                onEdit={() => handleEditRoutine(workout.id)}
            />
        </View>
    ), [handleEditRoutine, handlePlayRoutine]);

    const listHeaderComponent = React.useMemo(() => (
        <>
            <WorkoutHeader />
            <CategorySelector
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />
        </>
    ), [activeCategory, categories]);

    const listFooterComponent = React.useMemo(() => (
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
    ), [handleCreateRoutine]);

    const listEmptyComponent = React.useMemo(() => (isEmptyCategory ? (
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
    ) : null), [isEmptyCategory]);

    const getItemLayout = React.useCallback((_: ArrayLike<unknown> | null | undefined, index: number) => ({
        length: CARD_ESTIMATED_HEIGHT,
        offset: CARD_ESTIMATED_HEIGHT * index,
        index,
    }), []);

    return (
        <View style={styles.container}>
            <Header stats={headerStats} />

            <FlatList
                data={filteredWorkouts}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.listContent, { paddingTop: insets.top + 140 }]}
                ListHeaderComponent={listHeaderComponent}
                renderItem={renderItem}
                ListEmptyComponent={listEmptyComponent}
                ListFooterComponent={listFooterComponent}
                removeClippedSubviews
                maxToRenderPerBatch={5}
                windowSize={7}
                initialNumToRender={4}
                updateCellsBatchingPeriod={32}
                getItemLayout={getItemLayout}
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
