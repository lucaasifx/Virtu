import {
    XP_REWARDS,
    LEVEL_THRESHOLDS,
    LevelInfo,
    Achievement,
    AchievementId,
    GamificationState,
    DEFAULT_ACHIEVEMENTS,
} from '@/src/types/gamification';

export function calculateXPForSet(isExtra: boolean): number {
    return isExtra ? XP_REWARDS.EXTRA_SET : XP_REWARDS.SET_COMPLETE;
}

export function calculateXPForExercise(): number {
    return XP_REWARDS.EXERCISE_COMPLETE;
}

export function calculateXPForWorkout(): number {
    return XP_REWARDS.WORKOUT_COMPLETE;
}

export function calculateStreakBonus(streakDays: number): number {
    const cappedStreak = Math.min(streakDays, XP_REWARDS.STREAK_CAP_DAYS);
    return XP_REWARDS.STREAK_BONUS_PER_DAY * cappedStreak;
}

export function calculateFirstSetBonus(): number {
    return XP_REWARDS.FIRST_SET_TODAY;
}

export function calculatePRBonus(): number {
    return XP_REWARDS.PERSONAL_RECORD;
}

export function getLevelFromXP(totalXP: number): LevelInfo {
    let currentLevel = LEVEL_THRESHOLDS[0];

    for (const level of LEVEL_THRESHOLDS) {
        if (totalXP >= level.xpRequired) {
            currentLevel = level;
        } else {
            break;
        }
    }

    return currentLevel;
}

export function getXPProgress(totalXP: number): { current: number; max: number; percentage: number } {
    const currentLevel = getLevelFromXP(totalXP);
    const nextLevelIndex = LEVEL_THRESHOLDS.findIndex(l => l.level === currentLevel.level) + 1;

    if (nextLevelIndex >= LEVEL_THRESHOLDS.length) {
        return { current: totalXP, max: totalXP, percentage: 100 };
    }

    const nextLevel = LEVEL_THRESHOLDS[nextLevelIndex];
    const xpInCurrentLevel = totalXP - currentLevel.xpRequired;
    const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;

    return {
        current: xpInCurrentLevel,
        max: xpNeededForNext,
        percentage: Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100),
    };
}

export function checkLevelUp(oldXP: number, newXP: number): LevelInfo | null {
    const oldLevel = getLevelFromXP(oldXP);
    const newLevel = getLevelFromXP(newXP);

    if (newLevel.level > oldLevel.level) {
        return newLevel;
    }

    return null;
}

export function updateStreak(lastWorkoutDate: string | null): { increment: number; streakBroken: boolean } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastWorkoutDate) {
        return { increment: 1, streakBroken: false };
    }

    const lastDate = new Date(lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return { increment: 0, streakBroken: false };
    } else if (diffDays === 1) {
        return { increment: 1, streakBroken: false };
    } else {
        return { increment: 1, streakBroken: true };
    }
}

export function checkAchievements(
    state: GamificationState,
    context: {
        totalSets?: number;
        isFirstWorkout?: boolean;
        isPR?: boolean;
        workoutHour?: number;
    }
): AchievementId[] {
    const newAchievements: AchievementId[] = [];
    const unlockedIds = state.achievements.filter(a => a.unlockedAt).map(a => a.id);

    if (context.isFirstWorkout && !unlockedIds.includes('FIRST_WORKOUT')) {
        newAchievements.push('FIRST_WORKOUT');
    }

    if (state.streak >= 7 && !unlockedIds.includes('WEEK_STREAK')) {
        newAchievements.push('WEEK_STREAK');
    }

    if (state.streak >= 30 && !unlockedIds.includes('MONTH_STREAK')) {
        newAchievements.push('MONTH_STREAK');
    }

    if (context.totalSets && context.totalSets >= 100 && !unlockedIds.includes('HUNDRED_SETS')) {
        newAchievements.push('HUNDRED_SETS');
    }

    if (context.isPR && !unlockedIds.includes('PERSONAL_BEST')) {
        newAchievements.push('PERSONAL_BEST');
    }

    if (context.workoutHour !== undefined) {
        if (context.workoutHour < 7 && !unlockedIds.includes('EARLY_BIRD')) {
            newAchievements.push('EARLY_BIRD');
        }
        if (context.workoutHour >= 21 && !unlockedIds.includes('NIGHT_OWL')) {
            newAchievements.push('NIGHT_OWL');
        }
    }

    return newAchievements;
}

export function unlockAchievements(
    achievements: Achievement[],
    toUnlock: AchievementId[]
): Achievement[] {
    return achievements.map(achievement => {
        if (toUnlock.includes(achievement.id) && !achievement.unlockedAt) {
            return { ...achievement, unlockedAt: new Date() };
        }
        return achievement;
    });
}

export function createInitialState(): GamificationState {
    return {
        totalXP: 0,
        currentLevel: 1,
        streak: 0,
        lastWorkoutDate: null,
        achievements: [...DEFAULT_ACHIEVEMENTS],
        xpHistory: [],
    };
}
