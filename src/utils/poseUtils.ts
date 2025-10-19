import * as poseDetection from '@tensorflow-models/pose-detection';

type Keypoint = poseDetection.Keypoint;
type KeypointWithName = Keypoint & { name?: string };

interface Angles {
  Hip: number;
  Knee: number;
  Elbow: number;
  Shoulder: number;
  UpperBack: number;
  MidBack: number;
  LowerBack: number;
  [key: string]: number;
}

interface Accuracy {
  Hip: number;
  Knee: number;
  Elbow: number;
  Shoulder: number;
  UpperBack: number;
  MidBack: number;
  LowerBack: number;
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
function isVisible(keypoint: KeypointWithName | undefined): boolean {
  return keypoint !== undefined && keypoint.score !== undefined && keypoint.score > 0.3;
}

// Calculate spine angles for three segments (IMPROVED LOGIC)
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

  // Calculate midpoints for accuracy
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipMidX = (leftHip.x + rightHip.x) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;

  // Create virtual spine points
  const shoulderMid: Keypoint = { x: shoulderMidX, y: shoulderMidY };
  const hipMid: Keypoint = { x: hipMidX, y: hipMidY };
  
  // Calculate mid-torso point (between shoulders and hips)
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
  }

  // Elbow angle - average both sides
  let elbowAngles: number[] = [];
  if (isVisible(leftShoulder) && isVisible(leftElbow) && isVisible(leftWrist)) {
    elbowAngles.push(calculateAngle(leftShoulder!, leftElbow!, leftWrist!));
  }
  if (isVisible(rightShoulder) && isVisible(rightElbow) && isVisible(rightWrist)) {
    elbowAngles.push(calculateAngle(rightShoulder!, rightElbow!, rightWrist!));
  }
  if (elbowAngles.length > 0) {
    elbowAngle = elbowAngles.reduce((a, b) => a + b) / elbowAngles.length;
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
  }

  // Calculate spine angles for three segments
  const spineAngles = calculateSpineAngles(keypoints);

  return {
    Hip: Math.round(hipAngle),
    Knee: Math.round(kneeAngle),
    Elbow: Math.round(elbowAngle),
    Shoulder: Math.round(shoulderAngle),
    UpperBack: spineAngles.upperBack,
    MidBack: spineAngles.midBack,
    LowerBack: spineAngles.lowerBack
  };
}

// Calculate accuracy - DIRECT COMPARISON with trainer
export function calculateAccuracy(angles: Angles, idealAngles: Angles): Accuracy {
  const accuracy: Accuracy = {
    Hip: 0,
    Knee: 0,
    Elbow: 0,
    Shoulder: 0,
    UpperBack: 0,
    MidBack: 0,
    LowerBack: 0
  };

  // Calculate accuracy for all angles (including spine segments)
  for (const joint in idealAngles) {
    const ideal = idealAngles[joint];
    const actual = angles[joint];
    const diff = Math.abs(ideal - actual);

    // Convert difference to accuracy percentage
    // Spine segments are more sensitive (20° threshold)
    // Other joints use 45° threshold
    const maxDiff = joint.includes('Back') ? 20 : 45;
    accuracy[joint] = Math.max(0, Math.round(100 - (diff / maxDiff) * 100));
  }

  return accuracy;
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

// Check person distance
// Improved camera distance check with relative measurements
function checkPersonDistance(keypoints: KeypointWithName[]): 'ok' | 'too_close' | 'too_far' {
  const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
  const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
  const leftHip = keypoints.find(kp => kp.name === 'left_hip');
  const rightHip = keypoints.find(kp => kp.name === 'right_hip');

  // Need shoulders and at least one hip to be visible
  if (!leftShoulder || !rightShoulder || 
      leftShoulder.score! < 0.5 || rightShoulder.score! < 0.5) {
    return 'ok'; // Can't determine, don't show warning
  }

  // Calculate shoulder width in pixels
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
  
  // Check if hips are visible (indicates full body in frame)
  const hipsVisible = leftHip && rightHip && 
                      leftHip.score! > 0.4 && rightHip.score! > 0.4;
  
  // Adaptive thresholds based on whether hips are visible
  if (!hipsVisible) {
    // Person might be too close if hips aren't visible
    if (shoulderWidth > 200) {
      return 'too_close';
    }
    return 'ok'; // Give benefit of doubt
  }
  
  // Calculate torso height (shoulder to hip distance)
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipMidY = (leftHip.y + rightHip.y) / 2;
  const torsoHeight = Math.abs(hipMidY - shoulderMidY);
  
  // Calculate aspect ratio (width to height)
  const aspectRatio = torsoHeight > 0 ? shoulderWidth / torsoHeight : 0;
  
  // Good range: aspect ratio between 0.4 and 1.2
  if (aspectRatio < 0.3 || shoulderWidth < 80) {
    return 'too_far';
  } else if (aspectRatio > 1.5 || shoulderWidth > 280) {
    return 'too_close';
  }

  return 'ok';
}


// Generate feedback with spine-specific guidance
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

  // Check distance
  const distanceCheck = checkPersonDistance(keypoints);
  if (distanceCheck === 'too_close') {
    feedback.push({
      text: 'Move back from the camera',
      status: 'warning'
    });
  } else if (distanceCheck === 'too_far') {
    feedback.push({
      text: 'Move closer to the camera',
      status: 'warning'
    });
  }

  // SPINE FEEDBACK (Three Sections)
  const spineSegments = [
    { name: 'UpperBack', label: 'Upper Back', region: 'neck and shoulders' },
    { name: 'MidBack', label: 'Mid Back', region: 'torso' },
    { name: 'LowerBack', label: 'Lower Back', region: 'lower spine' }
  ];

  spineSegments.forEach(segment => {
    const accuracyValue = accuracy[segment.name];
    
    if (accuracyValue >= 85) {
      feedback.push({
        text: `${segment.label} alignment is correct`,
        status: 'good'
      });
    } else {
      const actual = angles[segment.name];
      const ideal = idealAngles[segment.name];
      const diff = ideal - actual;
      const severity: 'error' | 'warning' = accuracyValue < 50 ? 'error' : 'warning';
      
      const direction = diff > 0 ? 'straighten' : 'adjust';
      feedback.push({
        text: `${segment.label}: ${direction} your ${segment.region}`,
        status: severity
      });
    }
  });

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
