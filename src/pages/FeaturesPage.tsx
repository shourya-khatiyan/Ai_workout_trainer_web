import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, Zap, CheckCircle, Dumbbell } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FeaturesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Initialize AOS
    import('aos').then(AOS => {
      import('aos/dist/aos.css');
      AOS.init({
        duration: 1000,
        once: false,
        mirror: true
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Page Header */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0a0a14]"></div>
        
        {/* Subtle background elements */}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[150px] opacity-10 z-0"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-blue-500 rounded-full filter blur-[120px] opacity-10 z-0"></div>
        
        <div className="container mx-auto z-10 relative">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-500 to-blue-400 bg-clip-text text-transparent text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Key Features
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Discover how our AI-powered platform revolutionizes your workout experience with cutting-edge technology and personalized guidance.
          </motion.p>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/50 border border-gray-800 p-8 rounded-lg hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105" data-aos="fade-up" data-aos-delay="100">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-6">
                <Activity size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Real-time Pose Estimation</h3>
              <p className="text-gray-400 text-lg">
                Advanced AI algorithms detect and track your body movements with precision to provide instant feedback on your form and technique.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">17-point skeletal tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">60+ FPS analysis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">Works with any webcam</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-black/50 border border-gray-800 p-8 rounded-lg hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105" data-aos="fade-up" data-aos-delay="200">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-6">
                <Brain size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Personalized Feedback</h3>
              <p className="text-gray-400 text-lg">
                Get customized recommendations based on your body measurements, fitness goals, and real-time performance data.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">Adaptive learning algorithms</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">Progress tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">Goal-based recommendations</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-black/50 border border-gray-800 p-8 rounded-lg hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105" data-aos="fade-up" data-aos-delay="300">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-6">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Form Correction</h3>
              <p className="text-gray-400 text-lg">
                Immediate alerts when your form needs adjustment to prevent injuries and maximize results from every workout.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">Joint angle measurement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">Posture alignment checks</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={20} className="text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">Real-time correction guidance</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1" data-aos="fade-right">
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Advanced Workout Analysis</h3>
              <p className="text-gray-300 mb-8 text-lg">
                Our AI-powered system analyzes your movements in real-time, providing instant feedback to help you perfect your form and maximize your workout efficiency.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Joint angle measurement for precise form analysis",
                  "Posture correction to prevent injuries",
                  "Rep counting with proper form validation",
                  "Personalized workout recommendations",
                  "Progress tracking and performance analytics",
                  "Customizable workout plans"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle size={24} className="text-purple-400 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="order-1 lg:order-2" data-aos="fade-left">
              <div className="relative">
                <div className="bg-black/50 rounded-lg overflow-hidden border border-gray-800 shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Workout Analysis" 
                    className="w-full h-auto rounded-lg"
                  />
                </div>
                
                <div className="absolute -bottom-5 -right-5 bg-black/80 p-4 rounded-lg border border-gray-800 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                      <Dumbbell size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-400">92% Accuracy</p>
                      <p className="text-sm text-gray-400">Perfect form achieved</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 