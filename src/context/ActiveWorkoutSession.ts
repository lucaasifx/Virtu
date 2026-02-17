import { ExerciseSession, WorkoutSession } from '../types/execution';
import { MuscleGroup } from '../types/workout';

export function createWorkoutSession(exerciseIds: string[], groups: MuscleGroup[], now: Date = new Date()): WorkoutSession {
    const exercisesDict: Record<string, ExerciseSession> = {};
    exerciseIds.forEach(id => {
        exercisesDict[id] = {
            exerciseId: id,
            sets: [],
            targetSets: 4
        };
    });

    return {
        id: now.getTime().toString(),
        startTime: now,
        status: 'active',
        muscleGroups: groups,
        exercises: exercisesDict,
        exerciseOrder: exerciseIds
    };
}

export function calculateWorkoutSummary(session: WorkoutSession, endTime: Date) {
    const duration = Math.floor((endTime.getTime() - new Date(session.startTime).getTime()) / 1000);
    let totalVolume = 0;
    let totalSets = 0;
    let regularSets = 0;
    let extraSets = 0;

    session.exerciseOrder.forEach(id => {
        const ex = session.exercises[id];
        totalSets += ex.sets.length;

        ex.sets.forEach((set, index) => {
            totalVolume += set.weight * set.reps;
            if (index < 3) {
                regularSets++;
            } else {
                extraSets++;
            }
        });
    });

    return { duration, totalVolume, totalSets, regularSets, extraSets };
}
