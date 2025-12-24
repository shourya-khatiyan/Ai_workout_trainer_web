import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProfileSetup from './pages/ProfileSetup';
import Profile from './pages/Profile';
import WorkoutTrainer from './pages/WorkoutTrainer';
import { UserProvider } from './context/UserContext';
import { Dumbbell, Zap, Target, TrendingUp, Activity } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // skip loading screen for trainer page
    if (location.pathname === '/trainer') {
      setIsLoading(false);
      return;
    }

    // fake loading bar that takes 2.5 seconds
    const duration = 2500;
    const steps = 50;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => setIsLoading(false), 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [location.pathname]);

  // loading screen
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-hidden"
      >
        {/* background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-100 to-orange-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
            <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
          <div className="absolute inset-0 bg-light-vignette"></div>
        </div>

        {/* main content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
          {/* logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-4 px-8 py-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-orange-200 shadow-2xl mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <Dumbbell className="h-9 w-9 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  AI Workout Trainer
                </h1>
                <p className="text-sm text-gray-600 font-semibold">Transform Your Fitness Journey</p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 font-medium text-lg"
            >
              AI-Powered • Real-Time Analysis • Personalized Coaching
            </motion.p>
          </motion.div>

          {/* feature cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl w-full"
          >
            {[
              { icon: Zap, title: 'Instant Feedback', desc: 'Real-time pose correction', color: 'from-orange-500 to-amber-500' },
              { icon: Target, title: 'Precision Tracking', desc: 'Advanced motion analysis', color: 'from-red-500 to-orange-500' },
              { icon: TrendingUp, title: 'Progress Insights', desc: 'Data-driven improvements', color: 'from-amber-500 to-yellow-500' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-xl p-5 border border-orange-200 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-md`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full max-w-md"
          >
            <div className="relative w-full h-2 bg-white/60 backdrop-blur-sm rounded-full overflow-hidden mb-3 shadow-inner">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-600 animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">
                  {progress < 30 ? 'Loading AI Models...' :
                    progress < 70 ? 'Preparing Workspace...' :
                      'Almost Ready...'}
                </span>
              </div>
              <span className="text-sm font-bold text-orange-600">{Math.round(progress)}%</span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-xs text-gray-500 font-medium"
          >
            Powered by TensorFlow.js & MoveNet
          </motion.p>
        </div>

        {/* css animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(50px, -80px) scale(1.1); }
            66% { transform: translate(-40px, 60px) scale(0.95); }
          }
          @keyframes float-delayed {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(-60px, 70px) scale(1.05); }
            66% { transform: translate(50px, -50px) scale(0.9); }
          }
          @keyframes float-slow {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(30px, -40px) scale(1.08); }
          }
          .animate-float { animation: float 15s ease-in-out infinite; }
          .animate-float-delayed { animation: float-delayed 18s ease-in-out infinite; }
          .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
          .bg-grid-pattern {
            background-image: 
              linear-gradient(rgba(100, 100, 100, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 100, 100, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
          }
          .bg-light-vignette {
            background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.02) 100%);
          }
        `}</style>
      </motion.div>
    );
  }

  // main app with routes
  return (
    <UserProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trainer" element={<WorkoutTrainer />} />
        </Routes>
      </AnimatePresence>
    </UserProvider>
  );
}

export default App;
