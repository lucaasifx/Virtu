import { activeWorkoutReducer, ActiveWorkoutState } from '@/src/context/ActiveWorkoutReducer';
import { ExerciseSession } from '@/src/types/execution';
import { MuscleGroup } from '@/src/types/workout';

const createState = (
    exerciseOrder: string[],
    activeExerciseIndex = 0,
    overrides?: Partial<Record<string, Partial<ExerciseSession>>>
): ActiveWorkoutState => {
    const exercises = exerciseOrder.reduce<Record<string, ExerciseSession>>((acc, exerciseId) => {
        const override = overrides?.[exerciseId];
        acc[exerciseId] = {
            exerciseId,
            sets: [],
            targetSets: 4,
            ...override,
        };
        return acc;
    }, {});

    return {
        session: {
            id: 'session-1',
            startTime: new Date('2026-01-01T00:00:00.000Z'),
            status: 'active',
            muscleGroups: [MuscleGroup.CHEST, MuscleGroup.BACK],
            exercises,
            exerciseOrder,
        },
        activeExerciseIndex,
        isPaused: false,
    };
};

describe('activeWorkoutReducer', () => {
    it('inicia treino com sessão válida', () => {
        const result = activeWorkoutReducer(
            { session: null, activeExerciseIndex: 0, isPaused: true },
            {
                type: 'START_WORKOUT',
                payload: {
                    exercises: ['chest_1', 'back_1'],
                    groups: [MuscleGroup.CHEST, MuscleGroup.BACK],
                },
            }
        );

        expect(result.session).not.toBeNull();
        expect(result.activeExerciseIndex).toBe(0);
        expect(result.isPaused).toBe(false);
        expect(result.session?.exerciseOrder).toEqual(['chest_1', 'back_1']);
        expect(result.session?.exercises.chest_1.targetSets).toBe(4);
    });

    it('registra série no exercício ativo', () => {
        const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000);
        const state = createState(['chest_1', 'back_1'], 0);

        const result = activeWorkoutReducer(state, {
            type: 'LOG_SET',
            payload: { weight: 80, reps: 8, rpe: 9 },
        });

        expect(result.session?.exercises.chest_1.sets).toHaveLength(1);
        expect(result.session?.exercises.back_1.sets).toHaveLength(0);
        expect(result.session?.exercises.chest_1.sets[0].weight).toBe(80);
        expect(result.session?.exercises.chest_1.sets[0].reps).toBe(8);
        expect(result.session?.exercises.chest_1.sets[0].rpe).toBe(9);
        dateNowSpy.mockRestore();
    });

    it('avança e retorna exercício respeitando limites', () => {
        const state = createState(['chest_1', 'back_1'], 0);
        const next = activeWorkoutReducer(state, { type: 'NEXT_EXERCISE' });
        const nextAtLimit = activeWorkoutReducer(next, { type: 'NEXT_EXERCISE' });
        const prev = activeWorkoutReducer(nextAtLimit, { type: 'PREV_EXERCISE' });
        const prevAtZero = activeWorkoutReducer(
            { ...prev, activeExerciseIndex: 0 },
            { type: 'PREV_EXERCISE' }
        );

        expect(next.activeExerciseIndex).toBe(1);
        expect(nextAtLimit.activeExerciseIndex).toBe(1);
        expect(prev.activeExerciseIndex).toBe(0);
        expect(prevAtZero.activeExerciseIndex).toBe(0);
    });

    it('pula exercício e marca como skipped', () => {
        const state = createState(['chest_1', 'back_1'], 0);

        const result = activeWorkoutReducer(state, { type: 'SKIP_EXERCISE' });

        expect(result.activeExerciseIndex).toBe(1);
        expect(result.session?.exercises.chest_1.skipped).toBe(true);
    });

    it('remove exercício e ajusta índice ativo', () => {
        const state = createState(['chest_1', 'back_1', 'back_2'], 2);

        const result = activeWorkoutReducer(state, {
            type: 'REMOVE_EXERCISE',
            payload: { exerciseId: 'back_2' },
        });

        expect(result.session?.exerciseOrder).toEqual(['chest_1', 'back_1']);
        expect(result.session?.exercises.back_2).toBeUndefined();
        expect(result.activeExerciseIndex).toBe(1);
    });

    it('toggle remove exercício existente', () => {
        const state = createState(['chest_1', 'back_1'], 0);

        const result = activeWorkoutReducer(state, {
            type: 'TOGGLE_EXERCISE',
            payload: { exerciseId: 'back_1' },
        });

        expect(result.session?.exerciseOrder).toEqual(['chest_1']);
        expect(result.session?.exercises.back_1).toBeUndefined();
    });

    it('toggle adiciona exercício no bloco do mesmo grupo', () => {
        const state = createState(['chest_1', 'back_1', 'back_2'], 0);

        const result = activeWorkoutReducer(state, {
            type: 'TOGGLE_EXERCISE',
            payload: { exerciseId: 'chest_2' },
        });

        expect(result.session?.exerciseOrder).toEqual(['chest_1', 'chest_2', 'back_1', 'back_2']);
        expect(result.session?.exercises.chest_2).toBeDefined();
    });

    it('reordena exercícios sem histórico e recalcula índice ativo', () => {
        const state = createState(['chest_1', 'back_1', 'back_2'], 0);

        const result = activeWorkoutReducer(state, {
            type: 'REORDER_EXERCISES',
            payload: { fromIndex: 2, toIndex: 0 },
        });

        expect(result.session?.exerciseOrder).toEqual(['back_2', 'chest_1', 'back_1']);
        expect(result.activeExerciseIndex).toBe(0);
    });

    it('não reordena se exercício de origem ou alvo tem histórico', () => {
        const state = createState(['chest_1', 'back_1'], 0, {
            chest_1: {
                sets: [
                    {
                        id: 'set-1',
                        weight: 60,
                        reps: 10,
                        rpe: 8,
                        completedAt: new Date('2026-01-01T00:00:00.000Z'),
                        type: 'normal',
                    },
                ],
            },
        });

        const result = activeWorkoutReducer(state, {
            type: 'REORDER_EXERCISES',
            payload: { fromIndex: 0, toIndex: 1 },
        });

        expect(result).toBe(state);
    });

    it('atualiza lista apenas se histórico anterior ao índice ativo não muda', () => {
        const state = createState(['chest_1', 'back_1', 'back_2'], 1);

        const validResult = activeWorkoutReducer(state, {
            type: 'UPDATE_EXERCISES',
            payload: {
                exercises: [
                    state.session!.exercises.chest_1,
                    state.session!.exercises.back_2,
                    state.session!.exercises.back_1,
                ],
            },
        });

        const invalidResult = activeWorkoutReducer(state, {
            type: 'UPDATE_EXERCISES',
            payload: {
                exercises: [
                    state.session!.exercises.back_1,
                    state.session!.exercises.chest_1,
                    state.session!.exercises.back_2,
                ],
            },
        });

        expect(validResult.session?.exerciseOrder).toEqual(['chest_1', 'back_2', 'back_1']);
        expect(invalidResult).toBe(state);
    });

    it('move bloco de grupo para cima e para baixo na parte fluida', () => {
        const state = createState(['chest_1', 'back_1', 'back_2', 'legs_1'], 1);

        const up = activeWorkoutReducer(state, {
            type: 'MOVE_GROUP',
            payload: { group: MuscleGroup.LEGS, direction: 'up' },
        });

        const down = activeWorkoutReducer(up, {
            type: 'MOVE_GROUP',
            payload: { group: MuscleGroup.LEGS, direction: 'down' },
        });

        expect(up.session?.exerciseOrder).toEqual(['chest_1', 'legs_1', 'back_1', 'back_2']);
        expect(down.session?.exerciseOrder).toEqual(['chest_1', 'back_1', 'back_2', 'legs_1']);
    });

    it('mantém estado para ações dependentes de sessão quando sessão é nula', () => {
        const state: ActiveWorkoutState = {
            session: null,
            activeExerciseIndex: 0,
            isPaused: false,
        };

        const skipResult = activeWorkoutReducer(state, { type: 'SKIP_EXERCISE' });
        const removeResult = activeWorkoutReducer(state, {
            type: 'REMOVE_EXERCISE',
            payload: { exerciseId: 'chest_1' },
        });
        const updateResult = activeWorkoutReducer(state, {
            type: 'UPDATE_EXERCISES',
            payload: { exercises: [] },
        });

        expect(skipResult).toBe(state);
        expect(removeResult).toBe(state);
        expect(updateResult).toBe(state);
    });

    it('adiciona exercício desconhecido ao final ao fazer toggle', () => {
        const state = createState(['chest_1', 'back_1'], 0);

        const result = activeWorkoutReducer(state, {
            type: 'TOGGLE_EXERCISE',
            payload: { exerciseId: 'unknown_999' },
        });

        expect(result.session?.exerciseOrder).toEqual(['chest_1', 'back_1', 'unknown_999']);
        expect(result.session?.exercises.unknown_999).toEqual({
            exerciseId: 'unknown_999',
            sets: [],
            targetSets: 4,
        });
    });
});
