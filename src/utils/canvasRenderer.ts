import * as poseDetection from '@tensorflow-models/pose-detection';

/**
 * skeleton connection pairs for rendering.
 */
const CONNECTIONS = [
  ['nose', 'left_eye'], ['nose', 'right_eye'],
  ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
  ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
  ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle'],
];

/**
 * maps body keypoint names to their joint group for color coding.
 */
const BODYPART_TO_JOINT: Record<string, string> = {
  'left_shoulder': 'Shoulder', 'right_shoulder': 'Shoulder',
  'left_elbow': 'Elbow', 'right_elbow': 'Elbow',
  'left_hip': 'Hip', 'right_hip': 'Hip',
  'left_knee': 'Knee', 'right_knee': 'Knee',
};

/**
 * returns a color based on accuracy percentage.
 */
function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 85) return '#10b981';
  if (accuracy >= 50) return '#f59e0b';
  return '#ef4444';
}

/**
 * draws a pose skeleton on a video overlay canvas.
 * flips trainee keypoints horizontally to correct mirror effect.
 */
export function drawPoseOnCanvas(
  pose: poseDetection.Pose,
  canvas: HTMLCanvasElement,
  videoElement: HTMLVideoElement | null,
  isTrainer: boolean = false,
  accuracyData: Record<string, number> | null = null
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (videoElement) {
    canvas.width = videoElement.videoWidth || videoElement.width;
    canvas.height = videoElement.videoHeight || videoElement.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // draw keypoint circles
  pose.keypoints.forEach((keypoint) => {
    if (keypoint.score && keypoint.score > 0.3) {
      let x = keypoint.x;
      if (!isTrainer) x = canvas.width - x;

      ctx.beginPath();
      ctx.arc(x, keypoint.y, isTrainer ? 12 : 7, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, keypoint.y, isTrainer ? 10 : 6, 0, 2 * Math.PI);
      ctx.fillStyle = isTrainer ? '#d28249ff' : '#f05757ff';
      ctx.fill();
    }
  });

  // draw connection lines
  CONNECTIONS.forEach(([from, to]) => {
    const fromKp = pose.keypoints.find((kp) => kp.name === from);
    const toKp = pose.keypoints.find((kp) => kp.name === to);

    if (fromKp?.score && toKp?.score && fromKp.score > 0.3 && toKp.score > 0.3) {
      let fromX = fromKp.x;
      let toX = toKp.x;
      if (!isTrainer) {
        fromX = canvas.width - fromX;
        toX = canvas.width - toX;
      }

      ctx.beginPath();
      ctx.moveTo(fromX, fromKp.y);
      ctx.lineTo(toX, toKp.y);
      ctx.lineWidth = isTrainer ? 7 : 2;

      if (!isTrainer && accuracyData && (from in BODYPART_TO_JOINT || to in BODYPART_TO_JOINT)) {
        const jointName = BODYPART_TO_JOINT[from] || BODYPART_TO_JOINT[to];
        ctx.strokeStyle = getAccuracyColor(accuracyData[jointName] || 0);
      } else {
        ctx.strokeStyle = isTrainer ? '#f97316' : '#ef4444';
      }

      ctx.stroke();
    }
  });
}

/**
 * draws a centered, scaled skeleton on a white-background comparison canvas.
 * used for the side-by-side joint line comparison view.
 */
export function drawJointLinesOnCanvas(
  pose: poseDetection.Pose,
  canvas: HTMLCanvasElement,
  isTrainer: boolean = false,
  accuracyData: Record<string, number> | null = null
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 300;
  canvas.height = 300;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const keypoints = pose.keypoints;
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  let maxX = 0;
  let maxY = 0;

  // find visible pose boundaries
  keypoints.forEach((kp) => {
    if (kp.score && kp.score > 0.3) {
      minX = Math.min(minX, kp.x);
      minY = Math.min(minY, kp.y);
      maxX = Math.max(maxX, kp.x);
      maxY = Math.max(maxY, kp.y);
    }
  });

  const poseWidth = maxX - minX;
  const poseHeight = maxY - minY;
  const scale = Math.min((canvas.width * 0.8) / poseWidth, (canvas.height * 0.8) / poseHeight);
  const offsetX = (canvas.width - poseWidth * scale) / 2;
  const offsetY = (canvas.height - poseHeight * scale) / 2;

  // draw connection lines with scaling
  CONNECTIONS.forEach(([from, to]) => {
    const fromKp = pose.keypoints.find((kp) => kp.name === from);
    const toKp = pose.keypoints.find((kp) => kp.name === to);

    if (fromKp?.score && toKp?.score && fromKp.score > 0.3 && toKp.score > 0.3) {
      let fromX = (fromKp.x - minX) * scale + offsetX;
      let fromY = (fromKp.y - minY) * scale + offsetY;
      let toX = (toKp.x - minX) * scale + offsetX;
      let toY = (toKp.y - minY) * scale + offsetY;

      if (!isTrainer) {
        fromX = canvas.width - fromX;
        toX = canvas.width - toX;
      }

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.lineWidth = 2;

      if (!isTrainer && accuracyData && (from in BODYPART_TO_JOINT || to in BODYPART_TO_JOINT)) {
        const jointName = BODYPART_TO_JOINT[from] || BODYPART_TO_JOINT[to];
        ctx.strokeStyle = getAccuracyColor(accuracyData[jointName] || 0);
      } else {
        ctx.strokeStyle = isTrainer ? '#000000ff' : '#f97316';
      }

      ctx.stroke();
    }
  });

  // draw keypoint dots
  pose.keypoints.forEach((kp) => {
    if (kp.score && kp.score > 0.3) {
      let x = (kp.x - minX) * scale + offsetX;
      const y = (kp.y - minY) * scale + offsetY;
      if (!isTrainer) x = canvas.width - x;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = isTrainer ? '#000000ff' : '#f97316';
      ctx.fill();
    }
  });
}
