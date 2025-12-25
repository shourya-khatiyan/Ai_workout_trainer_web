import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, Ruler, Weight, Grape as Tape, Dumbbell, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';

// Multi-step form for collecting body measurements
export default function BodyCalibration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    hipSize: '',
    chestSize: '',
    neckSize: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useUser();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  // Save all measurements and redirect to home
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateUser({
        age: parseInt(formData.age),
        gender: formData.gender === 'prefer-not-to-say' ? 'prefer_not_to_say' : formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        hipSize: formData.hipSize ? parseFloat(formData.hipSize) : undefined,
        chestSize: formData.chestSize ? parseFloat(formData.chestSize) : undefined,
        neckSize: formData.neckSize ? parseFloat(formData.neckSize) : undefined
      });

      navigate('/');
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-black text-gray-900 mb-6">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="age" className="block text-sm font-bold text-gray-900 mb-2">
                  Age
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="age"
                    id="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: option.value }))}
                      className={`py-3 px-4 rounded-xl font-semibold transition-all ${formData.gender === option.value
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.age || !formData.gender}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-black text-gray-900 mb-6">Body Measurements</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="height" className="block text-sm font-bold text-gray-900 mb-2">
                  Height (cm)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="height"
                    id="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="Enter your height in cm"
                    min="50"
                    max="250"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-bold text-gray-900 mb-2">
                  Weight (kg)
                </label>
                <div className="relative">
                  <Weight className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="Enter your weight in kg"
                    min="20"
                    max="300"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  <ArrowLeft className="h-5 w-5" /> Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.height || !formData.weight}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-black text-gray-900 mb-2">Additional Measurements</h3>
            <p className="text-gray-600 text-sm mb-6">
              These measurements help us provide more accurate pose estimation and feedback. (Optional)
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="hipSize" className="block text-sm font-bold text-gray-900 mb-2">
                  Hip Size (cm)
                </label>
                <div className="relative">
                  <Tape className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="hipSize"
                    id="hipSize"
                    value={formData.hipSize}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="Enter your hip size in cm"
                    min="50"
                    max="200"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="chestSize" className="block text-sm font-bold text-gray-900 mb-2">
                  Chest Size (cm)
                </label>
                <div className="relative">
                  <Tape className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="chestSize"
                    id="chestSize"
                    value={formData.chestSize}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="Enter your chest size in cm"
                    min="50"
                    max="200"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="neckSize" className="block text-sm font-bold text-gray-900 mb-2">
                  Neck Size (cm)
                </label>
                <div className="relative">
                  <Tape className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="neckSize"
                    id="neckSize"
                    value={formData.neckSize}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all outline-none"
                    placeholder="Enter your neck size in cm"
                    min="20"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  <ArrowLeft className="h-5 w-5" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" /> Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Floating background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Body Calibration
          </h1>
        </div>
        <p className="text-center text-gray-600">
          Help us personalize your workout experience
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-gray-100">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${step >= s
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-400'
                      }`}
                  >
                    {step > s ? <Check className="h-5 w-5" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-2 mx-2 rounded-full transition-all duration-300 ${step > s ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gray-200'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>Basic Info</span>
              <span>Measurements</span>
              <span>Additional</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
        </div>
      </div>

      <div className="mt-8 text-center relative z-10">
        <p className="text-sm text-gray-600">
          Your data is securely stored and will only be used to improve your workout experience.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}