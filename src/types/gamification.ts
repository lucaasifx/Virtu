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
    title: string;
    xpRequired: number;
    xpToNext: number;
}

export const LEVEL_THRESHOLDS: LevelInfo[] = [
    { level: 1, title: 'Novato', xpRequired: 0, xpToNext: 1000 },
    { level: 2, title: 'Dedicado', xpRequired: 1000, xpToNext: 2000 },
    { level: 3, title: 'Focado', xpRequired: 3000, xpToNext: 4000 },
    { level: 4, title: 'Consistente', xpRequired: 7000, xpToNext: 8000 },
    { level: 5, title: 'Atleta', xpRequired: 15000, xpToNext: 15000 },
    { level: 6, title: 'Elite', xpRequired: 30000, xpToNext: 30000 },
    { level: 7, title: 'Campeão', xpRequired: 60000, xpToNext: 60000 },
    { level: 8, title: 'Lenda', xpRequired: 120000, xpToNext: 130000 },
    { level: 9, title: 'VIRTU', xpRequired: 250000, xpToNext: 0 },
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
