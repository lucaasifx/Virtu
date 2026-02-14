import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    GamificationState,
    XPEvent,
    LevelInfo,
    AchievementId,
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

const STORAGE_KEY = '@virtu_gamification';

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

export function GamificationProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(gamificationReducer, createInitialState());
    const [isLoaded, setIsLoaded] = React.useState(false);

    useEffect(() => {
        loadState();
    }, []);

    useEffect(() => {
        if (isLoaded) {
            saveState(state);
        }
    }, [state, isLoaded]);

    const loadState = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as GamificationState;
                dispatch({ type: 'LOAD_STATE', payload: parsed });
            }
        } catch (e) {
            console.error('Failed to load gamification state:', e);
        } finally {
            setIsLoaded(true);
        }
    };

    const saveState = async (stateToSave: GamificationState) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (e) {
            console.error('Failed to save gamification state:', e);
        }
    };

    const awardXP = useCallback((event: XPEvent): LevelInfo | null => {
        const levelUp = checkLevelUp(state.totalXP, state.totalXP + event.amount);
        dispatch({ type: 'ADD_XP', payload: { event } });
        return levelUp;
    }, [state.totalXP]);

    const recordWorkoutComplete = useCallback((stats: { totalSets: number; isPR: boolean; isFirstWorkout: boolean }) => {
        let xpEarned = 0;
        const now = new Date();

        xpEarned += calculateXPForWorkout();

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

        return {
            xpEarned,
            levelUp,
            newAchievements,
        };
    }, [state, awardXP]);

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
