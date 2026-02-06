import { MuscleGroup } from './workout';

export interface SetLog {
    id: string;
    weight: number;
    reps: number;
    rpe?: number; // Rate of Perceived Exertion (1-10)
    completedAt: Date;
    type: 'warmup' | 'normal' | 'failure' | 'drop';
}

export interface ExerciseSession {
    exerciseId: string;
    sets: SetLog[];
    notes?: string;
    targetSets: number; // Planned number of sets
    skipped?: boolean;
}

export interface WorkoutSession {
    id: string;
    startTime: Date;
    endTime?: Date;
    muscleGroups: MuscleGroup[];
    exercises: ExerciseSession[];
    status: 'active' | 'completed' | 'discarded';
}
