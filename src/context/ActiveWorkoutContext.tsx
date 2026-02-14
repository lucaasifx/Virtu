import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { WorkoutSession, ExerciseSession } from '../types/execution';
import { MuscleGroup } from '../types/workout';
import { router } from 'expo-router';
import { activeWorkoutReducer } from './ActiveWorkoutReducer';
import { NotificationService } from '../services/NotificationService';
import { getExerciseById } from '../constants/exercises';
import { createWorkoutSession, calculateWorkoutSummary } from './ActiveWorkoutSession';

interface ActiveWorkoutContextData {
    session: WorkoutSession | null;
    activeExerciseIndex: number;
    isPaused: boolean;
    startWorkout: (exercises: string[], groups: MuscleGroup[]) => void;
    logSet: (weight: number, reps: number, rpe: number) => void;
    togglePause: () => void;
    nextExercise: () => void;
    prevExercise: () => void;
    finishWorkout: () => void;
    cancelWorkout: () => void;
    getActiveExercise: () => ExerciseSession | null;
    removeExercise: (exerciseId: string) => void;
    toggleExercise: (exerciseId: string) => void;
    reorderExercises: (fromIndex: number, toIndex: number) => void;
    skipExercise: () => void;
    moveGroup: (group: MuscleGroup, direction: 'up' | 'down') => void;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextData | undefined>(undefined);

interface WorkoutTimerContextData {
    timerSeconds: number;
}
const WorkoutTimerContext = createContext<WorkoutTimerContextData | undefined>(undefined);

interface ActiveWorkoutProviderProps {
    children: ReactNode;
    onWorkoutEnd?: () => void;
}

export function ActiveWorkoutProvider({ children, onWorkoutEnd }: ActiveWorkoutProviderProps) {
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const sessionRef = useRef(session);
    const activeIndexRef = useRef(activeExerciseIndex);

    useEffect(() => {
        NotificationService.requestPermissions();
        return () => {
            NotificationService.dismissWorkoutNotification();
        };
    }, []);

    const formatTime = useCallback((seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    }, []);
    const notificationTimerBucket = Math.floor(timerSeconds / 60);

    useEffect(() => {
        if (!session) {
            NotificationService.dismissWorkoutNotification();
            return;
        }

        const activeExId = session.exerciseOrder[activeExerciseIndex];
        const activeEx = session.exercises[activeExId];
        const activeExerciseName = activeEx ? (getExerciseById(activeEx.exerciseId)?.name || 'Exercício') : 'Treino Ativo';
        const nextExerciseId = session.exerciseOrder[activeExerciseIndex + 1];
        const nextExerciseName = nextExerciseId ? (getExerciseById(nextExerciseId)?.name || 'Próximo exercício') : 'Finalizar treino';
        const displaySeconds = notificationTimerBucket * 60;

        const notificationTitle = isPaused ? 'VIRTU • TREINO PAUSADO' : 'VIRTU • TREINO ATIVO';
        const notificationSubtitle = activeExerciseName.toUpperCase();
        const playerHeader = nextExerciseId ? `PROXIMO EXERCICIO: ${nextExerciseName}` : `FIM DO TREINO: ${nextExerciseName}`;
        const timerLabel = `TIMER: ${formatTime(displaySeconds)}`;
        const statusBody = `${playerHeader}\n${timerLabel}`;

        NotificationService.showWorkoutNotification(
            notificationTitle,
            notificationSubtitle,
            statusBody,
            isPaused
        );
    }, [activeExerciseIndex, formatTime, isPaused, notificationTimerBucket, session]);

    useEffect(() => {
        const subscription = NotificationService.addNotificationResponseReceivedListener(response => {
            const actionId = response.actionIdentifier;
            if (actionId === 'PAUSE' || actionId === 'RESUME') {
                setIsPaused(prev => !prev);
            } else if (actionId === 'FINISH_SET') {
                router.push('/workout/Execution');
            } else if (actionId === NotificationService.DefaultActionIdentifier) {
                router.push('/workout/Execution');
            }
        });
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        let interval: any;
        if (session && !isPaused) {
            interval = setInterval(() => {
                setTimerSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [session, isPaused]);

    const startWorkout = useCallback((exerciseIds: string[], groups: MuscleGroup[]) => {
        const newSession = createWorkoutSession(exerciseIds, groups);

        sessionRef.current = newSession;
        activeIndexRef.current = 0;

        setSession(newSession);
        setActiveExerciseIndex(0);
        setTimerSeconds(0);
        setIsPaused(false);
    }, []);

    const logSet = useCallback((weight: number, reps: number, rpe: number) => {
        console.log('[ActiveWorkout] 📥 logSet called with:', { weight, reps, rpe }, 'at', new Date().toISOString());
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) {
            console.log('[ActiveWorkout] ❌ No session found!');
            return;
        }

        const newState = activeWorkoutReducer(
            { session: currentSession, activeExerciseIndex: currentIndex, isPaused: false },
            { type: 'LOG_SET', payload: { weight, reps, rpe } }
        );

        sessionRef.current = newState.session;
        activeIndexRef.current = newState.activeExerciseIndex;

        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);
        console.log('[ActiveWorkout] ✅ Set registered! New sets count:',
            newState.session?.exercises[newState.session.exerciseOrder[currentIndex]]?.sets.length);
    }, []);

    const togglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

    const prevExercise = useCallback(() => {
        const currentIndex = activeIndexRef.current;
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            activeIndexRef.current = newIndex;
            setActiveExerciseIndex(newIndex);
        }
    }, []);

    const finishWorkout = useCallback(() => {
        const currentSession = sessionRef.current;

        if (!currentSession) return;

        const endTime = new Date();
        const { duration, totalVolume, totalSets } = calculateWorkoutSummary(currentSession, endTime);

        // Sync to Supabase in BACKGROUND (non-blocking)
        import('@/src/lib/workoutSyncService').then(({ syncWorkoutToSupabase }) => {
            syncWorkoutToSupabase(currentSession, duration, totalVolume)
                .then(result => console.log('[Workout] Background sync:', result.success ? '✅' : '❌', result.error || ''))
                .catch(e => console.error('[Workout] Background sync error:', e));
        });

        onWorkoutEnd?.();
        sessionRef.current = null;
        activeIndexRef.current = 0;
        setSession(null);

        // Navigate immediately (don't wait for sync)
        router.replace({
            pathname: '/workout/Summary',
            params: {
                duration: duration.toString(),
                volume: totalVolume.toString(),
                totalSets: totalSets.toString(),
                date: endTime.toISOString(),
            }
        });
    }, [onWorkoutEnd]);

    const nextExercise = useCallback(() => {
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) return;
        if (currentIndex < currentSession.exerciseOrder.length - 1) {
            const newIndex = currentIndex + 1;
            activeIndexRef.current = newIndex;
            setActiveExerciseIndex(newIndex);
        } else {
            finishWorkout();
        }
    }, [finishWorkout]);



    const cancelWorkout = useCallback(() => {
        console.log('[Workout] ❌ Treino cancelado');
        onWorkoutEnd?.();
        sessionRef.current = null;
        activeIndexRef.current = 0;
        setSession(null);
        setTimerSeconds(0);
        setIsPaused(false);
        router.dismissAll();
        router.replace('/(tabs)/Workout');
    }, [onWorkoutEnd]);

    const getActiveExercise = useCallback(() => {
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) return null;
        const activeId = currentSession.exerciseOrder[currentIndex];
        return currentSession.exercises[activeId] || null;
    }, []);

    const removeExercise = useCallback((exerciseId: string) => {
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) return;

        const newState = activeWorkoutReducer(
            { session: currentSession, activeExerciseIndex: currentIndex, isPaused: false },
            { type: 'REMOVE_EXERCISE', payload: { exerciseId } }
        );

        sessionRef.current = newState.session;
        activeIndexRef.current = newState.activeExerciseIndex;

        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);
    }, []);

    const reorderExercises = useCallback((fromIndex: number, toIndex: number) => {
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) return;

        const newState = activeWorkoutReducer(
            { session: currentSession, activeExerciseIndex: currentIndex, isPaused: false },
            { type: 'REORDER_EXERCISES', payload: { fromIndex, toIndex } }
        );

        sessionRef.current = newState.session;
        activeIndexRef.current = newState.activeExerciseIndex;

        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);
    }, []);

    const skipExercise = useCallback(() => {
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) return;

        const newState = activeWorkoutReducer(
            { session: currentSession, activeExerciseIndex: currentIndex, isPaused: false },
            { type: 'SKIP_EXERCISE' }
        );

        sessionRef.current = newState.session;
        activeIndexRef.current = newState.activeExerciseIndex;

        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);

        if (currentIndex === currentSession.exerciseOrder.length - 1) {
            router.replace('/workout/Summary');
        }
    }, []);



    const moveGroup = useCallback((group: MuscleGroup, direction: 'up' | 'down') => {
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) return;
        const newState = activeWorkoutReducer(
            { session: currentSession, activeExerciseIndex: currentIndex, isPaused: false },
            { type: 'MOVE_GROUP', payload: { group, direction } }
        );

        sessionRef.current = newState.session;
        activeIndexRef.current = newState.activeExerciseIndex;

        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);
    }, []);

    const toggleExercise = useCallback((exerciseId: string) => {
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) return;

        const newState = activeWorkoutReducer(
            { session: currentSession, activeExerciseIndex: currentIndex, isPaused: false },
            { type: 'TOGGLE_EXERCISE', payload: { exerciseId } }
        );

        sessionRef.current = newState.session;
        activeIndexRef.current = newState.activeExerciseIndex;

        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);
    }, []);

    const contextValue = React.useMemo(() => ({
        session,
        activeExerciseIndex,
        isPaused,
        startWorkout,
        logSet,
        togglePause,
        nextExercise,
        prevExercise,
        finishWorkout,
        cancelWorkout,
        getActiveExercise,
        removeExercise,
        toggleExercise,
        reorderExercises,
        skipExercise,
        moveGroup
    }), [
        session,
        activeExerciseIndex,
        isPaused,
        startWorkout,
        logSet,
        togglePause,
        nextExercise,
        prevExercise,
        finishWorkout,
        cancelWorkout,
        getActiveExercise,
        removeExercise,
        toggleExercise,
        reorderExercises,
        skipExercise,
        moveGroup
    ]);

    return (
        <ActiveWorkoutContext.Provider value={contextValue}>
            <WorkoutTimerContext.Provider value={{ timerSeconds }}>
                {children}
            </WorkoutTimerContext.Provider>
        </ActiveWorkoutContext.Provider>
    );
}

export function useActiveWorkout() {
    const context = useContext(ActiveWorkoutContext);
    if (!context)
        throw new Error('useActiveWorkout must be used within an ActiveWorkoutProvider');
    return context;
}

export function useWorkoutTimer() {
    const context = useContext(WorkoutTimerContext);
    if (!context)
        throw new Error('useWorkoutTimer must be used within an ActiveWorkoutProvider');
    return context;
}
