import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';

/**
 * animated splash screen shown while the app initializes.
 * displays a dumbbell logo with orbiting dots and pulsing rings.
 */
export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src="/assets/hero.png"
          alt="Background"
          className="w-full h-full object-cover"
          style={{ filter: 'blur(4px)', transform: 'scale(1.1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-red-900/30 to-amber-900/40" />
        <div className="absolute inset-0 bg-white/60" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-amber-50/70 to-red-50/80">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-100 to-orange-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed" />
          <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow" />
        </div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute inset-0 bg-light-vignette" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        <div className="relative">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${
                  ['#ea995fff', '#e95454ff', '#ebd293ff', '#f1864cff'][i]
                }, ${
                  ['#ea580c', '#dc2626', '#edc98bff', '#c2410c'][i]
                })`,
                boxShadow: `0 0 20px ${
                  ['rgba(249,115,22,0.5)', 'rgba(239,68,68,0.5)', 'rgba(251,191,36,0.5)', 'rgba(234,88,12,0.5)'][i]
                }`,
              }}
              animate={{
                x: [0, 1, 2, 3].map((j) => Math.cos((i * Math.PI) / 2 + (j * Math.PI) / 2) * 60 - 6),
                y: [0, 1, 2, 3].map((j) => Math.sin((i * Math.PI) / 2 + (j * Math.PI) / 2) * 60 - 6),
                scale: [1, 1.2, 1, 0.8, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
            />
          ))}

          <motion.div
            className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-300"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-200"
            animate={{ scale: [1.1, 1.3, 1.1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10 h-24 w-24 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
            >
              <Dumbbell className="h-12 w-12 text-white" />
            </motion.div>
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-3xl font-black bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 bg-clip-text text-transparent"
        >
          AI Workout Trainer
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
              animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-xs text-gray-400 font-medium"
        >
          Powered by TensorFlow.js & MoveNet
        </motion.p>
      </div>
    </motion.div>
  );
}
