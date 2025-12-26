import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Dumbbell, AlertTriangle, RefreshCw } from 'lucide-react';

const NotFound: React.FC = () => {
    const location = useLocation();
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Glitch text animation variants
    const glitchVariants = {
        animate: {
            x: [0, -2, 2, -2, 0],
            transition: {
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 3,
            },
        },
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background image - same as landing page hero */}
            <div className="absolute inset-0">
                <img
                    src="/assets/hero.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                    style={{ filter: 'blur(4px)', transform: 'scale(1.1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-red-900/30 to-amber-900/40"></div>
                <div className="absolute inset-0 bg-white/60"></div>
            </div>

            {/* Gradient overlay with floating blobs - same as landing page */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-amber-50/70 to-red-50/80">
                <div className="absolute inset-0 opacity-15">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
                    <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-100 to-orange-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
                    <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
                </div>
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
                <div className="absolute inset-0 bg-light-vignette"></div>
            </div>

            {/* Mouse-following spotlight */}
            <div
                className="absolute pointer-events-none blur-3xl opacity-30"
                style={{
                    top: mousePos.y - 200,
                    left: mousePos.x - 200,
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(249, 115, 22, 0.5) 0%, rgba(239, 68, 68, 0.3) 40%, transparent 70%)',
                    transition: 'top 0.1s ease-out, left 0.1s ease-out',
                }}
            ></div>

            {/* Main content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
                {/* Animated dumbbell icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="h-24 w-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl"
                        >
                            <Dumbbell className="h-12 w-12 text-white" />
                        </motion.div>
                        {/* Warning badge */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg"
                        >
                            <AlertTriangle className="h-4 w-4 text-white" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* 404 text with glitch effect */}
                <motion.div
                    variants={glitchVariants}
                    animate="animate"
                    className="relative mb-4"
                >
                    <h1 className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent select-none">
                        404
                    </h1>
                    {/* Glitch layers */}
                    <h1
                        className="absolute inset-0 text-8xl sm:text-9xl font-black text-orange-500/20 select-none"
                        style={{ transform: 'translate(-2px, 2px)' }}
                    >
                        404
                    </h1>
                    <h1
                        className="absolute inset-0 text-8xl sm:text-9xl font-black text-red-500/20 select-none"
                        style={{ transform: 'translate(2px, -2px)' }}
                    >
                        404
                    </h1>
                </motion.div>

                {/* Error message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto text-lg">
                        Looks like this workout route doesn't exist. Maybe it's still warming up?
                    </p>
                </motion.div>

                {/* Attempted path display */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10 px-6 py-3 bg-white/80 backdrop-blur-md rounded-xl border border-orange-200 shadow-lg"
                >
                    <div className="flex items-center gap-3 text-sm">
                        <Search className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-500">Requested:</span>
                        <code className="font-mono text-orange-600 bg-orange-100 px-2 py-1 rounded">
                            {location.pathname}
                        </code>
                    </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center gap-4"
                >
                    <Link
                        to="/"
                        className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base hover:from-orange-600 hover:to-red-600 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                    >
                        <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        Back to Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-gray-700 font-bold text-base border border-orange-200 hover:border-orange-400 hover:bg-orange-50 hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Go Back
                    </button>
                </motion.div>

                {/* Fun animated section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 flex items-center gap-4 text-gray-500"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                        <RefreshCw className="h-5 w-5" />
                    </motion.div>
                    <span className="text-sm font-medium">
                        Looking for exercises? They're on the <Link to="/trainer" className="text-orange-600 hover:underline font-bold">trainer page</Link>!
                    </span>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-xs text-gray-400">
                    AI Workout Trainer • Powered by TensorFlow.js & MoveNet
                </p>
            </div>

            {/* CSS animations */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -80px) scale(1.1); }
          66% { transform: translate(-40px, 60px) scale(0.95); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-60px, 70px) scale(1.05); }
          66% { transform: translate(50px, -50px) scale(0.9); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.08); }
        }
        .animate-float { animation: float 15s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 18s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 20s ease-in-out infinite; }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(100, 100, 100, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 100, 100, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .bg-light-vignette {
          background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.02) 100%);
        }
      `}</style>
        </div>
    );
};

export default NotFound;
