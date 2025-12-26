import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Dumbbell, ArrowRight, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, isLoggedIn } = useUser();
  const navigate = useNavigate();

  // redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, name);
      navigate('/profile-setup');
    } catch (err) {
      // Handle specific Supabase auth errors
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (errorMessage.includes('User already registered')) {
        setError('An account with this email already exists.');
      } else if (errorMessage.includes('Password')) {
        setError('Password does not meet requirements.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      {/* floating background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* left side - branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col justify-center space-y-8 p-12"
        >
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              AI Workout Trainer
            </span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-5xl font-black text-gray-900 leading-tight">
              Start Your Fitness Journey Today
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Join thousands of users training smarter with AI-powered posture analysis and real-time feedback.
            </p>
          </div>

          {/* feature list */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">100% Free</h3>
                <p className="text-sm text-gray-600">No credit card required</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-red-100">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">AI-Powered Training</h3>
                <p className="text-sm text-gray-600">Advanced pose detection technology</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-100">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Progress Tracking</h3>
                <p className="text-sm text-gray-600">Track your improvement over time</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* right side - form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12">
            {/* mobile logo */}
            <Link to="/" className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <Dumbbell className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                AI Workout Trainer
              </span>
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Sign up to start your training journey</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
