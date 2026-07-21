import { useEffect, useRef, useCallback, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { calculateAngles } from '../utils/poseUtils';
import { drawPoseOnCanvas, drawJointLinesOnCanvas } from '../utils/canvasRenderer';

interface TrainerAngles {
  Hip: number;
  Knee: number;
  Elbow: number;
  Shoulder: number;
  BackStraightness: number;
  UpperBack: number;
  MidBack: number;
  LowerBack: number;
}

const DEFAULT_ANGLES: TrainerAngles = {
  Hip: 120, Knee: 145, Elbow: 90, Shoulder: 180,
  BackStraightness: 180, UpperBack: 180, MidBack: 180, LowerBack: 180,
};

/**
 * manages trainer video pose analysis: initial seek-based detection
 * and continuous tracking during playback.
 */
export function useTrainerVideo(
  detector: poseDetection.PoseDetector | null,
  trainerVideoUrl: string | null,
  trainerVideoRef: React.RefObject<HTMLVideoElement | null>,
  trainerCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  trainerJointCanvasRef: React.RefObject<HTMLCanvasElement | null>,
  isPlaying: boolean
) {
  const [trainerPose, setTrainerPose] = useState<poseDetection.Pose | null>(null);
  const [trainerAngles, setTrainerAngles] = useState<TrainerAngles>(DEFAULT_ANGLES);
  const [isTrainerReady, setIsTrainerReady] = useState(false);
  const analyzeCompleteRef = useRef(false);

  // initial analysis: seek to 3s and detect pose
  useEffect(() => {
    if (!trainerVideoUrl || !detector || !trainerVideoRef.current) return;
    analyzeCompleteRef.current = false;

    const analyzeTrainerVideo = async () => {
      if (!trainerVideoRef.current || !detector) return;
      setIsTrainerReady(false);

      trainerVideoRef.current.currentTime = 3.0;

      await new Promise((resolve) => {
        const handleSeeked = () => {
          trainerVideoRef.current?.removeEventListener('seeked', handleSeeked);
          resolve(null);
        };
        trainerVideoRef.current?.addEventListener('seeked', handleSeeked);
      });

      try {
        const poses = await detector.estimatePoses(trainerVideoRef.current);
        if (poses.length > 0) {
          const pose = poses[0];
          setTrainerPose(pose);
          setTrainerAngles(calculateAngles(pose.keypoints));

          if (trainerCanvasRef.current) {
            drawPoseOnCanvas(pose, trainerCanvasRef.current, trainerVideoRef.current, true);
          }
          if (trainerJointCanvasRef.current) {
            drawJointLinesOnCanvas(pose, trainerJointCanvasRef.current, true);
          }

          setIsTrainerReady(true);
          analyzeCompleteRef.current = true;
        }
      } catch (error) {
        console.error('Error analyzing trainer video:', error);
      }
    };

    analyzeTrainerVideo();
  }, [trainerVideoUrl, detector, trainerVideoRef, trainerCanvasRef, trainerJointCanvasRef]);

  // continuous tracking during playback
  const updateTrainerPose = useCallback(async () => {
    if (!trainerVideoRef.current || !detector || !isPlaying) return;

    try {
      const poses = await detector.estimatePoses(trainerVideoRef.current);
      if (poses.length > 0) {
        const pose = poses[0];
        setTrainerPose(pose);
        setTrainerAngles(calculateAngles(pose.keypoints));

        if (trainerCanvasRef.current) {
          drawPoseOnCanvas(pose, trainerCanvasRef.current, trainerVideoRef.current, true);
        }
        if (trainerJointCanvasRef.current) {
          drawJointLinesOnCanvas(pose, trainerJointCanvasRef.current, true);
        }
      }
    } catch (error) {
      console.error('Error updating trainer pose:', error);
    }
  }, [detector, isPlaying, trainerVideoRef, trainerCanvasRef, trainerJointCanvasRef]);

  useEffect(() => {
    const videoElement = trainerVideoRef.current;
    if (!videoElement) return;

    videoElement.addEventListener('timeupdate', updateTrainerPose);
    return () => videoElement.removeEventListener('timeupdate', updateTrainerPose);
  }, [trainerVideoRef, updateTrainerPose]);

  return { trainerPose, trainerAngles, isTrainerReady };
}
