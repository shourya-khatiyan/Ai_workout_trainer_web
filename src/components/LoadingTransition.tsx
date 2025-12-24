import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingTransitionProps {
  onComplete: () => void;
  message?: string;
}

const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  onComplete,
  message = "Preparing your AI trainer..."
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = prev < 50 ? 2 : prev < 80 ? 3 : 4;
        const newProgress = Math.min(prev + increment, 100);

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background matching landing page */}
      <div className="absolute inset-0">
        <img
          src="/assets/hero.png"
          alt="Background"
          className="w-full h-full object-cover"
          style={{ filter: 'blur(12px)', transform: 'scale(1.1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-indigo-900/50 to-purple-900/60"></div>
        <div className="absolute inset-0 bg-white/40"></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/70 to-purple-50/80">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 text-center px-6 max-w-2xl w-full"
      >
        {/* Logo */}
        <div className="mb-10 inline-flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-lg rounded-full border-2 border-blue-200 shadow-2xl">
          <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Workout Trainer
          </span>
        </div>

        {/* AI Chip Loader - Smaller version */}
        <div className="flex justify-center items-center mb-8">
          <svg className="w-full max-w-sm" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            <rect
              className="chip-body"
              x="120"
              y="100"
              width="160"
              height="100"
              rx="12"
              ry="12"
              fill="url(#chipGradient)"
              stroke="#3b82f6"
              strokeWidth="2"
              filter="url(#chipShadow)"
            />

            <pattern id="chipPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="#6366f1" opacity="0.3" />
            </pattern>
            <rect x="120" y="100" width="160" height="100" rx="12" ry="12" fill="url(#chipPattern)" />

            <text x="200" y="140" textAnchor="middle" className="chip-text" fill="#c1cae7ff" fontSize="20" fontWeight="bold">
              Loading Trainer...
            </text>
            <text x="200" y="165" textAnchor="middle" fill="#686868ff" fontSize="11" fontWeight="600">
              {progress}% READY
            </text>

            <g className="chip-pins-left">
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={`left-${i}`} className="chip-pin" x="100" y={110 + i * 18} width="20" height="4" fill="#64748b" stroke="#475569" strokeWidth="0.5" />
              ))}
            </g>

            <g className="chip-pins-right">
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={`right-${i}`} className="chip-pin" x="280" y={110 + i * 18} width="20" height="4" fill="#64748b" stroke="#475569" strokeWidth="0.5" />
              ))}
            </g>

            {[120, 140, 160, 180].map((y, i) => (
              <React.Fragment key={`trace-left-${i}`}>
                <path className="trace-bg" d={`M 20 ${y} L 100 ${y}`} stroke="#cbd5e1" strokeWidth="2" fill="none" />
                <path
                  className={`trace-flow ${['blue', 'indigo', 'purple', 'cyan'][i]}`}
                  d={`M 20 ${y} L 100 ${y}`}
                  strokeWidth="2"
                  fill="none"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              </React.Fragment>
            ))}

            {[120, 140, 160, 180].map((y, i) => (
              <React.Fragment key={`trace-right-${i}`}>
                <path className="trace-bg" d={`M 300 ${y} L 380 ${y}`} stroke="#cbd5e1" strokeWidth="2" fill="none" />
                <path
                  className={`trace-flow ${['blue', 'indigo', 'purple', 'cyan'][i]}`}
                  d={`M 300 ${y} L 380 ${y}`}
                  strokeWidth="2"
                  fill="none"
                  style={{ animationDelay: `${0.2 + i * 0.3}s` }}
                />
              </React.Fragment>
            ))}

            <defs>
              <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="50%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#e9d5ff" />
              </linearGradient>
              <filter id="chipShadow">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* Message */}
        <p className="text-lg font-bold text-gray-800 mb-6">{message}</p>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <p className="text-sm font-semibold text-gray-600">{progress}% complete</p>
      </motion.div>

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
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 18s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }

        .trace-flow {
          stroke-dasharray: 40 400;
          stroke-dashoffset: 438;
          filter: drop-shadow(0 0 6px currentColor);
          animation: flow 3s cubic-bezier(0.5, 0, 0.9, 1) infinite;
        }

        .blue {
          stroke: #3b82f6;
          color: #3b82f6;
        }
        .indigo {
          stroke: #6366f1;
          color: #6366f1;
        }
        .purple {
          stroke: #a855f7;
          color: #a855f7;
        }
        .cyan {
          stroke: #06b6d4;
          color: #06b6d4;
        }

        @keyframes flow {
          to {
            stroke-dashoffset: 0;
          }
        }

        .chip-text {
          font-weight: bold;
          letter-spacing: 2px;
        }

        .chip-pin {
          filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
        }
      `}</style>
    </div>
  );
};

export default LoadingTransition;