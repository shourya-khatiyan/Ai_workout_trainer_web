# AI Workout Trainer - Implementation Manual

This document provides detailed implementation guides for the major features and algorithms in AI Workout Trainer. For general architecture and API reference, see [DEVELOPER_MANUAL.md](./DEVELOPER_MANUAL.md).

---

## Table of Contents

1. [Video Segment Analysis](#1-video-segment-analysis)
2. [Segment Training Flow](#2-segment-training-flow)
3. [Harmonic Mean Accuracy](#3-harmonic-mean-accuracy)
4. [Context-Aware Feedback](#4-context-aware-feedback)
5. [Gamification System](#5-gamification-system)
6. [Preloaded Assets Architecture](#6-preloaded-assets-architecture)
7. [Voice Feedback System](#7-voice-feedback-system)
8. [Spine Analysis Algorithm](#8-spine-analysis-algorithm)

---

## 1. Video Segment Analysis

### Goal

Automatically extract key pose positions from trainer videos so users can practice matching specific poses rather than following along in real-time.

### Location

`src/utils/segmentAnalyzer.ts`

### Algorithm Overview

1. **Frame Sampling**: Video is sampled at configurable intervals (default: 0.5 seconds)
2. **Pose Detection**: Each frame is analyzed using MoveNet
3. **Angle Calculation**: Joint angles are computed for each pose
4. **Change Detection**: Significant angle changes (default: 15 degrees) mark new segments
5. **Segment Creation**: Poses that differ from previous are stored as segments

### Data Structures

```typescript
// Represents a key pose segment in the video
interface PoseSegment {
  id: number;                    // Sequential identifier
  startTime: number;             // Video timestamp (seconds)
  endTime: number;               // End of this segment
  targetPose: poseDetection.Pose; // Full pose data
  targetAngles: {                // Pre-calculated angles
    Hip: number;
    Knee: number;
    Elbow: number;
    Shoulder: number;
    BackStraightness: number;
  };
  description: string;           // Human-readable description
  matched: boolean;              // Has trainee matched this?
}

// Configuration for segment detection
interface SegmentConfig {
  angleThreshold: number;        // Degree change to trigger new segment (15)
  minSegmentDuration: number;    // Minimum seconds between segments (1.0)
  sampleInterval: number;        // Sample every N seconds (0.5)
  matchAccuracyThreshold: number; // Accuracy to consider matched (75%)
  holdDuration: number;          // Seconds to hold pose (1.5)
}
```

### Implementation Flow

```
Video Loaded
    |
    v
analyzeVideoForSegments() called
    |
    v
Wait for video metadata (loadeddata event)
    |
    v
Loop: Seek to next sample time
    |
    +---> Wait for 'seeked' event
    |
    +---> Run pose detection on frame
    |
    +---> Calculate angles
    |
    +---> Compare to previous segment's angles
    |         |
    |         +---> If significant change: create new segment
    |         |
    |         +---> If similar: continue (update end time)
    |
    +---> Report progress via callback
    |
    +---> Increment time by sampleInterval
    |
    v
Return array of PoseSegment[]
```

### Change Detection Logic

```typescript
function isSignificantChange(
  oldAngles: any, 
  newAngles: any, 
  threshold: number
): boolean {
  const joints = ['Hip', 'Knee', 'Elbow', 'Shoulder', 'BackStraightness'];
  
  for (const joint of joints) {
    const diff = Math.abs(oldAngles[joint] - newAngles[joint]);
    if (diff > threshold) {
      return true; // At least one joint changed significantly
    }
  }
  return false;
}
```

### Pose Description Generation

A human-readable description is generated for each segment:

```typescript
function generatePoseDescription(angles: any, segmentNumber: number): string {
  const parts = [];
  
  if (angles.Knee < 120) parts.push('deep knee bend');
  else if (angles.Knee < 150) parts.push('slight knee bend');
  
  if (angles.Hip < 120) parts.push('hip hinged');
  else if (angles.Hip < 160) parts.push('slight hip bend');
  
  // ... more conditions
  
  return `Segment ${segmentNumber}: ${parts.join(', ') || 'neutral stance'}`;
}
```

---

## 2. Segment Training Flow

### Goal

Guide the user through matching each extracted pose segment, requiring them to hold the correct position for a duration before advancing.

### State Machine

```
         +-----------------+
         |      idle       |<--------+
         +-----------------+         |
                 |                   |
     [Start Training]                |
                 |                   |
                 v                   |
         +-----------------+         |
         |    playing      |         |
         +-----------------+         |
                 |                   |
    [Video reaches segment end]      |
                 |                   |
                 v                   |
         +-----------------+         |
         |    waiting      |<---+    |
         +-----------------+    |    |
                 |              |    |
    [Pose matched + held]  [Pose      |
                 |          lost]    |
                 v              |    |
         +-----------------+    |    |
         |    matched      |----+    |
         +-----------------+         |
                 |                   |
    [Advance to next segment]        |
                 |                   |
    [If more segments: playing]      |
    [If no more: completed]          |
                 |                   |
                 v                   |
         +-----------------+         |
         |   completed     |---------+
         +-----------------+
              [Exit]
```

### Hold Timer Logic

```typescript
const HOLD_DURATION_MS = 1500; // 1.5 seconds
const holdStartTimeRef = useRef<number>(0);

function checkSegmentMatch(traineeAngles: any): void {
  const { accuracy, matched } = calculateSegmentMatch(traineeAngles, currentSegment);
  
  if (matched) {
    // Start or continue hold timer
    if (holdStartTimeRef.current === 0) {
      holdStartTimeRef.current = Date.now();
    }
    
    const heldTime = Date.now() - holdStartTimeRef.current;
    const holdProgress = Math.min(100, (heldTime / HOLD_DURATION_MS) * 100);
    
    if (heldTime >= HOLD_DURATION_MS) {
      advanceToNextSegment();
    }
  } else {
    // Reset hold timer if pose lost
    holdStartTimeRef.current = 0;
  }
}
```

### Segment Match Calculation

```typescript
function calculateSegmentMatch(
  traineeAngles: any, 
  segment: PoseSegment
): { accuracy: number; matched: boolean } {
  const targetAngles = segment.targetAngles;
  
  let totalDiff = 0;
  let count = 0;
  
  for (const joint of ['Hip', 'Knee', 'Elbow', 'Shoulder', 'BackStraightness']) {
    const diff = Math.abs(traineeAngles[joint] - targetAngles[joint]);
    totalDiff += diff;
    count++;
  }
  
  const avgDiff = totalDiff / count;
  const accuracy = Math.max(0, 100 - avgDiff);
  const matched = accuracy >= 75; // matchAccuracyThreshold
  
  return { accuracy, matched };
}
```

---

## 3. Harmonic Mean Accuracy

### Goal

Provide a more accurate overall score that penalizes poor individual joint scores, preventing one good joint from masking poor form elsewhere.

### Problem with Arithmetic Mean

With arithmetic mean:
- Hip: 90%, Knee: 90%, Elbow: 90%, Back: 90%, Shoulder: 10%
- Average = (90+90+90+90+10)/5 = 74%

This is misleading - the user has terrible shoulder form but gets a passing grade.

### Harmonic Mean Solution

Harmonic mean naturally penalizes low values:

```
H = n / (1/x1 + 1/x2 + ... + 1/xn)
```

With the same values:
- H = 5 / (1/90 + 1/90 + 1/90 + 1/90 + 1/10)
- H = 5 / (0.011 + 0.011 + 0.011 + 0.011 + 0.1)
- H = 5 / 0.144 = 34.7%

This better reflects that one joint is critically wrong.

### Implementation

```typescript
function calculateOverallAccuracy(accuracy: Accuracy): number {
  // Weight critical joints higher
  const criticalWeights = {
    Hip: 0.20,
    Knee: 0.20,
    BackStraightness: 0.40
  };
  
  const supportWeights = {
    Elbow: 0.10,
    Shoulder: 0.10
  };
  
  // Collect weighted reciprocals
  let reciprocalSum = 0;
  let weightSum = 0;
  
  for (const [joint, weight] of Object.entries({...criticalWeights, ...supportWeights})) {
    const value = accuracy[joint];
    if (value > 0) {
      reciprocalSum += weight / value;
      weightSum += weight;
    }
  }
  
  if (reciprocalSum === 0) return 0;
  
  // Weighted harmonic mean
  return Math.round(weightSum / reciprocalSum);
}
```

### Weight Distribution

| Joint | Weight | Rationale |
|-------|--------|-----------|
| Back | 40% | Critical for injury prevention |
| Hip | 20% | Core movement foundation |
| Knee | 20% | High injury risk joint |
| Elbow | 10% | Supporting role |
| Shoulder | 10% | Supporting role |

---

## 4. Context-Aware Feedback

### Goal

Provide specific, actionable feedback based on whether the user's angle is too high or too low compared to the target.

### Problem with Generic Feedback

Generic: "Adjust your knee position"
- User doesn't know if they should bend more or straighten

### Context-Aware Solution

```typescript
interface JointFeedbackConfig {
  name: string;
  lowAngleAction: string;   // When angle < ideal (joint too closed)
  highAngleAction: string;  // When angle > ideal (joint too open)
}

const jointFeedbackConfigs: Record<string, JointFeedbackConfig> = {
  Knee: {
    name: 'Knee',
    lowAngleAction: 'Straighten your knees more',
    highAngleAction: 'Bend your knees more'
  },
  Hip: {
    name: 'Hip',
    lowAngleAction: 'Open up your hips more',
    highAngleAction: 'Bend at the hips more'
  },
  // ... other joints
};
```

### Implementation

```typescript
function generateFeedback(
  angles: Angles, 
  idealAngles: Angles, 
  accuracy: Accuracy,
  keypoints: Keypoint[]
): FeedbackItem[] {
  const feedback: FeedbackItem[] = [];
  
  for (const [joint, config] of Object.entries(jointFeedbackConfigs)) {
    const acc = accuracy[joint];
    
    if (acc < 70) { // Needs improvement
      const current = angles[joint];
      const ideal = idealAngles[joint];
      
      let message: string;
      if (current < ideal) {
        message = config.lowAngleAction;  // Angle too closed
      } else {
        message = config.highAngleAction; // Angle too open
      }
      
      feedback.push({
        text: message,
        status: acc < 50 ? 'error' : 'warning'
      });
    }
  }
  
  return feedback;
}
```

### Feedback Status Levels

| Accuracy | Status | Color |
|----------|--------|-------|
| 70-100% | good | Green |
| 50-69% | warning | Yellow |
| 0-49% | error | Red |

---

## 5. Gamification System

### Goal

Increase user engagement through progression mechanics: XP, levels, badges, and streaks.

### Location

`src/services/gamificationService.ts`

### XP Calculation

```typescript
function calculateExperience(durationMinutes: number, accuracy: number): number {
  const baseXP = 10; // XP per minute
  const accuracyMultiplier = accuracy / 100;
  
  return Math.round(durationMinutes * baseXP * (0.5 + accuracyMultiplier * 0.5));
}
```

Example:
- 10 minutes at 80% accuracy
- XP = 10 * 10 * (0.5 + 0.8 * 0.5) = 100 * 0.9 = 90 XP

### Level Calculation

Uses exponential scaling where each level requires more XP:

```typescript
function calculateLevel(totalExperience: number): number {
  const baseXP = 100;
  const multiplier = 1.5;
  
  let level = 1;
  let xpForLevel = baseXP;
  let totalXpNeeded = 0;
  
  while (totalExperience >= totalXpNeeded + xpForLevel) {
    totalXpNeeded += xpForLevel;
    level++;
    xpForLevel = Math.floor(baseXP * Math.pow(multiplier, level - 1));
  }
  
  return level;
}
```

Level thresholds:
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 250 XP
- Level 4: 475 XP
- Level 5: 812 XP
- ...and so on

### Streak Logic

```typescript
function calculateStreak(
  lastWorkoutDate: string | null,
  currentStreak: number
): { newStreak: number; streakBroken: boolean } {
  if (!lastWorkoutDate) {
    return { newStreak: 1, streakBroken: false };
  }
  
  const last = new Date(lastWorkoutDate);
  const today = new Date();
  
  // Reset to start of day for comparison
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Same day - no change
    return { newStreak: currentStreak, streakBroken: false };
  } else if (diffDays === 1) {
    // Next day - extend streak
    return { newStreak: currentStreak + 1, streakBroken: false };
  } else {
    // Missed a day - reset
    return { newStreak: 1, streakBroken: true };
  }
}
```

### Badge Eligibility

Each badge has specific unlock conditions:

```typescript
function checkBadgeEligibility(
  currentBadges: string[],
  stats: UserStats,
  latestAccuracy?: number
): string[] {
  const newBadges: string[] = [];
  
  // First workout
  if (stats.totalWorkouts >= 1 && !currentBadges.includes('first_steps')) {
    newBadges.push('first_steps');
  }
  
  // 7-day streak
  if (stats.streakCurrent >= 7 && !currentBadges.includes('week_warrior')) {
    newBadges.push('week_warrior');
  }
  
  // Perfect form (95%+ in a session)
  if (latestAccuracy >= 95 && !currentBadges.includes('perfect_form')) {
    newBadges.push('perfect_form');
  }
  
  // ... more badges
  
  return newBadges;
}
```

### Complete Workout Processing

```typescript
function processWorkoutCompletion(currentStats, workoutData): WorkoutResult {
  // 1. Calculate streak
  const { newStreak } = calculateStreak(currentStats.lastWorkoutDate, currentStats.streakCurrent);
  
  // 2. Calculate XP
  const earnedXP = calculateExperience(workoutData.durationMinutes, workoutData.accuracy);
  const newExperience = currentStats.experience + earnedXP;
  
  // 3. Calculate level
  const newLevel = calculateLevel(newExperience);
  
  // 4. Update averages
  const newTotal = currentStats.totalWorkouts + 1;
  const newAvgAccuracy = ((currentStats.averageAccuracy * currentStats.totalWorkouts) 
                          + workoutData.accuracy) / newTotal;
  
  // 5. Check for new badges
  const newBadges = checkBadgeEligibility(
    currentStats.badges,
    { ...currentStats, streakCurrent: newStreak, totalWorkouts: newTotal },
    workoutData.accuracy
  );
  
  return {
    newStreak,
    newTotalWorkouts: newTotal,
    newAverageAccuracy: newAvgAccuracy,
    newExperience,
    newLevel,
    newBadges,
    allBadges: [...currentStats.badges, ...newBadges]
  };
}
```

---

## 6. Preloaded Assets Architecture

### Goal

Eliminate the delay between entering the trainer page and seeing pose detection lines by preloading the AI model and camera stream.

### Components

1. **WorkoutTrainer.tsx** - Wrapper that shows preloader
2. **ModelPreloader.tsx** - Loads assets and animates
3. **WorkoutTrainerApp.tsx** - Main trainer using preloaded assets

### Flow Diagram

```
User clicks "Start Training"
         |
         v
WorkoutTrainer renders
         |
         v
ModelPreloader shown
    +----+----+
    |         |
    v         v
Initialize  Request
TensorFlow  Camera
    |         |
    v         v
Create     Get
Detector   MediaStream
    |         |
    +----+----+
         |
         v
Call onComplete(stream, detector)
         |
         v
WorkoutTrainer stores in state
         |
         v
WorkoutTrainerApp renders with props:
  - preloadedCameraStream
  - preloadedDetector
         |
         v
Pose detection starts immediately
```

### Asset Transfer Code

```typescript
// WorkoutTrainer.tsx
const handleModelsLoaded = useCallback((
  cameraStream: MediaStream | null, 
  detector: poseDetection.PoseDetector | null
) => {
  setPreloadedAssets({ cameraStream, detector });
  setIsReadyToShow(true);
}, []);

// Pass to trainer app
<WorkoutTrainerApp
  preloadedCameraStream={preloadedAssets.cameraStream}
  preloadedDetector={preloadedAssets.detector}
/>
```

### Using Preloaded Stream

```typescript
// WorkoutTrainerApp.tsx
useEffect(() => {
  if (preloadedStream && webcamRef.current?.video) {
    const video = webcamRef.current.video;
    if (video.srcObject !== preloadedStream) {
      video.srcObject = preloadedStream;
      video.play();
    }
  }
}, [preloadedStream]);
```

---

## 7. Voice Feedback System

### Goal

Provide hands-free spoken corrections using Web Speech API with natural-sounding variations.

### Location

`src/services/voiceFeedbackService.ts`

### Voting System

Feedback must persist for a duration before being spoken to avoid rapid-fire corrections:

```typescript
interface QueuedFeedback {
  feedback: FeedbackItem;
  firstSeenTime: number;    // When first added
  lastSeenTime: number;     // Last time still present
  spokenCount: number;      // Times already spoken
}

const SPEAK_THRESHOLD_MS = 1500; // Persist for 1.5s before speaking
const COOLDOWN_MS = 5000;        // Wait 5s before repeating
```

### Dialogue Variations

Multiple phrases for each correction type prevent robotic repetition:

```typescript
private dialogues = {
  knee_more: [
    "Bend your knees a bit more",
    "Lower into that squat",
    "Get those knees bending",
    "A little deeper with the knees"
  ],
  knee_less: [
    "Straighten your knees more",
    "Extend your legs a bit", 
    "Don't bend your knees as much"
  ],
  // ... more dialogue sets
};

function getDialogueVariation(feedback: FeedbackItem): string {
  const type = identifyDialogueType(feedback);
  const phrases = this.dialogues[type];
  
  if (!phrases) return feedback.text;
  
  // Pick random phrase, avoiding recently used
  const history = this.dialogueHistory.get(type) || [];
  const available = phrases.filter((_, i) => !history.includes(i));
  
  const index = available.length > 0 
    ? available[Math.floor(Math.random() * available.length)]
    : Math.floor(Math.random() * phrases.length);
  
  // Update history
  this.dialogueHistory.set(type, [...history.slice(-2), index]);
  
  return phrases[index];
}
```

### Extended Guidance

For persistent issues (10+ seconds), provide detailed correction instructions:

```typescript
private correctionGuidance = {
  knee: "To improve knee position: Keep weight in heels. Track knees over toes. Lower slowly.",
  hip: "For better hip movement: Push hips back first. Keep chest up. Engage core.",
  back: "To straighten back: Pull shoulders back. Engage core. Look slightly up.",
  // ...
};

function getCorrectionGuidance(feedback: FeedbackItem): string {
  const queued = this.feedbackQueue.get(key);
  const persistedMs = Date.now() - queued.firstSeenTime;
  
  if (persistedMs > 10000 && queued.spokenCount >= 2) {
    // Provide detailed guidance
    return this.correctionGuidance[type];
  }
  
  return this.getDialogueVariation(feedback);
}
```

---

## 8. Spine Analysis Algorithm

### Goal

Detect back posture issues by analyzing three segments of the spine rather than treating it as a single line.

### Spine Segments

```
        Nose
          |
    [Upper Back] - Shoulders to mid-spine
          |
     [Mid Back]  - Calculated midpoint
          |
    [Lower Back] - Mid-spine to hips
          |
        Hips
```

### Implementation

```typescript
interface SpineAngles {
  upperBack: number;  // Shoulder area deviation
  midBack: number;    // Middle spine deviation
  lowerBack: number;  // Lower back deviation
}

function calculateSpineAngles(keypoints: Keypoint[]): SpineAngles {
  const nose = findKeypoint('nose');
  const leftShoulder = findKeypoint('left_shoulder');
  const rightShoulder = findKeypoint('right_shoulder');
  const leftHip = findKeypoint('left_hip');
  const rightHip = findKeypoint('right_hip');
  
  // Calculate midpoints
  const shoulderMid = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };
  
  const hipMid = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };
  
  // Virtual mid-spine point
  const spineMid = {
    x: (shoulderMid.x + hipMid.x) / 2,
    y: (shoulderMid.y + hipMid.y) / 2
  };
  
  // Calculate angles (180 = perfectly straight)
  const upperBack = calculateAngle(nose, shoulderMid, spineMid);
  const midBack = calculateAngle(shoulderMid, spineMid, hipMid);
  const lowerBack = calculateAngle(spineMid, hipMid, /* knee midpoint */);
  
  return { upperBack, midBack, lowerBack };
}
```

### Integration with Accuracy

The overall `BackStraightness` score is derived from the three segments:

```typescript
// In calculateAngles()
const spineAngles = calculateSpineAngles(keypoints);

const backStraightness = (
  spineAngles.upperBack * 0.3 +
  spineAngles.midBack * 0.4 +
  spineAngles.lowerBack * 0.3
);

return {
  // ... other angles
  BackStraightness: backStraightness,
  UpperBack: spineAngles.upperBack,
  MidBack: spineAngles.midBack,
  LowerBack: spineAngles.lowerBack
};
```

---

## Summary

This manual covers the implementation details of:

| Feature | Key Insight |
|---------|-------------|
| Segment Analysis | Extract key poses via angle change detection |
| Segment Training | State machine with hold timer for pose matching |
| Harmonic Mean | Penalizes low scores more than arithmetic mean |
| Context Feedback | Direction-aware messages based on angle comparison |
| Gamification | XP/levels with exponential scaling, conditional badges |
| Preloaded Assets | Pass camera/detector from preloader to trainer |
| Voice Feedback | Voting system with dialogue variations |
| Spine Analysis | Three-segment analysis for nuanced back feedback |

For API reference and project structure, see [DEVELOPER_MANUAL.md](./DEVELOPER_MANUAL.md).

---

*Created by Shourya Singh Khatiyan*
*Last Updated: December 2025*
