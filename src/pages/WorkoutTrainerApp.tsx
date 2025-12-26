import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { Play, Upload, Pause, SkipBack, SkipForward, RotateCcw, Camera, CameraOff, Download, Settings, Minimize2, Maximize2, LogOut, User, RefreshCw, Plus, ChevronDown, Menu, X, FolderOpen, Trash2, Mic, MicOff, CheckCircle2, AlertTriangle, XCircle, Volume2, VolumeX, Repeat, Gauge } from 'lucide-react';
import { calculateAngles, calculateAccuracy, generateFeedback, calculateOverallAccuracy, initializeDetector, analyzeVideoForSegments, calculateSegmentMatch, SegmentTrainingState, initialSegmentState } from '../utils';
import { voiceFeedbackService } from '../services/voiceFeedbackService';
import { useUser } from '../context/UserContext';

import './WorkoutTrainerApp.css';
import { createPortal } from 'react-dom';

interface WorkoutTrainerAppProps {
  preloadedCameraStream?: MediaStream | null;
  preloadedDetector?: poseDetection.PoseDetector | null;
}

export default function WorkoutTrainerApp({ preloadedCameraStream, preloadedDetector }: WorkoutTrainerAppProps) {
  // refs and state for webcam and pose detection
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trainerJointCanvasRef = useRef<HTMLCanvasElement>(null);
  const traineeJointCanvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(preloadedDetector || null);
  const [isDetecting, setIsDetecting] = useState<boolean>(!!preloadedCameraStream && !!preloadedDetector);
  const [cameraActive, setCameraActive] = useState<boolean>(!!preloadedCameraStream);
  const [voiceFeedbackActive, setVoiceFeedbackActive] = useState<boolean>(false);
  const [isTrainerReady, setIsTrainerReady] = useState<boolean>(false);
  const [isPoseReady, setIsPoseReady] = useState<boolean>(false);
  const [preloadedStream] = useState<MediaStream | null>(preloadedCameraStream || null);

  // trainer video element and related state
  const trainerVideoRef = useRef<HTMLVideoElement>(null);
  const trainerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [trainerVideoUrl, setTrainerVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trainerPose, setTrainerPose] = useState<poseDetection.Pose | null>(null);
  const [trainerAngles, setTrainerAngles] = useState<{
    Hip: number;
    Knee: number;
    Elbow: number;
    Shoulder: number;
    BackStraightness: number;
    UpperBack: number;
    MidBack: number;
    LowerBack: number;
  }>({
    Hip: 120,
    Knee: 145,
    Elbow: 90,
    Shoulder: 180,
    BackStraightness: 180,
    UpperBack: 180,
    MidBack: 180,
    LowerBack: 180
  });


  // pose accuracy data with debouncing to reduce ui updates
  const [postureAccuracy, setPostureAccuracy] = useState(85);
  const [postureStatus, setPostureStatus] = useState('CORRECT');
  const [jointAngles, setJointAngles] = useState([
    { joint: 'Hip', angle: 120, accuracy: 85 },
    { joint: 'Knee', angle: 145, accuracy: 45 },
    { joint: 'Elbow', angle: 90, accuracy: 65 },
    { joint: 'Shoulder', angle: 180, accuracy: 75 },
    { joint: 'Back', angle: 180, accuracy: 100 }
  ]);


  const [feedbackItems, setFeedbackItems] = useState<{ text: string, status: 'good' | 'warning' | 'error' }[]>([
    { text: 'Position yourself in front of the camera', status: 'warning' }
  ]);

  // stores the detected pose from trainee's webcam
  const [traineePose, setTraineePose] = useState<poseDetection.Pose | null>(null);

  // training session state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);

  // Enhanced video player state
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Segmented Training Mode state
  const [segmentState, setSegmentState] = useState<SegmentTrainingState>(initialSegmentState);
  const [lastAnalyzedVideoUrl, setLastAnalyzedVideoUrl] = useState<string | null>(null);
  const holdStartTimeRef = useRef<number>(0);
  const HOLD_DURATION_MS = 1500; // 1.5 seconds to hold correct pose

  // Training metrics for Supabase
  const [trainingStartTime, setTrainingStartTime] = useState<number | null>(null);
  const [accuracyReadings, setAccuracyReadings] = useState<number[]>([]);
  const { completeWorkout, isLoggedIn } = useUser();

  // exercise categories and videos management
  interface ExerciseVideo {
    name: string;
    url: string;
  }

  interface ExerciseCategory {
    name: string;
    videos: ExerciseVideo[];
  }

  const [exerciseCategories, setExerciseCategories] = useState<ExerciseCategory[]>(() => {
    // load saved categories from localstorage
    const savedCategories = localStorage.getItem('exerciseCategories');
    return savedCategories ? JSON.parse(savedCategories) : [
      { name: 'Squats', videos: [] },
      { name: 'Strength Training', videos: [] },
      { name: 'Cardio', videos: [] }
    ];
  });

  // persist categories to localstorage when they change
  useEffect(() => {
    localStorage.setItem('exerciseCategories', JSON.stringify(exerciseCategories));
  }, [exerciseCategories]);

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    // use first saved category or default to squats
    const savedCategories = localStorage.getItem('exerciseCategories');
    if (savedCategories) {
      const categories = JSON.parse(savedCategories);
      return categories.length > 0 ? categories[0].name : '';
    }
    return 'Squats'; // Default to first category
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // video selection state
  const [showVideoDropdown, setShowVideoDropdown] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);

  // debounce refs for performance
  const lastUpdateTime = useRef(0);
  const pendingData = useRef<{
    angles: any
    accuracy: any,
    overallAccuracy: number,
    feedback: any
  } | null>(null);

  // dropdown refs for click-outside detection
  const videoBtnRef = useRef<HTMLButtonElement>(null);
  const videoDropdownRef = useRef<HTMLDivElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // setup tensorflow and movenet detector on mount (only if not preloaded)
  useEffect(() => {
    // If detector was preloaded, use it directly
    if (preloadedDetector) {
      setDetector(preloadedDetector);
      setCameraActive(true);
      setIsDetecting(true);
      return;
    }

    // Otherwise initialize detector
    const initDetector = async () => {
      try {
        const initializedDetector = await initializeDetector();
        setDetector(initializedDetector);
        setCameraActive(true);
      } catch (error) {
        console.error('Error initializing pose detector:', error);
      }
    };

    initDetector();

    return () => {
      if (detector && !preloadedDetector) {
        detector.dispose?.();
      }
    };
  }, [preloadedDetector]);

  // Apply preloaded stream to webcam video element when ready
  useEffect(() => {
    if (preloadedStream && webcamRef.current?.video) {
      const video = webcamRef.current.video;
      if (video.srcObject !== preloadedStream) {
        video.srcObject = preloadedStream;
        video.play().catch(err => console.warn('Video play error:', err));
      }
    }
  }, [preloadedStream, cameraActive]);

  // cleanup voice service when component unmounts
  useEffect(() => {
    return () => {
      voiceFeedbackService.cleanup();
    };
  }, []);

  // navbar scroll effect - adds shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 10) {
          headerRef.current.classList.add('scrolled');
        } else {
          headerRef.current.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // detect pose in trainer video when loaded or playing
  useEffect(() => {
    if (!trainerVideoUrl || !detector || !trainerVideoRef.current) return;

    const analyzeTrainerVideo = async () => {
      if (!trainerVideoRef.current || !detector) return;

      // wait a moment for trainer to get into position
      setIsTrainerReady(false);

      // seek to 3 seconds for better pose analysis
      trainerVideoRef.current.currentTime = 3.0;

      // wait for seek to complete
      await new Promise(resolve => {
        const handleSeeked = () => {
          trainerVideoRef.current?.removeEventListener('seeked', handleSeeked);
          resolve(null);
        };
        trainerVideoRef.current?.addEventListener('seeked', handleSeeked);
      });

      try {
        // detect pose in trainer video frame
        const poses = await detector.estimatePoses(trainerVideoRef.current);

        if (poses.length > 0) {
          const pose = poses[0];
          setTrainerPose(pose);

          // get angles from trainer for comparison
          const angles = calculateAngles(pose.keypoints);
          setTrainerAngles(angles);

          // draw skeleton overlay on trainer video
          if (trainerCanvasRef.current) {
            drawPoseOnCanvas(pose, trainerCanvasRef.current, true);
          }

          // draw joint lines on separate canvas
          if (trainerJointCanvasRef.current) {
            drawJointLinesOnCanvas(pose, trainerJointCanvasRef.current, true);
          }

          setIsTrainerReady(true);
        }
      } catch (error) {
        console.error('Error analyzing trainer video:', error);
      }
    };

    analyzeTrainerVideo();

    // continuously update trainer pose during video playback
    const updateTrainerPoseDuringPlayback = async () => {
      if (!trainerVideoRef.current || !detector || !isPlaying) return;

      try {
        const poses = await detector.estimatePoses(trainerVideoRef.current);

        if (poses.length > 0) {
          const pose = poses[0];
          setTrainerPose(pose);

          // update angles as trainer moves
          const angles = calculateAngles(pose.keypoints);
          setTrainerAngles(angles);

          // redraw skeleton on trainer canvas
          if (trainerCanvasRef.current) {
            drawPoseOnCanvas(pose, trainerCanvasRef.current, true);
          }

          // redraw joint lines
          if (trainerJointCanvasRef.current) {
            drawJointLinesOnCanvas(pose, trainerJointCanvasRef.current, true);
          }
        }
      } catch (error) {
        console.error('Error updating trainer pose during playback:', error);
      }
    };

    const videoElement = trainerVideoRef.current;
    videoElement.addEventListener('timeupdate', updateTrainerPoseDuringPlayback);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTrainerPoseDuringPlayback);
    };
  }, [trainerVideoUrl, detector, isPlaying]);

  // draws skeleton joints on a canvas with white background
  const drawJointLinesOnCanvas = (pose: poseDetection.Pose, canvas: HTMLCanvasElement, isTrainer: boolean = false, accuracyData: any = null) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 300;
    canvas.height = 300;

    // white background for clean look
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // scale keypoints to fit canvas
    const keypoints = pose.keypoints;
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = 0;
    let maxY = 0;

    // find pose boundaries
    keypoints.forEach(keypoint => {
      if (keypoint.score && keypoint.score > 0.3) {
        minX = Math.min(minX, keypoint.x);
        minY = Math.min(minY, keypoint.y);
        maxX = Math.max(maxX, keypoint.x);
        maxY = Math.max(maxY, keypoint.y);
      }
    });

    // center the pose in canvas
    const poseWidth = maxX - minX;
    const poseHeight = maxY - minY;
    const scale = Math.min(
      (canvas.width * 0.8) / poseWidth,
      (canvas.height * 0.8) / poseHeight
    );

    const offsetX = (canvas.width - poseWidth * scale) / 2;
    const offsetY = (canvas.height - poseHeight * scale) / 2;

    // Define connections for drawing skeleton
    const connections = [
      ['nose', 'left_eye'], ['nose', 'right_eye'],
      ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
    ];

    // map body parts to joint names for color coding
    const bodyPartToJoint: { [key: string]: string } = {
      'left_shoulder': 'Shoulder', 'right_shoulder': 'Shoulder',
      'left_elbow': 'Elbow', 'right_elbow': 'Elbow',
      'left_hip': 'Hip', 'right_hip': 'Hip',
      'left_knee': 'Knee', 'right_knee': 'Knee'
    };

    // Draw connections
    connections.forEach(([from, to]) => {
      const fromKeypoint = pose.keypoints.find(kp => kp.name === from);
      const toKeypoint = pose.keypoints.find(kp => kp.name === to);

      if (
        fromKeypoint &&
        toKeypoint &&
        fromKeypoint.score &&
        toKeypoint.score &&
        fromKeypoint.score > 0.3 &&
        toKeypoint.score > 0.3
      ) {
        ctx.beginPath();

        // Scale and center the coordinates
        let fromX = (fromKeypoint.x - minX) * scale + offsetX;
        let fromY = (fromKeypoint.y - minY) * scale + offsetY;
        let toX = (toKeypoint.x - minX) * scale + offsetX;
        let toY = (toKeypoint.y - minY) * scale + offsetY;

        // For trainee, flip horizontally to correct mirror effect
        if (!isTrainer) {
          fromX = canvas.width - fromX;
          toX = canvas.width - toX;
        }

        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineWidth = isTrainer ? 2 : 2;

        // color based on accuracy for trainee joints
        if (!isTrainer && accuracyData && (from in bodyPartToJoint || to in bodyPartToJoint)) {
          const jointName = bodyPartToJoint[from] || bodyPartToJoint[to];
          const accuracy = accuracyData[jointName] || 0;

          if (accuracy >= 85) {
            ctx.strokeStyle = '#10b981'; // Green for good
          } else if (accuracy >= 50) {
            ctx.strokeStyle = '#f59e0b'; // Orange for warning
          } else {
            ctx.strokeStyle = '#ef4444'; // Red for error
          }
        } else {
          // orange for trainer, hot theme for trainee
          ctx.strokeStyle = isTrainer ? '#000000ff' : '#f97316';
        }

        ctx.stroke();
      }
    });

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score && keypoint.score > 0.3) {
        ctx.beginPath();

        // Scale and center the coordinates
        let x = (keypoint.x - minX) * scale + offsetX;
        let y = (keypoint.y - minY) * scale + offsetY;

        // For trainee, flip horizontally to correct mirror effect
        if (!isTrainer) {
          x = canvas.width - x;
        }

        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = isTrainer ? '#000000ff' : '#f97316';
        ctx.fill();
      }
    });
  };

  // draws pose skeleton on video overlay canvas
  const drawPoseOnCanvas = (pose: poseDetection.Pose, canvas: HTMLCanvasElement, isTrainer: boolean = false, accuracyData: any = null) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // match canvas size to video
    const videoElement = isTrainer ? trainerVideoRef.current : webcamRef.current?.video;
    if (videoElement) {
      canvas.width = videoElement.videoWidth || videoElement.width;
      canvas.height = videoElement.videoHeight || videoElement.height;

      // clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Draw keypoints with circles
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.score && keypoint.score > 0.3) {
        // For trainee, flip horizontally to correct mirror effect
        let x = keypoint.x;
        if (!isTrainer) {
          x = canvas.width - x;
        }

        // Draw white outline for visibility
        ctx.beginPath();
        ctx.arc(x, keypoint.y, isTrainer ? 12 : 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Draw colored circle
        ctx.beginPath();
        ctx.arc(x, keypoint.y, isTrainer ? 10 : 6, 0, 2 * Math.PI);
        ctx.fillStyle = isTrainer ? '#d28249ff' : '#f05757ff';
        ctx.fill();
      }
    });

    // Define connections for drawing skeleton
    const connections = [
      ['nose', 'left_eye'], ['nose', 'right_eye'],
      ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
    ];

    // map body parts to joints for accuracy coloring
    const bodyPartToJoint: { [key: string]: string } = {
      'left_shoulder': 'Shoulder', 'right_shoulder': 'Shoulder',
      'left_elbow': 'Elbow', 'right_elbow': 'Elbow',
      'left_hip': 'Hip', 'right_hip': 'Hip',
      'left_knee': 'Knee', 'right_knee': 'Knee'
    };

    // draw lines with color based on accuracy
    connections.forEach(([from, to]) => {
      const fromKeypoint = pose.keypoints.find(kp => kp.name === from);
      const toKeypoint = pose.keypoints.find(kp => kp.name === to);

      if (
        fromKeypoint &&
        toKeypoint &&
        fromKeypoint.score &&
        toKeypoint.score &&
        fromKeypoint.score > 0.3 &&
        toKeypoint.score > 0.3
      ) {
        ctx.beginPath();

        // For trainee, flip horizontally to correct mirror effect
        let fromX = fromKeypoint.x;
        let toX = toKeypoint.x;

        if (!isTrainer) {
          fromX = canvas.width - fromX;
          toX = canvas.width - toX;
        }

        ctx.moveTo(fromX, fromKeypoint.y);
        ctx.lineTo(toX, toKeypoint.y);
        ctx.lineWidth = isTrainer ? 7 : 2;

        // set line color by accuracy level
        if (!isTrainer && accuracyData && (from in bodyPartToJoint || to in bodyPartToJoint)) {
          const jointName = bodyPartToJoint[from] || bodyPartToJoint[to];
          const accuracy = accuracyData[jointName] || 0;

          if (accuracy >= 85) {
            ctx.strokeStyle = '#10b981'; // Green for good
          } else if (accuracy >= 50) {
            ctx.strokeStyle = '#f59e0b'; // Orange for warning
          } else {
            ctx.strokeStyle = '#ef4444'; // Red for error
          }
        } else {
          // hot theme colors
          ctx.strokeStyle = isTrainer ? '#f97316' : '#ef4444';
        }

        ctx.stroke();
      }
    });
  };

  // update ui state with processed pose data
  const updateUIWithData = useCallback((data: any) => {
    setJointAngles([
      { joint: 'Hip', angle: Math.round(data.angles.Hip), accuracy: data.accuracy.Hip },
      { joint: 'Knee', angle: Math.round(data.angles.Knee), accuracy: data.accuracy.Knee },
      { joint: 'Elbow', angle: Math.round(data.angles.Elbow), accuracy: data.accuracy.Elbow },
      { joint: 'Shoulder', angle: Math.round(data.angles.Shoulder), accuracy: data.accuracy.Shoulder },
      { joint: 'Back', angle: Math.round(data.angles.BackStraightness), accuracy: data.accuracy.BackStraightness }
    ]);

    setPostureAccuracy(data.overallAccuracy);  // use calculated overall accuracy

    // Collect accuracy readings for workout average
    if (data.overallAccuracy > 0) {
      setAccuracyReadings(prev => [...prev, data.overallAccuracy]);
    }

    if (data.overallAccuracy >= 85) {  // 85+ is considered good form
      setPostureStatus('CORRECT');
    } else {
      setPostureStatus('INCORRECT');
    }

    const goodFeedback = data.feedback.filter((item: any) => item.status === 'good');
    const improvementFeedback = data.feedback.filter((item: any) => item.status === 'warning' || item.status === 'error');

    const organizedFeedback = [
      { text: 'Good Form:', status: 'good' as const },
      ...goodFeedback,
      { text: 'Needs Improvement:', status: 'warning' as const },
      ...improvementFeedback
    ];

    setFeedbackItems(organizedFeedback);

    // only speak corrections, not positive feedback
    voiceFeedbackService.addFeedback(improvementFeedback);
  }, []);



  // process debounced pose updates at 500ms intervals
  useEffect(() => {
    const processDebounce = () => {
      const now = Date.now();

      // only update if 500ms has passed since last update
      if (pendingData.current && now - lastUpdateTime.current > 500) {
        updateUIWithData(pendingData.current);
        lastUpdateTime.current = now;
        pendingData.current = null;
      }

      requestAnimationFrame(processDebounce);
    };

    const animationFrameId = requestAnimationFrame(processDebounce);
    return () => cancelAnimationFrame(animationFrameId);
  }, [updateUIWithData]);

  // main pose detection loop - runs every animation frame
  useEffect(() => {
    let animationFrameId: number;

    const detectPose = async () => {
      try {
        if (
          isDetecting &&
          detector &&
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4 &&
          canvasRef.current
        ) {
          const video = webcamRef.current.video;
          const canvas = canvasRef.current;

          // run pose detection on webcam frame
          const poses = await detector.estimatePoses(video);

          if (poses.length > 0) {
            const pose = poses[0];
            setTraineePose(pose);

            // calculate joint angles from keypoints
            const angles = calculateAngles(pose.keypoints);

            // compare trainee angles to trainer or defaults
            // use trainer or default ideal angles
            const idealAngles = trainerPose ? {
              ...trainerAngles,
              visibleJoints: {  // track which joints are visible
                Hip: true,
                Knee: true,
                Elbow: true,
                Shoulder: true,
                Back: true
              }
            } : {
              Hip: 120,
              Knee: 145,
              Elbow: 90,
              Shoulder: 180,
              BackStraightness: 180,
              UpperBack: 180,
              MidBack: 180,
              LowerBack: 180,
              visibleJoints: {  // default visibility flags
                Hip: true,
                Knee: true,
                Elbow: true,
                Shoulder: true,
                Back: true
              }
            };


            const accuracy = calculateAccuracy(angles, idealAngles);

            // use harmonic mean for more accurate overall score
            const overallAccuracy = calculateOverallAccuracy(accuracy);

            // Generate feedback
            const feedback = generateFeedback(angles, idealAngles, accuracy, pose.keypoints);

            // draw skeleton with accuracy-based colors
            drawPoseOnCanvas(pose, canvas, false, accuracy);

            // update trainee joint visualization
            if (traineeJointCanvasRef.current) {
              drawJointLinesOnCanvas(pose, traineeJointCanvasRef.current, false, accuracy);
              // Mark pose as ready once we've drawn the first pose
              if (!isPoseReady) {
                setIsPoseReady(true);
              }
            }

            // only update ui during active training
            if (isTraining) {
              // queue data for debounced update
              pendingData.current = {
                angles,
                accuracy,
                overallAccuracy,  // using harmonic mean
                feedback
              };
            }

            // Segment mode: check if trainee matches target pose
            if (segmentState.isActive && segmentState.segmentStatus === 'waiting') {
              checkSegmentMatch(angles);
            }
          } else {
            // no pose detected in frame
            if (isTraining) {
              pendingData.current = {
                angles: {
                  Hip: 0,
                  Knee: 0,
                  Elbow: 0,
                  Shoulder: 0,
                  BackStraightness: 0,
                  UpperBack: 0,
                  MidBack: 0,
                  LowerBack: 0,
                  visibleJoints: { Hip: false, Knee: false, Elbow: false, Shoulder: false, Back: false }
                },
                accuracy: {
                  Hip: 0,
                  Knee: 0,
                  Elbow: 0,
                  Shoulder: 0,
                  BackStraightness: 0,
                  UpperBack: 0,
                  MidBack: 0,
                  LowerBack: 0
                },
                overallAccuracy: 0,  // no valid accuracy
                feedback: [
                  { text: 'No person detected. Position yourself in front of the camera.', status: 'error' }
                ]
              };
            }
          }

        } else if (webcamRef.current && !webcamRef.current.video) {
          // webcam not available
          if (isTraining) {
            pendingData.current = {
              angles: {
                Hip: 0,
                Knee: 0,
                Elbow: 0,
                Shoulder: 0,
                BackStraightness: 0,
                UpperBack: 0,
                MidBack: 0,
                LowerBack: 0,
                visibleJoints: { Hip: false, Knee: false, Elbow: false, Shoulder: false, Back: false }
              },
              accuracy: {
                Hip: 0,
                Knee: 0,
                Elbow: 0,
                Shoulder: 0,
                BackStraightness: 0,
                UpperBack: 0,
                MidBack: 0,
                LowerBack: 0
              },
              overallAccuracy: 0,  // camera not ready
              feedback: [
                { text: 'Camera not available. Please allow camera access.', status: 'error' }
              ]
            };
          }
        }

      } catch (error) {
        console.error('Error in pose detection:', error);
      }

      animationFrameId = requestAnimationFrame(detectPose);
    };

    if (isDetecting) {
      detectPose();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDetecting, detector, trainerPose, trainerAngles, isTraining]);

  // handle video file upload from user
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Revoke old blob URL to prevent memory leak
      if (trainerVideoUrl) {
        URL.revokeObjectURL(trainerVideoUrl);
      }

      const url = URL.createObjectURL(file);

      // add video to current category
      const updatedCategories = exerciseCategories.map(category => {
        if (category.name === selectedCategory) {
          return {
            ...category,
            videos: [...category.videos, { name: file.name, url }]
          };
        }
        return category;
      });

      setExerciseCategories(updatedCategories);

      // Reset trainer state for new video
      setIsTrainerReady(false);
      setTrainerPose(null);

      // Auto-load the newly uploaded video
      setTrainerVideoUrl(url);
      setSelectedVideo({ name: file.name, url });
      setIsPlaying(false);

      // Reset video element
      if (trainerVideoRef.current) {
        trainerVideoRef.current.load();
        trainerVideoRef.current.currentTime = 0;
      }

      setShowVideoDropdown(false);
    }
  };

  // load a previously saved video
  const loadVideo = (video: ExerciseVideo) => {
    setTrainerVideoUrl(video.url);
    setSelectedVideo(video);
    setIsPlaying(false);
    if (trainerVideoRef.current) {
      trainerVideoRef.current.currentTime = 0;
    }
    setShowVideoDropdown(false);
  };

  // play/pause video with training requirement
  const togglePlayPause = () => {
    if (!isTraining) {
      alert('Please click "Start Training" first to begin the session.');
      return;
    }

    if (trainerVideoRef.current) {
      if (isPlaying) {
        trainerVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        trainerVideoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const skipBackward = () => {
    if (trainerVideoRef.current) {
      trainerVideoRef.current.currentTime -= 5;
    }
  };

  const skipForward = () => {
    if (trainerVideoRef.current) {
      trainerVideoRef.current.currentTime += 5;
    }
  };

  // Format seconds to MM:SS display
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Analyze video for segments (runs on video load, before training starts)
  const startSegmentMode = async () => {
    if (!trainerVideoRef.current || !detector || !trainerVideoUrl) {
      return;
    }

    // Start analysis (but don't activate segment training yet)
    setSegmentState(prev => ({
      ...prev,
      isActive: false, // Not active until training starts
      isAnalyzing: true,
      analysisProgress: 0,
      segments: []
    }));

    try {
      const segments = await analyzeVideoForSegments(
        trainerVideoRef.current,
        detector,
        { angleThreshold: 15, minSegmentDuration: 1.0 },
        (progress) => {
          setSegmentState(prev => ({ ...prev, analysisProgress: progress }));
        }
      );

      if (segments.length === 0) {
        console.log('No poses detected in video');
        setSegmentState(initialSegmentState);
        return;
      }

      // Analysis complete - store segments but don't activate yet
      // Training activation will happen when user starts training
      setSegmentState(prev => ({
        ...prev,
        isAnalyzing: false,
        segments: segments,
        currentSegmentIndex: 0,
        segmentStatus: 'idle', // Waiting for training to start
        holdProgress: 0
      }));

      // Mark this video as analyzed
      setLastAnalyzedVideoUrl(trainerVideoUrl);
    } catch (error) {
      console.error('Error analyzing video:', error);
      alert('Error analyzing video. Please try again.');
      setSegmentState(initialSegmentState);
    }
  };

  // Check trainee pose against current segment target
  const checkSegmentMatch = useCallback((traineeAngles: any) => {
    if (!segmentState.isActive || segmentState.isAnalyzing || segmentState.segments.length === 0) {
      return;
    }

    const currentSegment = segmentState.segments[segmentState.currentSegmentIndex];
    if (!currentSegment || segmentState.segmentStatus !== 'waiting') {
      return;
    }

    // Calculate match
    const { accuracy, matched } = calculateSegmentMatch(traineeAngles, currentSegment);

    if (matched) {
      // Start or continue hold timer
      if (holdStartTimeRef.current === 0) {
        holdStartTimeRef.current = Date.now();
      }

      const heldTime = Date.now() - holdStartTimeRef.current;
      const holdProgress = Math.min(100, (heldTime / HOLD_DURATION_MS) * 100);

      setSegmentState(prev => ({
        ...prev,
        matchAccuracy: accuracy,
        holdProgress
      }));

      // Check if held long enough
      if (heldTime >= HOLD_DURATION_MS) {
        advanceToNextSegment();
      }
    } else {
      // Reset hold timer if pose is not matching
      holdStartTimeRef.current = 0;
      setSegmentState(prev => ({
        ...prev,
        matchAccuracy: accuracy,
        holdProgress: 0
      }));
    }
  }, [segmentState]);

  // Advance to next segment
  const advanceToNextSegment = () => {
    const nextIndex = segmentState.currentSegmentIndex + 1;

    // Mark current segment as matched
    const updatedSegments = [...segmentState.segments];
    updatedSegments[segmentState.currentSegmentIndex].matched = true;

    if (nextIndex >= segmentState.segments.length) {
      // All segments completed!
      setSegmentState(prev => ({
        ...prev,
        segments: updatedSegments,
        segmentStatus: 'completed',
        holdProgress: 0
      }));

      // Pause video
      if (trainerVideoRef.current) {
        trainerVideoRef.current.pause();
        setIsPlaying(false);
      }

      return;
    }

    // Move to next segment
    const nextSegment = segmentState.segments[nextIndex];
    holdStartTimeRef.current = 0;

    setSegmentState(prev => ({
      ...prev,
      segments: updatedSegments,
      currentSegmentIndex: nextIndex,
      segmentStatus: 'playing',
      holdProgress: 0,
      matchAccuracy: 0
    }));

    // Seek to next segment and play
    if (trainerVideoRef.current) {
      trainerVideoRef.current.currentTime = nextSegment.startTime;
      trainerVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Exit segment mode
  const exitSegmentMode = () => {
    setSegmentState(initialSegmentState);
    holdStartTimeRef.current = 0;
    if (trainerVideoRef.current) {
      trainerVideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // begin training session with countdown
  const startTraining = () => {
    if (!trainerVideoUrl) {
      alert('Please load a trainer video first to start training.');
      return;
    }

    // Block training if segment analysis is still in progress
    if (segmentState.isAnalyzing) {
      alert('Please wait for video analysis to complete before starting training.');
      return;
    }

    // Reset accuracy readings for new session
    setAccuracyReadings([]);

    // start 3 second countdown
    setShowCountdown(true);
    setCountdownValue(3);

    const countdownInterval = setInterval(() => {
      setCountdownValue(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setShowCountdown(false);
          setIsTraining(true);
          setTrainingStartTime(Date.now()); // Track start time

          // Activate segment mode training (segments already analyzed on video load)
          if (segmentState.segments.length > 0 && !segmentState.isActive) {
            setSegmentState(prev => ({
              ...prev,
              isActive: true,
              segmentStatus: 'playing',
              currentSegmentIndex: 0
            }));

            // Seek to first segment start and play
            if (trainerVideoRef.current) {
              trainerVideoRef.current.currentTime = segmentState.segments[0].startTime;
              trainerVideoRef.current.play();
              setIsPlaying(true);
            }
          }

          // countdown finished, begin training
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // end training session
  const stopTraining = async () => {
    setIsTraining(false);
    if (trainerVideoRef.current) {
      trainerVideoRef.current.pause();
    }
    setIsPlaying(false);

    // Calculate training duration and average accuracy
    if (trainingStartTime && isLoggedIn) {
      const durationMinutes = (Date.now() - trainingStartTime) / 60000;
      const avgAccuracy = accuracyReadings.length > 0
        ? accuracyReadings.reduce((a, b) => a + b, 0) / accuracyReadings.length
        : postureAccuracy;

      // Only save if training was at least 10 seconds
      if (durationMinutes >= 0.17) {
        try {
          const exerciseName = selectedCategory || 'General Workout';
          const result = await completeWorkout(avgAccuracy, durationMinutes, exerciseName);

          // Show achievement notification if badges earned
          if (result.newBadges && result.newBadges.length > 0) {
            alert(`Congrats!! New Badge Earned: ${result.newBadges.join(', ')}!\n+${result.xpGained} XP`);
          }
        } catch (error) {
          console.error('Error saving workout:', error);
        }
      }
    }

    setTrainingStartTime(null);
    setAccuracyReadings([]);

    // reset ui to defaults
    setPostureAccuracy(85);
    setPostureStatus('CORRECT');
    // reset joint angles to initial values
    setJointAngles([
      { joint: 'Hip', angle: 120, accuracy: 85 },
      { joint: 'Knee', angle: 145, accuracy: 45 },
      { joint: 'Elbow', angle: 90, accuracy: 65 },
      { joint: 'Shoulder', angle: 180, accuracy: 75 },
      { joint: 'Back', angle: 180, accuracy: 100 }
    ]);


    setFeedbackItems([
      { text: 'Position yourself in front of the camera', status: 'warning' }
    ]);
  };

  // create new exercise category
  const addNewCategory = () => {
    if (newCategoryName.trim() === '') return;

    setExerciseCategories(prev => [
      ...prev,
      { name: newCategoryName, videos: [] }
    ]);

    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  // get videos for selected category
  const getCurrentCategoryVideos = () => {
    const category = exerciseCategories.find(cat => cat.name === selectedCategory);
    return category ? category.videos : [];
  };

  // remove a video from category
  const deleteVideo = (videoName: string) => {
    if (confirm(`Are you sure you want to delete the video "${videoName}"?`)) {
      const updatedCategories = exerciseCategories.map(category => {
        if (category.name === selectedCategory) {
          return {
            ...category,
            videos: category.videos.filter(video => video.name !== videoName)
          };
        }
        return category;
      });

      setExerciseCategories(updatedCategories);

      // if deleted video was selected, clear it
      if (selectedVideo && selectedVideo.name === videoName) {
        setSelectedVideo(null);
        setTrainerVideoUrl(null);
      }
    }
  };

  // remove an exercise category
  const deleteCategory = (categoryName: string) => {
    if (exerciseCategories.length <= 1) {
      alert("You cannot delete the last category. Please create a new category first.");
      return;
    }

    if (confirm(`Are you sure you want to delete the category "${categoryName}" and all its videos?`)) {
      const updatedCategories = exerciseCategories.filter(
        category => category.name !== categoryName
      );

      setExerciseCategories(updatedCategories);

      // select another category if current was deleted
      if (selectedCategory === categoryName) {
        setSelectedCategory(updatedCategories[0].name);
        setSelectedVideo(null);
        setTrainerVideoUrl(null);
      }
    }
  };

  // close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // close video dropdown if click is outside
      if (
        showVideoDropdown &&
        videoBtnRef.current &&
        videoDropdownRef.current &&
        !videoBtnRef.current.contains(event.target as Node) &&
        !videoDropdownRef.current.contains(event.target as Node)
      ) {
        setShowVideoDropdown(false);
      }

      // close category dropdown if click is outside
      if (
        showCategoryDropdown &&
        categoryBtnRef.current &&
        categoryDropdownRef.current &&
        !categoryBtnRef.current.contains(event.target as Node) &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVideoDropdown, showCategoryDropdown]);

  // handle window resize for dropdown positioning
  useEffect(() => {
    const updateDropdownPositions = () => {
      // no forced re-render to prevent flickering
      // Just update the state if needed
    };

    window.addEventListener('resize', updateDropdownPositions);
    return () => {
      window.removeEventListener('resize', updateDropdownPositions);
    };
  }, [showVideoDropdown, showCategoryDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 flex flex-col">
      {/* header bar */}
      <header ref={headerRef} className="bg-gradient-to-r from-orange-50 to-amber-50 backdrop-blur-lg border-b border-orange-200 shadow-lg sticky top-0 z-50">
        {/* Subtle background decoration */}
        <div className="absolute -top-20 left-1/3 w-64 h-64 bg-orange-100 rounded-full filter blur-[100px] opacity-20"></div>
        <div className="absolute -top-10 right-1/4 w-40 h-40 bg-amber-100 rounded-full filter blur-[80px] opacity-10"></div>

        <div className="container mx-auto py-2 px-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-center lg:justify-end relative z-[100] gap-2 sm:gap-4 mobile-header-controls">
            {/* controls section */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mobile-header-controls">
              <div className="dropdown-container">
                <button
                  ref={videoBtnRef}
                  onClick={() => {
                    if (isTraining || segmentState.isAnalyzing) return;
                    setShowVideoDropdown(!showVideoDropdown);
                  }}
                  disabled={isTraining || segmentState.isAnalyzing}
                  className={`trainer-button flex items-center justify-center transition-all text-xs sm:text-sm ${(isTraining || segmentState.isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  title={isTraining ? "Stop training to change video" : segmentState.isAnalyzing ? "Wait for analysis to complete" : ""}
                >
                  <Upload size={14} className="mr-1.5" />
                  <span className="hidden sm:inline">{selectedVideo ? "Change Video" : "Upload Video"}</span>
                  <span className="sm:hidden">Video</span>
                </button>

                {showVideoDropdown && (
                  <div
                    ref={videoDropdownRef}
                    className="dropdown-menu absolute top-full mt-2 left-0 w-64 max-h-[80vh] z-[99999]"

                  >
                    <div className="p-2 border-b border-gray-200 bg-gray-50">
                      <label className="inline-flex items-center w-full trainer-button cursor-pointer">
                        <Upload size={16} className="mr-2" />
                        <span>Upload New Video</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoUpload}
                        />
                      </label>
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {getCurrentCategoryVideos().length > 0 ? (
                        getCurrentCategoryVideos().map((video, index) => (
                          <div
                            key={index}
                            className="p-3 border-b border-gray-100 hover:bg-orange-50 cursor-pointer flex justify-between items-center group"
                          >
                            <span
                              className="truncate group-hover:text-orange-600 transition-colors flex-grow font-medium"
                              onClick={() => loadVideo(video)}
                            >
                              {video.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                className="text-orange-600 hover:text-orange-800 text-sm font-semibold px-2 py-1 rounded hover:bg-orange-50"
                                onClick={() => loadVideo(video)}
                              >
                                Load
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteVideo(video.name);
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No videos in this category
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="dropdown-container">
                <button
                  ref={categoryBtnRef}
                  className={`trainer-button flex items-center justify-center transition-all text-xs sm:text-sm ${(isTraining || segmentState.isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  onClick={() => {
                    if (isTraining || segmentState.isAnalyzing) return;
                    setShowCategoryDropdown(!showCategoryDropdown);
                  }}
                  disabled={isTraining || segmentState.isAnalyzing}
                  title={isTraining ? "Stop training to change category" : segmentState.isAnalyzing ? "Wait for analysis to complete" : ""}
                >
                  <FolderOpen size={14} className="mr-1.5" />
                  <span className="hidden sm:inline">{selectedCategory || "Select Category"}</span>
                  <span className="sm:hidden">Category</span>
                  <ChevronDown size={14} className="ml-1.5" />
                </button>

                {showCategoryDropdown && (
                  <div
                    ref={categoryDropdownRef}
                    className="dropdown-menu absolute top-full mt-2 left-0 w-64 max-h-[80vh] z-[99999]"

                  >
                    {exerciseCategories.length > 0 ? (
                      exerciseCategories.map((category, index) => (
                        <div
                          key={index}
                          className="p-3 border-b border-gray-100 hover:bg-orange-50 cursor-pointer flex items-center justify-between group"
                        >
                          <span
                            className="truncate group-hover:text-orange-600 transition-colors flex-grow font-medium"
                            onClick={() => {
                              setSelectedCategory(category.name);
                              setShowCategoryDropdown(false);
                            }}
                          >
                            {category.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {category.videos?.length || 0} videos
                            </span>
                            {exerciseCategories.length > 1 && (
                              <button
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCategory(category.name);
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No categories found
                      </div>
                    )}

                    {/* add new category button */}
                    <div
                      className="p-3 border-t border-gray-200 hover:bg-orange-50 cursor-pointer flex items-center text-orange-600 font-medium"
                      onClick={() => {
                        setShowCategoryDropdown(false);
                        setShowAddCategoryModal(true);
                      }}
                    >
                      <Plus size={16} className="mr-2" />
                      Add New Category
                    </div>
                  </div>
                )}
              </div>

              <div className="p-2 flex justify-center space-x-3">
                <button
                  className={`${isTraining ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700' : 'trainer-button'} text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all font-semibold text-sm`}
                  onClick={isTraining ? stopTraining : startTraining}
                >
                  {isTraining ? "Stop Training" : "Start Training"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* main content area */}

      <div className="flex-1 p-4 flex flex-col gap-6 relative">
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '15%',
          width: '550px',
          height: '550px',
          background: 'linear-gradient(to bottom right, rgba(249, 115, 22, 0.6), rgba(251, 191, 36, 0.6))',
          borderRadius: '20%',
          filter: 'blur(70px)',
          opacity: 0.35,
          animation: 'float-gradient-3 10s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'fixed',
          bottom: 99,
          left: '55%',
          width: '350px',
          height: '350px',
          background: 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.6), rgba(251, 146, 60, 0.6))',
          borderRadius: '20%',
          filter: 'blur(70px)',
          opacity: 0.35,
          animation: 'float-gradient-3 5s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0
        }}></div>

        {/* Subtle background decoration */}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-100 rounded-full filter blur-[150px] opacity-20 z-0"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-amber-100 rounded-full filter blur-[120px] opacity-20 z-0"></div>

        {/* video panels grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* left panel - trainer video */}
          <div className="trainer-card rounded-2xl overflow-hidden flex flex-col video-panel order-2 lg:order-1">
            <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <p className="text-xs text-center font-semibold text-gray-700">
                {selectedVideo ? `Trainer Video: ${selectedVideo.name}` : "Trainer Video Preview"}
              </p>
            </div>
            <div
              className="flex-1 bg-gray-900 m-3 rounded-xl flex items-center justify-center relative overflow-hidden"
              onMouseEnter={() => setShowVideoControls(true)}
              onMouseLeave={() => setShowVideoControls(false)}
            >
              {trainerVideoUrl ? (
                <>
                  <video
                    ref={trainerVideoRef}
                    src={trainerVideoUrl}
                    className="w-full h-full object-contain bg-black"
                    onEnded={() => {
                      if (!isLooping) setIsPlaying(false);
                    }}
                    playsInline
                    loop={isLooping}
                    onLoadedMetadata={() => {
                      if (trainerVideoRef.current) {
                        setVideoDuration(trainerVideoRef.current.duration);
                      }
                    }}
                    onLoadedData={() => {
                      // Set playback rate when video loads
                      if (trainerVideoRef.current) {
                        trainerVideoRef.current.playbackRate = playbackRate;
                      }
                      // Auto-start segment analysis when a NEW video loads
                      // Skip if same video already analyzed, or if currently analyzing
                      if (detector && trainerVideoUrl && trainerVideoUrl !== lastAnalyzedVideoUrl && !segmentState.isAnalyzing) {
                        // Clear previous segments for new video
                        setSegmentState(initialSegmentState);
                        startSegmentMode();
                      }
                    }}
                    onTimeUpdate={() => {
                      if (trainerVideoRef.current) {
                        const currentTime = trainerVideoRef.current.currentTime;
                        setVideoCurrentTime(currentTime);
                        setVideoProgress((currentTime / trainerVideoRef.current.duration) * 100);

                        // Segment mode: pause at segment end
                        if (segmentState.isActive && segmentState.segmentStatus === 'playing') {
                          const currentSegment = segmentState.segments[segmentState.currentSegmentIndex];
                          if (currentSegment && currentTime >= currentSegment.endTime - 0.1) {
                            // Pause and wait for trainee to match
                            trainerVideoRef.current.pause();
                            setIsPlaying(false);
                            setSegmentState(prev => ({
                              ...prev,
                              segmentStatus: 'waiting'
                            }));
                          }
                        }
                      }
                    }}
                  />
                  <canvas
                    ref={trainerCanvasRef}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                  {(!isTrainerReady || segmentState.isAnalyzing) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-xl">
                      <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-white text-sm font-medium">
                        {segmentState.isAnalyzing
                          ? `Analyzing video segments... ${Math.round(segmentState.analysisProgress)}%`
                          : 'Analyzing trainer pose...'
                        }
                      </p>
                      {segmentState.isAnalyzing && (
                        <div className="w-48 bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
                          <div
                            className="h-full bg-orange-500 transition-all duration-200"
                            style={{ width: `${segmentState.analysisProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enhanced video controls overlay */}
                  {showVideoControls && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 backdrop-blur-sm rounded-b-xl">
                      {/* Progress bar */}
                      <div
                        ref={progressBarRef}
                        className="h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer group"
                        onClick={(e) => {
                          if (progressBarRef.current && trainerVideoRef.current) {
                            const rect = progressBarRef.current.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            trainerVideoRef.current.currentTime = pos * videoDuration;
                          }
                        }}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full relative"
                          style={{ width: `${videoProgress}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      {/* Controls row */}
                      <div className="flex justify-between items-center">
                        {/* Left: playback controls */}
                        <div className="flex items-center gap-2">
                          <button
                            className="text-white hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-white/20"
                            onClick={skipBackward}
                          >
                            <SkipBack size={18} />
                          </button>
                          <button
                            className="text-white hover:text-orange-400 transition-colors p-2 rounded-lg hover:bg-white/20 bg-white/10"
                            onClick={togglePlayPause}
                          >
                            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                          </button>
                          <button
                            className="text-white hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-white/20"
                            onClick={skipForward}
                          >
                            <SkipForward size={18} />
                          </button>

                          {/* Time display */}
                          <span className="text-white/80 text-xs font-mono ml-2">
                            {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                          </span>
                        </div>

                        {/* Right: options */}
                        <div className="flex items-center gap-1">
                          {/* Speed selector */}
                          <div className="relative">
                            <button
                              className={`text-white hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-white/20 flex items-center gap-1 text-xs ${playbackRate !== 1 ? 'text-orange-400' : ''}`}
                              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                            >
                              <Gauge size={16} />
                              <span>{playbackRate}x</span>
                            </button>

                            {showSpeedMenu && (
                              <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg py-1 shadow-xl border border-white/10 z-50">
                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                  <button
                                    key={rate}
                                    className={`block w-full px-4 py-1.5 text-xs text-left hover:bg-white/10 transition-colors ${playbackRate === rate ? 'text-orange-400 bg-white/5' : 'text-white'}`}
                                    onClick={() => {
                                      setPlaybackRate(rate);
                                      if (trainerVideoRef.current) {
                                        trainerVideoRef.current.playbackRate = rate;
                                      }
                                      setShowSpeedMenu(false);
                                    }}
                                  >
                                    {rate}x
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Loop toggle */}
                          <button
                            className={`text-white hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-white/20 ${isLooping ? 'text-orange-400 bg-white/10' : ''}`}
                            onClick={() => setIsLooping(!isLooping)}
                            title="Loop video"
                          >
                            <Repeat size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400">No trainer video loaded</p>
              )}
            </div>
          </div>

          {/* middle panel - joint line comparison */}
          <div className="trainer-card rounded-2xl overflow-hidden flex flex-col video-panel order-3 lg:order-2">
            <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <p className="text-xs text-center font-semibold text-gray-700">Joint Line Comparison</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 m-3">
              {/* trainer joint lines */}
              <div className="bg-white rounded-xl flex items-center justify-center relative border-2 border-gray-100">
                <p className="text-orange-600 absolute top-2 left-2 text-xs font-semibold">Trainer Joint Lines</p>
                <canvas
                  ref={trainerJointCanvasRef}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* trainee joint lines */}
              <div className="bg-white rounded-xl flex items-center justify-center relative border-2 border-gray-100">
                <p className="text-red-600 absolute top-2 left-2 text-xs font-semibold z-10">Trainee Joint Lines</p>
                <canvas
                  ref={traineeJointCanvasRef}
                  className="w-full h-full object-contain"
                />
                {/* Loading overlay until pose is detected */}
                {!isPoseReady && cameraActive && (
                  <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-xl">
                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-xs text-gray-500 font-medium">Detecting pose...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* right panel - trainee camera - shows FIRST on mobile */}
          <div className="trainer-card rounded-2xl overflow-hidden flex flex-col video-panel order-1 lg:order-3">
            <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">Trainee's Cam</p>
                <button
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${cameraActive
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                    : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                    }`}
                >
                  {cameraActive ? (
                    <>
                      <Camera className="h-3 w-3" />
                      <span>ON</span>
                    </>
                  ) : (
                    <>
                      <CameraOff className="h-3 w-3" />
                      <span>OFF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-900 m-3 rounded-xl flex items-center justify-center relative overflow-hidden">
              {cameraActive ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    mirrored
                    className="absolute top-0 left-0 w-full h-full object-contain rounded-xl"
                    onLoadedMetadata={() => setIsDetecting(true)}
                    videoConstraints={{
                      width: 640,
                      height: 480,
                      facingMode: "user"
                    }}
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full object-contain z-10"
                  />
                </>
              ) : (
                <div className="text-center">
                  <CameraOff className="h-16 w-16 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-semibold">Camera is turned off</p>
                  <p className="text-gray-500 text-xs mt-1">Click the toggle to turn it on</p>
                </div>
              )}


            </div>

          </div>
        </div>

        {/* feedback and metrics section */}
        <div className="relative">
          {/* Blur overlay when not training */}
          {!isTraining && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 rounded-2xl flex items-center justify-center">
              <div className="text-center px-4">
                <div className="mb-3">
                  <Play className="h-16 w-16 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Start Training to Unlock</h3>
                <p className="text-sm text-gray-500">Click "Start Training" to access feedback, segment training, and metrics</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* feedback panel */}
            <div className="trainer-card rounded-2xl p-4 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left panel: Segment Mode info OR Good Form feedback */}
              <div>
                {segmentState.isActive && segmentState.segments.length > 0 ? (
                  <>
                    {/* SEGMENT MODE INFO */}
                    <h2 className="text-base font-bold mb-3 text-purple-700 flex items-center">
                      🎯 Segment Training
                    </h2>
                    <div className="space-y-3">
                      {/* Segment progress indicators */}
                      <div>
                        <div className="text-xs text-gray-500 mb-1.5">Progress</div>
                        <div className="flex items-center gap-1">
                          {segmentState.segments.map((segment, idx) => (
                            <div
                              key={segment.id}
                              className={`h-2 flex-1 rounded-full transition-all ${segment.matched
                                ? 'bg-green-500'
                                : idx === segmentState.currentSegmentIndex
                                  ? 'bg-orange-500'
                                  : 'bg-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Current segment info */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-800">
                          Segment {segmentState.currentSegmentIndex + 1} of {segmentState.segments.length}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {segmentState.segments[segmentState.currentSegmentIndex]?.description || 'Match this pose'}
                        </div>
                      </div>

                      {/* Status */}
                      {segmentState.segmentStatus === 'waiting' && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Match Accuracy</span>
                            <span className={`text-sm font-bold ${segmentState.matchAccuracy >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {Math.round(segmentState.matchAccuracy)}%
                            </span>
                          </div>
                          {segmentState.holdProgress > 0 && (
                            <>
                              <div className="bg-white/50 rounded-full h-3 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-100"
                                  style={{ width: `${segmentState.holdProgress}%` }}
                                />
                              </div>
                              <div className="text-xs text-green-600 mt-1 text-center font-medium">Hold the pose...</div>
                            </>
                          )}
                        </div>
                      )}

                      {segmentState.segmentStatus === 'completed' && (
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-green-600">🎉 Complete!</div>
                          <button
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
                            onClick={exitSegmentMode}
                          >
                            Exit Segment Mode
                          </button>
                        </div>
                      )}

                      {segmentState.segmentStatus === 'playing' && (
                        <div className="text-xs text-gray-500 italic text-center py-2">
                          Video playing... wait for segment end
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* GOOD FORM FEEDBACK (default) */}
                    <h2 className="text-base font-bold mb-3 text-green-700 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Good Form
                    </h2>
                    <div className="max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {feedbackItems.filter(item => item.status === 'good').length > 0 ? (
                        <ul className="space-y-2">
                          {feedbackItems
                            .filter(item => item.status === 'good')
                            .map((item, index) => (
                              <li key={index} className="feedback-item good">
                                <CheckCircle2 className="feedback-icon" />
                                <span>{item.text}</span>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <div className="text-gray-400 text-sm italic py-4 text-center">
                          Start training to see feedback
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right panel: Improvement feedback */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-orange-700 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Needs Improvement
                  </h2>
                  <button
                    onClick={() => {
                      const newState = !voiceFeedbackActive;
                      setVoiceFeedbackActive(newState);
                      voiceFeedbackService.setEnabled(newState);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${voiceFeedbackActive
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                      }`}
                    title={voiceFeedbackActive ? 'Voice Feedback ON' : 'Voice Feedback OFF'}
                  >
                    {voiceFeedbackActive ? (
                      <>
                        <Mic className="h-3 w-3" />
                        <span>VOICE ON</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="h-3 w-3" />
                        <span>VOICE OFF</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                  {feedbackItems.filter(item => item.status === 'warning' || item.status === 'error').length > 0 ? (
                    <ul className="space-y-2">
                      {feedbackItems
                        .filter(item => item.status === 'warning' || item.status === 'error')
                        .map((item, index) => (
                          <li key={index} className={`feedback-item ${item.status}`}>
                            {item.status === 'error' ? (
                              <XCircle className="feedback-icon" />
                            ) : (
                              <AlertTriangle className="feedback-icon" />
                            )}
                            <span>{item.text}</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <div className="text-green-600 text-sm font-medium py-4 text-center flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Great job! Form looks good</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* metrics panel - compact */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
              {/* overall posture accuracy */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Overall</div>
                    <div className={`text-2xl font-black leading-none ${postureAccuracy >= 85 ? 'text-green-600' :
                      postureAccuracy >= 70 ? 'text-orange-500' : 'text-red-500'
                      }`}>
                      {postureAccuracy}%
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded text-[10px] font-bold border ${postureStatus === 'CORRECT'
                    ? 'bg-green-50 text-green-700 border-green-300'
                    : 'bg-red-50 text-red-700 border-red-300'
                    }`}>
                    {postureStatus}
                  </div>
                </div>
              </div>

              {/* joint accuracy list */}
              <div className="p-2.5">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-0.5">Joint Accuracy</div>

                <div className="space-y-2">
                  {jointAngles.map((item, index) => {
                    const getColor = (accuracy: number) => {
                      if (accuracy >= 85) return { text: 'text-green-700', bg: 'bg-green-500', light: 'bg-green-100' };
                      if (accuracy >= 70) return { text: 'text-orange-700', bg: 'bg-orange-500', light: 'bg-orange-100' };
                      if (accuracy >= 50) return { text: 'text-amber-700', bg: 'bg-amber-500', light: 'bg-amber-100' };
                      return { text: 'text-red-700', bg: 'bg-red-500', light: 'bg-red-100' };
                    };

                    const color = getColor(item.accuracy);

                    return (
                      <div key={index} className="bg-gray-50 rounded px-2 py-1.5 border border-gray-100">
                        {/* joint name and values */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-gray-700 uppercase">{item.joint}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${color.text}`}>{item.accuracy}%</span>
                            <span className="text-[10px] text-gray-500">•</span>
                            <span className="text-xs font-semibold text-gray-600">{item.angle}°</span>
                          </div>
                        </div>

                        {/* accuracy progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`${color.bg} h-full rounded-full transition-all duration-300`}
                            style={{ width: `${item.accuracy}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* add category modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[10000]">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Category</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="trainer-button-secondary px-4 py-2 rounded-lg text-sm"
                onClick={() => setShowAddCategoryModal(false)}
              >
                Cancel
              </button>
              <button
                className="trainer-button px-4 py-2 rounded-lg text-sm"
                onClick={addNewCategory}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
      {/* countdown before training starts */}
      {showCountdown && (
        <div className="countdown-overlay">
          <div className="text-center">
            <p className="text-white text-xl mb-3 font-semibold">Get ready!</p>
            <p className="countdown-number">{countdownValue}</p>
          </div>
        </div>
      )}
    </div>
  );
}
