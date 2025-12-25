export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    created_at: string;
                    updated_at: string | null;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    age: number | null;
                    gender: string | null;
                    height: number | null;
                    weight: number | null;
                    hip_size: number | null;
                    chest_size: number | null;
                    neck_size: number | null;
                    fitness_level: string | null;
                    fitness_goal: string | null;
                    bio: string | null;
                    level: number;
                    experience: number;
                    badges: string[];
                    streak_current: number;
                    streak_longest: number;
                    last_workout_date: string | null;
                    total_workouts: number;
                    average_accuracy: number;
                    total_time_hours: number;
                    most_practiced: string | null;
                    most_practiced_sessions: number;
                };
                Insert: {
                    id: string;
                    created_at?: string;
                    updated_at?: string | null;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    age?: number | null;
                    gender?: string | null;
                    height?: number | null;
                    weight?: number | null;
                    hip_size?: number | null;
                    chest_size?: number | null;
                    neck_size?: number | null;
                    fitness_level?: string | null;
                    fitness_goal?: string | null;
                    bio?: string | null;
                    level?: number;
                    experience?: number;
                    badges?: string[];
                    streak_current?: number;
                    streak_longest?: number;
                    last_workout_date?: string | null;
                    total_workouts?: number;
                    average_accuracy?: number;
                    total_time_hours?: number;
                    most_practiced?: string | null;
                    most_practiced_sessions?: number;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    updated_at?: string | null;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    age?: number | null;
                    gender?: string | null;
                    height?: number | null;
                    weight?: number | null;
                    hip_size?: number | null;
                    chest_size?: number | null;
                    neck_size?: number | null;
                    fitness_level?: string | null;
                    fitness_goal?: string | null;
                    bio?: string | null;
                    level?: number;
                    experience?: number;
                    badges?: string[];
                    streak_current?: number;
                    streak_longest?: number;
                    last_workout_date?: string | null;
                    total_workouts?: number;
                    average_accuracy?: number;
                    total_time_hours?: number;
                    most_practiced?: string | null;
                    most_practiced_sessions?: number;
                };
            };
            workout_sessions: {
                Row: {
                    id: string;
                    user_id: string;
                    created_at: string;
                    exercise_name: string;
                    duration_minutes: number;
                    accuracy: number;
                    reps_completed: number;
                    feedback_summary: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    created_at?: string;
                    exercise_name: string;
                    duration_minutes: number;
                    accuracy: number;
                    reps_completed?: number;
                    feedback_summary?: string | null;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    created_at?: string;
                    exercise_name?: string;
                    duration_minutes?: number;
                    accuracy?: number;
                    reps_completed?: number;
                    feedback_summary?: string | null;
                };
            };
        };
    };
}

// Helper types for easier access
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type WorkoutSessionInsert = Database['public']['Tables']['workout_sessions']['Insert'];
