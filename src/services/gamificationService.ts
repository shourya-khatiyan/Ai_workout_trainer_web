// badge definition - each badge has an id, display name, description, and emoji icon
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
}

// all available badges users can earn through various achievements
export const BADGE_DEFINITIONS: Badge[] = [
    { id: 'beginner', name: 'Beginner', description: 'Welcome to AI Workout Trainer!', icon: '🌱' },
    { id: 'first_steps', name: 'First Steps', description: 'Complete your first workout', icon: '👣' },
    { id: 'consistent', name: 'Consistent', description: 'Maintain a 3-day streak', icon: '🔥' },
    { id: 'dedicated', name: 'Dedicated', description: 'Maintain a 7-day streak', icon: '💪' },
    { id: 'perfect_form', name: 'Perfect Form', description: 'Achieve 95%+ accuracy in a workout', icon: '⭐' },
    { id: 'iron_will', name: 'Iron Will', description: 'Maintain a 14-day streak', icon: '🏆' },
    { id: 'centurion', name: 'Centurion', description: 'Complete 100 workouts', icon: '💯' },
    { id: 'elite', name: 'Elite', description: 'Reach level 10', icon: '👑' },
    { id: 'marathon', name: 'Marathon', description: 'Train for 10+ hours total', icon: '⏱️' },
    { id: 'variety', name: 'Variety', description: 'Try 5 different exercises', icon: '🎯' },
];

// calculates the new streak based on when the user last worked out
// returns the updated streak count and whether it was broken
export function calculateStreak(
    lastWorkoutDate: string | null,
    currentStreak: number
): { newStreak: number; streakBroken: boolean } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastWorkoutDate) {
        // first ever workout starts a new streak
        return { newStreak: 1, streakBroken: false };
    }

    const lastDate = new Date(lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // already worked out today, streak stays the same
        return { newStreak: currentStreak, streakBroken: false };
    } else if (diffDays === 1) {
        // worked out yesterday, streak continues
        return { newStreak: currentStreak + 1, streakBroken: false };
    } else {
        // missed a day or more, streak resets to 1
        return { newStreak: 1, streakBroken: true };
    }
}

// checks if working out now would add to the streak (used for ui hints)
export function wouldExtendStreak(lastWorkoutDate: string | null): boolean {
    if (!lastWorkoutDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = new Date(lastWorkoutDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 1;
}

// stats needed to check badge eligibility
export interface UserStats {
    totalWorkouts: number;
    averageAccuracy: number;
    totalTimeHours: number;
    streakCurrent: number;
    streakLongest: number;
    level: number;
    highestAccuracy?: number;
}

// checks which badges a user has earned based on their current stats
// returns only newly earned badges, not ones they already have
export function checkBadgeEligibility(
    currentBadges: string[],
    stats: UserStats,
    latestWorkoutAccuracy?: number
): string[] {
    const newBadges: string[] = [];

    // first steps - user completed at least one workout
    if (!currentBadges.includes('First Steps') && stats.totalWorkouts >= 1) {
        newBadges.push('First Steps');
    }

    // consistent - maintained 3 days in a row
    if (!currentBadges.includes('Consistent') && stats.streakCurrent >= 3) {
        newBadges.push('Consistent');
    }

    // dedicated - maintained 7 days in a row
    if (!currentBadges.includes('Dedicated') && stats.streakCurrent >= 7) {
        newBadges.push('Dedicated');
    }

    // iron will - maintained 14 days in a row
    if (!currentBadges.includes('Iron Will') && stats.streakCurrent >= 14) {
        newBadges.push('Iron Will');
    }

    // perfect form - got 95% or higher accuracy in a single workout
    if (!currentBadges.includes('Perfect Form') && latestWorkoutAccuracy && latestWorkoutAccuracy >= 95) {
        newBadges.push('Perfect Form');
    }

    // centurion - completed 100 total workouts
    if (!currentBadges.includes('Centurion') && stats.totalWorkouts >= 100) {
        newBadges.push('Centurion');
    }

    // elite - reached level 10 through xp
    if (!currentBadges.includes('Elite') && stats.level >= 10) {
        newBadges.push('Elite');
    }

    // marathon - trained for 10+ hours total
    if (!currentBadges.includes('Marathon') && stats.totalTimeHours >= 10) {
        newBadges.push('Marathon');
    }

    return newBadges;
}

// calculates xp earned from a workout based on duration and accuracy
// base rate is 10 xp per minute with bonus for higher accuracy
export function calculateExperience(
    durationMinutes: number,
    accuracy: number
): number {
    const baseXP = durationMinutes * 10;
    const accuracyBonus = Math.floor(accuracy / 10);
    const totalXP = Math.floor(baseXP * (1 + accuracyBonus / 100));
    return totalXP;
}

// calculates user level based on total accumulated xp
// each level requires more xp than the previous (exponential scaling)
export function calculateLevel(totalExperience: number): number {
    let level = 1;
    let xpRequired = 0;
    let increment = 100;

    while (totalExperience >= xpRequired + increment) {
        xpRequired += increment;
        level++;
        increment = Math.floor(increment * 1.5);
    }

    return level;
}

// calculates how much xp is needed to reach the next level
export function xpToNextLevel(totalExperience: number): number {
    let xpRequired = 0;
    let increment = 100;
    let level = 1;

    while (totalExperience >= xpRequired + increment) {
        xpRequired += increment;
        level++;
        increment = Math.floor(increment * 1.5);
    }

    return (xpRequired + increment) - totalExperience;
}

// calculates progress percentage within the current level (0-100)
export function getLevelProgress(totalExperience: number): number {
    let xpRequired = 0;
    let increment = 100;

    while (totalExperience >= xpRequired + increment) {
        xpRequired += increment;
        increment = Math.floor(increment * 1.5);
    }

    const xpIntoLevel = totalExperience - xpRequired;
    return Math.floor((xpIntoLevel / increment) * 100);
}

// result returned after processing a completed workout
export interface WorkoutResult {
    newStreak: number;
    newStreakLongest: number;
    newTotalWorkouts: number;
    newAverageAccuracy: number;
    newTotalTimeHours: number;
    newExperience: number;
    newLevel: number;
    newBadges: string[];
    allBadges: string[];
}

// main function that processes a workout and calculates all updated stats
// handles streaks, xp, levels, badges, and running averages
export function processWorkoutCompletion(
    currentStats: {
        totalWorkouts: number;
        averageAccuracy: number;
        totalTimeHours: number;
        streakCurrent: number;
        streakLongest: number;
        lastWorkoutDate: string | null;
        experience: number;
        badges: string[];
    },
    workoutData: {
        durationMinutes: number;
        accuracy: number;
        exerciseName: string;
    }
): WorkoutResult {
    // figure out streak status
    const { newStreak } = calculateStreak(
        currentStats.lastWorkoutDate,
        currentStats.streakCurrent
    );
    const newStreakLongest = Math.max(newStreak, currentStats.streakLongest);

    // update workout totals and running average
    const newTotalWorkouts = currentStats.totalWorkouts + 1;
    const newTotalTimeHours = currentStats.totalTimeHours + workoutData.durationMinutes / 60;
    const newAverageAccuracy =
        (currentStats.averageAccuracy * currentStats.totalWorkouts + workoutData.accuracy) /
        newTotalWorkouts;

    // calculate xp gained and check for level up
    const xpGained = calculateExperience(workoutData.durationMinutes, workoutData.accuracy);
    const newExperience = currentStats.experience + xpGained;
    const newLevel = calculateLevel(newExperience);

    // check if any new badges were earned
    const userStats: UserStats = {
        totalWorkouts: newTotalWorkouts,
        averageAccuracy: newAverageAccuracy,
        totalTimeHours: newTotalTimeHours,
        streakCurrent: newStreak,
        streakLongest: newStreakLongest,
        level: newLevel,
    };

    const earnedBadges = checkBadgeEligibility(
        currentStats.badges,
        userStats,
        workoutData.accuracy
    );

    const allBadges = [...currentStats.badges, ...earnedBadges];

    return {
        newStreak,
        newStreakLongest,
        newTotalWorkouts,
        newAverageAccuracy: Math.round(newAverageAccuracy * 100) / 100,
        newTotalTimeHours: Math.round(newTotalTimeHours * 100) / 100,
        newExperience,
        newLevel,
        newBadges: earnedBadges,
        allBadges,
    };
}
