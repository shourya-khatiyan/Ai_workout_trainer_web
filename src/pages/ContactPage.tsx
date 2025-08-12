import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate form submission
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate for demo
        setFormStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setFormStatus('error');
        setErrorMessage('There was an error submitting your message. Please try again later.');
      }
    }, 1500);
  };

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
            Contact Us
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Have questions or feedback? We'd love to hear from you. Get in touch with our team.
          </motion.p>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-black/50 border border-gray-800 p-8 rounded-lg shadow-xl" data-aos="fade-right">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Send Us a Message</h2>
              
              {formStatus === 'success' ? (
                <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 text-center">
                  <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-300">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <button 
                    onClick={() => setFormStatus('idle')}
                    className="mt-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 px-6 rounded-md font-medium hover:from-purple-700 hover:to-blue-600 transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {formStatus === 'error' && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start">
                      <AlertCircle size={20} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-red-200">{errorMessage}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-300 mb-2">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-black/30 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-300 mb-2">Your Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-black/30 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-gray-300 mb-2">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-black/30 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="" disabled>Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-300 mb-2">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full bg-black/30 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className={`w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center transition-all ${
                      formStatus === 'submitting' 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:from-purple-700 hover:to-blue-600'
                    }`}
                  >
                    {formStatus === 'submitting' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
            
            {/* Contact Information */}
            <div data-aos="fade-left">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Get in Touch</h2>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
                    <p className="text-gray-400 mb-1">For general inquiries:</p>
                    <a href="mailto:info@aiworkouttrainer.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                      info@aiworkouttrainer.com
                    </a>
                    <p className="text-gray-400 mt-2 mb-1">For technical support:</p>
                    <a href="mailto:support@aiworkouttrainer.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                      support@aiworkouttrainer.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-4 flex-shrink-0">
                    <Phone size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Call Us</h3>
                    <p className="text-gray-400 mb-1">Customer Service:</p>
                    <a href="tel:+1-800-123-4567" className="text-purple-400 hover:text-purple-300 transition-colors">
                      +1 (800) 123-4567
                    </a>
                    <p className="text-gray-400 mt-2 mb-1">Business Hours:</p>
                    <p className="text-white">Monday - Friday: 9AM - 6PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Visit Us</h3>
                    <p className="text-gray-400 mb-1">Headquarters:</p>
                    <address className="text-white not-italic">
                      123 AI Innovation Center<br />
                      Tech District, San Francisco<br />
                      CA 94105, United States
                    </address>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mr-4 flex-shrink-0">
                    <MessageSquare size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Live Chat</h3>
                    <p className="text-gray-400 mb-3">
                      Need immediate assistance? Chat with our support team.
                    </p>
                    <button className="bg-black/50 border border-purple-500/50 text-white py-2 px-6 rounded-md font-medium hover:bg-purple-500/10 transition-all flex items-center">
                      <MessageSquare size={18} className="mr-2" />
                      Start Live Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0a0a14] to-black relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        
        {/* Glow effects */}
        <div className="absolute -top-40 left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "How accurate is the AI pose detection?",
                answer: "Our AI pose detection system achieves over 90% accuracy in ideal conditions. The system uses MoveNet, a state-of-the-art pose detection model, and continuously improves through machine learning."
              },
              {
                question: "Do I need special equipment to use the platform?",
                answer: "No special equipment is needed. All you need is a device with a camera (laptop, tablet, or smartphone) and a stable internet connection. The platform works best when your full body is visible to the camera."
              },
              {
                question: "Is my workout data private and secure?",
                answer: "Yes, we take privacy very seriously. Your workout data and videos are encrypted and never shared with third parties. You can delete your data at any time from your account settings."
              },
              {
                question: "Can I use the platform offline?",
                answer: "Currently, an internet connection is required to use the full features of our platform. However, we're working on an offline mode for basic functionality that will be available in a future update."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with our service. Please contact our support team to process your refund."
              },
              {
                question: "How do I cancel my subscription?",
                answer: "You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-black/50 border border-gray-800 p-6 rounded-lg hover:border-purple-500/50 transition-all duration-300"
                data-aos="fade-up" 
                data-aos-delay={100 * (index % 2)}
              >
                <h3 className="text-xl font-bold mb-3 text-white">{faq.question}</h3>
                <p className="text-gray-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 