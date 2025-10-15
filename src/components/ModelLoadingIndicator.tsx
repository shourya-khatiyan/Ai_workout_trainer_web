import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

interface ModelLoadingIndicatorProps {
  message?: string;
}

const ModelLoadingIndicator: React.FC<ModelLoadingIndicatorProps> = ({
  message = 'Loading AI model...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-gray-100 shadow-lg">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="mb-6"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
          <Cpu className="h-8 w-8 text-white" />
        </div>
      </motion.div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {message}
      </h3>

      <p className="text-sm text-gray-600 text-center max-w-md mb-4">
        This may take a moment as we prepare the AI workout analysis tools.
      </p>

      <p className="text-xs text-gray-500 text-center">
        Please ensure your camera is connected and ready
      </p>

      {/* Animated loading dots */}
      <div className="flex space-x-2 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              y: [-4, 4, -4],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ModelLoadingIndicator;
