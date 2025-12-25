import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WorkoutTrainerApp from './WorkoutTrainerApp';
import { useUser } from '../context/UserContext';
import ModelPreloader from '../components/ModelPreloader';

const WorkoutTrainer: React.FC = () => {
  const { isLoggedIn, isLoading: isAuthLoading } = useUser();
  const navigate = useNavigate();
  const [isModelLoading, setIsModelLoading] = useState(true);

  // redirect to signin if not logged in (only after auth check is complete)
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      navigate('/signin');
    }
    document.title = 'AI Workout Trainer';
  }, [isLoggedIn, isAuthLoading, navigate]);

  // called when models finish loading
  const handleModelsLoaded = () => {
    setTimeout(() => {
      setIsModelLoading(false);
    }, 500);
  };

  // Show nothing while checking auth state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <ModelPreloader onComplete={() => { }} />
      </div>
    );
  }

  // If not logged in, don't render anything (redirect will happen)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      {isModelLoading ? (
        <div className="flex items-center justify-center min-h-[80vh] pt-20">
          <ModelPreloader onComplete={handleModelsLoaded} />
        </div>
      ) : (
        <div className="pt-16">
          <WorkoutTrainerApp />
        </div>
      )}
    </div>
  );
};

export default WorkoutTrainer;

