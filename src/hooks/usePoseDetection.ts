import { useEffect, useRef, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import Webcam from 'react-webcam';
import { calculateAngles, calculateAccuracy, generateFeedback, calculateOverallAccuracy } from '../utils/poseUtils';
import { drawPoseOnCanvas, drawJointLinesOnCanvas } from '../utils/canvasRenderer';

const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

interface PoseData {
  angles: ReturnType<typeof calculateAngles>;
  accuracy: ReturnType<typeof calculateAccuracy>;
  overallAccuracy: number;
  feedback: ReturnType<typeof generateFeedback>;
}

interface UsePoseDetectionOptions {
  detector: poseDetection.PoseDetector | null;
  webcamRef: React.RefObject<Webcam | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  traineeJointCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  isDetecting: boolean;
  isTraining: boolean;
  trainerPose: poseDetection.Pose | null;
  trainerAngles: Record<string, number>;
  onPoseData: (data: PoseData) => void;
  onPoseReady: () => void;
  onSegmentCheck: (angles: ReturnType<typeof calculateAngles>) => void;
  segmentActive: boolean;
  segmentWaiting: boolean;
}

/**
 * runs the main pose detection loop at a throttled frame rate.
 * processes webcam frames, calculates accuracy, and draws overlays.
 */
export function usePoseDetection({
  detector,
  webcamRef,
  canvasRef,
  traineeJointCanvasRef,
  isDetecting,
  isTraining,
  trainerPose,
  trainerAngles,
  onPoseData,
  onPoseReady,
  onSegmentCheck,
  segmentActive,
  segmentWaiting,
}: UsePoseDetectionOptions) {
  const lastFrameTime = useRef(0);
  const poseReadyFired = useRef(false);

  const detectPose = useCallback(async () => {
    if (!isDetecting || !detector || !webcamRef.current?.video || webcamRef.current.video.readyState !== 4 || !canvasRef.current) {
      return;
    }

    const now = performance.now();
    if (now - lastFrameTime.current < FRAME_INTERVAL) return;
    lastFrameTime.current = now;

    try {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;

      const poses = await detector.estimatePoses(video);

      if (poses.length > 0) {
        const pose = poses[0];
        const angles = calculateAngles(pose.keypoints);

        const idealAngles = trainerPose
          ? { ...trainerAngles, visibleJoints: { Hip: true, Knee: true, Elbow: true, Shoulder: true, Back: true } }
          : {
              Hip: 120, Knee: 145, Elbow: 90, Shoulder: 180,
              BackStraightness: 180, UpperBack: 180, MidBack: 180, LowerBack: 180,
              visibleJoints: { Hip: true, Knee: true, Elbow: true, Shoulder: true, Back: true },
            };

        const accuracy = calculateAccuracy(angles, idealAngles);
        const overallAccuracy = calculateOverallAccuracy(accuracy);
        const feedback = generateFeedback(angles, idealAngles, accuracy, pose.keypoints);

        drawPoseOnCanvas(pose, canvas, video, false, accuracy);

        if (traineeJointCanvasRef.current) {
          drawJointLinesOnCanvas(pose, traineeJointCanvasRef.current, false, accuracy);
          if (!poseReadyFired.current) {
            poseReadyFired.current = true;
            onPoseReady();
          }
        }

        if (isTraining) {
          onPoseData({ angles, accuracy, overallAccuracy, feedback });
        }

        if (segmentActive && segmentWaiting) {
          onSegmentCheck(angles);
        }
      }
    } catch (error) {
      console.error('Error in pose detection:', error);
    }
  }, [isDetecting, detector, webcamRef, canvasRef, traineeJointCanvasRef, isTraining, trainerPose, trainerAngles, onPoseData, onPoseReady, onSegmentCheck, segmentActive, segmentWaiting]);

  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      detectPose();
      animationFrameId = requestAnimationFrame(loop);
    };

    if (isDetecting) {
      loop();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDetecting, detectPose]);
}
