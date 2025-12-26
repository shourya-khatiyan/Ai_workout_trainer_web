import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WorkoutTrainerApp from './WorkoutTrainerApp';
import { useUser } from '../context/UserContext';
import ModelPreloader from '../components/ModelPreloader';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface PreloadedAssets {
  cameraStream: MediaStream | null;
  detector: poseDetection.PoseDetector | null;
}

const WorkoutTrainer: React.FC = () => {
  const { isLoggedIn, isLoading: isAuthLoading } = useUser();
  const navigate = useNavigate();
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [preloadedAssets, setPreloadedAssets] = useState<PreloadedAssets>({
    cameraStream: null,
    detector: null
  });

  // Track if loading is complete (waiting for both auth and models)
  const [isReadyToShow, setIsReadyToShow] = useState(false);
  const assetsLoadedRef = useRef(false);

  // Redirect to signin if not logged in (checked after auth loading completes)
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      navigate('/signin');
    }
    document.title = 'AI Workout Trainer';
  }, [isLoggedIn, isAuthLoading, navigate]);

  // When both auth is complete AND models are loaded, show the app
  useEffect(() => {
    if (!isAuthLoading && isLoggedIn && assetsLoadedRef.current) {
      setIsReadyToShow(true);
      setIsModelLoading(false);
    }
  }, [isAuthLoading, isLoggedIn]);

  // Called when models and camera finish loading
  const handleModelsLoaded = useCallback((cameraStream: MediaStream | null, detector: poseDetection.PoseDetector | null) => {
    setPreloadedAssets({ cameraStream, detector });
    assetsLoadedRef.current = true;

    // If auth is already complete and user is logged in, show the app
    if (!isAuthLoading && isLoggedIn) {
      setTimeout(() => {
        setIsReadyToShow(true);
        setIsModelLoading(false);
      }, 400);
    }
  }, [isAuthLoading, isLoggedIn]);

  // If not logged in and auth check is complete, return null (redirect will happen)
  if (!isAuthLoading && !isLoggedIn) {
    return null;
  }

  // Show ModelPreloader immediately - auth runs in parallel
  if (isModelLoading || !isReadyToShow) {
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

