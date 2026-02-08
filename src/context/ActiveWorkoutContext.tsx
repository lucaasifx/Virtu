import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { WorkoutSession, SetLog, ExerciseSession } from '../types/execution';
import { MuscleGroup } from '../types/workout';
import { router } from 'expo-router';
import { activeWorkoutReducer } from './ActiveWorkoutReducer';
import { NotificationService } from '../services/NotificationService';
import { getExerciseById } from '../constants/exercises';

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

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (session) {
            const activeExId = session.exerciseOrder[activeExerciseIndex];
            const activeEx = session.exercises[activeExId];
            const exerciseName = activeEx ? (getExerciseById(activeEx.exerciseId)?.name || 'Exercício') : 'Treino Ativo';

            const statusBody = isPaused
                ? "PAUSADO - Toque para retomar"
                : `Tempo: ${formatTime(timerSeconds)} • Série ${(activeEx?.sets.length || 0) + 1}`;

            NotificationService.showWorkoutNotification(
                exerciseName,
                statusBody,
                isPaused
            );
        } else {
            NotificationService.dismissWorkoutNotification();
        }
    }, [isPaused, session, activeExerciseIndex]);

    useEffect(() => {
        if (session && !isPaused && appState.current !== 'active') {
            const activeExId = session.exerciseOrder[activeExerciseIndex];
            const activeEx = session.exercises[activeExId];
            const exerciseName = activeEx ? (getExerciseById(activeEx.exerciseId)?.name || 'Exercício') : 'Treino Ativo';

            NotificationService.showWorkoutNotification(
                exerciseName,
                `Tempo: ${formatTime(timerSeconds)} • Série ${(activeEx?.sets.length || 0) + 1}`,
                isPaused
            );
        }
    }, [timerSeconds]);

    const togglePauseRef = useRef(isPaused);
    useEffect(() => { togglePauseRef.current = isPaused; }, [isPaused]);

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

    const startWorkout = (exerciseIds: string[], groups: MuscleGroup[]) => {
        const exercisesDict: Record<string, ExerciseSession> = {};
        exerciseIds.forEach(id => {
            exercisesDict[id] = {
                exerciseId: id,
                sets: [],
                targetSets: 4
            };
        });

        const newSession: WorkoutSession = {
            id: Date.now().toString(),
            startTime: new Date(),
            status: 'active',
            muscleGroups: groups,
            exercises: exercisesDict,
            exerciseOrder: exerciseIds
        };

        sessionRef.current = newSession;
        activeIndexRef.current = 0;

        setSession(newSession);
        setActiveExerciseIndex(0);
        setTimerSeconds(0);
        setIsPaused(false);
    };

    const logSet = useCallback((weight: number, reps: number, rpe: number) => {
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) return;

        const newState = activeWorkoutReducer(
            { session: currentSession, activeExerciseIndex: currentIndex, isPaused: false },
            { type: 'LOG_SET', payload: { weight, reps, rpe } }
        );

        sessionRef.current = newState.session;
        activeIndexRef.current = newState.activeExerciseIndex;

        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);
    }, []);

    const togglePause = () => {
        setIsPaused(prev => !prev);
    };

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
        const duration = Math.floor((endTime.getTime() - new Date(currentSession.startTime).getTime()) / 1000);

        let totalVolume = 0;
        let totalSets = 0;

        currentSession.exerciseOrder.forEach(id => {
            const ex = currentSession.exercises[id];
            totalSets += ex.sets.length;
            ex.sets.forEach(set => {
                totalVolume += set.weight * set.reps;
            });
        });

        onWorkoutEnd?.();
        sessionRef.current = null;
        activeIndexRef.current = 0;
        setSession(null);

        router.replace({
            pathname: '/workout/Summary',
            params: {
                duration: duration.toString(),
                volume: totalVolume.toString(),
                sets: totalSets.toString(),
                date: endTime.toISOString()
            }
        });
    }, [onWorkoutEnd]);

    const cancelWorkout = useCallback(() => {
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
    }), [session, activeExerciseIndex, isPaused]);

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
