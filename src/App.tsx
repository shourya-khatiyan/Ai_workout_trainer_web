import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { UserProvider } from './context/UserContext';
import GoogleAnalytics from './components/GoogleAnalytics';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const BodyCalibration = lazy(() => import('./pages/BodyCalibration'));
const Profile = lazy(() => import('./pages/Profile'));
const WorkoutTrainer = lazy(() => import('./pages/WorkoutTrainer'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * root app component with lazy-loaded routes and auth protection.
 */
function App() {
  const location = useLocation();

  return (
    <UserProvider>
      <GoogleAnalytics />
      <Suspense fallback={<SplashScreen />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/body-calibration" element={<BodyCalibration />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/trainer" element={<ProtectedRoute><WorkoutTrainer /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </UserProvider>
  );
}

export default App;
