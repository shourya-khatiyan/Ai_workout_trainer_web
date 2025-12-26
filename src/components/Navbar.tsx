import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Dumbbell, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isLoggedIn, logout } = useUser();
  const navigate = useNavigate();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  useEffect(() => {
    // add shadow when scrolled
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-orange-200'
        : 'bg-white/80 backdrop-blur-md border-b border-orange-100'
        }`}
    >
      <div className="w-full px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex justify-between items-center h-16">
          {/* logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              AI Workout Trainer
            </span>
          </Link>

          {/* profile or auth buttons */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="relative z-[9999]" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-300"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="h-9 w-9 rounded-lg border-2 border-white shadow-sm object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Level {user?.level || 1}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-600 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {/* dropdown menu */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{ zIndex: 99999 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-orange-100 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
                        <p className="text-sm font-bold text-gray-900">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          <User className="h-4 w-4 mr-3" />
                          Your Profile
                        </Link>
                      </div>

                      <div className="border-t border-orange-100 pt-2 pb-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
