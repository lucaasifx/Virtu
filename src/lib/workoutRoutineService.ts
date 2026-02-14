import { z } from 'zod';
import { supabase } from './supabase';
import { Database } from './database.types';
import { MuscleGroup } from '../types/workout';

export interface WorkoutRoutineRecord {
    id: string;
    title: string;
    category: string;
    muscleGroups: MuscleGroup[];
    exerciseIds: string[];
    coverMuscleGroup: MuscleGroup;
    createdAt: string;
    updatedAt: string;
}

export interface WorkoutRoutinePersistInput {
    title: string;
    category: string;
    muscleGroups: MuscleGroup[];
    exerciseIds: string[];
    coverMuscleGroup: MuscleGroup;
}

type WorkoutRoutineRow = Database['public']['Tables']['workout_routines']['Row'];
const ROUTINE_REQUEST_TIMEOUT_MS = 12000;

const routineSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    category: z.string().min(1),
    muscle_groups: z.array(z.string()),
    exercise_ids: z.array(z.string()),
    cover_muscle_group: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

function isMuscleGroup(value: string): value is MuscleGroup {
    return Object.values(MuscleGroup).includes(value as MuscleGroup);
}

function parseMuscleGroups(values: string[]): MuscleGroup[] {
    return values.filter(isMuscleGroup);
}

function toRecord(row: WorkoutRoutineRow): WorkoutRoutineRecord | null {
    const parsed = routineSchema.safeParse(row);
    if (!parsed.success) {
        return null;
    }

    const muscleGroups = parseMuscleGroups(parsed.data.muscle_groups);
    const coverMuscleGroup = isMuscleGroup(parsed.data.cover_muscle_group)
        ? parsed.data.cover_muscle_group
        : muscleGroups[0] ?? MuscleGroup.CHEST;

    return {
        id: parsed.data.id,
        title: parsed.data.title,
        category: parsed.data.category,
        muscleGroups,
        exerciseIds: parsed.data.exercise_ids,
        coverMuscleGroup,
        createdAt: parsed.data.created_at,
        updatedAt: parsed.data.updated_at,
    };
}

async function withTimeout<T>(promiseLike: PromiseLike<T>, timeoutMs: number): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('Tempo de resposta excedido ao salvar/carregar rotina.'));
        }, timeoutMs);
    });

    try {
        return await Promise.race([Promise.resolve(promiseLike), timeoutPromise]);
    } finally {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }
}

export async function fetchWorkoutRoutines(userId: string): Promise<WorkoutRoutineRecord[]> {
    const { data, error } = await withTimeout(
        supabase
            .from('workout_routines')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false }),
        ROUTINE_REQUEST_TIMEOUT_MS
    );

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? [])
        .map((row) => toRecord(row))
        .filter((row): row is WorkoutRoutineRecord => row !== null);
}

export async function createWorkoutRoutine(
    userId: string,
    input: WorkoutRoutinePersistInput
): Promise<WorkoutRoutineRecord> {
    const payload: Database['public']['Tables']['workout_routines']['Insert'] = {
        user_id: userId,
        title: input.title,
        category: input.category,
        muscle_groups: input.muscleGroups,
        exercise_ids: input.exerciseIds,
        cover_muscle_group: input.coverMuscleGroup,
    };

    const { data, error } = await withTimeout(
        supabase
            .from('workout_routines')
            .insert(payload)
            .select('*')
            .single(),
        ROUTINE_REQUEST_TIMEOUT_MS
    );

    if (error) {
        throw new Error(error.message);
    }

    const mapped = toRecord(data);
    if (!mapped) {
        throw new Error('Invalid routine response');
    }

    return mapped;
}

export async function updateWorkoutRoutine(
    routineId: string,
    userId: string,
    input: WorkoutRoutinePersistInput
): Promise<WorkoutRoutineRecord> {
    const payload: Database['public']['Tables']['workout_routines']['Update'] = {
        title: input.title,
        category: input.category,
        muscle_groups: input.muscleGroups,
        exercise_ids: input.exerciseIds,
        cover_muscle_group: input.coverMuscleGroup,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await withTimeout(
        supabase
            .from('workout_routines')
            .update(payload)
            .eq('id', routineId)
            .eq('user_id', userId)
            .select('*')
            .single(),
        ROUTINE_REQUEST_TIMEOUT_MS
    );

    if (error) {
        throw new Error(error.message);
    }

    const mapped = toRecord(data);
    if (!mapped) {
        throw new Error('Invalid routine response');
    }

    return mapped;
}
