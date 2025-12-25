import { supabase } from './supabase';

export interface Profile {
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
}

export interface ProfileInsert {
    id: string;
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
}

export interface ProfileUpdate {
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
    updated_at?: string;
}


//Sign up a new user with email and password

export async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });

    if (error) throw error;

    // Create or update profile entry (upsert handles case when trigger already created it)
    if (data.user) {
        const profileData: ProfileInsert = {
            id: data.user.id,
            email: email,
            full_name: fullName,
            level: 1,
            experience: 0,
            badges: ['Beginner'],
            streak_current: 0,
            streak_longest: 0,
            total_workouts: 0,
            average_accuracy: 0,
            total_time_hours: 0,
            most_practiced_sessions: 0,
        };

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });

        if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't throw - user is still created, profile can be created later
        }
    }

    return data;
}

//Sign in with email and password
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

//Sign out the current user
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

//Get the current session
export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

//Get the current user
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

//Send password reset email
export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
}

//Update password (after reset)
export async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });
    if (error) throw error;
}

//Profile Functions

//Get user profile by user ID
export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No profile found
            return null;
        }
        throw error;
    }

    return data as Profile;
}

//Update user profile
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const updateData: ProfileUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as Profile;
}

//Update user stats after a workout
export async function updateWorkoutStats(
    userId: string,
    workoutAccuracy: number,
    durationMinutes: number,
    exerciseName: string
) {
    // Import gamification service dynamically to avoid circular deps
    const { processWorkoutCompletion } = await import('./gamificationService');

    // First, get current profile
    const profile = await getProfile(userId);
    if (!profile) throw new Error('Profile not found');

    // Process the workout using gamification service
    const result = processWorkoutCompletion(
        {
            totalWorkouts: profile.total_workouts,
            averageAccuracy: profile.average_accuracy,
            totalTimeHours: profile.total_time_hours,
            streakCurrent: profile.streak_current,
            streakLongest: profile.streak_longest,
            lastWorkoutDate: profile.last_workout_date,
            experience: profile.experience,
            badges: profile.badges || ['Beginner'],
        },
        {
            durationMinutes,
            accuracy: workoutAccuracy,
            exerciseName,
        }
    );

    // Track most practiced exercise
    let mostPracticed = profile.most_practiced;
    let mostPracticedSessions = profile.most_practiced_sessions;

    if (mostPracticed === exerciseName) {
        mostPracticedSessions += 1;
    } else if (!mostPracticed || mostPracticedSessions === 0) {
        mostPracticed = exerciseName;
        mostPracticedSessions = 1;
    }

    // Get today's date for last_workout_date
    const today = new Date().toISOString().split('T')[0];

    // Update profile with all new stats
    const updatedProfile = await updateProfile(userId, {
        total_workouts: result.newTotalWorkouts,
        total_time_hours: result.newTotalTimeHours,
        average_accuracy: result.newAverageAccuracy,
        streak_current: result.newStreak,
        streak_longest: result.newStreakLongest,
        last_workout_date: today,
        most_practiced: mostPracticed,
        most_practiced_sessions: mostPracticedSessions,
        experience: result.newExperience,
        level: result.newLevel,
        badges: result.allBadges,
    });

    // Log workout session
    await supabase.from('workout_sessions').insert({
        user_id: userId,
        exercise_name: exerciseName,
        duration_minutes: durationMinutes,
        accuracy: workoutAccuracy,
    });

    // Return updated profile along with newly earned badges
    return {
        profile: updatedProfile,
        newBadges: result.newBadges,
        xpGained: result.newExperience - profile.experience,
        leveledUp: result.newLevel > profile.level,
    };
}

//Get workout history for a user
export async function getWorkoutHistory(userId: string, limit = 10) {
    const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}
