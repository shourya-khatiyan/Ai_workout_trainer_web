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

**Note**: When you load a new video, the AI will automatically analyze it for key poses. Wait for the analysis to complete before starting training.

### Segment Training Mode

The app uses **Segment Training** to guide you through exercises:

1. **Video Analysis**: When you load a video, the AI identifies key pose positions
2. **Guided Practice**: During training, the video plays to each key pose
3. **Pose Matching**: Match the trainer's pose and hold it
4. **Hold Duration**: Hold the correct position for 1.5 seconds to progress
5. **Auto-Advance**: Once matched, the video moves to the next segment
6. **Completion**: After all segments are matched, training is complete

The progress bar shows how long you've held the pose. Keep your form correct until it fills completely.

### Starting Training

1. Load a trainer video
2. Wait for video analysis to complete (progress indicator will show)
3. Ensure your full body is visible in the camera
4. Click **"Start Training"**
5. A countdown (3, 2, 1) will appear
6. Follow along with the trainer video
7. Match each pose and hold until the progress indicator fills
8. Watch the feedback panel for real-time corrections

### Understanding Accuracy Metrics

The app tracks accuracy for these joints:

- **Hip** - Hip angle alignment
- **Knee** - Knee bend accuracy
- **Elbow** - Arm positioning
- **Shoulder** - Shoulder alignment
- **Back** - Spine straightness

**Accuracy Levels:**
- **85-100%** - Excellent (green)
- **70-84%** - Good (orange)
- **50-69%** - Fair (yellow)
- **0-49%** - Needs improvement (red)

**Note**: The overall accuracy uses a weighted calculation that prioritizes critical joints (hip, knee, back) over support joints (elbow, shoulder). Poor form in any joint will affect your overall score more significantly.

### Voice Feedback

Enable voice feedback for hands-free corrections:

1. Click the **microphone icon** in the trainer interface
2. The app will speak corrections aloud
3. Different phrases are used to avoid repetition
4. For persistent issues, detailed guidance is provided

### Context-Aware Corrections

The feedback system knows whether your angles are too high or too low:

| Joint | If Angle Too Low | If Angle Too High |
|-------|------------------|-------------------|
| Hip | "Open up your hips more" | "Bend at the hips more" |
| Knee | "Straighten your knees more" | "Bend your knees more" |
| Elbow | "Extend your arms more" | "Bend your elbows more" |
| Shoulder | "Raise your shoulders higher" | "Lower your shoulders" |
| Back | "Stand more upright" | "Keep your back straight" |

---

## Video Controls

### Playback Controls

| Button | Action |
|--------|--------|
| Play | Start/resume trainer video |
| Pause | Pause video playback |
| Rewind | Go back 5 seconds |
| Forward | Skip forward 5 seconds |
| Restart | Return to beginning |

### Speed Control

You can adjust video playback speed:

1. Click the **speed button** (shows current speed like "1x")
2. Select from available speeds: 0.25x, 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x
3. Slower speeds help you study the movement
4. Faster speeds are useful for review

### Loop Toggle

Click the **loop icon** to make the video repeat automatically.

### Camera Controls

| Button | Action |
|--------|--------|
| Toggle Camera | Turn webcam on/off |
| Voice Feedback | Enable/disable spoken corrections |

---

## Your Dashboard

### Training Statistics

View your progress on the landing page:

- **Current Streak** - Consecutive workout days
- **Longest Streak** - Best streak achieved
- **Total Workouts** - Lifetime session count
- **Average Accuracy** - Overall form rating
- **Total Time** - Hours spent training
- **Most Practiced** - Your favorite exercise
- **Level** - Your current level
- **Experience** - XP earned towards next level

### Experience and Levels

Earn XP (experience points) by completing workouts:

- **Base XP**: 10 XP per minute of training
- **Accuracy Bonus**: Higher accuracy earns bonus XP
- **Leveling Up**: Each level requires more XP than the previous

Your level is displayed on your profile and dashboard.

### Achievements (Badges)

Earn badges for completing milestones:

| Badge | Requirement |
|-------|-------------|
| Beginner | Welcome to AI Workout Trainer |
| First Steps | Complete your first workout |
| Week Warrior | Maintain a 7-day streak |
| Month Master | Maintain a 30-day streak |
| Getting Good | Achieve 70% average accuracy |
| Form Master | Score 80%+ accuracy in a session |
| Perfect Form | Score 95%+ accuracy in a session |
| Consistent | Complete 10 workouts |
| Dedicated | Complete 50 workouts |
| Marathon | Train for 10+ hours total |
| Variety | Try 5 different exercises |

Badges are displayed on your profile page.

### Streak Tracking

Your streak tracks consecutive days of training:

- Work out at least once per day to maintain your streak
- Miss a day and your streak resets to zero
- Your longest streak is saved for reference

---

## Profile Management

### Viewing Your Profile

1. Click your profile icon in the navigation bar
2. Select **"Profile"** from the dropdown

### Editing Profile

On your profile page, you can update:

- Profile picture
- Personal information (name, age, gender)
- Body measurements (height, weight)
- Body calibration (hip, chest, neck, arm, leg measurements)
- Fitness goals

### Body Calibration

For more personalized feedback, enter your body measurements:

1. Navigate to **Calibration** from your profile
2. Enter measurements in centimeters
3. Save your calibration data

### Signing Out

1. Click your profile icon
2. Select **"Sign Out"**

---

## Navigation

### Available Pages

| Page | Description |
|------|-------------|
| Home | Landing page with overview and stats |
| Trainer | The workout training interface |
| Profile | Your profile and settings |
| Calibration | Body measurement entry |

### If You Get Lost (404 Page)

If you navigate to a page that doesn't exist:

1. You'll see a friendly "404 - Page Not Found" message
2. Click **"Back to Home"** to return to the homepage
3. Or click **"Go Back"** to return to the previous page
4. The page also shows a link to the trainer

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
- Hold poses steadily for accurate matching

### During Segment Training

- Watch the video first to understand the movement
- Use slower playback speed to study poses
- Focus on one joint at a time if struggling
- Hold the pose until the progress bar fills
- Listen to voice feedback for corrections

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

### Video Analysis Taking Too Long

1. Shorter videos analyze faster
2. Ensure the video shows clear movements
3. Wait for the progress indicator to complete

### Training Won't Start

1. Make sure a video is loaded
2. Wait for video analysis to complete
3. Ensure camera is enabled and detecting poses

### Slow Performance

1. Close unnecessary browser tabs
2. Use Chrome for best performance
3. Ensure stable internet connection
4. Restart your browser

### Voice Feedback Not Working

1. Check your device volume
2. Ensure browser has audio permissions
3. Try refreshing the page
4. Check if voice feedback is enabled (microphone icon)

---

## Privacy and Data

- **Camera data** is processed locally in your browser (video never leaves your device)
- **Profile data** is stored securely in the cloud via Supabase
- **No video** is uploaded to servers
- **Authentication** ensures only you can access your data
- **XP and badges** are saved to your account
- Sign out to clear your session data

---

## Support

For issues or feedback:

- **GitHub Issues**: [Report a Bug](https://github.com/shourya-khatiyan/Ai_workout_trainer_web/issues)
- **Repository**: [View Source Code](https://github.com/shourya-khatiyan/Ai_workout_trainer_web)

---

*AI Workout Trainer v0.2.0 - Created by Shourya Singh Khatiyan*
*Last Updated: December 2025*
