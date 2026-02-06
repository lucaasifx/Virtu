import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { WorkoutSession, SetLog, ExerciseSession } from '../types/execution';
import { MuscleGroup } from '../types/workout';
import { router } from 'expo-router';
import { activeWorkoutReducer } from './ActiveWorkoutReducer';
import { useWorkoutCreation } from './WorkoutContext';

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
        const newSession: WorkoutSession = {
            id: Date.now().toString(),
            startTime: new Date(),
            status: 'active',
            muscleGroups: groups,
            exercises: exerciseIds.map(id => ({
                exerciseId: id,
                sets: [],
                targetSets: 4 // Default target, configurable later
            }))
        };
        setSession(newSession);
        setActiveExerciseIndex(0);
        setTimerSeconds(0);
        setIsPaused(false);
        // Navigate happens in the component
    };

    const logSet = (weight: number, reps: number, rpe: number) => {
        if (!session) return;

        const newState = activeWorkoutReducer(
            { session, activeExerciseIndex, isPaused },
            { type: 'LOG_SET', payload: { weight, reps, rpe } }
        );

        setSession(newState.session);
        // Although LOG_SET currently doesn't change index, we sync strictly to be safe
        setActiveExerciseIndex(newState.activeExerciseIndex);
    };

    const togglePause = () => {
        setIsPaused(prev => !prev);
    };

    const nextExercise = () => {
        if (!session) return;
        if (activeExerciseIndex < session.exercises.length - 1) {
            setActiveExerciseIndex(prev => prev + 1);
        } else {
            // Already at last exercise - Finish Workout
            finishWorkout();
        }
    };

    const prevExercise = () => {
        if (activeExerciseIndex > 0) {
            setActiveExerciseIndex(prev => prev - 1);
        }
    };



    const finishWorkout = () => {
        if (!session) return;

        const finalSession: WorkoutSession = {
            ...session,
            status: 'completed',
            endTime: new Date()
        };

        console.log('--- FINAL WORKOUT DATA (COMPLETED) ---');
        console.log(JSON.stringify(finalSession, null, 2));
        console.log('--------------------------------------');

        // Reset Selection State (WorkoutContext)
        resetSelection();

        // Reset Execution State (ActiveWorkoutContext)
        setSession(null);

        router.replace('/workout/Summary'); // Go to summary
    };

    const cancelWorkout = () => {
        resetSelection(); // Clear selection state
        setSession(null);
        setTimerSeconds(0);
        setIsPaused(false);
        router.dismissAll();
        router.replace('/(tabs)/Workout');
    };

    const getActiveExercise = () => {
        if (!session) return null;
        return session.exercises[activeExerciseIndex];
    };

    const removeExercise = (exerciseId: string) => {
        setSession(prev => {
            if (!prev) return null;
            const exerciseIndex = prev.exercises.findIndex(ex => ex.exerciseId === exerciseId);
            if (exerciseIndex === -1) return prev;

            const newExercises = prev.exercises.filter(ex => ex.exerciseId !== exerciseId);

            // Adjust active index
            if (exerciseIndex < activeExerciseIndex) {
                setActiveExerciseIndex(curr => Math.max(0, curr - 1));
            } else if (exerciseIndex === activeExerciseIndex) {
                if (newExercises.length === 0) {
                    setActiveExerciseIndex(0);
                } else if (activeExerciseIndex >= newExercises.length) {
                    setActiveExerciseIndex(newExercises.length - 1);
                }
            }

            return {
                ...prev,
                exercises: newExercises
            };
        });
    };

    const reorderExercises = (fromIndex: number, toIndex: number) => {
        setSession(prev => {
            if (!prev) return null;
            const newExercises = [...prev.exercises];
            const [moved] = newExercises.splice(fromIndex, 1);
            newExercises.splice(toIndex, 0, moved);
            return {
                ...prev,
                exercises: newExercises
            };
        });
    };

    const skipExercise = () => {
        if (!session) return;

        const newState = activeWorkoutReducer(
            { session, activeExerciseIndex, isPaused },
            { type: 'SKIP_EXERCISE' }
        );

        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);

        // Check if we skipped the last exercise
        if (activeExerciseIndex === session.exercises.length - 1) {
            console.log('--- FINAL WORKOUT DATA (LAST EXERCISE SKIPPED) ---');
            // We use newState.session because that contains the 'skipped: true' update
            console.log(JSON.stringify(newState.session, null, 2));
            console.log('------------------------------------------------');

            // Navigate to Summary (Coming Soon)
            router.replace('/workout/Summary');
        }
    };

    const updateExercises = (exercises: ExerciseSession[]) => {
        if (!session) return;
        const newState = activeWorkoutReducer(
            { session, activeExerciseIndex, isPaused },
            { type: 'UPDATE_EXERCISES', payload: { exercises } }
        );
        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);
    };

    const moveGroup = (group: MuscleGroup, direction: 'up' | 'down') => {
        if (!session) return;
        const newState = activeWorkoutReducer(
            { session, activeExerciseIndex, isPaused },
            { type: 'MOVE_GROUP', payload: { group, direction } }
        );
        setSession(newState.session);
        setActiveExerciseIndex(newState.activeExerciseIndex);
    };

    const toggleExercise = (exerciseId: string) => {
        setSession(prev => {
            if (!prev) return null;
            const exerciseIndex = prev.exercises.findIndex(ex => ex.exerciseId === exerciseId);

            if (exerciseIndex !== -1) {
                // Remove
                const newExercises = prev.exercises.filter(ex => ex.exerciseId !== exerciseId);

                // Adjust active index if needed
                if (exerciseIndex < activeExerciseIndex) {
                    // Removed an exercise before the current one, shift left
                    setActiveExerciseIndex(curr => curr - 1);
                } else if (exerciseIndex === activeExerciseIndex) {
                    // Removed current exercise
                    if (newExercises.length === 0) {
                        setActiveExerciseIndex(0);
                    } else if (activeExerciseIndex >= newExercises.length) {
                        // Was last, move to new last
                        setActiveExerciseIndex(newExercises.length - 1);
                    }
                    // Else: allow it to stay at same index (next one moves in)
                }

                return {
                    ...prev,
                    exercises: newExercises
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
                    exercises: [...prev.exercises, newExercise]
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
