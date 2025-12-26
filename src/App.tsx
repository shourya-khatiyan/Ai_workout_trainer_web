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
        className="fixed inset-0 z-50 overflow-hidden"
      >
        {/* Background image - same as landing page hero */}
        <div className="absolute inset-0">
          <img
            src="/assets/hero.png"
            alt="Background"
            className="w-full h-full object-cover"
            style={{ filter: 'blur(4px)', transform: 'scale(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-red-900/30 to-amber-900/40"></div>
          <div className="absolute inset-0 bg-white/60"></div>
        </div>

        {/* Gradient overlay with floating blobs - same as landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-amber-50/70 to-red-50/80">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-100 to-orange-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
            <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
          </div>
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
          <div className="absolute inset-0 bg-light-vignette"></div>
        </div>

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

        {/* CSS animations - same as landing page */}
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
