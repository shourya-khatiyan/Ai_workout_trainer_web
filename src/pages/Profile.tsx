import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Navbar from '../components/Navbar';
import {
  User,
  Dumbbell,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Activity,
  Flame,
  Award,
  Edit,
  Camera,
  ChevronRight,
  BarChart3,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { user, isLoggedIn } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  if (!isLoggedIn) {
    navigate('/signin');
    return null;
  }

  const level = user?.level || 1;
  const experience = user?.experience || 0;
  const xpToNext = 100 - (experience % 100);
  const xpProgress = ((100 - xpToNext) / 100) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero Section with Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8 p-8 sm:p-12"
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-xl border-4 border-white/30 shadow-2xl flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-white text-blue-600 p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-4xl font-black text-white mb-2">
                  {user?.name || 'Fitness Enthusiast'}
                </h1>
                <p className="text-blue-100 text-lg mb-4 font-medium">
                  Level {level} • {user?.email || 'email@example.com'}
                </p>

                {/* XP Progress */}
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
                      className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 backdrop-blur-lg border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2 shadow-xl"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Flame, label: 'Current Streak', value: '3 days', color: 'from-orange-400 to-red-500', bg: 'from-orange-50 to-red-50' },
              { icon: Dumbbell, label: 'Total Workouts', value: '12', color: 'from-blue-400 to-indigo-500', bg: 'from-blue-50 to-indigo-50' },
              { icon: Target, label: 'Avg Accuracy', value: '87%', color: 'from-green-400 to-emerald-500', bg: 'from-green-50 to-emerald-50' },
              { icon: Clock, label: 'Total Time', value: '3.5h', color: 'from-purple-400 to-pink-500', bg: 'from-purple-50 to-pink-50' }
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
            {/* Left Column - Personal Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
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

              {/* Body Measurements Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Body Measurements
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Hip', value: user?.hipSize ? `${user.hipSize} cm` : 'N/A' },
                    { label: 'Chest', value: user?.chestSize ? `${user.chestSize} cm` : 'N/A' },
                    { label: 'Neck', value: user?.neckSize ? `${user.neckSize} cm` : 'N/A' }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Achievements */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Most Practiced</h3>
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-1">Squats</p>
                  <p className="text-sm text-gray-600">8 sessions this month</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Best Accuracy</h3>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-1">95%</p>
                  <p className="text-sm text-gray-600">Perfect form achieved</p>
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
                  {[
                    { icon: Award, title: 'First Workout', desc: 'Completed your first workout session', color: 'bg-green-500' },
                    { icon: Target, title: 'Perfect Form', desc: 'Achieved 95% form accuracy', color: 'bg-blue-500' },
                    { icon: Flame, title: '3-Day Streak', desc: 'Work out for 3 days in a row', color: 'bg-orange-500' }
                  ].map((achievement, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
                      <div className={`flex-shrink-0 w-12 h-12 ${achievement.color} rounded-xl flex items-center justify-center shadow-md`}>
                        <achievement.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{achievement.title}</p>
                        <p className="text-sm text-gray-600">{achievement.desc}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Recent Activity
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No recent workouts</p>
                      <button className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md">
                        Start Training
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
