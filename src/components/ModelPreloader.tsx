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
        // Stage 1: Initialize TensorFlow.js (25%)
        setCurrentStage('Initializing TensorFlow.js');
        await tf.ready();
        setStageProgress(prev => ({ ...prev, tfjs: true }));
        setProgress(25);
        
        // Stage 2: Set up WebGL backend (50%)
        setCurrentStage('Setting up WebGL backend');
        await tf.setBackend('webgl');
        setStageProgress(prev => ({ ...prev, backend: true }));
        setProgress(50);
        
        // Stage 3: Load MoveNet model (100%)
        setCurrentStage('Loading MoveNet pose detection model');
        
        // Initialize the detector using our utility function
        await initializeDetector();
        
        setStageProgress(prev => ({ ...prev, model: true }));
        setProgress(100);
        
        // Complete loading after a short delay to show 100%
        setTimeout(() => {
          onComplete();
        }, 500);
      } catch (error) {
        console.error('Error loading models:', error);
        // Even if there's an error, we'll proceed after a delay
        // The app will handle model errors separately
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    };

    loadModels();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-4">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0a0a14]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[150px] opacity-10 z-0"></div>
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-500 rounded-full filter blur-[120px] opacity-10 z-0"></div>
      
      <motion.div 
        className="max-w-md w-full flex flex-col items-center relative z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="mb-8"
        >
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 bg-opacity-20 flex items-center justify-center">
            <Cpu size={40} className="text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-purple-400 via-blue-500 to-blue-400 bg-clip-text text-transparent">
          AI Workout Trainer
        </h2>
        
        <p className="text-xl text-gray-300 mb-8 text-center">
          Loading essential components
        </p>
        
        <div className="w-full space-y-4 mb-8">
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${stageProgress.tfjs ? 'bg-green-500' : 'bg-gray-700'}`}>
              {stageProgress.tfjs ? <CheckCircle size={16} className="text-white" /> : <span className="text-white text-sm">1</span>}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">TensorFlow.js</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className={`h-2 rounded-full ${stageProgress.tfjs ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: stageProgress.tfjs ? '100%' : '0%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${stageProgress.backend ? 'bg-green-500' : 'bg-gray-700'}`}>
              {stageProgress.backend ? <CheckCircle size={16} className="text-white" /> : <span className="text-white text-sm">2</span>}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">WebGL Backend</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className={`h-2 rounded-full ${stageProgress.backend ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: stageProgress.backend ? '100%' : '0%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${stageProgress.model ? 'bg-green-500' : 'bg-gray-700'}`}>
              {stageProgress.model ? <CheckCircle size={16} className="text-white" /> : <span className="text-white text-sm">3</span>}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">MoveNet Model</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div className={`h-2 rounded-full ${stageProgress.model ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: stageProgress.model ? '100%' : '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <p className="text-sm text-gray-400 text-center">{currentStage} ({progress}%)</p>
      </motion.div>
    </div>
  );
};

export default ModelPreloader; 