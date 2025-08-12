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
import { Dumbbell } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [skipLoading, setSkipLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if we should skip loading (from localStorage)
    const shouldSkipLoading = localStorage.getItem('skipLoading') === 'true';
    
    // Skip loading for trainer page or if skipLoading flag is set
    if (shouldSkipLoading || location.pathname === '/trainer') {
      setSkipLoading(true);
      localStorage.removeItem('skipLoading'); // Clear the flag after using it
      setIsLoading(false);
      return;
    }

    // Initialize AOS
    import('aos').then(AOS => {
      import('aos/dist/aos.css');
      AOS.init({
        duration: 1000,
        once: false,
        mirror: true
      });
    });

    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading && !skipLoading) {
    return (
      <motion.div 
        className="fixed inset-0 bg-black flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        
        <motion.div className="relative z-10 flex flex-col items-center">
          <motion.div 
            className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Dumbbell size={40} className="text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            AI Workout Trainer
          </h1>
          
          <p className="text-gray-400 mb-6">Your personal AI fitness coach</p>
          
          <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
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
            <Route path="/calibration" element={<BodyCalibration />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/trainer" element={<WorkoutTrainer />} />
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