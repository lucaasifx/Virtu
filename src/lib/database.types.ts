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
                Relationships: []
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
                Relationships: []
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
                Relationships: []
            }
            workouts: {
                Row: {
                    id: string
                    user_id: string
                    started_at: string
                    ended_at: string | null
                    duration_seconds: number | null
                    total_volume: number | null
                    total_sets: number | null
                    muscle_groups: string[]
                    exercises_data: Json | null
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
                    total_sets?: number | null
                    muscle_groups?: string[]
                    exercises_data?: Json | null
                    status?: string
                    created_at?: string
                }
                Update: {
                    ended_at?: string | null
                    duration_seconds?: number | null
                    total_volume?: number | null
                    total_sets?: number | null
                    exercises_data?: Json | null
                    status?: string
                }
                Relationships: []
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
