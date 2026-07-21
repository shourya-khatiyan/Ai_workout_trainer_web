import { useState, useCallback, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import WorkoutTrainerApp from './WorkoutTrainerApp';
import ModelPreloader from '../components/ModelPreloader';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface PreloadedAssets {
  cameraStream: MediaStream | null;
  detector: poseDetection.PoseDetector | null;
}

/**
 * wrapper page that preloads the ai model and camera,
 * then renders the main workout trainer app.
 * auth is handled by ProtectedRoute in App.tsx.
 */
const WorkoutTrainer = () => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [preloadedAssets, setPreloadedAssets] = useState<PreloadedAssets>({
    cameraStream: null,
    detector: null,
  });
  const assetsLoadedRef = useRef(false);

  useEffect(() => {
    document.title = 'AI Workout Trainer';
  }, []);

  const handleModelsLoaded = useCallback(
    (cameraStream: MediaStream | null, detector: poseDetection.PoseDetector | null) => {
      setPreloadedAssets({ cameraStream, detector });
      assetsLoadedRef.current = true;
      setTimeout(() => setIsModelLoading(false), 400);
    },
    []
  );

  if (isModelLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <ModelPreloader onComplete={handleModelsLoaded} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <div className="pt-16">
        <WorkoutTrainerApp
          preloadedCameraStream={preloadedAssets.cameraStream}
          preloadedDetector={preloadedAssets.detector}
        />
      </div>
    </div>
  );
};

export default WorkoutTrainer;
