import { Dumbbell } from 'lucide-react';

/**
 * app logo with dumbbell icon and gradient title.
 */
export default function Logo() {
  return (
    <div className="flex items-center">
      <Dumbbell size={28} className="text-orange-500 mr-2" />
      <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        AI Workout Trainer
      </span>
    </div>
  );
}
