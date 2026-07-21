import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Dumbbell, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../services/authService';

/**
 * allows users to request a password reset email.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8">
          <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              AI Workout Trainer
            </span>
          </Link>

          {isSuccess ? (
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
              </p>
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-600">Enter your email and we'll send you a reset link.</p>
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

              <form onSubmit={handleSubmit} className="space-y-6">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-semibold transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
