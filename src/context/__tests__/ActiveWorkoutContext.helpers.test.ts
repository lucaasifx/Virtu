import { calculateWorkoutSummary, createWorkoutSession } from '@/src/context/ActiveWorkoutSession';
import { MuscleGroup } from '@/src/types/workout';

describe('ActiveWorkoutContext helpers', () => {
    it('createWorkoutSession cria sessão com estrutura esperada', () => {
        const now = new Date('2026-02-14T10:00:00.000Z');
        const session = createWorkoutSession(['chest_1', 'back_1'], [MuscleGroup.CHEST, MuscleGroup.BACK], now);

        expect(session.id).toBe(now.getTime().toString());
        expect(session.startTime).toBe(now);
        expect(session.status).toBe('active');
        expect(session.muscleGroups).toEqual([MuscleGroup.CHEST, MuscleGroup.BACK]);
        expect(session.exerciseOrder).toEqual(['chest_1', 'back_1']);
        expect(session.exercises.chest_1).toEqual({
            exerciseId: 'chest_1',
            sets: [],
            targetSets: 4,
        });
    });

    it('calculateWorkoutSummary calcula duração, volume e total de séries', () => {
        const startTime = new Date('2026-02-14T10:00:00.000Z');
        const endTime = new Date('2026-02-14T10:45:30.000Z');
        const session = createWorkoutSession(['chest_1', 'back_1'], [MuscleGroup.CHEST, MuscleGroup.BACK], startTime);

        session.exercises.chest_1.sets.push({
            id: 'set-1',
            weight: 100,
            reps: 5,
            rpe: 9,
            completedAt: new Date('2026-02-14T10:10:00.000Z'),
            type: 'normal',
        });
        session.exercises.back_1.sets.push({
            id: 'set-2',
            weight: 80,
            reps: 8,
            rpe: 8,
            completedAt: new Date('2026-02-14T10:20:00.000Z'),
            type: 'normal',
        });

        const summary = calculateWorkoutSummary(session, endTime);

        expect(summary.duration).toBe(2730);
        expect(summary.totalSets).toBe(2);
        expect(summary.totalVolume).toBe(1140);
    });
});
