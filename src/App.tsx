import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import BodyCalibration from './pages/BodyCalibration';
import Profile from './pages/Profile';
import WorkoutTrainer from './pages/WorkoutTrainer';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { Dumbbell, Activity } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [skipLoading, setSkipLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const shouldSkipLoading = localStorage.getItem('skipLoading') === 'true';
    
    if (shouldSkipLoading || location.pathname === '/trainer') {
      setSkipLoading(true);
      localStorage.removeItem('skipLoading');
      setIsLoading(false);
      return;
    }

    import('aos').then(AOS => {
      import('aos/dist/aos.css');
      AOS.init({
        duration: 1000,
        once: false,
        mirror: true
      });
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading && !skipLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center overflow-hidden">
        {/* Animated background elements matching landing page */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          {/* Logo with pulsing animation */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-8"
          >
            <Dumbbell className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-3">
            AI Workout Trainer
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 font-medium">
            Your personal AI fitness coach
          </p>

          {/* Loading bar */}
          <div className="w-64 mx-auto">
            <div className="h-2 bg-white/50 rounded-full overflow-hidden shadow-inner backdrop-blur-sm border border-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Loading dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-blue-500 rounded-full"
                animate={{
                  y: [-8, 8, -8],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>

        <style>{`
          .animation-delay-2000 {
            animation-delay: 2s;
          }
        `}</style>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/body-calibration" element={<BodyCalibration />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/trainer" element={<WorkoutTrainer />} />
            {/* Uncomment when ready */}
            {/* <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} /> */}
          </Routes>
        </AnimatePresence>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
