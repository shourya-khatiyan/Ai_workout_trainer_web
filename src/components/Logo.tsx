import { Dumbbell } from 'lucide-react';

// simple logo component
export default function Logo() {
  return (
    <div className="flex items-center">
      <Dumbbell size={28} className="text-primary mr-2" />
      <span className="text-xl font-bold gradient-text neon-glow">AI Workout Trainer</span>
    </div>
  );
}