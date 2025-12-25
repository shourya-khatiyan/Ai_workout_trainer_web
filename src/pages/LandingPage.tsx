import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useUser } from '../context/UserContext';
import {
  TrendingUp,
  Flame,
  Clock,
  Target,
  Trophy,
  BarChart3,
  Play,
  ChevronRight,
  CalendarDays,
  Dumbbell,
  Activity,
  Zap,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';

type Maybe<T> = T | undefined | null;

// simple card component
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = '', children }) => (
  <div className={`bg-white border border-orange-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
    {children}
  </div>
);

// stat display component
const Stat: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode; trend?: string }> = ({
  label,
  value,
  icon,
  trend
}) => (
  <div className="flex items-center justify-between p-5 bg-gradient-to-br from-white to-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 transition-all duration-300">
    <div className="flex-1">
      <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">{label}</span>
      <span className="block text-2xl font-bold text-gray-900">{value}</span>
      {trend && (
        <span className="block text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> {trend}
        </span>
      )}
    </div>
    {icon ? <div className="text-orange-500 opacity-80">{icon}</div> : null}
  </div>
);

// day dot for streak calendar
const DayDot: React.FC<{ active?: boolean; index: number }> = ({ active, index }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`h-10 w-10 rounded-xl border-2 text-sm font-bold flex items-center justify-center transition-all duration-300
          ${active
            ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white border-orange-600 shadow-md scale-110'
            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
        aria-label={active ? 'Workout day' : 'Rest day'}
        role="img"
      >
        {active ? <CheckCircle2 className="h-5 w-5" /> : days[index]}
      </div>
      <span className="text-xs text-gray-500 font-medium">{days[index]}</span>
    </div>
  );
};

// cool spotlight effect on the title text
const SpotlightText: React.FC<{ children: string }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block cursor-pointer select-none"
    >
      <h1
        className="font-black text-gray-900"
        style={{
          fontSize: 'clamp(2rem, 8vw, 5rem)',
          lineHeight: '1.1',
        }}
      >
        {children}
      </h1>

      {isHovering && (
        <div
          className="absolute pointer-events-none blur-3xl"
          style={{
            top: `${mousePos.y}%`,
            left: `${mousePos.x}%`,
            width: '400px',
            height: '400px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, rgba(239, 68, 68, 0.3) 40%, transparent 70%)',
            transition: 'top 0.15s ease-out, left 0.15s ease-out',
            opacity: 0.6,
          }}
        />
      )}
    </div>
  );
};

// helper functions
const formatCm = (v: Maybe<number>) => (typeof v === 'number' ? `${v} cm` : 'Not set');
const formatKg = (v: Maybe<number>) => (typeof v === 'number' ? `${v} kg` : 'Not set');
const safe = <T,>(v: Maybe<T>, fallback: T) => (v ?? fallback);

const LandingPage: React.FC = () => {
  const { isLoggedIn, user } = useUser?.() ?? { isLoggedIn: false, user: {} as any };

  // get user stats with fallbacks
  const level = safe<number>(user?.level, 1);
  const experience = safe<number>(user?.experience, 0);
  const xpToNext = 100 - (experience % 100);
  const age = user?.age ?? 'Not set';
  const gender = user?.gender ?? 'Not set';
  const height = formatCm(user?.height);
  const weight = formatKg(user?.weight);
  const hip = typeof user?.hipSize === 'number' ? `${user.hipSize} cm` : 'N/A';
  const chest = typeof user?.chestSize === 'number' ? `${user.chestSize} cm` : 'N/A';
  const neck = typeof user?.neckSize === 'number' ? `${user.neckSize} cm` : 'N/A';

  const streak = safe<number>(user?.streak?.current, 0);
  const totalWorkouts = safe<number>(user?.stats?.totalWorkouts, 0);
  const avgAccuracy = safe<number>(user?.stats?.averageAccuracy, 0);
  const totalTimeHours = safe<number>(user?.stats?.totalTimeHours, 0);
  const mostPracticed = safe<string>(user?.stats?.mostPracticed, 'None yet');
  const mostPracticedSessions = safe<number>(user?.stats?.mostPracticedSessions, 0);
  const badges = user?.badges || [];

  const streakDays = Array.from({ length: 7 }, (_, i) => i < streak).reverse();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white text-gray-900">
        {/* hero section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* background image */}
          <div className="absolute inset-0">
            <img
              src="/assets/hero.png"
              alt="Workout background"
              className="w-full h-full object-cover"
              style={{ filter: 'blur(4px)', transform: 'scale(1.1)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-red-900/30 to-amber-900/40"></div>
            <div className="absolute inset-0 bg-white/60"></div>
          </div>

          {/* gradient overlay with floating blobs */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-amber-50/70 to-red-50/80">
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
              <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-100 to-orange-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-delayed"></div>
              <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
            </div>
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
            <div className="absolute inset-0 bg-light-vignette"></div>
          </div>

          {/* hero content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-full border border-orange-200 shadow-lg">
              <Zap className="h-4 w-4 text-orange-600 animate-pulse" />
              <span className="text-gray-700 font-semibold text-xs tracking-wide">AI-Powered Form Analysis</span>
            </div>

            <div className="mb-6 space-y-2">
              <SpotlightText>AI Workout</SpotlightText>
              <SpotlightText>Trainer</SpotlightText>
            </div>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Real-time pose detection, instant feedback, and personalized coaching--powered by advanced machine learning.
            </p>

            <div className="mb-12">
              <Link
                to={isLoggedIn ? '/trainer' : '/signin'}
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base hover:from-orange-600 hover:to-red-600 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {isLoggedIn ? 'Start Training Now' : 'Get Started Free'}
              </Link>
            </div>

            <div className="animate-bounce">
              <ArrowDown className="h-6 w-6 text-gray-400 mx-auto" />
              <p className="text-gray-500 text-xs mt-1 font-medium">Scroll to see your progress</p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        {/* dashboard section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Your Training Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your progress, maintain streaks, and achieve your fitness goals with data-driven insights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* profile summary */}
            <section className="lg:col-span-1">
              <Card>
                <div className="p-6 border-b border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                      <Dumbbell className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Level {level} Athlete
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-500"
                            style={{ width: `${((100 - xpToNext) / 100) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{xpToNext} XP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" /> Basic Info
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <Stat label="Age" value={age} />
                      <Stat label="Gender" value={gender} />
                      <Stat label="Height" value={height} />
                      <Stat label="Weight" value={weight} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Body Measurements
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Stat label="Hip" value={hip} />
                      <Stat label="Chest" value={chest} />
                      <Stat label="Neck" value={neck} />
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* analytics grid */}
            <section className="lg:col-span-2 space-y-8">
              {/* streak card */}
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-orange-600 font-bold mb-1">Current Streak</p>
                      <p className="text-4xl font-black text-gray-900 flex items-center gap-3">
                        <Flame className="h-10 w-10 text-orange-500" />
                        {streak} Days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Keep it up!</p>
                      <p className="text-xs text-green-600 font-semibold">+15% this week</p>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    {streakDays.map((active, idx) => (
                      <DayDot key={idx} active={active} index={idx} />
                    ))}
                  </div>
                </div>
              </Card>

              {/* stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6 space-y-4">
                    <Stat
                      label="Total Workouts"
                      value={totalWorkouts}
                      icon={<CalendarDays className="h-6 w-6" />}
                      trend="+3 this week"
                    />
                    <Stat
                      label="Most Practiced"
                      value={
                        <div>
                          <p className="text-xl font-bold">{mostPracticed}</p>
                          <p className="text-xs text-gray-500">{mostPracticedSessions} sessions</p>
                        </div>
                      }
                      icon={<Activity className="h-6 w-6" />}
                    />
                  </div>
                </Card>

                <Card>
                  <div className="p-6 space-y-4">
                    <Stat
                      label="Avg Accuracy"
                      value={`${avgAccuracy}%`}
                      icon={<Target className="h-6 w-6" />}
                      trend="+5% improvement"
                    />
                    <Stat
                      label="Total Time"
                      value={`${totalTimeHours}h`}
                      icon={<Clock className="h-6 w-6" />}
                    />
                  </div>
                </Card>
              </div>

              {/* achievements and insights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs uppercase tracking-wider text-amber-600 font-bold flex items-center gap-2">
                        <Trophy className="h-4 w-4" /> Achievements
                      </p>
                      <Trophy className="h-6 w-6 text-amber-500" />
                    </div>
                    <ul className="space-y-3">
                      {badges.length > 0 ? (
                        badges.slice(0, 3).map((badge, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                            <span className="mt-1 h-3 w-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-md" />
                            <div>
                              <p className="text-sm font-bold text-gray-900">{badge}</p>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="text-center py-4 text-gray-500 text-sm">
                          Complete workouts to earn badges!
                        </li>
                      )}
                    </ul>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs uppercase tracking-wider text-gray-600 font-bold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Quick Insights
                      </p>
                      <BarChart3 className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                        <p className="text-xs text-gray-600 font-semibold">Last Session</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">Accuracy • {avgAccuracy}%</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                        <p className="text-xs text-gray-600 font-semibold">Current Focus</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{mostPracticed}</p>
                      </div>
                    </div>
                    <Link
                      to="/trainer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 hover:gap-3 transition-all"
                    >
                      View detailed analytics <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              </div>

              {/* cta card */}
              <Card className="bg-gradient-to-r from-orange-500 to-red-600 border-0">
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to train smarter?</h3>
                  <p className="text-orange-100 mb-6">Start your next session with AI-powered guidance</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      to="/trainer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-orange-700 font-bold hover:scale-105 transition-transform shadow-xl"
                    >
                      <Play className="h-5 w-5" /> Start Training
                    </Link>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </main>

        {/* footer */}
        <footer className="border-t border-orange-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} AI Workout Trainer. Powered by TensorFlow.js & MoveNet.</p>
          </div>
        </footer>

        {/* css animations */}
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
    </>
  );
};

export default LandingPage;
