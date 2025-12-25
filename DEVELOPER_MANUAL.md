# AI Workout Trainer - Developer Manual

## Project Overview

AI Workout Trainer is a React-based web application that uses TensorFlow.js and MoveNet pose detection to provide real-time exercise form analysis. The application compares user poses against trainer videos and provides instant feedback.

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
│   │   ├── LoadingTransition.tsx
│   │   ├── Logo.tsx
│   │   ├── ModelLoadingIndicator.tsx
│   │   ├── ModelPreloader.tsx
│   │   └── Navbar.tsx
│   │
│   ├── context/             # react context providers
│   │   ├── ThemeContext.tsx
│   │   └── UserContext.tsx
│   │
│   ├── pages/               # page components
│   │   ├── BodyCalibration.tsx
│   │   ├── LandingPage.tsx
│   │   ├── Profile.tsx
│   │   ├── ProfileSetup.tsx
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── WorkoutTrainer.tsx
│   │   ├── WorkoutTrainerApp.tsx
│   │   └── WorkoutTrainerApp.css
│   │
│   ├── services/            # business logic services
│   │   ├── authService.ts       # supabase auth & profiles
│   │   ├── gamificationService.ts # xp & leveling logic
│   │   ├── supabase.ts          # client initialization
│   │   └── voiceFeedbackService.ts
│   │
│   ├── utils/               # utility functions
│   │   ├── index.ts
│   │   ├── modelUtils.ts
│   │   ├── navigationUtils.ts
│   │   └── poseUtils.ts
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

### App Component (`App.tsx`)

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
</Routes>
```

### Context Providers

#### UserContext

Manages user authentication and profile data:

```tsx
interface UserContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  login: (userData: UserData) => void;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  updateStreak: (streak: Partial<UserStreak>) => void;
}
```

**Usage:**
```tsx
const { user, isLoggedIn, login, logout, updateUser } = useUser();
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
  id: string;               // References auth.users.id
  email: string;
  full_name: string;
  // Stats
  level: number;
  experience: number;
  badges: text[];           // Array of badge names
  streak_current: number;
  total_workouts: number;
  average_accuracy: number;
  // ...other physical stats
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

1. **Sign Up**: `authService.signUp` creates auth user + `profiles` row.
2. **Session**: `UserContext` listens to `onAuthStateChange`.
3. **Protection**: Protected routes check `useUser().isLoggedIn`.

---

## Pose Detection System

### Model Initialization (`modelUtils.ts`)

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

### Pose Utilities (`poseUtils.ts`)

#### Key Functions

| Function | Purpose |
|----------|---------|
| `calculateAngles(keypoints)` | Calculate joint angles from keypoints |
| `calculateAccuracy(angles, idealAngles)` | Compare angles to ideal positions |
| `calculateOverallAccuracy(accuracy)` | Compute weighted overall score |
| `generateFeedback(angles, ideal, accuracy, keypoints)` | Generate correction messages |

#### Angle Calculation

The system calculates angles between three connected keypoints:

```tsx
function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - 
                  Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}
```

#### Tracked Joints

| Joint | Keypoints Used |
|-------|----------------|
| Hip | shoulder → hip → knee |
| Knee | hip → knee → ankle |
| Elbow | shoulder → elbow → wrist |
| Shoulder | hip → shoulder → elbow |
| Back | nose → shoulders → hips → knees |

### Accuracy Calculation

Uses harmonic mean with critical joint penalties:

```tsx
// critical joints have higher weight
const criticalJoints = {
  Hip: 0.20,
  Knee: 0.20,
  BackStraightness: 0.40
};

const supportJoints = {
  Elbow: 0.10,
  Shoulder: 0.10
};
```

---

## Voice Feedback Service

### Overview

`voiceFeedbackService.ts` provides spoken feedback using Web Speech API.

### Key Features

- **Voting system**: Only speaks feedback that persists for 1.5+ seconds
- **Variation**: Multiple phrases for same correction to avoid repetition
- **Detailed guidance**: Extended help for persistent issues (10+ seconds)

### Usage

```tsx
import { voiceFeedbackService } from '../services/voiceFeedbackService';

// enable/disable
voiceFeedbackService.setEnabled(true);

// add feedback items
voiceFeedbackService.addFeedback([
  { text: 'Bend your knees more', status: 'warning' }
]);

// cleanup
voiceFeedbackService.cleanup();
```

---

## Workout Trainer Component

### State Management

```tsx
// main states in WorkoutTrainerApp.tsx
const [detector, setDetector] = useState<PoseDetector | null>(null);
const [isDetecting, setIsDetecting] = useState(false);
const [trainerPose, setTrainerPose] = useState<Pose | null>(null);
const [traineePose, setTraineePose] = useState<Pose | null>(null);
const [postureAccuracy, setPostureAccuracy] = useState(85);
const [feedbackItems, setFeedbackItems] = useState([]);
```

### Detection Loop

```tsx
const detectPose = async () => {
  if (!detector || !webcamRef.current) return;
  
  const video = webcamRef.current.video;
  const poses = await detector.estimatePoses(video);
  
  if (poses.length > 0) {
    const traineeAngles = calculateAngles(poses[0].keypoints);
    const accuracy = calculateAccuracy(traineeAngles, trainerAngles);
    const feedback = generateFeedback(traineeAngles, trainerAngles, accuracy);
    
    setTraineePose(poses[0]);
    setPostureAccuracy(calculateOverallAccuracy(accuracy));
    setFeedbackItems(feedback);
  }
  
  requestAnimationFrame(detectPose);
};
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

---

## Performance Optimization

### Current Optimizations

- **WebGL backend**: TensorFlow uses GPU acceleration
- **SINGLEPOSE_LIGHTNING**: Fastest MoveNet variant
- **Pose smoothing**: Reduces jitter in detection
- **Debounced updates**: UI updates are throttled

### Tips for Better Performance

1. Use production builds (`npm run build`)
2. Close unnecessary browser tabs
3. Ensure WebGL is enabled 4. Use Chrome for best TensorFlow.js performance

---

## Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Profile creation and editing
- [ ] Video loading and playback
- [ ] Pose detection accuracy
- [ ] Voice feedback functionality
- [ ] Theme switching
- [ ] Responsive design

### Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Edge | ✅ Full |
| Safari | ⚠️ Limited WebGL |

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

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Open Pull Request

---

## License

ISC License - See LICENSE file for details.

---

*Created by Shourya Singh Khatiyan*
*Last Updated: December 2025*
