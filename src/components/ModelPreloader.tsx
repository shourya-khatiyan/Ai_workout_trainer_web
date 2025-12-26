import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Dumbbell } from 'lucide-react';

interface ModelPreloaderProps {
  onComplete: (cameraStream: MediaStream | null, detector: poseDetection.PoseDetector | null) => void;
}

export default function ModelPreloader({ onComplete }: ModelPreloaderProps) {
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cameraStream: MediaStream | null = null;
    let detector: poseDetection.PoseDetector | null = null;

    const loadModels = async () => {
      try {
        setLoadingText('Setting up TensorFlow...');
        setProgress(15);
        await tf.setBackend('webgl');
        await tf.ready();

        setLoadingText('Loading Pose Detection Model...');
        setProgress(35);
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        };

        detector = await poseDetection.createDetector(model, detectorConfig);

        setLoadingText('Requesting Camera Access...');
        setProgress(60);

        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user'
            }
          });
          setLoadingText('Camera Connected!');
          setProgress(85);
        } catch (cameraError) {
          console.warn('Camera access denied or unavailable:', cameraError);
          setLoadingText('Camera access denied. Continuing...');
          setProgress(85);
          cameraStream = null;
        }

        setLoadingText('Preparing AI Engine...');
        setProgress(95);
        await new Promise(resolve => setTimeout(resolve, 300));

        setLoadingText('Ready!');
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 400));

        onComplete(cameraStream, detector);
      } catch (error) {
        console.error('Error loading models:', error);
        setTimeout(() => loadModels(), 2000);
      }
    };

    loadModels();

    // Cleanup function to stop camera if component unmounts before completion
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      // Don't dispose detector here as it's passed to WorkoutTrainerApp
    };
  }, [onComplete]);

  // Animated skeleton keypoints
  const skeletonPoints = [
    { id: 'head', cx: 200, cy: 60, r: 18 },
    { id: 'neck', cx: 200, cy: 95, r: 8 },
    { id: 'lShoulder', cx: 160, cy: 110, r: 10 },
    { id: 'rShoulder', cx: 240, cy: 110, r: 10 },
    { id: 'lElbow', cx: 130, cy: 150, r: 8 },
    { id: 'rElbow', cx: 270, cy: 150, r: 8 },
    { id: 'lWrist', cx: 110, cy: 190, r: 8 },
    { id: 'rWrist', cx: 290, cy: 190, r: 8 },
    { id: 'torso', cx: 200, cy: 160, r: 12 },
    { id: 'lHip', cx: 170, cy: 210, r: 10 },
    { id: 'rHip', cx: 230, cy: 210, r: 10 },
    { id: 'lKnee', cx: 165, cy: 270, r: 8 },
    { id: 'rKnee', cx: 235, cy: 270, r: 8 },
    { id: 'lAnkle', cx: 160, cy: 330, r: 8 },
    { id: 'rAnkle', cx: 240, cy: 330, r: 8 },
  ];

  const skeletonLines = [
    { from: 'head', to: 'neck' },
    { from: 'neck', to: 'lShoulder' },
    { from: 'neck', to: 'rShoulder' },
    { from: 'lShoulder', to: 'lElbow' },
    { from: 'rShoulder', to: 'rElbow' },
    { from: 'lElbow', to: 'lWrist' },
    { from: 'rElbow', to: 'rWrist' },
    { from: 'neck', to: 'torso' },
    { from: 'torso', to: 'lHip' },
    { from: 'torso', to: 'rHip' },
    { from: 'lHip', to: 'rHip' },
    { from: 'lHip', to: 'lKnee' },
    { from: 'rHip', to: 'rKnee' },
    { from: 'lKnee', to: 'lAnkle' },
    { from: 'rKnee', to: 'rAnkle' },
  ];

  const getPoint = (id: string) => skeletonPoints.find(p => p.id === id)!;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Light gradient background matching website theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
        {/* Background image with blur */}
        <div className="absolute inset-0">
          <img
            src="/assets/hero.png"
            alt="Background"
            className="w-full h-full object-cover"
            style={{ filter: 'blur(12px)', transform: 'scale(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-red-900/30 to-amber-900/40"></div>
          <div className="absolute inset-0 bg-white/60"></div>
        </div>

        {/* Floating blobs like landing page */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-200 to-amber-200 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-200 to-orange-200 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-amber-200 to-yellow-200 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-lg w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-lg rounded-2xl border border-orange-200 shadow-xl"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            AI Workout Trainer
          </span>
        </motion.div>

        {/* Animated skeleton figure */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 border border-orange-100 shadow-2xl">
            <svg width="320" height="300" viewBox="0 0 400 380" className="drop-shadow-lg">
              {/* Glow filter */}
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316">
                    <animate attributeName="stop-color" values="#f97316;#ef4444;#f97316" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#ef4444">
                    <animate attributeName="stop-color" values="#ef4444;#f97316;#ef4444" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>

              {/* Skeleton lines */}
              {skeletonLines.map((line, idx) => {
                const from = getPoint(line.from);
                const to = getPoint(line.to);
                return (
                  <motion.line
                    key={idx}
                    x1={from.cx}
                    y1={from.cy}
                    x2={to.cx}
                    y2={to.cy}
                    stroke="url(#skeletonGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                  />
                );
              })}

              {/* Skeleton points */}
              {skeletonPoints.map((point, idx) => (
                <motion.circle
                  key={point.id}
                  cx={point.cx}
                  cy={point.cy}
                  r={point.r}
                  fill="url(#skeletonGradient)"
                  filter="url(#glow)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: 1
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity, delay: idx * 0.1 },
                    opacity: { duration: 0.3, delay: idx * 0.03 }
                  }}
                />
              ))}

              {/* Scanning effect */}
              <motion.rect
                x="100"
                y="0"
                width="200"
                height="6"
                fill="url(#skeletonGradient)"
                opacity="0.4"
                rx="3"
                animate={{ y: [0, 380, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Progress section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-orange-100 shadow-xl"
        >
          {/* Loading text */}
          <motion.p
            key={loadingText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-gray-800 mb-4"
          >
            {loadingText}
          </motion.p>

          {/* Progress bar */}
          <div className="relative mb-3">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite'
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-semibold text-gray-500">Loading AI Models</span>
              <span className="text-xs font-bold text-orange-600">{progress}%</span>
            </div>
          </div>

          {/* Pulsing dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Powered by text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-sm text-gray-500 font-medium"
        >
          Powered by TensorFlow.js & MoveNet
        </motion.p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
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
        .animate-float { animation: float 15s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 18s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
