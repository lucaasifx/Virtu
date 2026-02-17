import { supabase } from './supabase';
import { WorkoutSession, SetLog, ExerciseSession } from '../types/execution';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Json } from './database.types';

const WORKOUT_CACHE_KEY_PREFIX = '@virtu_workouts_cache';
const CACHE_LAST_SYNC_KEY_PREFIX = '@virtu_last_workout_sync';
const ANONYMOUS_CACHE_ID = 'anonymous';

async function getUserIdFromSession(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

function getWorkoutCacheKey(userId: string | null): string {
    return `${WORKOUT_CACHE_KEY_PREFIX}:${userId ?? ANONYMOUS_CACHE_ID}`;
}

function getLastSyncKey(userId: string | null): string {
    return `${CACHE_LAST_SYNC_KEY_PREFIX}:${userId ?? ANONYMOUS_CACHE_ID}`;
}

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
    totalVolume: number,
    userId?: string
): Promise<WorkoutSyncResult> {
    try {
        const resolvedUserId = userId ?? await getUserIdFromSession();
        if (!resolvedUserId) {
            console.log('[WorkoutSync] No user logged in, saving to local cache only');
            await saveWorkoutToCache(session, durationSeconds, totalVolume, undefined, null);
            return { success: false, error: 'User not authenticated' };
        }

        console.log('[WorkoutSync] Syncing workout for user:', resolvedUserId);

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
                user_id: resolvedUserId,
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
            await saveWorkoutToCache(session, durationSeconds, totalVolume, undefined, resolvedUserId);
            return { success: false, error: workoutError.message };
        }

        console.log('[WorkoutSync] ✅ Workout synced successfully! ID:', workout.id);

        await saveWorkoutToCache(session, durationSeconds, totalVolume, workout.id, resolvedUserId);

        return { success: true, workoutId: workout.id };

    } catch (error) {
        console.error('[WorkoutSync] Unexpected error:', error);
        await saveWorkoutToCache(session, durationSeconds, totalVolume, undefined, userId ?? null);
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
    serverId?: string,
    userId?: string | null
): Promise<void> {
    try {
        const resolvedUserId = userId === undefined ? await getUserIdFromSession() : userId;
        const cacheKey = getWorkoutCacheKey(resolvedUserId);
        const lastSyncKey = getLastSyncKey(resolvedUserId);
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
        const existingCache = await AsyncStorage.getItem(cacheKey);
        const workouts: CachedWorkout[] = existingCache ? JSON.parse(existingCache) : [];

        // Add new workout at the beginning
        workouts.unshift(cachedWorkout);

        // Keep only last 100 workouts in cache (memory optimization)
        const trimmedWorkouts = workouts.slice(0, 100);

        await AsyncStorage.setItem(cacheKey, JSON.stringify(trimmedWorkouts));
        await AsyncStorage.setItem(lastSyncKey, new Date().toISOString());

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
        const userId = await getUserIdFromSession();
        const scopedKey = getWorkoutCacheKey(userId);
        const [scopedCache, legacyCache] = await Promise.all([
            AsyncStorage.getItem(scopedKey),
            AsyncStorage.getItem(WORKOUT_CACHE_KEY_PREFIX),
        ]);

        if (!scopedCache && legacyCache) {
            await AsyncStorage.setItem(scopedKey, legacyCache);
        }

        const cache = scopedCache ?? legacyCache;
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
        const userId = await getUserIdFromSession();
        return await syncWorkoutsFromSupabaseForUser(userId, daysToSync);
    } catch (error) {
        console.error('[WorkoutSync] Error syncing from Supabase:', error);
        return await getCachedWorkouts();
    }
}

export async function syncWorkoutsFromSupabaseForUser(
    userId: string | null,
    daysToSync: number = 30
): Promise<CachedWorkout[]> {
    try {
        if (!userId) {
            return await getCachedWorkouts();
        }

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - daysToSync);
        const dateLimitStr = dateLimit.toISOString();
        const dateLimitMs = dateLimit.getTime();
        const cacheKey = getWorkoutCacheKey(userId);
        const lastSyncKey = getLastSyncKey(userId);

        const { data: workouts, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', userId)
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
        const [currentScopedCache, legacyCache] = await Promise.all([
            AsyncStorage.getItem(cacheKey),
            AsyncStorage.getItem(WORKOUT_CACHE_KEY_PREFIX),
        ]);

        if (!currentScopedCache && legacyCache) {
            await AsyncStorage.setItem(cacheKey, legacyCache);
        }

        const currentCacheRaw = currentScopedCache ?? legacyCache;
        const currentCache: CachedWorkout[] = currentCacheRaw ? JSON.parse(currentCacheRaw) : [];
        const olderCache = currentCache.filter((workout) => {
            const startedAtMs = new Date(workout.startedAt).getTime();
            return Number.isFinite(startedAtMs) && startedAtMs < dateLimitMs;
        });

        const mergedById = new Map<string, CachedWorkout>();
        [...fetchedWorkouts, ...olderCache].forEach((workout) => {
            mergedById.set(workout.id, workout);
        });

        const mergedWorkouts = Array.from(mergedById.values())
            .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
            .slice(0, 100);

        await AsyncStorage.setItem(cacheKey, JSON.stringify(mergedWorkouts));
        await AsyncStorage.setItem(lastSyncKey, new Date().toISOString());

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
    streak: number,
    userId?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const resolvedUserId = userId ?? await getUserIdFromSession();
        if (!resolvedUserId) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('gamification')
            .upsert({
                user_id: resolvedUserId,
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
