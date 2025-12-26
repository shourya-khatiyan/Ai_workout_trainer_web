import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProfileSetup from './pages/ProfileSetup';
import BodyCalibration from './pages/BodyCalibration';
import Profile from './pages/Profile';
import WorkoutTrainer from './pages/WorkoutTrainer';
import NotFound from './pages/NotFound';
import { UserProvider } from './context/UserContext';
import { Dumbbell } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/trainer') {
      setIsLoading(false);
      return;
    }

    // Much faster loading - 1.5 seconds
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // loading screen
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-red-50"
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 30% 30%, rgba(249,115,22,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 70%, rgba(239,68,68,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 70%, rgba(251,191,36,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 30%, rgba(249,115,22,0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Main content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          {/* Animated logo container */}
          <div className="relative">
            {/* Orbiting dots */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${i === 0 ? '#ea995fff' : i === 1 ? '#e95454ff' : i === 2 ? '#ebd293ff' : '#f1864cff'
                    }, ${i === 0 ? '#ea580c' : i === 1 ? '#dc2626' : i === 2 ? '#edc98bff' : '#c2410c'
                    })`,
                  boxShadow: `0 0 20px ${i === 0 ? 'rgba(249,115,22,0.5)' : i === 1 ? 'rgba(239,68,68,0.5)' : i === 2 ? 'rgba(251,191,36,0.5)' : 'rgba(234,88,12,0.5)'
                    }`,
                }}
                animate={{
                  x: [
                    Math.cos((i * Math.PI) / 2) * 60 - 6,
                    Math.cos((i * Math.PI) / 2 + Math.PI / 2) * 60 - 6,
                    Math.cos((i * Math.PI) / 2 + Math.PI) * 60 - 6,
                    Math.cos((i * Math.PI) / 2 + (3 * Math.PI) / 2) * 60 - 6,
                    Math.cos((i * Math.PI) / 2) * 60 - 6,
                  ],
                  y: [
                    Math.sin((i * Math.PI) / 2) * 60 - 6,
                    Math.sin((i * Math.PI) / 2 + Math.PI / 2) * 60 - 6,
                    Math.sin((i * Math.PI) / 2 + Math.PI) * 60 - 6,
                    Math.sin((i * Math.PI) / 2 + (3 * Math.PI) / 2) * 60 - 6,
                    Math.sin((i * Math.PI) / 2) * 60 - 6,
                  ],
                  scale: [1, 1.2, 1, 0.8, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
              />
            ))}

            {/* Pulsing ring */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-300"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Second pulsing ring */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-200"
              animate={{
                scale: [1.1, 1.3, 1.1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            />

            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative z-10 h-24 w-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
              >
                <Dumbbell className="h-12 w-12 text-white" />
              </motion.div>
            </motion.div>
          </div>

          {/* App name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-3xl font-black bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 bg-clip-text text-transparent"
          >
            AI Workout Trainer
          </motion.h1>

          {/* Animated dots loader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>

          {/* Powered by text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-xs text-gray-400 font-medium"
          >
            Powered by TensorFlow.js & MoveNet
          </motion.p>
        </div>
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
          <Route path="/body-calibration" element={<BodyCalibration />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trainer" element={<WorkoutTrainer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </UserProvider>
  );
}

export default App;
