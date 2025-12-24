import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface ModelPreloaderProps {
  onComplete: () => void;
}

export default function ModelPreloader({ onComplete }: ModelPreloaderProps) {
  const [loadingText, setLoadingText] = useState('Initializing Model...');

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingText('Setting up TensorFlow...');
        await tf.setBackend('webgl');
        await tf.ready();

        setLoadingText('Loading Pose Detection...');
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        };

        await poseDetection.createDetector(model, detectorConfig);

        setLoadingText('Models Ready!');
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Models loaded successfully');
        onComplete();
      } catch (error) {
        console.error('Error loading models:', error);
        setTimeout(() => loadModels(), 2000);
      }
    };

    loadModels();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Background matching landing page - Hot theme */}
      <div className="absolute inset-0">
        <img
          src="/assets/hero.png"
          alt="Background"
          className="w-full h-full object-cover"
          style={{ filter: 'blur(12px)', transform: 'scale(1.1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/60 via-red-900/50 to-amber-900/60"></div>
        <div className="absolute inset-0 bg-white/40"></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-amber-50/70 to-red-50/80">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-100 to-orange-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl w-full">
        {/* Logo Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 15 }}
          animate={{ scale: 1, opacity: 29 }}
          transition={{ duration: 0.5 }}
          className="mb-12 inline-flex items-center gap-3 px-6 py-3 bg-white/40 backdrop-blur-lg rounded-full border-2 shadow-2xl"
        >
          <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            AI Workout Trainer
          </span>
        </motion.div>

        {/* AI Chip Loader */}
        <div className="flex justify-center items-center mb-8">
          <svg className="w-full max-w-md" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            {/* Processor Chip Body */}
            <rect
              className="chip-body"
              x="120"
              y="100"
              width="160"
              height="100"
              rx="12"
              ry="12"
              fill="#ffffffff"
              fillOpacity="0.3"
              filter="url(#chipShadow)"
            />

            {/* Chip Text */}
            <text x="200" y="140" textAnchor="middle" className="chip-text" fill="#676a6cff" fontSize="15" fontWeight="600">
              AI PROCESSOR
            </text>
            <text x="200" y="165" textAnchor="middle" fill="#686868ff" fontSize="12" fontWeight="400">
              POSE DETECTION
            </text>

            {/* Left Pins */}
            <g className="chip-pins-left">
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={`left-${i}`} className="chip-pin" x="100" y={110 + i * 18} width="20" height="4" fill="#ffffffff" stroke="#ffffffff" strokeWidth="0.5" />
              ))}
            </g>

            {/* Right Pins */}
            <g className="chip-pins-right">
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={`right-${i}`} className="chip-pin" x="280" y={110 + i * 18} width="20" height="4" fill="#ffffffff" stroke="#ffffffff" strokeWidth="0.5" />
              ))}
            </g>

            {/* Animated Traces - Orange */}
            <path
              className="trace-bg"
              d="M 20 112 L 100 112"
              stroke="#ffffffff"
              strokeWidth="2"
              fill="none"
            />
            <path
              className="trace-flow orange"
              d="M 20 112 L 100 112"
              strokeWidth="2"
              fill="none"
            />

            {/* Animated Traces - Red */}
            <path
              className="trace-bg"
              d="M 20 130 L 100 130"
              stroke="#ffffffff"
              strokeWidth="2"
              fill="none"
            />
            <path
              className="trace-flow red"
              d="M 20 130 L 100 130"
              strokeWidth="2"
              fill="none"
              style={{ animationDelay: '0.3s' }}
            />

            {/* Animated Traces - Amber */}
            <path
              className="trace-bg"
              d="M 20 148 L 100 148"
              stroke="#ffffffff"
              strokeWidth="2"
              fill="none"
            />
            <path
              className="trace-flow amber"
              d="M 20 148 L 100 148"
              strokeWidth="2"
              fill="none"
              style={{ animationDelay: '0.6s' }}
            />

            {/* Animated Traces - Yellow */}
            <path
              className="trace-bg"
              d="M 20 166 L 100 166"
              stroke="#ffffffff"
              strokeWidth="2"
              fill="none"
            />
            <path
              className="trace-flow yellow"
              d="M 20 166 L 100 166"
              strokeWidth="2"
              fill="none"
              style={{ animationDelay: '0.9s' }}
            />

            {/* Animated Traces - Rose (5th line) */}
            <path
              className="trace-bg"
              d="M 20 184 L 100 184"
              stroke="#ffffffff"
              strokeWidth="2"
              fill="none"
            />
            <path
              className="trace-flow rose"
              d="M 20 184 L 100 184"
              strokeWidth="2"
              fill="none"
              style={{ animationDelay: '1.2s' }}
            />

            {/* Right side traces */}
            <path className="trace-bg" d="M 300 112 L 380 112" stroke="#ffffffff" strokeWidth="2" fill="none" />
            <path className="trace-flow orange" d="M 300 112 L 380 112" strokeWidth="2" fill="none" style={{ animationDelay: '0.2s' }} />

            <path className="trace-bg" d="M 300 130 L 380 130" stroke="#ffffffff" strokeWidth="2" fill="none" />
            <path className="trace-flow red" d="M 300 130 L 380 130" strokeWidth="2" fill="none" style={{ animationDelay: '0.5s' }} />

            <path className="trace-bg" d="M 300 148 L 380 148" stroke="#ffffffff" strokeWidth="2" fill="none" />
            <path className="trace-flow amber" d="M 300 148 L 380 148" strokeWidth="2" fill="none" style={{ animationDelay: '0.8s' }} />

            <path className="trace-bg" d="M 300 166 L 380 166" stroke="#ffffffff" strokeWidth="2" fill="none" />
            <path className="trace-flow yellow" d="M 300 166 L 380 166" strokeWidth="2" fill="none" style={{ animationDelay: '1.1s' }} />

            <path className="trace-bg" d="M 300 184 L 380 184" stroke="#ffffffff" strokeWidth="2" fill="none" />
            <path className="trace-flow rose" d="M 300 184 L 380 184" strokeWidth="2" fill="none" style={{ animationDelay: '1.4s' }} />

            {/* Gradients and Filters */}
            <defs>
              <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="50%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#fdba74" />
              </linearGradient>
              <filter id="chipShadow">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* Loading Text */}
        <motion.p
          key={loadingText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-gray-800 mb-4"
        >
          {loadingText}
        </motion.p>

        {/* Pulsing Dots - Hot theme */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-orange-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Styles - Hot theme */}
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

        .orange {
          stroke: #f97316;
          color: #f97316;
        }
        .red {
          stroke: #ef4444;
          color: #ef4444;
        }
        .amber {
          stroke: #f59e0b;
          color: #f59e0b;
        }
        .yellow {
          stroke: #eab308;
          color: #eab308;
        }
        .rose {
          stroke: #f43f5e;
          color: #f43f5e;
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
    </div >
  );
}
