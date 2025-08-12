import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Code, CheckCircle, Award, Heart, Cpu } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
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
            About Us
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Our mission is to make professional-level fitness guidance accessible to everyone through cutting-edge AI technology.
          </motion.p>
        </div>
      </section>
      
      {/* Our Story Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12" data-aos="fade-right">
              <div className="relative">
                <div className="bg-black/50 rounded-lg overflow-hidden border border-gray-800 shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Team" 
                    className="rounded-lg w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-5 -left-5 bg-black/80 p-4 rounded-lg border border-gray-800 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-400">Our Team</p>
                      <p className="text-sm text-gray-400">Fitness & AI experts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2" data-aos="fade-left">
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Our Story</h3>
              <p className="text-gray-300 mb-6 text-lg">
                AI Workout Trainer was born from a simple observation: many people struggle with proper exercise form, leading to injuries and suboptimal results. Our team of fitness experts and AI engineers came together to solve this problem.
              </p>
              <p className="text-gray-300 mb-8 text-lg">
                Using advanced computer vision and machine learning, we've created a platform that provides real-time feedback on your workout form, just like having a personal trainer by your side. Our mission is to democratize access to professional fitness guidance and make it available to everyone, anywhere.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/30 p-5 rounded-lg border border-gray-800">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-3">
                      <Heart size={20} className="text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Our Mission</h4>
                  </div>
                  <p className="text-gray-400">
                    To make professional fitness guidance accessible to everyone through AI technology.
                  </p>
                </div>
                
                <div className="bg-black/30 p-5 rounded-lg border border-gray-800">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-3">
                      <Award size={20} className="text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white">Our Vision</h4>
                  </div>
                  <p className="text-gray-400">
                    To revolutionize how people exercise by providing AI-powered guidance for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Team Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0a0a14] to-black relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        
        {/* Glow effects */}
        <div className="absolute -top-40 left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Meet Our Team</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              A diverse group of experts passionate about fitness and technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:transform hover:scale-105" data-aos="fade-up" data-aos-delay="100">
              <img 
                src="https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Team Member" 
                className="w-full h-64 object-cover object-center"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1 text-white">Dr. Sarah Johnson</h3>
                <p className="text-purple-400 mb-4">Chief AI Scientist</p>
                <p className="text-gray-400">
                  With a Ph.D. in Computer Vision and 10+ years of experience in AI research, Sarah leads our AI development team.
                </p>
              </div>
            </div>
            
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:transform hover:scale-105" data-aos="fade-up" data-aos-delay="200">
              <img 
                src="https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Team Member" 
                className="w-full h-64 object-cover object-center"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1 text-white">Michael Chen</h3>
                <p className="text-purple-400 mb-4">Head of Fitness Science</p>
                <p className="text-gray-400">
                  A certified personal trainer with a Master's in Exercise Physiology, Michael ensures our AI provides accurate fitness guidance.
                </p>
              </div>
            </div>
            
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:transform hover:scale-105" data-aos="fade-up" data-aos-delay="300">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Team Member" 
                className="w-full h-64 object-cover object-center"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1 text-white">Emily Rodriguez</h3>
                <p className="text-purple-400 mb-4">UX/UI Designer</p>
                <p className="text-gray-400">
                  With expertise in creating intuitive user experiences, Emily ensures our platform is accessible and easy to use for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Our Values</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The principles that guide our work and shape our company culture
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Heart size={32} className="text-white" />,
                title: "Accessibility",
                description: "Making professional fitness guidance available to everyone, regardless of location or budget."
              },
              {
                icon: <Award size={32} className="text-white" />,
                title: "Excellence",
                description: "Striving for the highest quality in our technology, service, and user experience."
              },
              {
                icon: <Cpu size={32} className="text-white" />,
                title: "Innovation",
                description: "Continuously pushing the boundaries of what's possible with AI and fitness technology."
              },
              {
                icon: <Users size={32} className="text-white" />,
                title: "Community",
                description: "Building a supportive community of users who inspire and motivate each other."
              }
            ].map((value, index) => (
              <div 
                key={index} 
                className="bg-black/50 border border-gray-800 p-6 rounded-lg hover:border-purple-500/50 transition-all duration-300"
                data-aos="fade-up" 
                data-aos-delay={100 * index}
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{value.title}</h3>
                <p className="text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Join Our Community Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10" data-aos="zoom-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Join Our Community</h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Connect with like-minded fitness enthusiasts and be part of our growing community.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#" className="bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 px-8 rounded-md text-lg font-medium hover:from-purple-700 hover:to-blue-600 transition-all">
              Join Discord
            </a>
            <a href="#" className="bg-black/50 border border-purple-500/50 text-white py-3 px-8 rounded-md text-lg font-medium hover:bg-purple-500/10 transition-all">
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 