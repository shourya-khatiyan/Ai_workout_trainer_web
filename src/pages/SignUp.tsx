import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';
import Logo from '../components/Logo';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isLoggedIn } = useUser();
  const navigate = useNavigate();
  
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
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      login({
        name,
        email,
        level: 1,
        experience: 0,
        badges: ['Beginner']
      });
      
      navigate('/calibration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 grid-pattern opacity-10"></div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Logo />
        </div>
      </div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form 
          onSubmit={handleSubmit} 
          className="form"
          style={{
            backgroundColor: '#171717',
            padding: '2em',
            borderRadius: '25px',
            transition: '0.4s ease-in-out',
            maxWidth: '400px',
            margin: '0 auto'
          }}
        >
          <h2 id="heading" className="text-center text-2xl font-bold mb-8 text-white">
            Create your account
          </h2>

          {error && (
            <div className="mb-4 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="field">
            <User className="input-icon text-white" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="field">
            <Mail className="input-icon text-white" size={20} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="field">
            <Lock className="input-icon text-white" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="field">
            <Lock className="input-icon text-white" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex items-center mb-4">
            <input
              id="cbx-terms"
              type="checkbox"
              required
              style={{ display: 'none' }}
            />
            <label className="check" htmlFor="cbx-terms">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
                <polyline points="1 9 7 14 15 4"></polyline>
              </svg>
            </label>
            <label htmlFor="cbx-terms" className="ml-2 text-sm text-white cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-primary hover:text-primary-light">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:text-primary-light">Privacy Policy</a>
            </label>
          </div>

          <div className="btn">
            <button
              type="submit"
              disabled={isLoading}
              className="button1 w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Sign up'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#171717] text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="button2 flex justify-center items-center">
                <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                Google
              </button>
              <button className="button2 flex justify-center items-center">
                <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/448234/facebook.svg" alt="Facebook" />
                Facebook
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/signin" className="text-white hover:text-gray-200">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
      
      <div className="mt-8 text-center relative z-10">
        <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white">
          <ArrowLeft size={16} className="mr-1" />
          Back to home
        </Link>
      </div>

      <style>{`
        .form:hover {
          transform: scale(1.05);
          border: 1px solid #333;
        }

        .field {
          display: flex;
          align-items: center;
          gap: 0.5em;
          border-radius: 25px;
          padding: 0.6em;
          border: none;
          outline: none;
          color: white;
          background-color: #171717;
          box-shadow: inset 2px 5px 10px rgb(5, 5, 5);
          margin-bottom: 1em;
        }

        .input-icon {
          height: 1.3em;
          width: 1.3em;
          fill: white;
        }

        .input-field {
          background: none;
          border: none;
          outline: none;
          width: 100%;
          color: #d3d3d3;
        }

        .check {
          cursor: pointer;
          position: relative;
          margin: auto;
          width: 18px;
          height: 18px;
          -webkit-tap-highlight-color: transparent;
          transform: translate3d(0, 0, 0);
        }

        .check:before {
          content: "";
          position: absolute;
          top: -15px;
          left: -15px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(34,50,84,0.03);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .check svg {
          position: relative;
          z-index: 1;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke: #c8ccd4;
          stroke-width: 1.5;
          transform: translate3d(0, 0, 0);
          transition: all 0.2s ease;
        }

        .check svg path {
          stroke-dasharray: 60;
          stroke-dashoffset: 0;
        }

        .check svg polyline {
          stroke-dasharray: 22;
          stroke-dashoffset: 66;
        }

        .check:hover:before {
          opacity: 1;
        }

        .check:hover svg {
          stroke: #8B5CF6;
        }

        #cbx-terms:checked + .check svg {
          stroke: #8B5CF6;
        }

        #cbx-terms:checked + .check svg path {
          stroke-dashoffset: 60;
          transition: all 0.3s linear;
        }

        #cbx-terms:checked + .check svg polyline {
          stroke-dashoffset: 42;
          transition: all 0.2s linear;
          transition-delay: 0.15s;
        }

        .button1, .button2 {
          --hover-shadows: 16px 16px 33pxrgb(0, 0, 0), -16px -16px 33pxrgb(0, 0, 0);
          --accent:rgb(179, 0, 255);
          font-weight: bold;
          letter-spacing: 0.1em;
          border: none;
          border-radius: 1.1em;
          background-color:rgb(23, 23, 23);
          cursor: pointer;
          box-shadow: 2px 5px 10px rgb(18 18 18);
          
          color: white;
          padding: 1em 2em;
          transition: box-shadow ease-in-out 0.3s, background-color ease-in-out 0.1s,
            letter-spacing ease-in-out 0.1s, transform ease-in-out 0.1s;
        }

        .button1:hover, .button2:hover {
          box-shadow: var(--hover-shadows);
          box-shadow: inset 2px 5px 10px rgb(11, 11, 11);
        }

        .button1:active, .button2:active {
          box-shadow: var(--hover-shadows), var(--accent) 0px 0px 30px 5px;
          background-color: var(--accent);
          transform: scale(0.95);
        }

        .button2 {
          padding: 0.8em 1.5em;
        }
      `}</style>
    </div>
  );
}