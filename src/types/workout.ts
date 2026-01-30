export enum MuscleGroup {
    CHEST = 'CHEST',
    BACK = 'BACK',
    LEGS = 'LEGS',
    SHOULDERS = 'SHOULDERS',
    BICEPS = 'BICEPS',
    TRICEPS = 'TRICEPS',
    ABS = 'ABS',
    CARDIO = 'CARDIO',
    FULL_BODY = 'FULL_BODY',
    OTHER = 'OTHER'
}

export enum ExerciseType {
    STRENGTH = 'STRENGTH',
    CARDIO = 'CARDIO'
}

export interface BaseSet {
    id: string;
    rpe?: number; // Escala de percepção de esforço (1-10)
    completed: boolean;
}

export interface StrengthSet extends BaseSet {
    reps: number;
    weight: number;
}

export interface CardioSet extends BaseSet {
    duration: number; // Segundos
    distance?: number; // Metros
}

export type ExerciseSet = StrengthSet | CardioSet;

export interface Exercise {
    id: string;
    name: string;
    type: ExerciseType;
    muscleGroup?: MuscleGroup;
    sets: ExerciseSet[];
    notes?: string;
}

export interface WorkoutDTO {
    id: string;
    title: string;
    date: Date;
    startTime?: Date;
    endTime?: Date;
    duration?: number; // Em segundos
    exercises: Exercise[];
    totalVolume?: number; // Volume total de treino calculado
    notes?: string;
}
