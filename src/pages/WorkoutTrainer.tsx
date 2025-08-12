import React, { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin');
    }
    document.title = 'AI Workout Trainer';
  }, [isLoggedIn, navigate]);

  const handleModelsLoaded = () => {
    setModelsLoaded(true);
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black relative overflow-hidden">
      {/* Background grid pattern */}
      {/* <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0"></div> */}
      
      {/* Glow effects */}
      {/* <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] opacity-20 z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[128px] opacity-20 z-0"></div> */}
      
      <Navbar />
      
      {isLoading && (
        <ModelPreloader onComplete={handleModelsLoaded} />
      )}
      
      {!isLoading && (
        <div className="flex-1 flex flex-col z-10 pt-16">
          <WorkoutTrainerApp />
        </div>
      )}
    </div>
  );
}

export default WorkoutTrainer;