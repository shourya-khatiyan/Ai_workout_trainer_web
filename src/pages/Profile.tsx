import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Navbar from '../components/Navbar';
import {
  User,
  Dumbbell,
  Trophy,
  Target,
  Calendar,
  Clock,
  Activity,
  Flame,
  Award,
  Edit,
  Camera,
  ChevronRight,
  BarChart3,
  Zap,
  Ruler,
  X,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWorkoutHistory } from '../services/authService';

// Activity contribution grid component (GitHub-style)
interface WorkoutDay {
  date: string;
  count: number;
  intensity: number; // 0-4 for color intensity
}

const ActivityGrid: React.FC<{ userId: string | undefined }> = ({ userId }) => {
  const [activityData, setActivityData] = useState<Map<string, WorkoutDay>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkoutHistory = async () => {
      if (!userId) return;

      try {
        const history = await getWorkoutHistory(userId, 365);
        const dataMap = new Map<string, WorkoutDay>();

        // Process workout history into daily counts
        history?.forEach((workout: any) => {
          const date = new Date(workout.created_at).toISOString().split('T')[0];
          const existing = dataMap.get(date);
          if (existing) {
            existing.count += 1;
            existing.intensity = Math.min(4, existing.count);
          } else {
            dataMap.set(date, { date, count: 1, intensity: 1 });
          }
        });

        setActivityData(dataMap);
      } catch (error) {
        console.error('Error fetching workout history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutHistory();
  }, [userId]);

  // Generate last 52 weeks of dates
  const generateWeeks = () => {
    const weeks: string[][] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // Go back ~1 year

    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentDate = new Date(startDate);

    for (let week = 0; week < 53; week++) {
      const weekDays: string[] = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    return weeks;
  };

  const weeks = generateWeeks();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getIntensityColor = (intensity: number) => {
    const colors = [
      'bg-gray-100', // 0 - no activity
      'bg-green-200', // 1
      'bg-green-300', // 2
      'bg-green-400', // 3
      'bg-green-600', // 4+
    ];
    return colors[intensity] || colors[0];
  };

  // Get month labels for the header
  const getMonthLabels = () => {
    const labels: { month: string; index: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const date = new Date(week[0]);
      const month = date.getMonth();
      if (month !== lastMonth) {
        labels.push({ month: months[month], index: weekIndex });
        lastMonth = month;
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalWorkouts = Array.from(activityData.values()).reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{totalWorkouts} workouts in the last year</span>
        <div className="flex items-center gap-2">
          <span className="text-xs">Less</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${getIntensityColor(i)}`}></div>
            ))}
          </div>
          <span className="text-xs">More</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="relative">
        <div className="flex text-xs text-gray-500 ml-8">
          {monthLabels.map((label, idx) => (
            <div
              key={idx}
              className="absolute"
              style={{ left: `${32 + label.index * 14}px` }}
            >
              {label.month}
            </div>
          ))}
        </div>
      </div>

      {/* Activity grid */}
      <div className="flex gap-1 overflow-x-auto pb-2 mt-6">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 text-xs text-gray-500 mr-1 flex-shrink-0">
          <div className="h-3"></div>
          <div className="h-3 flex items-center">Mon</div>
          <div className="h-3"></div>
          <div className="h-3 flex items-center">Wed</div>
          <div className="h-3"></div>
          <div className="h-3 flex items-center">Fri</div>
          <div className="h-3"></div>
        </div>

        {/* Weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-0.5 flex-shrink-0">
            {week.map((dateStr, dayIndex) => {
              const day = activityData.get(dateStr);
              const today = new Date().toISOString().split('T')[0];
              const isFuture = dateStr > today;

              return (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm transition-all hover:ring-1 hover:ring-gray-400 cursor-pointer ${isFuture ? 'bg-transparent' : getIntensityColor(day?.intensity || 0)
                    }`}
                  title={`${dateStr}: ${day?.count || 0} workout${(day?.count || 0) !== 1 ? 's' : ''}`}
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Quick action removed per user request */}
    </div>
  );
};

const Profile: React.FC = () => {
  const { user, isLoggedIn, isLoading: isAuthLoading, updateUser, authUser } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    fitnessLevel: '',
    fitnessGoal: '',
    profileImage: ''
  });

  // Initialize form when user data loads or modal opens
  useEffect(() => {
    if (user && isEditing) {
      setEditForm({
        name: user.name || '',
        bio: user.bio || '',
        fitnessLevel: user.fitnessLevel || '',
        fitnessGoal: user.fitnessGoal || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user, isEditing]);

  // Redirect to signin if not logged in (only after auth check is complete)
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      navigate('/signin');
    }
  }, [isLoggedIn, isAuthLoading, navigate]);

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If not logged in, don't render anything (redirect will happen)
  if (!isLoggedIn) {
    return null;
  }

  // Calculate xp progress
  const level = user?.level || 1;
  const experience = user?.experience || 0;
  const xpToNext = 100 - (experience % 100);
  const xpProgress = ((100 - xpToNext) / 100) * 100;

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      await updateUser({
        name: editForm.name,
        bio: editForm.bio,
        fitnessLevel: editForm.fitnessLevel.toLowerCase(),
        fitnessGoal: editForm.fitnessGoal.toLowerCase().replace(/ /g, '_'),
        profileImage: editForm.profileImage
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 rounded-3xl shadow-2xl overflow-hidden mb-8 p-8 sm:p-12"
          >
            {/* Decorative blobs */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
              {/* Profile picture (no edit button here) */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-xl border-4 border-white/30 shadow-2xl flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* User info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-4xl font-black text-white mb-2">
                  {user?.name || 'Fitness Enthusiast'}
                </h1>
                <p className="text-orange-100 text-lg mb-2 font-medium">
                  Level {level} • {user?.email || 'email@example.com'}
                </p>

                {/* Bio */}
                {user?.bio && (
                  <p className="text-white/90 text-sm mb-3 max-w-lg italic">
                    "{user.bio}"
                  </p>
                )}

                {/* Fitness Level and Goal badges */}
                <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                  {user?.fitnessLevel && (
                    <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-semibold border border-white/30">
                      {user.fitnessLevel.charAt(0).toUpperCase() + user.fitnessLevel.slice(1)}
                    </span>
                  )}
                  {user?.fitnessGoal && (
                    <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-semibold border border-white/30">
                      {user.fitnessGoal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  )}
                </div>

                {/* XP bar */}
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 max-w-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-white">Experience</span>
                    <span className="text-sm font-bold text-white">{xpToNext} XP to Level {level + 1}</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 backdrop-blur-lg border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2 shadow-xl"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Flame, label: 'Current Streak', value: `${user?.streak?.current || 0} days`, color: 'from-orange-400 to-red-500', bg: 'from-orange-50 to-red-50' },
              { icon: Dumbbell, label: 'Total Workouts', value: String(user?.stats?.totalWorkouts || 0), color: 'from-amber-400 to-orange-500', bg: 'from-amber-50 to-orange-50' },
              { icon: Target, label: 'Avg Accuracy', value: `${Math.round(user?.stats?.averageAccuracy || 0)}%`, color: 'from-green-400 to-emerald-500', bg: 'from-green-50 to-emerald-50' },
              { icon: Clock, label: 'Total Time', value: `${(user?.stats?.totalTimeHours || 0).toFixed(1)}h`, color: 'from-red-400 to-orange-500', bg: 'from-red-50 to-orange-50' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} mb-4 shadow-md`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Personal info card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-600" />
                    Personal Info
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Age', value: user?.age || 'Not set' },
                    { label: 'Gender', value: user?.gender || 'Not set' },
                    { label: 'Height', value: user?.height ? `${user.height} cm` : 'Not set' },
                    { label: 'Weight', value: user?.weight ? `${user.weight} kg` : 'Not set' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-semibold text-gray-600">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body measurements card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    Body Measurements
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Hip', value: user?.hipSize ? `${user.hipSize} cm` : 'N/A' },
                    { label: 'Chest', value: user?.chestSize ? `${user.chestSize} cm` : 'N/A' },
                    { label: 'Neck', value: user?.neckSize ? `${user.neckSize} cm` : 'N/A' }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={() => navigate('/body-calibration')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-100 hover:border-red-300 transition-all group"
                  >
                    <Ruler className="h-4 w-4" />
                    Update Measurements
                  </button>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Most Practiced</h3>
                    <BarChart3 className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-1">{user?.stats?.mostPracticed || 'None yet'}</p>
                  <p className="text-sm text-gray-600">{user?.stats?.mostPracticedSessions || 0} sessions</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Longest Streak</h3>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-1">{user?.streak?.longest || 0} days</p>
                  <p className="text-sm text-gray-600">Your best streak</p>
                </div>
              </div>

              {/* Activity Overview */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Activity Overview
                  </h2>
                </div>
                <div className="p-6">
                  <ActivityGrid userId={authUser?.id} />
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Achievements
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  {(user?.badges && user.badges.length > 0) ? (
                    user.badges.map((badge, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{badge}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Complete workouts to earn badges!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Profile Photo */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                      {editForm.profileImage ? (
                        <img src={editForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-12 w-12 text-orange-500" />
                      )}
                    </div>
                    <label
                      htmlFor="editProfileImage"
                      className="absolute bottom-0 right-0 h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl hover:bg-orange-600 transition-all"
                    >
                      <Camera className="h-5 w-5 text-white" />
                      <input
                        id="editProfileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">Click to upload new photo</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none resize-none"
                    placeholder="Tell us about your fitness journey..."
                    rows={3}
                  />
                </div>

                {/* Fitness Level */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Fitness Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, fitnessLevel: level }))}
                        className={`py-3 px-4 rounded-xl font-semibold transition-all ${editForm.fitnessLevel === level || editForm.fitnessLevel === level.toLowerCase()
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fitness Goal */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Primary Goal</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Lose Weight', 'Build Muscle', 'General Fitness', 'Improve Flexibility'].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, fitnessGoal: goal }))}
                        className={`py-3 px-4 rounded-xl font-semibold transition-all text-left ${editForm.fitnessGoal === goal || editForm.fitnessGoal === goal.toLowerCase().replace(/ /g, '_')
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
