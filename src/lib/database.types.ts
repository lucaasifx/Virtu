export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string | null
                    avatar_url?: string | null
                    updated_at?: string
                }
            }
            gamification: {
                Row: {
                    id: string
                    user_id: string
                    total_xp: number
                    current_level: number
                    streak: number
                    last_workout_date: string | null
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    total_xp?: number
                    current_level?: number
                    streak?: number
                    last_workout_date?: string | null
                    updated_at?: string
                }
                Update: {
                    total_xp?: number
                    current_level?: number
                    streak?: number
                    last_workout_date?: string | null
                    updated_at?: string
                }
            }
            user_achievements: {
                Row: {
                    id: string
                    user_id: string
                    achievement_id: string
                    unlocked_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    achievement_id: string
                    unlocked_at?: string
                }
                Update: {
                    achievement_id?: string
                    unlocked_at?: string
                }
            }
            workouts: {
                Row: {
                    id: string
                    user_id: string
                    started_at: string
                    ended_at: string | null
                    duration_seconds: number | null
                    total_volume: number | null
                    muscle_groups: string[]
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    started_at: string
                    ended_at?: string | null
                    duration_seconds?: number | null
                    total_volume?: number | null
                    muscle_groups?: string[]
                    status?: string
                    created_at?: string
                }
                Update: {
                    ended_at?: string | null
                    duration_seconds?: number | null
                    total_volume?: number | null
                    status?: string
                }
            }
            workout_sets: {
                Row: {
                    id: string
                    workout_id: string
                    exercise_id: string
                    set_number: number | null
                    weight: number | null
                    reps: number | null
                    rpe: number | null
                    completed_at: string | null
                    is_extra: boolean
                }
                Insert: {
                    id?: string
                    workout_id: string
                    exercise_id: string
                    set_number?: number | null
                    weight?: number | null
                    reps?: number | null
                    rpe?: number | null
                    completed_at?: string | null
                    is_extra?: boolean
                }
                Update: {
                    weight?: number | null
                    reps?: number | null
                    rpe?: number | null
                    is_extra?: boolean
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
