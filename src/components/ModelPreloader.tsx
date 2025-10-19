import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Zap, CheckCircle2 } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface ModelPreloaderProps {
  onComplete: () => void;
}

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'complete';
  progress: number;
}

export default function ModelPreloader({ onComplete }: ModelPreloaderProps) {
  const [steps, setSteps] = useState<LoadingStep[]>([
    { id: 'tensorflow', label: 'Initializing TensorFlow', status: 'pending', progress: 0 },
    { id: 'backend', label: 'Setting up WebGL Backend', status: 'pending', progress: 0 },
    { id: 'model', label: 'Loading Pose Detection Model', status: 'pending', progress: 0 },
    { id: 'ready', label: 'Finalizing Setup', status: 'pending', progress: 0 },
  ]);

  const updateStep = (id: string, updates: Partial<LoadingStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  // Smooth progress animation helper
  const animateProgress = async (stepId: string, duration: number) => {
    const steps = 10;
    const increment = 100 / steps;
    const delay = duration / steps;
    
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, delay));
      updateStep(stepId, { progress: Math.min(i * increment, 100) });
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Step 1: Initialize TensorFlow
        updateStep('tensorflow', { status: 'loading', progress: 0 });
        await animateProgress('tensorflow', 500);
        updateStep('tensorflow', { status: 'complete', progress: 100 });
        await new Promise(resolve => setTimeout(resolve, 200));

        // Step 2: Set backend
        updateStep('backend', { status: 'loading', progress: 0 });
        await tf.setBackend('webgl');
        await animateProgress('backend', 600);
        await tf.ready();
        updateStep('backend', { status: 'complete', progress: 100 });
        await new Promise(resolve => setTimeout(resolve, 200));

        // Step 3: Load model
        updateStep('model', { status: 'loading', progress: 0 });
        
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        };
        
        // Start progress animation
        const progressPromise = animateProgress('model', 2000);
        
        // Load model in parallel
        const modelPromise = poseDetection.createDetector(model, detectorConfig);
        
        // Wait for both to complete
        await Promise.all([progressPromise, modelPromise]);
        
        updateStep('model', { status: 'complete', progress: 100 });
        await new Promise(resolve => setTimeout(resolve, 200));

        // Step 4: Finalize
        updateStep('ready', { status: 'loading', progress: 0 });
        await animateProgress('ready', 500);
        updateStep('ready', { status: 'complete', progress: 100 });

        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Models loaded successfully');
        onComplete();
      } catch (error) {
        console.error('Error loading models:', error);
        // Retry after error
        setTimeout(() => loadModels(), 2000);
      }
    };

    loadModels();
  }, [onComplete]);

  const allComplete = steps.every(step => step.status === 'complete');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Professional gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="absolute inset-0 bg-light-vignette"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg w-full">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-lg rounded-full border border-gray-200 shadow-xl"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="h-7 w-7 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Workout Trainer
          </span>
        </motion.div>

        {/* Orbiting loader animation */}
        <div className="relative w-24 h-24 mx-auto mb-12">
          {/* Center circle */}
          <motion.div
            animate={{ 
              scale: allComplete ? [1, 1.2, 1] : [1, 1.1, 1],
              rotate: allComplete ? 0 : 360
            }}
            transition={{ 
              scale: { duration: 0.5, repeat: allComplete ? 2 : Infinity },
              rotate: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
            className={`absolute inset-0 m-auto w-16 h-16 rounded-full shadow-2xl flex items-center justify-center ${
              allComplete 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}
          >
            <AnimatePresence mode="wait">
              {allComplete ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </motion.div>
              ) : (
                <motion.div key="zap">
                  <Zap className="h-8 w-8 text-white animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Orbiting dots */}
          {!allComplete && [0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg"
              style={{
                top: '50%',
                left: '50%',
                marginTop: '-6px',
                marginLeft: '-6px',
              }}
              animate={{
                x: [
                  Math.cos((index * 2 * Math.PI) / 3) * 48,
                  Math.cos((index * 2 * Math.PI) / 3 + (2 * Math.PI) / 3) * 48,
                  Math.cos((index * 2 * Math.PI) / 3 + (4 * Math.PI) / 3) * 48,
                  Math.cos((index * 2 * Math.PI) / 3) * 48,
                ],
                y: [
                  Math.sin((index * 2 * Math.PI) / 3) * 48,
                  Math.sin((index * 2 * Math.PI) / 3 + (2 * Math.PI) / 3) * 48,
                  Math.sin((index * 2 * Math.PI) / 3 + (4 * Math.PI) / 3) * 48,
                  Math.sin((index * 2 * Math.PI) / 3) * 48,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.2,
              }}
            />
          ))}
        </div>

        {/* Loading Steps */}
        <div className="space-y-4 bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step label */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {step.status === 'complete' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : step.status === 'loading' ? (
                    <div className="h-5 w-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={`text-sm font-semibold ${
                    step.status === 'complete' ? 'text-green-700' : 
                    step.status === 'loading' ? 'text-blue-700' : 
                    'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                <span className={`text-xs font-bold ${
                  step.status === 'complete' ? 'text-green-600' : 
                  step.status === 'loading' ? 'text-blue-600' : 
                  'text-gray-400'
                }`}>
                  {Math.round(step.progress)}%
                </span>
              </div>

              {/* Progress bar - KEY FIX: Only animate when value changes, no duration */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-200 ease-linear ${
                    step.status === 'complete' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                    'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${step.progress}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-sm text-gray-600 font-semibold"
        >
          {allComplete ? 'All systems ready!' : 'Preparing your AI-powered workout experience...'}
        </motion.p>
      </div>

      {/* Styles */}
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
    </div>
  );
}
