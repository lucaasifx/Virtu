import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    GamificationState,
    XPEvent,
    LevelInfo,
    AchievementId,
    XP_REWARDS
} from '@/src/types/gamification';
import {
    createInitialState,
    getLevelFromXP,
    checkLevelUp,
    updateStreak,
    checkAchievements,
    unlockAchievements,
    calculateXPForWorkout,
    calculateStreakBonus,
    calculatePRBonus,
    getXPProgress,
} from '@/src/services/GamificationService';
import { useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/src/lib/supabase';
import { syncGamificationToSupabase } from '@/src/lib/workoutSyncService';

const STORAGE_KEY_PREFIX = '@virtu_gamification';

type GamificationAction =
    | { type: 'LOAD_STATE'; payload: GamificationState }
    | { type: 'ADD_XP'; payload: { event: XPEvent } }
    | { type: 'UPDATE_STREAK'; payload: { streak: number; lastDate: string } }
    | { type: 'UNLOCK_ACHIEVEMENTS'; payload: { ids: AchievementId[] } }
    | { type: 'RESET' };

function gamificationReducer(state: GamificationState, action: GamificationAction): GamificationState {
    switch (action.type) {
        case 'LOAD_STATE':
            return action.payload;

        case 'ADD_XP': {
            const newTotalXP = state.totalXP + action.payload.event.amount;
            const newLevel = getLevelFromXP(newTotalXP);
            return {
                ...state,
                totalXP: newTotalXP,
                currentLevel: newLevel.level,
                xpHistory: [...state.xpHistory.slice(-99), action.payload.event],
            };
        }

        case 'UPDATE_STREAK':
            return {
                ...state,
                streak: action.payload.streak,
                lastWorkoutDate: action.payload.lastDate,
            };

        case 'UNLOCK_ACHIEVEMENTS':
            return {
                ...state,
                achievements: unlockAchievements(state.achievements, action.payload.ids),
            };

        case 'RESET':
            return createInitialState();

        default:
            return state;
    }
}

interface GamificationContextType {
    state: GamificationState;
    levelInfo: LevelInfo;
    xpProgress: { current: number; max: number; percentage: number };
    awardXP: (event: XPEvent) => LevelInfo | null;
    recordWorkoutComplete: (stats: { totalSets: number; isPR: boolean; isFirstWorkout: boolean }) => {
        xpEarned: number;
        levelUp: LevelInfo | null;
        newAchievements: AchievementId[];
    };
    isLoaded: boolean;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

interface RemoteGamificationState {
    total_xp: number;
    current_level: number;
    streak: number;
    last_workout_date: string | null;
}

function getStorageKey(userId: string) {
    return `${STORAGE_KEY_PREFIX}:${userId}`;
}

function getTimeFromISO(value: string | null) {
    if (!value) {
        return 0;
    }
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
}

function getMostRecentDate(first: string | null, second: string | null): string | null {
    const firstTime = getTimeFromISO(first);
    const secondTime = getTimeFromISO(second);

    if (firstTime === 0 && secondTime === 0) {
        return null;
    }

    if (secondTime > firstTime) {
        return second;
    }

    return first;
}

function mergeGamificationState(local: GamificationState | null, remote: RemoteGamificationState | null): GamificationState {
    const localState = local ?? createInitialState();
    if (!remote) {
        const normalizedLevel = getLevelFromXP(localState.totalXP).level;
        return {
            ...localState,
            currentLevel: normalizedLevel,
        };
    }

    const localXP = Math.max(0, localState.totalXP);
    const remoteXP = Math.max(0, remote.total_xp);
    const totalXP = Math.max(localXP, remoteXP);
    const streak = Math.max(localState.streak, Math.max(0, remote.streak));
    const lastWorkoutDate = getMostRecentDate(localState.lastWorkoutDate, remote.last_workout_date);
    const currentLevel = getLevelFromXP(totalXP).level;

    return {
        ...localState,
        totalXP,
        streak,
        lastWorkoutDate,
        currentLevel,
    };
}

export function GamificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [state, dispatch] = useReducer(gamificationReducer, createInitialState());
    const [isLoaded, setIsLoaded] = React.useState(false);

    useEffect(() => {
        let active = true;

        const loadState = async () => {
            setIsLoaded(false);

            if (!userId) {
                if (active) {
                    dispatch({ type: 'LOAD_STATE', payload: createInitialState() });
                    setIsLoaded(true);
                }
                return;
            }

            const storageKey = getStorageKey(userId);

            try {
                const [stored, legacyStored, remoteResponse] = await Promise.all([
                    AsyncStorage.getItem(storageKey),
                    AsyncStorage.getItem(STORAGE_KEY_PREFIX),
                    supabase
                        .from('gamification')
                        .select('total_xp, current_level, streak, last_workout_date')
                        .eq('user_id', userId)
                        .maybeSingle(),
                ]);

                const rawLocalState = stored ?? legacyStored;
                const localState = rawLocalState ? (JSON.parse(rawLocalState) as GamificationState) : null;
                const remoteState = remoteResponse.data as RemoteGamificationState | null;
                const mergedState = mergeGamificationState(localState, remoteState);

                if (active) {
                    dispatch({ type: 'LOAD_STATE', payload: mergedState });
                }

                if (!stored && legacyStored) {
                    await AsyncStorage.setItem(storageKey, legacyStored);
                }
            } catch (e) {
                console.error('Failed to load gamification state:', e);
                if (active) {
                    dispatch({ type: 'LOAD_STATE', payload: createInitialState() });
                }
            } finally {
                if (active) {
                    setIsLoaded(true);
                }
            }
        };

        loadState();

        return () => {
            active = false;
        };
    }, [userId]);

    useEffect(() => {
        if (isLoaded && userId) {
            saveState(state, userId);
        }
    }, [state, isLoaded, userId]);

    const saveState = async (stateToSave: GamificationState, storageUserId: string) => {
        try {
            await AsyncStorage.setItem(getStorageKey(storageUserId), JSON.stringify(stateToSave));
        } catch (e) {
            console.error('Failed to save gamification state:', e);
        }
    };

    const awardXP = useCallback((event: XPEvent): LevelInfo | null => {
        const levelUp = checkLevelUp(state.totalXP, state.totalXP + event.amount);
        dispatch({ type: 'ADD_XP', payload: { event } });
        return levelUp;
    }, [state.totalXP]);

    const recordWorkoutComplete = useCallback((stats: { totalSets: number; regularSets?: number; extraSets?: number; isPR: boolean; isFirstWorkout: boolean }) => {
        let xpEarned = 0;
        const now = new Date();

        xpEarned += calculateXPForWorkout();

        if (stats.regularSets !== undefined && stats.extraSets !== undefined) {
            xpEarned += (stats.regularSets * XP_REWARDS.SET_COMPLETE);
            xpEarned += (stats.extraSets * XP_REWARDS.EXTRA_SET);
        } else {
            xpEarned += (stats.totalSets * XP_REWARDS.SET_COMPLETE);
        }

        const streakResult = updateStreak(state.lastWorkoutDate);
        const nextStreak = streakResult.streakBroken
            ? 1
            : state.streak + streakResult.increment;

        if (streakResult.increment > 0) {
            dispatch({
                type: 'UPDATE_STREAK',
                payload: {
                    streak: nextStreak,
                    lastDate: now.toISOString(),
                },
            });
            xpEarned += calculateStreakBonus(nextStreak);
        }

        if (stats.isPR) {
            xpEarned += calculatePRBonus();
        }

        const newAchievements = checkAchievements({
            ...state,
            streak: nextStreak,
        }, {
            totalSets: stats.totalSets,
            isFirstWorkout: stats.isFirstWorkout,
            isPR: stats.isPR,
            workoutHour: now.getHours(),
        });

        if (newAchievements.length > 0) {
            dispatch({ type: 'UNLOCK_ACHIEVEMENTS', payload: { ids: newAchievements } });
        }

        const event: XPEvent = {
            type: 'WORKOUT_COMPLETE',
            amount: xpEarned,
            timestamp: now,
        };

        const levelUp = awardXP(event);
        const nextTotalXP = state.totalXP + xpEarned;
        const nextLevel = getLevelFromXP(nextTotalXP).level;

        if (userId) {
            syncGamificationToSupabase(
                nextTotalXP,
                nextLevel,
                nextStreak,
                userId
            ).catch((e) => {
                console.error('Failed to sync gamification state:', e);
            });
        }

        return {
            xpEarned,
            levelUp,
            newAchievements,
        };
    }, [state, awardXP, userId]);

    const levelInfo = getLevelFromXP(state.totalXP);
    const xpProgress = getXPProgress(state.totalXP);

    return (
        <GamificationContext.Provider
            value={{
                state,
                levelInfo,
                xpProgress,
                awardXP,
                recordWorkoutComplete,
                isLoaded,
            }}
        >
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}
