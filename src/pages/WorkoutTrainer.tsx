import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WorkoutTrainerApp from './WorkoutTrainerApp';
import { useUser } from '../context/UserContext';
import ModelPreloader from '../components/ModelPreloader';

const WorkoutTrainer: React.FC = () => {
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // redirect to signin if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin');
    }
    document.title = 'AI Workout Trainer';
  }, [isLoggedIn, navigate]);

  // called when models finish loading
  const handleModelsLoaded = () => {
    setModelsLoaded(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      {isLoading ? (
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
