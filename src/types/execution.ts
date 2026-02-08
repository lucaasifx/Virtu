import { MuscleGroup } from './workout';

export interface SetLog {
    id: string;
    weight: number;
    reps: number;
    rpe?: number;
    completedAt: Date;
    type: 'warmup' | 'normal' | 'failure' | 'drop';
}

export interface ExerciseSession {
    exerciseId: string;
    sets: SetLog[];
    notes?: string;
    targetSets: number;
    skipped?: boolean;
}

export interface WorkoutSession {
    id: string;
    startTime: Date;
    endTime?: Date;
    muscleGroups: MuscleGroup[];
    exercises: Record<string, ExerciseSession>;
    exerciseOrder: string[];
    status: 'active' | 'completed' | 'discarded';
}
