export type AchievementId =
    | 'FIRST_WORKOUT'
    | 'WEEK_STREAK'
    | 'MONTH_STREAK'
    | 'HUNDRED_SETS'
    | 'PERSONAL_BEST'
    | 'EARLY_BIRD'
    | 'NIGHT_OWL';

export interface Achievement {
    id: AchievementId;
    name: string;
    description: string;
    icon: string;
    unlockedAt?: Date;
}

export interface XPEvent {
    type: 'SET_COMPLETE' | 'EXTRA_SET' | 'EXERCISE_COMPLETE' | 'WORKOUT_COMPLETE' | 'PERSONAL_RECORD' | 'FIRST_SET_TODAY' | 'STREAK_BONUS';
    amount: number;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

export interface LevelInfo {
    level: number;
    xpRequired: number;
    xpToNext: number;
}

export const LEVEL_THRESHOLDS: LevelInfo[] = [
    { level: 1, xpRequired: 0, xpToNext: 1000 },
    { level: 2, xpRequired: 1000, xpToNext: 2000 },
    { level: 3, xpRequired: 3000, xpToNext: 3000 },
    { level: 4, xpRequired: 6000, xpToNext: 4000 },
    { level: 5, xpRequired: 10000, xpToNext: 5000 },
    { level: 6, xpRequired: 15000, xpToNext: 7000 },
    { level: 7, xpRequired: 22000, xpToNext: 9000 },
    { level: 8, xpRequired: 31000, xpToNext: 11000 },
    { level: 9, xpRequired: 42000, xpToNext: 14000 },
    { level: 10, xpRequired: 56000, xpToNext: 18000 },
    { level: 11, xpRequired: 74000, xpToNext: 22000 },
    { level: 12, xpRequired: 96000, xpToNext: 26000 },
    { level: 13, xpRequired: 122000, xpToNext: 30000 },
    { level: 14, xpRequired: 152000, xpToNext: 35000 },
    { level: 15, xpRequired: 187000, xpToNext: 40000 },
    { level: 16, xpRequired: 227000, xpToNext: 45000 },
    { level: 17, xpRequired: 272000, xpToNext: 50000 },
    { level: 18, xpRequired: 322000, xpToNext: 55000 },
    { level: 19, xpRequired: 377000, xpToNext: 60000 },
    { level: 20, xpRequired: 437000, xpToNext: 0 },
];

export const XP_REWARDS = {
    SET_COMPLETE: 10,
    EXTRA_SET: 15,
    EXERCISE_COMPLETE: 25,
    WORKOUT_COMPLETE: 100,
    PERSONAL_RECORD: 50,
    FIRST_SET_TODAY: 15,
    STREAK_BONUS_PER_DAY: 20,
    STREAK_CAP_DAYS: 14,
} as const;

export interface GamificationState {
    totalXP: number;
    currentLevel: number;
    streak: number;
    lastWorkoutDate: string | null;
    achievements: Achievement[];
    xpHistory: XPEvent[];
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    { id: 'FIRST_WORKOUT', name: 'Primeira Vitória', description: 'Complete seu primeiro treino', icon: '🏆' },
    { id: 'WEEK_STREAK', name: 'Semana de Fogo', description: 'Mantenha um streak de 7 dias', icon: '🔥' },
    { id: 'MONTH_STREAK', name: 'Guerreiro de Aço', description: 'Mantenha um streak de 30 dias', icon: '🦾' },
    { id: 'HUNDRED_SETS', name: '100 Sets Club', description: 'Complete 100 sets no total', icon: '💪' },
    { id: 'PERSONAL_BEST', name: 'Personal Best', description: 'Bata um recorde pessoal', icon: '🏅' },
    { id: 'EARLY_BIRD', name: 'Madrugador', description: 'Treine antes das 7:00', icon: '🌅' },
    { id: 'NIGHT_OWL', name: 'Treino Noturno', description: 'Treine depois das 21:00', icon: '🌙' },
];
