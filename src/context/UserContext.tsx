import { createContext, useState, useContext, ReactNode } from 'react';

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
  isLoggedIn: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  updateStreak: (streak: Partial<UserStreak>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // load saved user from localstorage
  const [user, setUser] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  });

  const isLoggedIn = !!user;

  const login = (userData: UserData) => {
    // set default stats if not provided
    const userWithDefaults = {
      ...userData,
      streak: userData.streak || { current: 0, longest: 0 },
      stats: userData.stats || {
        totalWorkouts: 0,
        averageAccuracy: 0,
        totalTimeHours: 0,
        mostPracticed: '',
        mostPracticedSessions: 0
      }
    };
    setUser(userWithDefaults);
    localStorage.setItem('user', JSON.stringify(userWithDefaults));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (data: Partial<UserData>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateStats = (newStats: Partial<UserStats>) => {
    if (user) {
      const updatedUser = {
        ...user,
        stats: { ...user.stats, ...newStats } as UserStats
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateStreak = (newStreak: Partial<UserStreak>) => {
    if (user) {
      const updatedUser = {
        ...user,
        streak: { ...user.streak, ...newStreak } as UserStreak
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout, updateUser, updateStats, updateStreak }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
