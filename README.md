<p align="center">
  <img src="https://img.icons8.com/?size=100&id=s1oWJWDF36JQ&format=png&color=000000" alt="AI Workout Trainer Logo" width="120" height="120">
</p>

<h1 align="center"> AI Workout Trainer</h1>

<p align="center">
  <strong>Real-time AI-powered exercise form analysis using pose detection</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#documentation">Docs</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/TensorFlow.js-4.22-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow">
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
</p>

---

## 📖 About

AI Workout Trainer is a web application that uses **TensorFlow.js** and **MoveNet** pose detection to analyze your exercise form in real-time. Simply load a trainer video, enable your webcam, and get instant feedback on your posture and joint angles.

### Why AI Workout Trainer?

- 🎯 **Real-time Analysis** - Get instant feedback as you exercise
- 🤖 **AI-Powered** - Uses Google's MoveNet for accurate pose detection
- 🔊 **Voice Feedback** - Hands-free corrections while you work out
- 📊 **Progress Tracking** - Track your accuracy, streaks, and achievements
- 🔒 **Privacy First** - All processing happens locally in your browser

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Pose Detection** | Real-time body keypoint detection using MoveNet |
| **Joint Accuracy** | Track accuracy for hip, knee, elbow, shoulder, and back |
| **Form Feedback** | Instant tips to correct your posture |
| **Voice Coaching** | Spoken feedback using Web Speech API |
| **Video Comparison** | Follow along with trainer demonstration videos |

### User Features

| Feature | Description |
|---------|-------------|
| **User Profiles** | Create and customize your fitness profile |
| **Body Calibration** | Enter measurements for personalized analysis |
| **Dashboard** | View workout statistics and progress |
| **Achievements** | Earn badges for milestones |
| **Streak Tracking** | Maintain workout consistency |

### Technical Features

- ⚡ **WebGL Acceleration** - GPU-powered pose detection
- 📱 **Responsive Design** - Works on desktop and tablets
- 🎨 **Hot Color Theme** - Vibrant orange/red/amber design
- 🌙 **Dark/Light Mode** - Theme switching support
- 💾 **Local Storage** - Data persisted in browser

---

## 🎬 Demo

### Trainer Interface

<p align="center">
  <img src="public/assets/demo.png" alt="AI Workout Trainer Interface" width="100%">
</p>

*The trainer interface showing real-time pose detection, joint accuracy metrics, and form feedback.*

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- Modern browser with WebGL support

### Quick Start

```bash
# Clone the repository
git clone https://github.com/shourya-khatiyan/Ai_workout_trainer_web.git

# Navigate to project directory
cd Ai_workout_trainer_web/project

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 📖 Usage

### Getting Started

1. **Create Account** - Sign up with your email
2. **Complete Profile** - Add your fitness information
3. **Start Training** - Click "Start Training" from dashboard

### Using the Trainer

1. **Load Video** - Upload a trainer demonstration video
2. **Enable Camera** - Allow webcam access
3. **Start Session** - Click the play button
4. **Follow Along** - Match the trainer's movements
5. **Check Feedback** - Watch accuracy meters and feedback panel

### Tips for Best Results

- Stand 6-8 feet from your camera
- Ensure good lighting
- Wear contrasting clothes
- Keep full body in frame

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev/) | UI Framework |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [Vite](https://vitejs.dev/) | Build Tool |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [React Router](https://reactrouter.com/) | Navigation |
| [Lucide React](https://lucide.dev/) | Icons |

### AI/ML

| Technology | Purpose |
|------------|---------|
| [TensorFlow.js](https://www.tensorflow.org/js) | ML Runtime |
| [MoveNet](https://www.tensorflow.org/hub/tutorials/movenet) | Pose Detection |
| Web Speech API | Voice Feedback |

### Development

| Tool | Purpose |
|------|---------|
| ESLint | Code Linting |
| PostCSS | CSS Processing |
| Autoprefixer | Browser Compatibility |

---

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── LoadingTransition.tsx
│   ├── Logo.tsx
│   ├── ModelPreloader.tsx
│   └── Navbar.tsx
│
├── context/            # React Context providers
│   ├── ThemeContext.tsx
│   └── UserContext.tsx
│
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── WorkoutTrainerApp.tsx
│   ├── Profile.tsx
│   ├── SignIn.tsx
│   └── SignUp.tsx
│
├── services/           # Business logic
│   └── voiceFeedbackService.ts
│
├── utils/              # Utility functions
│   ├── poseUtils.ts    # Angle calculations
│   ├── modelUtils.ts   # TensorFlow setup
│   └── navigationUtils.ts
│
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [USER_MANUAL.md](./USER_MANUAL.md) | End-user guide with features and troubleshooting |
| [DEVELOPER_MANUAL.md](./DEVELOPER_MANUAL.md) | Developer guide with architecture and API docs |

---

## 🎨 Color Theme

The application uses a **"Hot Colors"** theme:

| Color | Hex | Usage |
|-------|-----|-------|
| 🟠 Primary | `#F97316` | Buttons, accents |
| 🔴 Secondary | `#EF4444` | Gradients, alerts |
| 🟡 Accent | `#FBBF24` | Highlights |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add comments for complex logic
- Test on multiple browsers

---

## 📋 Roadmap

- [ ] Mobile app version
- [ ] More exercise templates
- [ ] Social sharing features
- [ ] Workout history export
- [ ] Multi-language support
- [ ] Custom exercise creation

---

## ⚠️ Known Issues

| Issue | Workaround |
|-------|------------|
| Safari WebGL limited | Use Chrome or Firefox |
| Slow on older devices | Close other tabs |
| Camera permission denied | Check browser settings |

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Shourya Singh Khatiyan**

- GitHub: [@shourya-khatiyan](https://github.com/shourya-khatiyan)
- Repository: [Ai_workout_trainer_web](https://github.com/shourya-khatiyan/Ai_workout_trainer_web)

---

## 🙏 Acknowledgments

- [TensorFlow.js Team](https://www.tensorflow.org/js) for the amazing ML framework
- [MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html) for pose detection model
- [Lucide](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

---

<p align="center">
  Made with ❤️ and ☕ by Shourya Singh Khatiyan
</p>

<p align="center">
  <a href="#top">⬆️ Back to Top</a>
</p>
