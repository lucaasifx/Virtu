import { supabase } from './supabase';
import { WorkoutSession, SetLog, ExerciseSession } from '../types/execution';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Json } from './database.types';

const WORKOUT_CACHE_KEY = '@virtu_workouts_cache';
const CACHE_LAST_SYNC_KEY = '@virtu_last_workout_sync';

// Types for JSONB storage
export interface WorkoutExerciseData {
    exerciseId: string;
    sets: {
        weight: number;
        reps: number;
        rpe: number;
        completedAt: string;
    }[];
}

export interface CachedWorkout {
    id: string;
    startedAt: string;
    endedAt: string;
    durationSeconds: number;
    totalVolume: number;
    totalSets: number;
    muscleGroups: string[];
    exercisesData: WorkoutExerciseData[];
}

export interface WorkoutSyncResult {
    success: boolean;
    workoutId?: string;
    error?: string;
}

function parseExercisesData(data: Json | null): WorkoutExerciseData[] {
    if (!Array.isArray(data)) return [];

    return data
        .map((item) => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) return null;

            const exerciseId = item.exerciseId;
            const sets = item.sets;

            if (typeof exerciseId !== 'string' || !Array.isArray(sets)) return null;

            const parsedSets = sets
                .map((set) => {
                    if (!set || typeof set !== 'object' || Array.isArray(set)) return null;

                    const { weight, reps, rpe, completedAt } = set;
                    if (
                        typeof weight !== 'number' ||
                        typeof reps !== 'number' ||
                        typeof rpe !== 'number' ||
                        typeof completedAt !== 'string'
                    ) {
                        return null;
                    }

                    return { weight, reps, rpe, completedAt };
                })
                .filter((set): set is WorkoutExerciseData['sets'][number] => set !== null);

            return {
                exerciseId,
                sets: parsedSets,
            };
        })
        .filter((item): item is WorkoutExerciseData => item !== null);
}

/**
 * Syncs a completed workout to Supabase using JSONB format
 */
export async function syncWorkoutToSupabase(
    session: WorkoutSession,
    durationSeconds: number,
    totalVolume: number
): Promise<WorkoutSyncResult> {
    try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.log('[WorkoutSync] No user logged in, saving to local cache only');
            await saveWorkoutToCache(session, durationSeconds, totalVolume);
            return { success: false, error: 'User not authenticated' };
        }

        console.log('[WorkoutSync] Syncing workout for user:', user.id);

        // Prepare exercises data as JSONB
        const exercisesData: WorkoutExerciseData[] = [];
        let totalSets = 0;

        for (const exerciseId of session.exerciseOrder) {
            const exercise: ExerciseSession | undefined = session.exercises[exerciseId];
            if (!exercise || exercise.sets.length === 0) continue;

            totalSets += exercise.sets.length;

            exercisesData.push({
                exerciseId: exercise.exerciseId,
                sets: exercise.sets.map((set: SetLog) => ({
                    weight: set.weight,
                    reps: set.reps,
                    rpe: set.rpe || 0,
                    completedAt: set.completedAt.toISOString(),
                })),
            });
        }
        const exercisesDataJson = exercisesData as unknown as Json;

        // Insert workout with JSONB data
        const { data: workout, error: workoutError } = await supabase
            .from('workouts')
            .insert({
                user_id: user.id,
                started_at: session.startTime.toISOString(),
                ended_at: new Date().toISOString(),
                duration_seconds: durationSeconds,
                total_volume: totalVolume,
                total_sets: totalSets,
                muscle_groups: session.muscleGroups,
                exercises_data: exercisesDataJson,
                status: 'completed',
            })
            .select('id')
            .single();

        if (workoutError) {
            console.error('[WorkoutSync] Error inserting workout:', workoutError);
            // Fallback to local cache
            await saveWorkoutToCache(session, durationSeconds, totalVolume);
            return { success: false, error: workoutError.message };
        }

        console.log('[WorkoutSync] ✅ Workout synced successfully! ID:', workout.id);

        // Also save to local cache for offline stats
        await saveWorkoutToCache(session, durationSeconds, totalVolume, workout.id);

        return { success: true, workoutId: workout.id };

    } catch (error) {
        console.error('[WorkoutSync] Unexpected error:', error);
        // Fallback to local cache
        await saveWorkoutToCache(session, durationSeconds, totalVolume);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Saves workout to local AsyncStorage cache
 */
async function saveWorkoutToCache(
    session: WorkoutSession,
    durationSeconds: number,
    totalVolume: number,
    serverId?: string
): Promise<void> {
    try {
        const exercisesData: WorkoutExerciseData[] = [];
        let totalSets = 0;

        for (const exerciseId of session.exerciseOrder) {
            const exercise = session.exercises[exerciseId];
            if (!exercise || exercise.sets.length === 0) continue;

            totalSets += exercise.sets.length;

            exercisesData.push({
                exerciseId: exercise.exerciseId,
                sets: exercise.sets.map((set: SetLog) => ({
                    weight: set.weight,
                    reps: set.reps,
                    rpe: set.rpe || 0,
                    completedAt: set.completedAt.toISOString(),
                })),
            });
        }

        const cachedWorkout: CachedWorkout = {
            id: serverId || session.id,
            startedAt: session.startTime.toISOString(),
            endedAt: new Date().toISOString(),
            durationSeconds,
            totalVolume,
            totalSets,
            muscleGroups: session.muscleGroups,
            exercisesData,
        };

        // Get existing cache
        const existingCache = await AsyncStorage.getItem(WORKOUT_CACHE_KEY);
        const workouts: CachedWorkout[] = existingCache ? JSON.parse(existingCache) : [];

        // Add new workout at the beginning
        workouts.unshift(cachedWorkout);

        // Keep only last 100 workouts in cache (memory optimization)
        const trimmedWorkouts = workouts.slice(0, 100);

        await AsyncStorage.setItem(WORKOUT_CACHE_KEY, JSON.stringify(trimmedWorkouts));
        await AsyncStorage.setItem(CACHE_LAST_SYNC_KEY, new Date().toISOString());

        console.log('[WorkoutCache] Saved workout to local cache');
    } catch (error) {
        console.error('[WorkoutCache] Error saving to cache:', error);
    }
}

/**
 * Gets all cached workouts for offline stats
 */
export async function getCachedWorkouts(): Promise<CachedWorkout[]> {
    try {
        const cache = await AsyncStorage.getItem(WORKOUT_CACHE_KEY);
        return cache ? JSON.parse(cache) : [];
    } catch (error) {
        console.error('[WorkoutCache] Error reading cache:', error);
        return [];
    }
}

/**
 * Fetches workouts from Supabase and updates local cache
 */
/**
 * Fetches workouts from Supabase and updates local cache
 * @param daysToSync Number of days to look back (default: 30)
 */
export async function syncWorkoutsFromSupabase(daysToSync: number = 30): Promise<CachedWorkout[]> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return await getCachedWorkouts();

        // Calculate date limit
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - daysToSync);
        const dateLimitStr = dateLimit.toISOString();

        const { data: workouts, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', user.id)
            .gte('started_at', dateLimitStr) // Only workouts from last X days
            .order('started_at', { ascending: false });

        if (error) {
            console.error('[WorkoutSync] Error fetching workouts:', error);
            return await getCachedWorkouts();
        }

        // Transform to CachedWorkout format
        const fetchedWorkouts: CachedWorkout[] = (workouts ?? []).map((w) => ({
            id: w.id,
            startedAt: w.started_at,
            endedAt: w.ended_at ?? w.started_at,
            durationSeconds: w.duration_seconds ?? 0,
            totalVolume: w.total_volume ?? 0,
            totalSets: w.total_sets ?? 0,
            muscleGroups: w.muscle_groups ?? [],
            exercisesData: parseExercisesData(w.exercises_data),
        }));

        // MERGE Strategy:
        // We typically want to keep older cached workouts if they exist, but update recent ones.
        // For simplicity and per user request ("pull last 30 days"), we can overwrite/merge.
        // Let's read current cache, remove overlaps, and prepend new ones?
        // Or simpler: Just fetch everything we need?
        // If we only fetch 30 days, we might lose older history in cache if we just overwrite.
        // So we should merge.

        const currentCache = await getCachedWorkouts();

        // Create a map of current cache for duplicates check
        const cacheMap = new Map(currentCache.map(w => [w.id, w]));

        // Update/Add fetched workouts
        fetchedWorkouts.forEach(w => {
            cacheMap.set(w.id, w);
        });

        // Convert back to array and sort
        const mergedWorkouts = Array.from(cacheMap.values())
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
            .slice(0, 100); // Keep limit 100 locally

        // Update local cache
        await AsyncStorage.setItem(WORKOUT_CACHE_KEY, JSON.stringify(mergedWorkouts));
        await AsyncStorage.setItem(CACHE_LAST_SYNC_KEY, new Date().toISOString());

        console.log(`[WorkoutSync] ✅ Synced ${fetchedWorkouts.length} workouts (last ${daysToSync} days) from Supabase`);
        return mergedWorkouts;

    } catch (error) {
        console.error('[WorkoutSync] Error syncing from Supabase:', error);
        return await getCachedWorkouts();
    }
}

/**
 * Syncs gamification data to Supabase
 */
export async function syncGamificationToSupabase(
    totalXP: number,
    currentLevel: number,
    streak: number
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('gamification')
            .upsert({
                user_id: user.id,
                total_xp: totalXP,
                current_level: currentLevel,
                streak: streak,
                last_workout_date: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id',
            });

        if (error) {
            console.error('[GamificationSync] Error:', error);
            return { success: false, error: error.message };
        }

        console.log('[GamificationSync] ✅ Gamification synced!');
        return { success: true };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
