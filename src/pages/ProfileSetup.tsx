import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Ruler, Weight, Target, Camera, ArrowRight, ArrowLeft, Check, Dumbbell } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function ProfileSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState<string>('');
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitnessLevel: '',
    fitnessGoal: '',
    bio: ''
  });
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  const totalSteps = 3;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Update user profile with all collected data
    updateUser({
      ...user,
      profileImage,
      age: parseInt(formData.age),
      gender: formData.gender,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      fitnessLevel: formData.fitnessLevel,
      fitnessGoal: formData.fitnessGoal,
      bio: formData.bio
    });
    navigate('/');
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profileImage && formData.age && formData.gender;
      case 2:
        return formData.height && formData.weight;
      case 3:
        return formData.fitnessLevel && formData.fitnessGoal;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Dumbbell className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
          </div>
          <p className="text-gray-600">Help us personalize your fitness experience</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-2 mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-semibold text-gray-600">
            <span>Basic Info</span>
            <span>Body Stats</span>
            <span>Fitness Goals</span>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-12"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-gray-900 mb-6">Basic Information</h2>

                {/* Profile Image Upload */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-12 w-12 text-blue-500" />
                      )}
                    </div>
                    <label
                      htmlFor="profileImage"
                      className="absolute bottom-0 right-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-110"
                    >
                      <Camera className="h-5 w-5 text-white" />
                      <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">Upload your profile picture</p>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                      placeholder="Enter your age"
                      min="13"
                      max="100"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Gender</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => handleInputChange('gender', gender)}
                        className={`py-3.5 px-4 rounded-xl font-semibold transition-all ${
                          formData.gender === gender
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Body Stats */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-gray-900 mb-6">Body Statistics</h2>

                {/* Height */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Height (cm)</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                      placeholder="Enter your height"
                      min="100"
                      max="250"
                    />
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Weight (kg)</label>
                  <div className="relative">
                    <Weight className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                      placeholder="Enter your weight"
                      min="30"
                      max="200"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Fitness Goals */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-black text-gray-900 mb-6">Fitness Goals</h2>

                {/* Fitness Level */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Current Fitness Level</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleInputChange('fitnessLevel', level)}
                        className={`py-3.5 px-6 rounded-xl font-semibold text-left transition-all ${
                          formData.fitnessLevel === level
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fitness Goal */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Primary Goal</label>
                  <div className="grid grid-cols-1 gap-3">
                    {['Weight Loss', 'Muscle Gain', 'General Fitness', 'Flexibility'].map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleInputChange('fitnessGoal', goal)}
                        className={`py-3.5 px-6 rounded-xl font-semibold text-left transition-all ${
                          formData.fitnessGoal === goal
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bio (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Bio <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none resize-none"
                    placeholder="Tell us about your fitness journey..."
                    rows={4}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <span>Next</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!isStepValid()}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <Check className="h-5 w-5" />
                <span>Complete Profile</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Skip Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 font-semibold transition-colors"
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    </div>
  );
}
