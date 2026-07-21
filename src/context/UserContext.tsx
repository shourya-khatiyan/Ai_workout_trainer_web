import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  getProfile,
  updateProfile as updateProfileApi,
  updateWorkoutStats,
} from '../services/authService';
import type { Profile, ProfileUpdate } from '../types/database.types';


interface UserStats {
  totalWorkouts: number;
  averageAccuracy: number;
  totalTimeHours: number;
  mostPracticed: string;
  mostPracticedSessions: number;
}

interface UserStreak {
  current: number;
  longest: number;
  lastWorkoutDate?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  hipSize?: number;
  chestSize?: number;
  neckSize?: number;
  level?: number;
  experience?: number;
  badges?: string[];
  profileImage?: string;
  fitnessLevel?: string;
  fitnessGoal?: string;
  bio?: string;
  streak?: UserStreak;
  stats?: UserStats;
}

interface UserContextType {
  user: UserData | null;
  authUser: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => Promise<void>;
  updateStats: (stats: Partial<UserStats>) => void;
  updateStreak: (streak: Partial<UserStreak>) => void;
  refreshProfile: () => Promise<void>;
  completeWorkout: (accuracy: number, durationMinutes: number, exerciseName: string) => Promise<{ newBadges: string[]; xpGained: number; leveledUp: boolean }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * maps a supabase profile row to the frontend UserData shape.
 */
function profileToUserData(profile: Profile): UserData {
  return {
    id: profile.id,
    name: profile.full_name || '',
    email: profile.email,
    age: profile.age || undefined,
    gender: profile.gender || undefined,
    height: profile.height || undefined,
    weight: profile.weight || undefined,
    hipSize: profile.hip_size || undefined,
    chestSize: profile.chest_size || undefined,
    neckSize: profile.neck_size || undefined,
    level: profile.level,
    experience: profile.experience,
    badges: profile.badges,
    profileImage: profile.avatar_url || undefined,
    fitnessLevel: profile.fitness_level || undefined,
    fitnessGoal: profile.fitness_goal || undefined,
    bio: profile.bio || undefined,
    streak: {
      current: profile.streak_current,
      longest: profile.streak_longest,
      lastWorkoutDate: profile.last_workout_date || undefined,
    },
    stats: {
      totalWorkouts: profile.total_workouts,
      averageAccuracy: profile.average_accuracy,
      totalTimeHours: profile.total_time_hours,
      mostPracticed: profile.most_practiced || '',
      mostPracticedSessions: profile.most_practiced_sessions,
    },
  };
}

/**
 * converts frontend UserData fields to the db ProfileUpdate shape.
 */
function userDataToProfileUpdate(data: Partial<UserData>): ProfileUpdate {
  const update: ProfileUpdate = {};

  if (data.name !== undefined) update.full_name = data.name;
  if (data.age !== undefined) update.age = data.age;
  if (data.gender !== undefined) update.gender = data.gender;
  if (data.height !== undefined) update.height = data.height;
  if (data.weight !== undefined) update.weight = data.weight;
  if (data.hipSize !== undefined) update.hip_size = data.hipSize;
  if (data.chestSize !== undefined) update.chest_size = data.chestSize;
  if (data.neckSize !== undefined) update.neck_size = data.neckSize;
  if (data.level !== undefined) update.level = data.level;
  if (data.experience !== undefined) update.experience = data.experience;
  if (data.badges !== undefined) update.badges = data.badges;
  if (data.profileImage !== undefined) update.avatar_url = data.profileImage;
  if (data.fitnessLevel !== undefined) update.fitness_level = data.fitnessLevel;
  if (data.fitnessGoal !== undefined) update.fitness_goal = data.fitnessGoal;
  if (data.bio !== undefined) update.bio = data.bio;

  return update;
}

/**
 * provides auth state + profile data to the entire app.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = !!session && !!user;

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      if (profile) {
        setUser(profileToUserData(profile));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setIsLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setAuthUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authSignIn(email, password);
    if (data.user) {
      await fetchProfile(data.user.id);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const data = await authSignUp(email, password, name);

    if (data.user) {
      setUser({
        id: data.user.id,
        name,
        email,
        level: 1,
        experience: 0,
        badges: ['Beginner'],
        streak: { current: 0, longest: 0 },
        stats: {
          totalWorkouts: 0,
          averageAccuracy: 0,
          totalTimeHours: 0,
          mostPracticed: '',
          mostPracticedSessions: 0,
        },
      });
    }
  };

  const logout = async () => {
    await authSignOut();
    setSession(null);
    setAuthUser(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<UserData>) => {
    if (!authUser) throw new Error('Not authenticated');

    const profileUpdate = userDataToProfileUpdate(data);
    await updateProfileApi(authUser.id, profileUpdate);
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const updateStats = (newStats: Partial<UserStats>) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        stats: { ...prev.stats, ...newStats } as UserStats,
      };
    });
  };

  const updateStreak = (newStreak: Partial<UserStreak>) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        streak: { ...prev.streak, ...newStreak } as UserStreak,
      };
    });
  };

  const refreshProfile = async () => {
    if (authUser) {
      await fetchProfile(authUser.id);
    }
  };

  const completeWorkout = async (
    accuracy: number,
    durationMinutes: number,
    exerciseName: string
  ) => {
    if (!authUser) throw new Error('Not authenticated');

    const result = await updateWorkoutStats(
      authUser.id,
      accuracy,
      durationMinutes,
      exerciseName
    );

    await fetchProfile(authUser.id);

    return {
      newBadges: result.newBadges,
      xpGained: result.xpGained,
      leveledUp: result.leveledUp,
    };
  };

  return (
    <UserContext.Provider
      value={{
        user,
        authUser,
        session,
        isLoggedIn,
        isLoading,
        login,
        signUp,
        logout,
        updateUser,
        updateStats,
        updateStreak,
        refreshProfile,
        completeWorkout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**
 * hook to access user context. must be used within UserProvider.
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
