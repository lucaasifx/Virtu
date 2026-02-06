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

export const activeWorkoutReducer = (state: ActiveWorkoutState, action: ActiveWorkoutAction): ActiveWorkoutState => {
    switch (action.type) {
        case 'START_WORKOUT':
            return {
                session: {
                    id: Date.now().toString(),
                    startTime: new Date(),
                    status: 'active',
                    muscleGroups: action.payload.groups,
                    exercises: action.payload.exercises.map(id => ({
                        exerciseId: id,
                        sets: [],
                        targetSets: 4
                    }))
                },
                activeExerciseIndex: 0,
                isPaused: false
            };

        case 'LOG_SET': {
            if (!state.session) return state;

            const updatedExercises = state.session.exercises.map((ex, idx) => {
                if (idx !== state.activeExerciseIndex) return ex;

                const newSet: SetLog = {
                    id: Date.now().toString(),
                    weight: action.payload.weight,
                    reps: action.payload.reps,
                    rpe: action.payload.rpe,
                    completedAt: new Date(),
                    type: 'normal'
                };

                return { ...ex, sets: [...ex.sets, newSet] };
            });

            return {
                ...state,
                session: { ...state.session, exercises: updatedExercises }
            };
        }

        case 'TOGGLE_PAUSE':
            return {
                ...state,
                isPaused: !state.isPaused
            };

        case 'NEXT_EXERCISE': {
            if (!state.session) return state;
            if (state.activeExerciseIndex < state.session.exercises.length - 1) {
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

            const updatedExercises = state.session.exercises.map((ex, idx) => {
                if (idx !== state.activeExerciseIndex) return ex;
                return { ...ex, skipped: true };
            });

            // Identify if we can move next
            let nextIndex = state.activeExerciseIndex;
            if (nextIndex < state.session.exercises.length - 1) {
                nextIndex++;
            }

            return {
                ...state,
                activeExerciseIndex: nextIndex,
                session: { ...state.session, exercises: updatedExercises }
            };
        }

        case 'FINISH_WORKOUT':
            // Persistence logic is handled in the Context or Middleware, Reducer just clears or updates status
            if (!state.session) return state;
            return {
                ...state,
                session: null // Or mark as completed if we wanted to show a summary screen reading this state
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
            const exIndex = state.session.exercises.findIndex(e => e.exerciseId === exerciseId);

            if (exIndex === -1) return state;

            const newExercises = state.session.exercises.filter(e => e.exerciseId !== exerciseId);

            // Re-calculate Index atomically
            let newIndex = state.activeExerciseIndex;
            if (newExercises.length === 0) {
                newIndex = 0;
            } else if (exIndex < state.activeExerciseIndex) {
                newIndex = state.activeExerciseIndex - 1;
            } else if (exIndex === state.activeExerciseIndex) {
                if (newIndex >= newExercises.length) {
                    newIndex = newExercises.length - 1;
                }
            }

            return {
                ...state,
                activeExerciseIndex: Math.max(0, newIndex),
                session: { ...state.session, exercises: newExercises }
            };
        }

        case 'TOGGLE_EXERCISE': {
            if (!state.session) return state;
            const { exerciseId } = action.payload;
            const exists = state.session.exercises.some(e => e.exerciseId === exerciseId);

            if (exists) {
                // Reuse REMOVE logic
                return activeWorkoutReducer(state, { type: 'REMOVE_EXERCISE', payload: { exerciseId } });
            } else {
                // ADD
                const newExercise: ExerciseSession = {
                    exerciseId,
                    sets: [],
                    targetSets: 4
                };
                return {
                    ...state,
                    session: {
                        ...state.session,
                        exercises: [...state.session.exercises, newExercise]
                    }
                };
            }
        }

        case 'REORDER_EXERCISES': {
            if (!state.session) return state;

            const { fromIndex, toIndex } = action.payload;
            const exercises = state.session.exercises;

            // Security Check: Prevent moving "Real History" (Completed with sets)
            const movingExercise = exercises[fromIndex];
            const targetExercise = exercises[toIndex];

            const isRealHistory = (ex: ExerciseSession, index: number) => {
                // It is real history if it has sets logged AND is effectively in the past
                // But for simplicity, we just check sets. If you have sets, you are locked.
                return ex.sets.length > 0;
            };

            if (isRealHistory(movingExercise, fromIndex) || isRealHistory(targetExercise, toIndex)) {
                // Cannot move items with logged sets
                return state;
            }

            const newExercises = [...exercises];
            const [moved] = newExercises.splice(fromIndex, 1);
            newExercises.splice(toIndex, 0, moved);

            // Re-evaluate Active Index and Sanitize State
            // The Active Index is the first item that is NOT "History".
            // History = continuous block of (sets > 0 OR skipped=true) from the start.
            // If we find a "Pending" item, that's the start of Future.
            // ANY item in the Future (after Active Index) must verify it is NOT skipped.
            // If a skipped item was moved to future, it must be unskipped.

            let newActiveIndex = 0;
            for (let i = 0; i < newExercises.length; i++) {
                const ex = newExercises[i];
                if (ex.sets.length > 0) {
                    // Completed with sets -> Always History
                    newActiveIndex = i + 1;
                } else if (ex.skipped) {
                    // Skipped -> History, UNLESS we previously found a 'Pending' gap?
                    // Actually, if we encounter a 'Pending' item, the history block ends.
                    // But here, we haven't found pending yet.
                    newActiveIndex = i + 1;
                } else {
                    // Found a Pending item (No sets, not skipped).
                    // This creates a boundary.
                    newActiveIndex = i;
                    break;
                }
            }

            // Sanitize Future: Unskip any skipped items after the new active index
            const sanitizedExercises = newExercises.map((ex, i) => {
                if (i > newActiveIndex && ex.skipped) {
                    const clean = { ...ex };
                    delete clean.skipped;
                    return clean;
                }
                return ex;
            });

            // Double Check: The item at newActiveIndex should also be unskipped if it was skipped?
            // Wait, our loop determined newActiveIndex by finding the first NON-Skipped.
            // So newExercises[newActiveIndex] is guaranteed to be !skipped (or it's the end of array).
            // BUT, if we broke early, 'i' is the index of the pending item.
            // So sanitizedExercises[newActiveIndex] is fine.

            // Edge case: simple swap of [Skip, Pending] -> [Pending, Skip]
            // Loop:
            // 0: Pending. Break. newActive = 0.
            // Map:
            // 1: Skip. i > 0. Unskip! -> Pending.
            // Result: [Pending, Pending]. Active=0.
            // Correct.

            return {
                ...state,
                activeExerciseIndex: newActiveIndex,
                session: { ...state.session, exercises: sanitizedExercises }
            };
        }

        case 'UPDATE_EXERCISES': {
            if (!state.session) return state;

            // Payload contains ONLY the exercise list?
            // Need to verify if we are getting full list or partial.
            // Tool usage suggests full list.
            const newExercises = action.payload.exercises;

            // Ensure History Integrity
            const historyLimit = state.activeExerciseIndex;
            const oldHistory = state.session.exercises.slice(0, historyLimit);
            const newHistoryCandidate = newExercises.slice(0, historyLimit);

            const isHistoryIntact = oldHistory.every((ex, i) => ex.exerciseId === newHistoryCandidate[i]?.exerciseId);

            if (!isHistoryIntact) {
                return state; // Reject history modification
            }

            // Accept change.
            // Active Index stays fixed.

            return {
                ...state,
                session: { ...state.session, exercises: newExercises }
            };
        }

        case 'MOVE_GROUP': {
            if (!state.session) return state;
            const { group, direction } = action.payload;
            const allExercises = state.session.exercises;

            // 1. Identify "movable" History (Skipped Items ONLY)
            // We want to pull skipped items out of history if they belong to the group being moved,
            // so they don't get left behind creating a "Phantom" group.
            let adjustedActiveIndex = state.activeExerciseIndex;
            const consolidatedExercises = [...allExercises];

            // Optimization: Only scan if we suspect fragmentation? 
            // Or just always try to consolidate 'skipped' items of the target group?

            // Strategy: Filter history for skipped items of this group
            // If found, move them to the START of the pending zone ??
            // OR just rebuild the list.

            // Let's protect "Real History" (Completed with sets)
            // Everything else is fluid.

            const realHistory: ExerciseSession[] = [];
            const fluidItems: ExerciseSession[] = [];

            for (let i = 0; i < allExercises.length; i++) {
                const ex = allExercises[i];
                // "Real History" = Completed (sets > 0) AND index < activeIndex
                // Wait, if index < activeIndex but sets=0 (Skipped), it is Fluid.
                if (i < state.activeExerciseIndex && ex.sets.length > 0) {
                    realHistory.push(ex);
                } else {
                    // Reset 'skipped' status when moving items back into play
                    const pendingEx = { ...ex };
                    if (pendingEx.skipped) {
                        delete pendingEx.skipped;
                    }
                    fluidItems.push(pendingEx);
                }
            }

            // Recalculate Active Index relative to Fluid Start
            // The new "Active" item will depend on how we shuffle fluid items.
            // Actually, we just want to GROUP fluid items.

            // 2. Group Fluid Items
            const groups: { group: string, items: ExerciseSession[] }[] = [];
            let currentGroup: string | null = null;
            let currentBlock: ExerciseSession[] = [];

            fluidItems.forEach((ex) => {
                const def = getExerciseById(ex.exerciseId);
                const g = def ? def.muscleGroup : 'Unknown';

                if (g !== currentGroup) {
                    if (currentGroup !== null) {
                        groups.push({ group: currentGroup, items: currentBlock });
                    }
                    currentGroup = g;
                    currentBlock = [ex];
                } else {
                    currentBlock.push(ex);
                }
            });
            if (currentGroup !== null) {
                groups.push({ group: currentGroup, items: currentBlock });
            }

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
            const newFluid = groups.flatMap(g => g.items);
            const finalExercises = [...realHistory, ...newFluid];

            // 5. Determine New Active Index
            // The active index should point to the FIRST item in "newFluid" usually,
            // UNLESS the user dragged "Active" thing down?
            // "Active" is effectively the first item of Fluid list.
            // So:
            return {
                ...state,
                activeExerciseIndex: realHistory.length,
                session: { ...state.session, exercises: finalExercises }
            };
        }

        default:
            return state;
    }
};
