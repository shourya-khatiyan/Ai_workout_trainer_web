# AI Workout Trainer - Developer Manual

## Project Overview

AI Workout Trainer is a React-based web application that uses TensorFlow.js and MoveNet pose detection to provide real-time exercise form analysis. The application compares user poses against trainer videos and provides instant feedback.

For detailed implementation guides on major features, see [IMPLEMENTATION_MANUAL.md](./IMPLEMENTATION_MANUAL.md).

---

## Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend Framework** | React 18 with TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + Custom CSS |
| **Routing** | React Router DOM v6 |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **AI/ML** | TensorFlow.js + MoveNet |
| **Webcam** | react-webcam |
| **Backend** | Supabase (Auth + DB) |

---

## Project Structure

```
project/
├── src/
│   ├── components/          # reusable ui components
│   │   ├── LoadingTransition.tsx   # page transition animations
│   │   ├── Logo.tsx                # app logo component
│   │   ├── ModelLoadingIndicator.tsx # small loading spinner
│   │   ├── ModelPreloader.tsx      # ai model preloading screen
│   │   ├── Navbar.tsx              # navigation bar
│   │   ├── VideoPlayer.tsx         # custom video player
│   │   └── VideoPlayer.css         # video player styles
│   │
│   ├── context/             # react context providers
│   │   ├── ThemeContext.tsx        # dark/light theme
│   │   └── UserContext.tsx         # auth and user data
│   │
│   ├── pages/               # page components
│   │   ├── BodyCalibration.tsx     # body measurement entry
│   │   ├── LandingPage.tsx         # homepage
│   │   ├── NotFound.tsx            # 404 error page
│   │   ├── Profile.tsx             # user profile page
│   │   ├── ProfileSetup.tsx        # initial profile setup
│   │   ├── SignIn.tsx              # login page
│   │   ├── SignUp.tsx              # registration page
│   │   ├── WorkoutTrainer.tsx      # trainer wrapper (preloading)
│   │   ├── WorkoutTrainerApp.tsx   # main trainer application
│   │   └── WorkoutTrainerApp.css   # trainer styles
│   │
│   ├── services/            # business logic services
│   │   ├── authService.ts          # supabase auth and profiles
│   │   ├── gamificationService.ts  # xp, levels, badges, streaks
│   │   ├── supabase.ts             # client initialization
│   │   └── voiceFeedbackService.ts # speech synthesis
│   │
│   ├── utils/               # utility functions
│   │   ├── index.ts                # barrel export
│   │   ├── modelUtils.ts           # tensorflow initialization
│   │   ├── navigationUtils.ts      # navigation helpers
│   │   ├── poseUtils.ts            # angle and accuracy calculations
│   │   └── segmentAnalyzer.ts      # video segment analysis
│   │
│   ├── types/               # typescript definitions
│   │   └── index.ts
│   │
│   ├── App.tsx              # main app with routing
│   ├── main.tsx             # entry point
│   ├── index.css            # global styles
│   └── vite-env.d.ts
│
├── public/
│   └── assets/              # static assets (images)
│
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# clone the repository
git clone https://github.com/shourya-khatiyan/Ai_workout_trainer_web.git

# navigate to project
cd project

# install dependencies
npm install

# start development server
npm run dev
```

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on localhost:5173 |
| `npm run build` | Build production bundle to /dist |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

---

## Core Architecture

### App Component (App.tsx)

The main app handles:
- Initial loading animation
- Route configuration
- Context providers wrapping

```tsx
// routing structure
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/signin" element={<SignIn />} />
  <Route path="/signup" element={<SignUp />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/profile-setup" element={<ProfileSetup />} />
  <Route path="/trainer" element={<WorkoutTrainer />} />
  <Route path="/calibration" element={<BodyCalibration />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Context Providers

#### UserContext

Manages user authentication and profile data:

```tsx
interface UserContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  updateStreak: (streak: Partial<UserStreak>) => void;
  completeWorkout: (accuracy: number, duration: number, exercise: string) => Promise<void>;
}
```

**Usage:**
```tsx
const { user, isLoggedIn, completeWorkout } = useUser();
```

### ThemeContext

Manages dark/light theme toggle:

```tsx
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}
```

---

## Backend Architecture

### Supabase Integration

The application uses Supabase for authentication and data persistence. The client is initialized in `src/services/supabase.ts`.

### Database Schema

#### `profiles` Table

Stores user data, stats, and progression.

```typescript
interface Profile {
  id: string;               // references auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  
  // physical stats
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  
  // body calibration
  hip_size: number | null;
  chest_size: number | null;
  neck_size: number | null;
  arm_length: number | null;
  leg_length: number | null;
  
  // gamification
  level: number;
  experience: number;
  badges: string[];
  
  // streaks
  streak_current: number;
  streak_longest: number;
  last_workout_date: string | null;
  
  // workout stats
  total_workouts: number;
  average_accuracy: number;
  total_time_hours: number;
  most_practiced: string | null;
  most_practiced_sessions: number;
  
  // timestamps
  created_at: string;
  updated_at: string | null;
}
```

#### `workout_sessions` Table

Logs individual workout history.

```typescript
interface WorkoutSession {
  id: string;
  user_id: string;
  exercise_name: string;
  duration_minutes: number;
  accuracy: number;
  created_at: string;
}
```

### Authentication Flow

1. **Sign Up**: `authService.signUp` creates auth user + `profiles` row
2. **Session**: `UserContext` listens to `onAuthStateChange`
3. **Protection**: Protected routes check `useUser().isLoggedIn`

---

## Services Reference

### authService.ts

Handles authentication and profile management.

| Function | Description |
|----------|-------------|
| `signUp(email, password, fullName)` | Register new user |
| `signIn(email, password)` | Login existing user |
| `signOut()` | Logout current user |
| `getSession()` | Get current session |
| `getCurrentUser()` | Get current user |
| `getProfile(userId)` | Fetch user profile |
| `updateProfile(userId, updates)` | Update profile fields |
| `updateWorkoutStats(userId, accuracy, duration, exercise)` | Update after workout |
| `getWorkoutHistory(userId, limit)` | Get workout history |

### gamificationService.ts

Handles XP, levels, badges, and streaks.

| Function | Description |
|----------|-------------|
| `calculateStreak(lastDate, current)` | Calculate new streak |
| `wouldExtendStreak(lastDate)` | Check if workout today extends streak |
| `checkBadgeEligibility(badges, stats, accuracy)` | Get newly earned badges |
| `calculateExperience(minutes, accuracy)` | Calculate XP earned |
| `calculateLevel(totalXP)` | Get level from total XP |
| `xpToNextLevel(totalXP)` | XP needed for next level |
| `getLevelProgress(totalXP)` | Progress percentage (0-100) |
| `processWorkoutCompletion(stats, workout)` | Process complete workout |

### voiceFeedbackService.ts

Handles spoken feedback using Web Speech API.

| Method | Description |
|--------|-------------|
| `setEnabled(enabled)` | Toggle voice on/off |
| `isActive()` | Check if enabled |
| `addFeedback(items)` | Queue feedback for speaking |
| `cleanup()` | Stop and cleanup |

---

## Pose Detection System

### Model Initialization (modelUtils.ts)

```tsx
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

export const initializeDetector = async () => {
  await tf.setBackend('webgl');
  await tf.ready();
  
  return poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true
    }
  );
};
```

### Pose Utilities (poseUtils.ts)

#### Key Functions

| Function | Purpose |
|----------|---------|
| `calculateAngles(keypoints)` | Calculate joint angles from keypoints |
| `calculateAccuracy(angles, idealAngles)` | Compare angles to ideal positions |
| `calculateOverallAccuracy(accuracy)` | Compute weighted overall score (harmonic mean) |
| `generateFeedback(angles, ideal, accuracy, keypoints)` | Generate context-aware correction messages |
| `calculateSpineAngles(keypoints)` | Calculate three-segment spine angles |
| `isPersonProperlyVisible(keypoints)` | Check if person is visible enough |
| `checkPersonDistance(keypoints)` | Check if too close/far |

#### Tracked Joints

| Joint | Keypoints Used |
|-------|----------------|
| Hip | shoulder, hip, knee |
| Knee | hip, knee, ankle |
| Elbow | shoulder, elbow, wrist |
| Shoulder | hip, shoulder, elbow |
| Back | Three segments: upper, mid, lower |

### Segment Analyzer (segmentAnalyzer.ts)

Analyzes trainer videos to extract key pose segments.

#### Key Interfaces

```typescript
interface PoseSegment {
  id: number;
  startTime: number;
  endTime: number;
  targetPose: poseDetection.Pose;
  targetAngles: { Hip, Knee, Elbow, Shoulder, BackStraightness };
  description: string;
  matched: boolean;
}

interface SegmentConfig {
  angleThreshold: number;      // degrees change to trigger new segment
  minSegmentDuration: number;  // minimum seconds between segments
  sampleInterval: number;      // how often to sample (seconds)
  matchAccuracyThreshold: number; // accuracy needed to match
  holdDuration: number;        // seconds to hold pose
}

interface SegmentTrainingState {
  isActive: boolean;
  isAnalyzing: boolean;
  analysisProgress: number;
  segments: PoseSegment[];
  currentSegmentIndex: number;
  segmentStatus: 'idle' | 'playing' | 'waiting' | 'matched' | 'completed';
  holdProgress: number;
  matchAccuracy: number;
}
```

#### Key Functions

| Function | Purpose |
|----------|---------|
| `analyzeVideoForSegments(video, detector, config, onProgress)` | Extract segments from video |
| `calculateSegmentMatch(traineeAngles, segment)` | Check if trainee matches target |
| `isSignificantChange(oldAngles, newAngles, threshold)` | Detect pose change |
| `generatePoseDescription(angles, segmentNumber)` | Create readable description |

---

## Preloaded Assets Architecture

The `WorkoutTrainer.tsx` wrapper preloads camera and AI model before showing the trainer.

### Flow

```
User navigates to /trainer
        |
        v
WorkoutTrainer.tsx renders
        |
        v
ModelPreloader.tsx shown
  - Initializes TensorFlow
  - Creates pose detector
  - Requests camera access
  - Gets MediaStream
        |
        v
Assets passed to WorkoutTrainerApp
  - preloadedCameraStream: MediaStream
  - preloadedDetector: PoseDetector
        |
        v
Pose detection starts immediately
```

### Benefits

- No re-initialization on page entry
- Instant pose detection lines
- Camera already streaming
- Faster perceived performance

---

## 404 Page (NotFound.tsx)

A themed error page for unknown routes.

### Features

- Matches app theme (orange/amber gradients)
- Animated elements using Framer Motion
- Mouse-following spotlight effect
- Shows attempted path
- Links to home and trainer pages
- "Go Back" button using history API

### Integration

Added to `App.tsx` routes as catch-all:

```tsx
<Route path="*" element={<NotFound />} />
```

---

## Styling System

### Color Theme (Hot Colors)

```css
:root {
  --primary: #F97316;      /* orange-500 */
  --primary-dark: #EA580C; /* orange-600 */
  --secondary: #EF4444;    /* red-500 */
  --accent: #FBBF24;       /* amber-400 */
  --background: #1A1412;   /* warm dark */
}
```

### CSS Organization

| File | Purpose |
|------|---------|
| `index.css` | Global styles, CSS variables, utilities |
| `WorkoutTrainerApp.css` | Trainer-specific styles |
| `VideoPlayer.css` | Video player component styles |

### Tailwind Config

Custom colors and animations are defined in `tailwind.config.js`.

---

## Adding New Features

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link in `Navbar.tsx`

### Adding New Exercise Metrics

1. Add keypoint calculations in `poseUtils.ts`
2. Update `Angles` interface
3. Add accuracy calculation
4. Add feedback generation logic

### Adding Voice Feedback Phrases

Edit dialogues in `voiceFeedbackService.ts`:

```tsx
private dialogues = {
  hip_more: [
    "Bend your hips a bit more",
    "Lower your hips down",
    // add new phrases here
  ],
};
```

### Adding New Badges

1. Add badge definition in `gamificationService.ts`:
```tsx
{ id: 'new_badge', name: 'Badge Name', description: 'How to earn', icon: 'icon' }
```

2. Add eligibility check in `checkBadgeEligibility()`:
```tsx
if (stats.someCondition && !currentBadges.includes('new_badge')) {
  newBadges.push('new_badge');
}
```

---

## Performance Optimization

### Current Optimizations

- **WebGL backend**: TensorFlow uses GPU acceleration
- **SINGLEPOSE_LIGHTNING**: Fastest MoveNet variant
- **Pose smoothing**: Reduces jitter in detection
- **Debounced updates**: UI updates throttled to 500ms
- **Harmonic mean**: Efficient overall accuracy calculation
- **Preloaded assets**: No re-initialization on page entry

### Tips for Better Performance

1. Use production builds (`npm run build`)
2. Close unnecessary browser tabs
3. Ensure WebGL is enabled
4. Use Chrome for best TensorFlow.js performance

---

## Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Profile creation and editing
- [ ] Video loading and playback
- [ ] Video segment analysis
- [ ] Pose detection accuracy
- [ ] Segment training flow
- [ ] Voice feedback functionality
- [ ] XP and badge earning
- [ ] Streak tracking
- [ ] Theme switching
- [ ] Responsive design
- [ ] 404 page navigation

### Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | Full |
| Firefox | Full |
| Edge | Full |
| Safari | Limited WebGL |

---

## Deployment

### Production Build

```bash
npm run build
```

Output is in `/dist` folder.

### Environment Considerations

- Ensure HTTPS for webcam access
- Configure CORS if using external APIs
- Optimize assets for production
- Set Supabase environment variables

### Vercel Deployment

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy

---

## Troubleshooting

### TensorFlow Loading Issues

```tsx
// ensure backend is ready
await tf.setBackend('webgl');
await tf.ready();
```

### Webcam Permissions

Browser requires HTTPS or localhost for webcam access.

### Memory Leaks

Always dispose detector on unmount:

```tsx
useEffect(() => {
  return () => {
    detector?.dispose();
  };
}, [detector]);
```

Revoke blob URLs when done:

```tsx
if (videoUrl) {
  URL.revokeObjectURL(videoUrl);
}
```

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Open Pull Request

---

## Related Documentation

- [USER_MANUAL.md](./USER_MANUAL.md) - End-user guide
- [IMPLEMENTATION_MANUAL.md](./IMPLEMENTATION_MANUAL.md) - Feature implementation details

---

## License

ISC License - See LICENSE file for details.

---

*Created by Shourya Singh Khatiyan*
*Last Updated: December 2025*
