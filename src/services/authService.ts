import { supabase } from './supabase';
import { processWorkoutCompletion } from './gamificationService';
import type { Profile, ProfileInsert, ProfileUpdate } from '../types/database.types';

export type { Profile, ProfileInsert, ProfileUpdate };

/**
 * signs up a new user with email/password and creates their profile.
 */
export async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
        },
    });

    if (error) throw error;

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
        }
    }

    return data;
}

/**
 * signs in a user with email and password.
 */
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * signs out the current user.
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * returns the current user session or null.
 */
export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

/**
 * returns the current authenticated user.
 */
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

/**
 * sends a password reset email with a redirect url.
 */
export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
}

/**
 * updates the user's password after a reset flow.
 */
export async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });
    if (error) throw error;
}

/**
 * fetches a user profile by id, returns null if not found.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        throw error;
    }

    return data as Profile;
}

/**
 * updates a user profile and returns the updated row.
 */
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

/**
 * processes a completed workout: calculates gamification rewards,
 * updates the profile stats, and logs the session.
 */
export async function updateWorkoutStats(
    userId: string,
    workoutAccuracy: number,
    durationMinutes: number,
    exerciseName: string
) {
    const profile = await getProfile(userId);
    if (!profile) throw new Error('Profile not found');

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

    let mostPracticed = profile.most_practiced;
    let mostPracticedSessions = profile.most_practiced_sessions;

    if (mostPracticed === exerciseName) {
        mostPracticedSessions += 1;
    } else if (!mostPracticed || mostPracticedSessions === 0) {
        mostPracticed = exerciseName;
        mostPracticedSessions = 1;
    }

    const today = new Date().toISOString().split('T')[0];

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

    await supabase.from('workout_sessions').insert({
        user_id: userId,
        exercise_name: exerciseName,
        duration_minutes: durationMinutes,
        accuracy: workoutAccuracy,
    });

    return {
        profile: updatedProfile,
        newBadges: result.newBadges,
        xpGained: result.newExperience - profile.experience,
        leveledUp: result.newLevel > profile.level,
    };
}

/**
 * fetches the most recent workout sessions for a user.
 */
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
