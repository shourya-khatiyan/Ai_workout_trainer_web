# AI Workout Trainer - User Manual

## Introduction

AI Workout Trainer is a web application that uses artificial intelligence to analyze your exercise form in real-time. Using your webcam, the app detects your body posture and provides instant feedback to help you perform exercises correctly and safely. Your stats and progress are securely synced to the cloud, allowing you to train from any device.

---

## Getting Started

### System Requirements

- **Browser**: Chrome, Firefox, Edge, or Safari (latest versions)
- **Webcam**: Built-in or external webcam
- **Internet**: Stable connection for initial model loading
- **Space**: Ensure enough room to perform exercises (your full body should be visible)

### Creating an Account

1. Navigate to the application homepage
2. Click **"Get Started Free"** or **"Sign Up"**
3. Enter your details:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
4. Click **"Create Account"**
5. You'll be redirected to complete your profile setup

### Profile Setup

After signing up, complete your profile for personalized experience:

1. **Basic Information**: Upload profile picture, enter age, and select gender
2. **Body Statistics**: Enter height (cm) and weight (kg)
3. **Fitness Goals**: Select your fitness level and primary goal

You can skip this step and complete it later from your profile page.

---

## Using the Trainer

### Starting a Workout Session

1. **Sign In** to your account
2. Click **"Start Training"** from the homepage or navigation
3. Wait for the AI model to load (you'll see a loading animation)
4. Once loaded, you'll see the trainer interface

### Interface Overview

The trainer interface has several sections:

| Section | Description |
|---------|-------------|
| **Trainer Video** | Shows the exercise demonstration video |
| **Your Camera** | Live feed from your webcam with pose overlay |
| **Joint Accuracy** | Circular progress bars showing accuracy for each joint |
| **Feedback Panel** | Real-time tips to correct your form |

### Loading Exercise Videos

1. Click the **folder icon** or **"Load Video"** button
2. Select a trainer video file from your computer (MP4, WebM supported)
3. The video will appear in the trainer panel
4. Videos are organized by categories (Squats, Strength Training, Cardio)

### Starting Training

1. Load a trainer video
2. Ensure your full body is visible in the camera
3. Click **"Start Training"**
4. A countdown (3, 2, 1) will appear
5. Follow along with the trainer video
6. Watch the feedback panel for real-time corrections

### Understanding Accuracy Metrics

The app tracks accuracy for these joints:

- **Hip** - Hip angle alignment
- **Knee** - Knee bend accuracy
- **Elbow** - Arm positioning
- **Shoulder** - Shoulder alignment
- **Back** - Spine straightness

**Accuracy Levels:**
- 🟢 **85-100%** - Excellent (green)
- 🟠 **70-84%** - Good (orange)
- 🟡 **50-69%** - Fair (yellow)
- 🔴 **0-49%** - Needs improvement (red)

### Voice Feedback

Enable voice feedback for hands-free corrections:

1. Click the **microphone icon** in the trainer interface
2. The app will speak corrections aloud
3. Different phrases are used to avoid repetition
4. For persistent issues, detailed guidance is provided

---

## Controls

### Video Controls

| Button | Action |
|--------|--------|
| ▶️ Play | Start/resume trainer video |
| ⏸️ Pause | Pause video playback |
| ⏪ Rewind | Go back 5 seconds |
| ⏩ Forward | Skip forward 5 seconds |
| 🔄 Restart | Return to beginning |

### Camera Controls

| Button | Action |
|--------|--------|
| 📷 Toggle Camera | Turn webcam on/off |
| 🎤 Voice Feedback | Enable/disable spoken corrections |

---

## Your Dashboard

### Training Statistics

View your progress on the landing page:

- **Current Streak** - Consecutive workout days
- **Total Workouts** - Lifetime session count
- **Average Accuracy** - Overall form rating
- **Total Time** - Hours spent training
- **Most Practiced** - Your favorite exercise

### Achievements

Earn badges for milestones:

- 🏆 **First Workout** - Complete your first session
- 🎯 **Perfect Form** - Achieve 95%+ accuracy
- 🔥 **3-Day Streak** - Work out 3 days in a row

---

## Profile Management

### Viewing Your Profile

1. Click your profile icon in the navigation bar
2. Select **"Profile"** from the dropdown

### Editing Profile

On your profile page, you can update:

- Profile picture
- Personal information
- Body measurements
- Fitness goals

### Signing Out

1. Click your profile icon
2. Select **"Sign Out"**

---

## Tips for Best Results

### Camera Positioning

- Place camera at waist height for best angle
- Stand 6-8 feet away from camera
- Ensure good lighting (avoid backlight)
- Wear contrasting clothes to your background

### Exercise Environment

- Clear the area of obstacles
- Use a non-slip surface
- Have water nearby
- Warm up before intense exercises

### Getting Accurate Readings

- Ensure all joints are visible to camera
- Wear fitted clothing for better detection
- Move at a moderate pace
- Face the camera directly

---

## Troubleshooting

### Camera Not Working

1. Check browser permissions (allow camera access)
2. Close other apps using the camera
3. Refresh the page
4. Try a different browser

### Pose Not Detected

1. Ensure full body is in frame
2. Improve lighting conditions
3. Stand on a contrasting background
4. Move closer or farther from camera

### Video Not Loading

1. Check file format (MP4, WebM supported)
2. Try a smaller file size
3. Refresh the page and try again

### Slow Performance

1. Close unnecessary browser tabs
2. Use Chrome for best performance
3. Ensure stable internet connection
4. Restart your browser

---

## Privacy & Data

- **Camera data** is processed locally in your browser (video never leaves your device)
- **Profile data** is stored securely in the cloud via Supabase
- **No video** is uploaded to servers
- **Authentication** ensures only you can access your data
- Sign out to clear your session data

---

## Support

For issues or feedback:

- **GitHub Issues**: [Report a Bug](https://github.com/shourya-khatiyan/Ai_workout_trainer_web/issues)
- **Repository**: [View Source Code](https://github.com/shourya-khatiyan/Ai_workout_trainer_web)

---

*AI Workout Trainer v0.1.0 - Created by Shourya Singh Khatiyan*
