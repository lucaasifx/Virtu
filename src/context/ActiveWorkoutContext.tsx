import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { WorkoutSession, SetLog, ExerciseSession } from '../types/execution';
import { MuscleGroup } from '../types/workout';
import { router } from 'expo-router';
import { activeWorkoutReducer } from './ActiveWorkoutReducer';
import { useWorkoutCreation } from './WorkoutContext';
// import * as Notifications from 'expo-notifications'; // Removed for Expo Go safety
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
    updateExercises: (exercises: ExerciseSession[]) => void;
    skipExercise: () => void;
    moveGroup: (group: MuscleGroup, direction: 'up' | 'down') => void;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextData | undefined>(undefined);

interface WorkoutTimerContextData {
    timerSeconds: number;
}
const WorkoutTimerContext = createContext<WorkoutTimerContextData | undefined>(undefined);

export function ActiveWorkoutProvider({ children }: { children: ReactNode }) {
    const { resetWorkout: resetSelection } = useWorkoutCreation();
    const [session, setSession] = useState<WorkoutSession | null>(null);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState(0); // Kept here for state, but exposed via separate context
    const [isPaused, setIsPaused] = useState(false);

    const sessionRef = useRef(session);
    const activeIndexRef = useRef(activeExerciseIndex);

    useEffect(() => { sessionRef.current = session; }, [session]);
    useEffect(() => { activeIndexRef.current = activeExerciseIndex; }, [activeExerciseIndex]);

    // --- Notification Logic ---
    useEffect(() => {
        NotificationService.requestPermissions();
        return () => {
            NotificationService.dismissWorkoutNotification();
        };
    }, []);

    // Helper: Format Time
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    // Track AppState to only update timer in notification when backgrounded
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, []);

    // 1. Immediate Notification Update (User Actions)
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

    // 2. Background Timer Update
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

    // Handle Background Actions
    // useLatestCallback pattern not needed if we trust the closure, 
    // but togglePause uses setState(prev) so it is safe.
    const togglePauseRef = useRef(isPaused);
    useEffect(() => { togglePauseRef.current = isPaused; }, [isPaused]);

    useEffect(() => {
        const subscription = NotificationService.addNotificationResponseReceivedListener(response => {
            const actionId = response.actionIdentifier;
            if (actionId === 'PAUSE' || actionId === 'RESUME') {
                setIsPaused(prev => !prev);
            } else if (actionId === 'FINISH_SET') {
                // Open app to finish set
                router.push('/workout/Execution');
            } else if (actionId === NotificationService.DefaultActionIdentifier) {
                // User tapped the notification body -> Open App
                router.push('/workout/Execution');
            }
        });
        return () => subscription.remove();
    }, []);

    // Timer Logic
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
        // Construct Normalized Data
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

        resetSelection();
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
    }, [resetSelection]);

    const cancelWorkout = () => {
        resetSelection(); // Clear selection state
        setSession(null);
        setTimerSeconds(0);
        setIsPaused(false);
        router.dismissAll();
        router.replace('/(tabs)/Workout');
    };

    const getActiveExercise = useCallback(() => {
        const currentSession = sessionRef.current;
        const currentIndex = activeIndexRef.current;

        if (!currentSession) return null;
        const activeId = currentSession.exerciseOrder[currentIndex];
        return currentSession.exercises[activeId] || null;
    }, []);

    const removeExercise = (exerciseId: string) => {
        setSession(prev => {
            if (!prev) return null;

            // 1. Remove from Dict
            const newExercises = { ...prev.exercises };
            delete newExercises[exerciseId];

            // 2. Remove from Order
            const newOrder = prev.exerciseOrder.filter(id => id !== exerciseId);

            // 3. Adjust Index
            const oldIndex = prev.exerciseOrder.indexOf(exerciseId);
            let newIndex = activeExerciseIndex;

            if (oldIndex < activeExerciseIndex) {
                newIndex = Math.max(0, activeExerciseIndex - 1);
            } else if (oldIndex === activeExerciseIndex) {
                if (newOrder.length === 0) newIndex = 0;
                else if (activeExerciseIndex >= newOrder.length) newIndex = newOrder.length - 1;
            }

            return {
                ...prev,
                exercises: newExercises,
                exerciseOrder: newOrder
            };
        });
        // We might need to sync activeExerciseIndex state if we changed it in the logic above
        // But setState callback doesn't allow setting other state easily. 
        // For now, this simple implementation assumes the component re-renders and handles bounds, 
        // but 'setActiveExerciseIndex' is separate state. 
        // TO DO: Refactor removeExercise to use Reducer pattern properly to handle both states.
    };

    const reorderExercises = (fromIndex: number, toIndex: number) => {
        setSession(prev => {
            if (!prev) return null;
            const newOrder = [...prev.exerciseOrder];
            const [moved] = newOrder.splice(fromIndex, 1);
            newOrder.splice(toIndex, 0, moved);
            return {
                ...prev,
                exerciseOrder: newOrder
            };
        });
    };

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

    const updateExercises = (exercises: ExerciseSession[]) => {
        // This likely needs a full rethink for normalized structure 
        // For now, let's assume it passes a list and we re-normalize?
        // Or better, update ActiveWorkoutReducer to handle this.
    };

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

    const toggleExercise = (exerciseId: string) => {
        setSession(prev => {
            if (!prev) return null;
            const exerciseIndex = prev.exerciseOrder.indexOf(exerciseId);

            if (exerciseIndex !== -1) {
                // Remove
                const newExercises = { ...prev.exercises };
                delete newExercises[exerciseId];
                const newOrder = prev.exerciseOrder.filter(id => id !== exerciseId);

                // Adjust active index if needed
                if (exerciseIndex < activeExerciseIndex) {
                    // Removed an exercise before the current one, shift left
                    setActiveExerciseIndex(curr => curr - 1);
                } else if (exerciseIndex === activeExerciseIndex) {
                    // Removed current exercise
                    if (newOrder.length === 0) {
                        setActiveExerciseIndex(0);
                    } else if (activeExerciseIndex >= newOrder.length) {
                        // Was last, move to new last
                        setActiveExerciseIndex(newOrder.length - 1);
                    }
                    // Else: allow it to stay at same index (next one moves in)
                }

                return {
                    ...prev,
                    exercises: newExercises,
                    exerciseOrder: newOrder
                };
            } else {
                // Add
                const newExercise: ExerciseSession = {
                    exerciseId,
                    sets: [],
                    targetSets: 4
                };
                return {
                    ...prev,
                    exercises: { ...prev.exercises, [exerciseId]: newExercise },
                    exerciseOrder: [...prev.exerciseOrder, exerciseId]
                };
            }
        });
    };

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
        updateExercises,
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
