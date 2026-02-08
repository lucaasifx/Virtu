import { WorkoutSession, SetLog, ExerciseSession } from '../types/execution';
import { MuscleGroup } from '../types/workout';
import { getExerciseById } from '../constants/exercises';

export interface ActiveWorkoutState {
    session: WorkoutSession | null;
    activeExerciseIndex: number;
    isPaused: boolean;
}

export type ActiveWorkoutAction =
    | { type: 'START_WORKOUT'; payload: { exercises: string[]; groups: MuscleGroup[] } }
    | { type: 'LOG_SET'; payload: { weight: number; reps: number; rpe: number } }
    | { type: 'TOGGLE_PAUSE' }
    | { type: 'NEXT_EXERCISE' }
    | { type: 'PREV_EXERCISE' }
    | { type: 'FINISH_WORKOUT' }
    | { type: 'CANCEL_WORKOUT' }
    | { type: 'REMOVE_EXERCISE'; payload: { exerciseId: string } }
    | { type: 'TOGGLE_EXERCISE'; payload: { exerciseId: string } }
    | { type: 'SKIP_EXERCISE' }
    | { type: 'REORDER_EXERCISES'; payload: { fromIndex: number; toIndex: number } }
    | { type: 'UPDATE_EXERCISES'; payload: { exercises: ExerciseSession[] } }
    | { type: 'MOVE_GROUP'; payload: { group: MuscleGroup; direction: 'up' | 'down' } };

// Helper to get active exercise ID safely
const getActiveExerciseId = (session: WorkoutSession, index: number) => {
    return session.exerciseOrder[index];
};

export const activeWorkoutReducer = (state: ActiveWorkoutState, action: ActiveWorkoutAction): ActiveWorkoutState => {
    switch (action.type) {
        case 'START_WORKOUT':
            return {
                session: {
                    id: Date.now().toString(),
                    startTime: new Date(),
                    status: 'active',
                    muscleGroups: action.payload.groups,
                    exercises: action.payload.exercises.reduce((acc, id) => {
                        acc[id] = { exerciseId: id, sets: [], targetSets: 4 };
                        return acc;
                    }, {} as Record<string, ExerciseSession>),
                    exerciseOrder: action.payload.exercises
                },
                activeExerciseIndex: 0,
                isPaused: false
            };

        case 'LOG_SET': {
            const { session, activeExerciseIndex } = state;
            if (!session) return state;
            const { weight, reps, rpe } = action.payload;

            const activeExId = getActiveExerciseId(session, activeExerciseIndex);
            if (!activeExId) return state;

            const activeEx = session.exercises[activeExId];
            if (!activeEx) return state;

            const newSet: SetLog = {
                id: Date.now().toString(),
                weight,
                reps,
                rpe,
                completedAt: new Date(),
                type: 'normal'
            };

            // Normalized Update: O(1) complexity
            const updatedExercise = {
                ...activeEx,
                sets: [...activeEx.sets, newSet]
            };

            return {
                ...state,
                session: {
                    ...session,
                    exercises: {
                        ...session.exercises,
                        [activeExId]: updatedExercise
                    }
                }
            };
        }

        case 'TOGGLE_PAUSE':
            return {
                ...state,
                isPaused: !state.isPaused
            };

        case 'NEXT_EXERCISE': {
            if (!state.session) return state;
            if (state.activeExerciseIndex < state.session.exerciseOrder.length - 1) {
                return { ...state, activeExerciseIndex: state.activeExerciseIndex + 1 };
            }
            return state;
        }

        case 'PREV_EXERCISE':
            if (state.activeExerciseIndex > 0) {
                return { ...state, activeExerciseIndex: state.activeExerciseIndex - 1 };
            }
            return state;

        case 'SKIP_EXERCISE': {
            if (!state.session) return state;

            const activeExId = getActiveExerciseId(state.session, state.activeExerciseIndex);
            if (!activeExId) return state;

            const activeEx = state.session.exercises[activeExId];
            if (!activeEx) return state;

            const updatedExercise = { ...activeEx, skipped: true };

            let nextIndex = state.activeExerciseIndex;
            if (nextIndex < state.session.exerciseOrder.length - 1) {
                nextIndex++;
            }

            return {
                ...state,
                activeExerciseIndex: nextIndex,
                session: {
                    ...state.session,
                    exercises: {
                        ...state.session.exercises,
                        [activeExId]: updatedExercise
                    }
                }
            };
        }

        case 'FINISH_WORKOUT':
            if (!state.session) return state;
            return {
                ...state,
                session: null
            };

        case 'CANCEL_WORKOUT':
            return {
                session: null,
                activeExerciseIndex: 0,
                isPaused: false
            };

        case 'REMOVE_EXERCISE': {
            if (!state.session) return state;
            const { exerciseId } = action.payload;

            // Check if exists
            if (!state.session.exercises[exerciseId]) return state;

            // 1. Remove from Dict
            const newExercises = { ...state.session.exercises };
            delete newExercises[exerciseId];

            // 2. Remove from Order
            const newOrder = state.session.exerciseOrder.filter(id => id !== exerciseId);

            // 3. Adjust Index
            const exIndex = state.session.exerciseOrder.indexOf(exerciseId);
            let newIndex = state.activeExerciseIndex;

            if (newOrder.length === 0) {
                newIndex = 0;
            } else if (exIndex < state.activeExerciseIndex) {
                newIndex = state.activeExerciseIndex - 1;
            } else if (exIndex === state.activeExerciseIndex) {
                if (newIndex >= newOrder.length) newIndex = newOrder.length - 1;
            }

            return {
                ...state,
                activeExerciseIndex: Math.max(0, newIndex),
                session: {
                    ...state.session,
                    exercises: newExercises,
                    exerciseOrder: newOrder
                }
            };
        }

        case 'TOGGLE_EXERCISE': {
            if (!state.session) return state;
            const { exerciseId } = action.payload;
            const exists = !!state.session.exercises[exerciseId];

            if (exists) {
                return activeWorkoutReducer(state, { type: 'REMOVE_EXERCISE', payload: { exerciseId } });
            } else {
                const newExercise: ExerciseSession = {
                    exerciseId,
                    sets: [],
                    targetSets: 4
                };
                return {
                    ...state,
                    session: {
                        ...state.session,
                        exercises: {
                            ...state.session.exercises,
                            [exerciseId]: newExercise
                        },
                        exerciseOrder: [...state.session.exerciseOrder, exerciseId]
                    }
                };
            }
        }

        case 'REORDER_EXERCISES': {
            if (!state.session) return state;

            const { fromIndex, toIndex } = action.payload;
            const { exercises, exerciseOrder } = state.session;

            // Use order array for indexing
            const movingExerciseId = exerciseOrder[fromIndex];
            const targetExerciseId = exerciseOrder[toIndex];

            const movingExercise = exercises[movingExerciseId];
            const targetExercise = exercises[targetExerciseId];

            const isRealHistory = (ex: ExerciseSession) => ex.sets.length > 0;

            if (isRealHistory(movingExercise) || isRealHistory(targetExercise)) {
                return state;
            }

            const newOrder = [...exerciseOrder];
            const [moved] = newOrder.splice(fromIndex, 1);
            newOrder.splice(toIndex, 0, moved);

            // Re-evaluate Active Index
            let newActiveIndex = 0;
            for (let i = 0; i < newOrder.length; i++) {
                const exId = newOrder[i];
                const ex = exercises[exId];

                if (ex.sets.length > 0) {
                    newActiveIndex = i + 1;
                } else if (ex.skipped) {
                    // Check context if prev was pending? Assuming strict history order:
                    newActiveIndex = i + 1;
                } else {
                    newActiveIndex = i;
                    break;
                }
            }

            // Sanitize
            const newExercises = { ...exercises };
            newOrder.forEach((id, i) => {
                if (i > newActiveIndex) {
                    const ex = newExercises[id];
                    if (ex.skipped) {
                        newExercises[id] = { ...ex, skipped: undefined };
                    }
                }
            });

            return {
                ...state,
                activeExerciseIndex: newActiveIndex,
                session: {
                    ...state.session,
                    exerciseOrder: newOrder,
                    exercises: newExercises
                }
            };
        }

        case 'UPDATE_EXERCISES': {
            if (!state.session) return state;

            // Payload is a list of ExerciseSession. 
            // We need to verify standard history and then re-normalize.
            const newExercisesList = action.payload.exercises;
            const activeExerciseIndex = state.activeExerciseIndex;

            // Simple check: IDs of first N items must match
            // This assumes newExercisesList is the FULL list
            const currentOrder = state.session.exerciseOrder;

            for (let i = 0; i < activeExerciseIndex; i++) {
                if (newExercisesList[i]?.exerciseId !== currentOrder[i]) return state;
            }

            // Re-normalize
            const newDict: Record<string, ExerciseSession> = {};
            const newOrder: string[] = [];

            newExercisesList.forEach(ex => {
                newDict[ex.exerciseId] = ex;
                newOrder.push(ex.exerciseId);
            });

            return {
                ...state,
                session: {
                    ...state.session,
                    exercises: newDict,
                    exerciseOrder: newOrder
                }
            };
        }

        case 'MOVE_GROUP': {
            if (!state.session) return state;
            const { group, direction } = action.payload;
            const { exerciseOrder, exercises } = state.session;

            // 1. Identify "Fluid" items
            // "Real History" = items before active index with sets > 0

            // Logic: Split order into [History] and [Fluid]
            // We can't move history. We only reorder the Fluid part.

            // If active index separates history, we just slice?
            // BUT skipped items in history might be movable? 
            // Simplifying: Assume strict history = 0 to activeIndex-1.

            const historyIds = exerciseOrder.slice(0, state.activeExerciseIndex);
            const fluidIds = exerciseOrder.slice(state.activeExerciseIndex);

            // 2. Group Fluid Items
            const groups: { group: string, ids: string[] }[] = [];
            let currentGroup: string | null = null;
            let currentBlock: string[] = [];

            fluidIds.forEach(id => {
                const def = getExerciseById(id);
                const g = def?.muscleGroup ?? 'Unknown';

                if (g !== currentGroup) {
                    if (currentGroup !== null) groups.push({ group: currentGroup, ids: currentBlock });
                    currentGroup = g;
                    currentBlock = [id];
                } else {
                    currentBlock.push(id);
                }
            });
            if (currentGroup !== null) groups.push({ group: currentGroup, ids: currentBlock });

            const groupIndex = groups.findIndex(g => g.group === group);
            if (groupIndex === -1) return state;

            // 3. Swap
            if (direction === 'up' && groupIndex > 0) {
                const prev = groups[groupIndex - 1];
                const curr = groups[groupIndex];
                groups[groupIndex - 1] = curr;
                groups[groupIndex] = prev;
            } else if (direction === 'down' && groupIndex < groups.length - 1) {
                const next = groups[groupIndex + 1];
                const curr = groups[groupIndex];
                groups[groupIndex + 1] = curr;
                groups[groupIndex] = next;
            } else {
                return state;
            }

            // 4. Reconstruct
            const newFluidIds = groups.flatMap(g => g.ids);
            const newOrder = [...historyIds, ...newFluidIds];

            // Active index remains same value (pointing to start of fluid)
            // unless we did something fancy with skipped items, 
            // but here we just reordered the future.

            return {
                ...state,
                session: {
                    ...state.session,
                    exerciseOrder: newOrder
                }
            };
        }

        default:
            return state;
    }
};
