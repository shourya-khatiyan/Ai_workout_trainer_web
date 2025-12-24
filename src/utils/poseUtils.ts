import * as poseDetection from '@tensorflow-models/pose-detection';

type Keypoint = poseDetection.Keypoint;
type KeypointWithName = Keypoint & { name?: string };

interface Angles {
  Hip: number;
  Knee: number;
  Elbow: number;
  Shoulder: number;
  BackStraightness: number;
  UpperBack: number;
  MidBack: number;
  LowerBack: number;
  // ✅ NEW: Track which joints are actually visible
  visibleJoints: {
    Hip: boolean;
    Knee: boolean;
    Elbow: boolean;
    Shoulder: boolean;
    Back: boolean;
  };
  [key: string]: number | any;
}


interface Accuracy {
  Hip: number;
  Knee: number;
  Elbow: number;
  Shoulder: number;
  BackStraightness: number;  // Combined back accuracy
  UpperBack: number;         // Internal - for calculation
  MidBack: number;           // Internal - for calculation
  LowerBack: number;         // Internal - for calculation
  [key: string]: number;
}

interface FeedbackItem {
  text: string;
  status: 'good' | 'warning' | 'error';
}

// Calculate angle between three points
function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

// Check if a keypoint is visible
// FIXED: Adaptive visibility threshold based on joint type
function isVisible(keypoint: KeypointWithName | undefined, minScore: number = 0.3): boolean {
  return keypoint !== undefined && keypoint.score !== undefined && keypoint.score > minScore;
}


// Calculate spine angles for three segments
interface SpineAngles {
  upperBack: number;
  midBack: number;
  lowerBack: number;
}

function calculateSpineAngles(keypoints: KeypointWithName[]): SpineAngles {
  const nose = keypoints.find(kp => kp.name === 'nose');
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const leftHip = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip = keypoints.find(kp => kp.name === 'right_hip');
  const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
  const rightKnee = keypoints.find(kp => kp.name === 'right_knee');

  // Default values (straight posture)
  let upperBackAngle = 180;
  let midBackAngle = 180;
  let lowerBackAngle = 180;

  // Validate essential keypoints
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip ||
    leftShoulder.score! < 0.5 || rightShoulder.score! < 0.5 ||
    leftHip.score! < 0.5 || rightHip.score! < 0.5) {
    return { upperBack: 180, midBack: 180, lowerBack: 180 };
  }

  // Calculate midpoints
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipMidX = (leftHip.x + rightHip.x) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;

  // Create virtual spine points
  const shoulderMid: Keypoint = { x: shoulderMidX, y: shoulderMidY };
  const hipMid: Keypoint = { x: hipMidX, y: hipMidY };

  const midTorsoX = (shoulderMidX + hipMidX) / 2;
  const midTorsoY = (shoulderMidY + hipMidY) / 2;
  const midTorso: Keypoint = { x: midTorsoX, y: midTorsoY };

  // UPPER BACK: Angle between nose/neck -> shoulder -> mid-torso
  if (nose && nose.score! > 0.5) {
    const neckX = shoulderMidX;
    const neckY = Math.min(nose.y, shoulderMidY);
    const neck: Keypoint = { x: neckX, y: neckY };
    upperBackAngle = calculateAngle(neck, shoulderMid, midTorso);
  }

  // MID BACK: Angle between shoulder -> mid-torso -> hip
  midBackAngle = calculateAngle(shoulderMid, midTorso, hipMid);

  // LOWER BACK: Angle between mid-torso -> hip -> knee
  if ((leftKnee && leftKnee.score! > 0.5) || (rightKnee && rightKnee.score! > 0.5)) {
    const kneeMidX = leftKnee && leftKnee.score! > 0.5
      ? (rightKnee && rightKnee.score! > 0.5 ? (leftKnee.x + rightKnee.x) / 2 : leftKnee.x)
      : rightKnee!.x;
    const kneeMidY = leftKnee && leftKnee.score! > 0.5
      ? (rightKnee && rightKnee.score! > 0.5 ? (leftKnee.y + rightKnee.y) / 2 : leftKnee.y)
      : rightKnee!.y;
    const kneeMid: Keypoint = { x: kneeMidX, y: kneeMidY };
    lowerBackAngle = calculateAngle(midTorso, hipMid, kneeMid);
  }

  return {
    upperBack: Math.round(upperBackAngle),
    midBack: Math.round(midBackAngle),
    lowerBack: Math.round(lowerBackAngle)
  };
}

// Calculate joint angles including spine segments
export function calculateAngles(keypoints: KeypointWithName[]): Angles {
  const findKeypoint = (name: string) => keypoints.find(kp => kp.name === name);

  const leftShoulder = findKeypoint('left_shoulder');
  const rightShoulder = findKeypoint('right_shoulder');
  const leftElbow = findKeypoint('left_elbow');
  const rightElbow = findKeypoint('right_elbow');
  const leftWrist = findKeypoint('left_wrist');
  const rightWrist = findKeypoint('right_wrist');
  const leftHip = findKeypoint('left_hip');
  const rightHip = findKeypoint('right_hip');
  const leftKnee = findKeypoint('left_knee');
  const rightKnee = findKeypoint('right_knee');
  const leftAnkle = findKeypoint('left_ankle');
  const rightAnkle = findKeypoint('right_ankle');

  let hipAngle = 180;
  let kneeAngle = 180;
  let elbowAngle = 180;
  let shoulderAngle = 180;

  // ✅ NEW: Track visibility
  const visibleJoints = {
    Hip: false,
    Knee: false,
    Elbow: false,
    Shoulder: false,
    Back: false
  };

  // Hip angle - average both sides
  let hipAngles: number[] = [];
  if (isVisible(leftShoulder) && isVisible(leftHip) && isVisible(leftKnee)) {
    hipAngles.push(calculateAngle(leftShoulder!, leftHip!, leftKnee!));
  }
  if (isVisible(rightShoulder) && isVisible(rightHip) && isVisible(rightKnee)) {
    hipAngles.push(calculateAngle(rightShoulder!, rightHip!, rightKnee!));
  }
  if (hipAngles.length > 0) {
    hipAngle = hipAngles.reduce((a, b) => a + b) / hipAngles.length;
    visibleJoints.Hip = true;  // ✅ Mark as visible
  }

  // Knee angle - average both sides
  let kneeAngles: number[] = [];
  if (isVisible(leftHip) && isVisible(leftKnee) && isVisible(leftAnkle)) {
    kneeAngles.push(calculateAngle(leftHip!, leftKnee!, leftAnkle!));
  }
  if (isVisible(rightHip) && isVisible(rightKnee) && isVisible(rightAnkle)) {
    kneeAngles.push(calculateAngle(rightHip!, rightKnee!, rightAnkle!));
  }
  if (kneeAngles.length > 0) {
    kneeAngle = kneeAngles.reduce((a, b) => a + b) / kneeAngles.length;
    visibleJoints.Knee = true;  // ✅ Mark as visible
  }

  // Elbow angle - average both sides

  // FIXED: Lower threshold for elbow/wrist (harder to detect)
  let elbowAngles: number[] = [];
  if (isVisible(leftShoulder) && isVisible(leftElbow, 0.25) && isVisible(leftWrist, 0.2)) {
    elbowAngles.push(calculateAngle(leftShoulder!, leftElbow!, leftWrist!));
  }
  if (isVisible(rightShoulder) && isVisible(rightElbow, 0.25) && isVisible(rightWrist, 0.2)) {
    elbowAngles.push(calculateAngle(rightShoulder!, rightElbow!, rightWrist!));
  }
  if (elbowAngles.length > 0) {
    elbowAngle = elbowAngles.reduce((a, b) => a + b) / elbowAngles.length;
    visibleJoints.Elbow = true;
  }

  // Shoulder angle - average both sides
  let shoulderAngles: number[] = [];
  if (isVisible(leftHip) && isVisible(leftShoulder) && isVisible(leftElbow)) {
    shoulderAngles.push(calculateAngle(leftHip!, leftShoulder!, leftElbow!));
  }
  if (isVisible(rightHip) && isVisible(rightShoulder) && isVisible(rightElbow)) {
    shoulderAngles.push(calculateAngle(rightHip!, rightShoulder!, rightElbow!));
  }
  if (shoulderAngles.length > 0) {
    shoulderAngle = shoulderAngles.reduce((a, b) => a + b) / shoulderAngles.length;
    visibleJoints.Shoulder = true;  // ✅ Mark as visible
  }

  // Calculate spine angles for three segments
  const spineAngles = calculateSpineAngles(keypoints);

  // ✅ Check if back is visible (requires shoulders and hips)
  if (leftShoulder && rightShoulder && leftHip && rightHip &&
    leftShoulder.score! >= 0.5 && rightShoulder.score! >= 0.5 &&
    leftHip.score! >= 0.5 && rightHip.score! >= 0.5) {
    visibleJoints.Back = true;
  }

  // Average the three spine segments for overall back straightness
  const backStraightness = Math.round(
    (spineAngles.upperBack + spineAngles.midBack + spineAngles.lowerBack) / 3
  );

  return {
    Hip: Math.round(hipAngle),
    Knee: Math.round(kneeAngle),
    Elbow: Math.round(elbowAngle),
    Shoulder: Math.round(shoulderAngle),
    BackStraightness: backStraightness,
    UpperBack: spineAngles.upperBack,
    MidBack: spineAngles.midBack,
    LowerBack: spineAngles.lowerBack,
    visibleJoints  // ✅ Return visibility info
  };
}

export function calculateAccuracy(angles: Angles, idealAngles: Angles): Accuracy {
  const accuracy: Accuracy = {
    Hip: 0,
    Knee: 0,
    Elbow: 0,
    Shoulder: 0,
    BackStraightness: 0,
    UpperBack: 0,
    MidBack: 0,
    LowerBack: 0
  };

  // ✅ FIXED: Type-safe joint checking
  type JointName = 'Hip' | 'Knee' | 'Elbow' | 'Shoulder';
  const regularJoints: JointName[] = ['Hip', 'Knee', 'Elbow', 'Shoulder'];

  regularJoints.forEach((joint: JointName) => {
    // Check visibility first (now type-safe)
    if (!angles.visibleJoints[joint]) {
      accuracy[joint] = 0;  // ✅ Not visible = 0% accuracy
      return;
    }

    const ideal = idealAngles[joint];
    const actual = angles[joint];
    const diff = Math.abs(ideal - actual);
    const maxDiff = 45;
    accuracy[joint] = Math.max(0, Math.round(100 - (diff / maxDiff) * 100));
  });

  // ✅ Handle back visibility
  if (!angles.visibleJoints.Back) {
    accuracy.BackStraightness = 0;
    accuracy.UpperBack = 0;
    accuracy.MidBack = 0;
    accuracy.LowerBack = 0;
    return accuracy;
  }

  // Calculate accuracy for each spine segment (internal)
  type SpineSegment = 'UpperBack' | 'MidBack' | 'LowerBack';
  const spineSegments: SpineSegment[] = ['UpperBack', 'MidBack', 'LowerBack'];

  spineSegments.forEach((segment: SpineSegment) => {
    const ideal = idealAngles[segment];
    const actual = angles[segment];
    const diff = Math.abs(ideal - actual);
    const maxDiff = 20;
    accuracy[segment] = Math.max(0, Math.round(100 - (diff / maxDiff) * 100));
  });

  // Calculate weighted combined back straightness accuracy
  const backWeights = {
    UpperBack: 0.35,
    MidBack: 0.35,
    LowerBack: 0.30
  };

  accuracy.BackStraightness = Math.round(
    accuracy.UpperBack * backWeights.UpperBack +
    accuracy.MidBack * backWeights.MidBack +
    accuracy.LowerBack * backWeights.LowerBack
  );

  return accuracy;
}

//calculate overall accuracy using harmonic mean with critical joint checks
export function calculateOverallAccuracy(accuracy: Accuracy): number {
  //define critical joints that MUST meet minimum threshold
  const criticalJoints = {
    Hip: 0.20,
    Knee: 0.20,
    BackStraightness: 0.40
  };

  const supportJoints = {
    Elbow: 0.10,
    Shoulder: 0.10
  };

  //Check if any critical joint is below 70% (absolute minimum)
  const criticalThreshold = 65;
  const failedCriticalJoints = Object.entries(criticalJoints)
    .filter(([joint]) => accuracy[joint] < criticalThreshold);

  if (failedCriticalJoints.length > 0) {
    // At least one critical joint is too low
    // Cap overall accuracy at lowest critical joint + 5%
    const minCritical = Math.min(
      ...Object.keys(criticalJoints).map(joint => accuracy[joint])
    );
    return Math.min(minCritical + 5, 69); // Max 69% if critical joint fails
  }

  // Step 2: Check if ALL joints are at least 75% (good enough)
  const allJoints = [...Object.keys(criticalJoints), ...Object.keys(supportJoints)];
  const allAbove75 = allJoints.every(joint => accuracy[joint] >= 75);

  if (allAbove75) {
    // All joints good - use weighted average
    const weightedSum =
      accuracy.Hip * criticalJoints.Hip +
      accuracy.Knee * criticalJoints.Knee +
      accuracy.BackStraightness * criticalJoints.BackStraightness +
      accuracy.Elbow * supportJoints.Elbow +
      accuracy.Shoulder * supportJoints.Shoulder;

    return Math.round(weightedSum);
  }

  // Step 3: Mixed scenario - use harmonic mean (penalizes low scores)
  // Harmonic mean = n / (1/x1 + 1/x2 + ... + 1/xn)
  // This penalizes low values more than arithmetic mean

  const weights = { ...criticalJoints, ...supportJoints };
  let harmonicSum = 0;
  let totalWeight = 0;

  Object.entries(weights).forEach(([joint, weight]) => {
    const acc = accuracy[joint];
    if (acc > 0) { // Avoid division by zero
      harmonicSum += weight / acc;
      totalWeight += weight;
    }
  });

  const harmonicMean = totalWeight / harmonicSum;

  // Apply slight boost if most joints are good (80%+ threshold)
  const goodJoints = allJoints.filter(joint => accuracy[joint] >= 80).length;
  const goodRatio = goodJoints / allJoints.length;

  let finalAccuracy = harmonicMean;
  if (goodRatio >= 0.6) { // At least 60% joints are good
    finalAccuracy = harmonicMean * (1 + (goodRatio - 0.6) * 0.1); // Up to 4% boost
  }

  return Math.round(Math.min(finalAccuracy, 100));
}


// Check for proper visibility
function isPersonProperlyVisible(keypoints: KeypointWithName[]): boolean {
  const essentialKeypoints = [
    'left_shoulder', 'right_shoulder',
    'left_hip', 'right_hip',
    'left_knee', 'right_knee'
  ];

  const essentialVisible = essentialKeypoints.filter(name => {
    const kp = keypoints.find(k => k.name === name);
    return kp && kp.score && kp.score > 0.5;
  }).length;

  return essentialVisible >= 5;
}

// Improved camera distance check
function checkPersonDistance(keypoints: KeypointWithName[]): 'ok' | 'too_close' | 'too_far' {
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const leftHip = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip = keypoints.find(kp => kp.name === 'right_hip');

  if (!leftShoulder || !rightShoulder ||
    leftShoulder.score! < 0.5 || rightShoulder.score! < 0.5) {
    return 'ok';
  }

  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);

  const hipsVisible = leftHip && rightHip &&
    leftHip.score! > 0.4 && rightHip.score! > 0.4;

  if (!hipsVisible) {
    if (shoulderWidth > 200) {
      return 'too_close';
    }
    return 'ok';
  }

  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;
  const torsoHeight = Math.abs(hipMidY - shoulderMidY);

  const aspectRatio = torsoHeight > 0 ? shoulderWidth / torsoHeight : 0;

  // Relaxed thresholds to allow standing farther back for full body visibility
  if (aspectRatio < 0.2 || shoulderWidth < 50) {
    return 'too_far';
  } else if (aspectRatio > 1.5 || shoulderWidth > 280) {
    return 'too_close';
  }

  return 'ok';
}

// Generate feedback - ONLY show combined back straightness
export function generateFeedback(
  angles: Angles,
  idealAngles: Angles,
  accuracy: Accuracy,
  keypoints: KeypointWithName[]
): FeedbackItem[] {
  const feedback: FeedbackItem[] = [];

  // Check visibility
  if (!isPersonProperlyVisible(keypoints)) {
    feedback.push({
      text: 'Position yourself in front of the camera',
      status: 'error'
    });
    return feedback;
  }

  // Check distance - only warn if too close (could cut off body parts)
  const distanceCheck = checkPersonDistance(keypoints);
  if (distanceCheck === 'too_close') {
    feedback.push({
      text: 'Move back from the camera',
      status: 'warning'
    });
  }
  // Removed 'too_far' check - users can stand at comfortable distance for full body visibility

  // COMBINED BACK STRAIGHTNESS FEEDBACK (single entry)
  const backAccuracy = accuracy.BackStraightness;

  if (backAccuracy >= 85) {
    feedback.push({
      text: 'Back alignment is correct',
      status: 'good'
    });
  } else {
    // Determine which segment needs most improvement
    const segmentAccuracies = {
      upper: accuracy.UpperBack,
      mid: accuracy.MidBack,
      lower: accuracy.LowerBack
    };

    const lowestSegment = Object.entries(segmentAccuracies)
      .sort((a, b) => a[1] - b[1])[0][0];

    const segmentMessages: { [key: string]: string } = {
      upper: 'straighten your upper back and neck',
      mid: 'engage your core and straighten mid-back',
      lower: 'maintain neutral lower back position'
    };

    const severity: 'error' | 'warning' = backAccuracy < 50 ? 'error' : 'warning';

    feedback.push({
      text: `Back Straightness: ${segmentMessages[lowestSegment]}`,
      status: severity
    });
  }

  // Joint feedback
  const joints = [
    { name: 'Hip', verb: 'Adjust', direction: 'hip' },
    { name: 'Knee', verb: 'Bend', direction: 'knee' },
    { name: 'Elbow', verb: 'Bend', direction: 'elbow' },
    { name: 'Shoulder', verb: 'Adjust', direction: 'shoulder' }
  ];

  joints.forEach(joint => {
    const jointName = joint.name;
    const accuracyValue = accuracy[jointName];

    if (accuracyValue >= 85) {
      feedback.push({
        text: `${jointName} angle is correct`,
        status: 'good'
      });
    } else {
      const actual = angles[jointName];
      const ideal = idealAngles[jointName];
      const diff = ideal - actual;
      const direction = diff > 0 ? 'more' : 'less';
      const severity: 'error' | 'warning' = accuracyValue < 50 ? 'error' : 'warning';

      feedback.push({
        text: `${joint.verb} your ${joint.direction} ${direction} (${Math.abs(Math.round(diff))}°)`,
        status: severity
      });
    }
  });

  return feedback;
}
