import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, CheckCircle } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { initializeDetector } from '../utils';

interface ModelPreloaderProps {
  onComplete: () => void;
}

const ModelPreloader: React.FC<ModelPreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Initializing');
  const [stageProgress, setStageProgress] = useState({
    tfjs: false,
    backend: false,
    model: false
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        setCurrentStage('Initializing TensorFlow.js');
        await tf.ready();
        setStageProgress(prev => ({ ...prev, tfjs: true }));
        setProgress(25);

        setCurrentStage('Setting up WebGL backend');
        await tf.setBackend('webgl');
        setStageProgress(prev => ({ ...prev, backend: true }));
        setProgress(50);

        setCurrentStage('Loading MoveNet pose detection model');
        await initializeDetector();
        setStageProgress(prev => ({ ...prev, model: true }));
        setProgress(100);

        setTimeout(() => {
          onComplete();
        }, 500);
      } catch (error) {
        console.error('Error loading models:', error);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    };

    loadModels();
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
              <Activity className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI Workout Trainer
            </h2>
            <p className="text-sm text-gray-600">
              Loading essential components
            </p>
          </div>

          {/* Progress stages */}
          <div className="space-y-3 mb-6">
            {[
              { key: 'tfjs', label: 'TensorFlow.js', number: 1 },
              { key: 'backend', label: 'WebGL Backend', number: 2 },
              { key: 'model', label: 'MoveNet Model', number: 3 }
            ].map((stage) => (
              <div
                key={stage.key}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                  stageProgress[stage.key as keyof typeof stageProgress]
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  stageProgress[stage.key as keyof typeof stageProgress]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stageProgress[stage.key as keyof typeof stageProgress] ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    stage.number
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  stageProgress[stage.key as keyof typeof stageProgress]
                    ? 'text-green-700'
                    : 'text-gray-700'
                }`}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-center text-sm font-medium text-gray-700">
              {currentStage} ({progress}%)
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModelPreloader;
