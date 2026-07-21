import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { Play, Upload, Pause, SkipBack, SkipForward, Camera, CameraOff, Plus, ChevronDown, FolderOpen, Trash2, Repeat, Gauge } from 'lucide-react';
import { initializeDetector, analyzeVideoForSegments, calculateSegmentMatch, initialSegmentState } from '../utils';
import type { SegmentTrainingState } from '../utils';
import { voiceFeedbackService } from '../services/voiceFeedbackService';
import { useUser } from '../context/UserContext';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useTrainerVideo } from '../hooks/useTrainerVideo';
import FeedbackPanel from '../components/trainer/FeedbackPanel';
import MetricsPanel from '../components/trainer/MetricsPanel';

import './WorkoutTrainerApp.css';

interface WorkoutTrainerAppProps {
  preloadedCameraStream?: MediaStream | null;
  preloadedDetector?: poseDetection.PoseDetector | null;
}

/**
 * main workout trainer application.
 * manages the training session, video playback, segment mode,
 * and delegates rendering to extracted components.
 */
export default function WorkoutTrainerApp({ preloadedCameraStream, preloadedDetector }: WorkoutTrainerAppProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trainerJointCanvasRef = useRef<HTMLCanvasElement>(null);
  const traineeJointCanvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(preloadedDetector || null);
  const [isDetecting, setIsDetecting] = useState<boolean>(!!preloadedCameraStream && !!preloadedDetector);
  const [cameraActive, setCameraActive] = useState<boolean>(!!preloadedCameraStream);
  const [voiceFeedbackActive, setVoiceFeedbackActive] = useState(false);
  const [isPoseReady, setIsPoseReady] = useState(false);
  const [preloadedStream] = useState<MediaStream | null>(preloadedCameraStream || null);

  // trainer video state
  const trainerVideoRef = useRef<HTMLVideoElement>(null);
  const trainerCanvasRef = useRef<HTMLCanvasElement>(null);
  const [trainerVideoUrl, setTrainerVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // use trainer video hook
  const { trainerPose, trainerAngles, isTrainerReady } = useTrainerVideo(
    detector, trainerVideoUrl, trainerVideoRef, trainerCanvasRef, trainerJointCanvasRef, isPlaying
  );

  // ui state
  const [postureAccuracy, setPostureAccuracy] = useState(85);
  const [postureStatus, setPostureStatus] = useState('CORRECT');
  const [jointAngles, setJointAngles] = useState([
    { joint: 'Hip', angle: 120, accuracy: 85 },
    { joint: 'Knee', angle: 145, accuracy: 45 },
    { joint: 'Elbow', angle: 90, accuracy: 65 },
    { joint: 'Shoulder', angle: 180, accuracy: 75 },
    { joint: 'Back', angle: 180, accuracy: 100 },
  ]);
  const [feedbackItems, setFeedbackItems] = useState<{ text: string; status: 'good' | 'warning' | 'error' }[]>([
    { text: 'Position yourself in front of the camera', status: 'warning' },
  ]);

  // training session state
  const [isTraining, setIsTraining] = useState(false);
  const [countdownValue, setCountdownValue] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);

  // video player state
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // segment training state
  const [segmentState, setSegmentState] = useState<SegmentTrainingState>(initialSegmentState);
  const [lastAnalyzedVideoUrl, setLastAnalyzedVideoUrl] = useState<string | null>(null);
  const holdStartTimeRef = useRef(0);
  const HOLD_DURATION_MS = 1500;

  // training metrics
  const [trainingStartTime, setTrainingStartTime] = useState<number | null>(null);
  const [accuracyReadings, setAccuracyReadings] = useState<number[]>([]);
  const { completeWorkout, isLoggedIn } = useUser();

  // exercise categories
  interface ExerciseVideo { name: string; url: string; }
  interface ExerciseCategory { name: string; videos: ExerciseVideo[]; }

  const [exerciseCategories, setExerciseCategories] = useState<ExerciseCategory[]>(() => {
    const saved = localStorage.getItem('exerciseCategories');
    return saved ? JSON.parse(saved) : [
      { name: 'Squats', videos: [] },
      { name: 'Strength Training', videos: [] },
      { name: 'Cardio', videos: [] },
    ];
  });

  useEffect(() => {
    localStorage.setItem('exerciseCategories', JSON.stringify(exerciseCategories));
  }, [exerciseCategories]);

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const saved = localStorage.getItem('exerciseCategories');
    if (saved) {
      const cats = JSON.parse(saved);
      return cats.length > 0 ? cats[0].name : '';
    }
    return 'Squats';
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showVideoDropdown, setShowVideoDropdown] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);

  // debounce refs
  const lastUpdateTime = useRef(0);
  const pendingData = useRef<{ angles: any; accuracy: any; overallAccuracy: number; feedback: any } | null>(null);

  // dropdown refs
  const videoBtnRef = useRef<HTMLButtonElement>(null);
  const videoDropdownRef = useRef<HTMLDivElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // initialize detector if not preloaded
  useEffect(() => {
    if (preloadedDetector) {
      setDetector(preloadedDetector);
      setCameraActive(true);
      setIsDetecting(true);
      return;
    }

    const initDetector = async () => {
      try {
        const d = await initializeDetector();
        setDetector(d);
        setCameraActive(true);
      } catch (error) {
        console.error('Error initializing pose detector:', error);
      }
    };

    initDetector();
  }, [preloadedDetector]);

  // apply preloaded camera stream
  useEffect(() => {
    if (preloadedStream && webcamRef.current?.video) {
      const video = webcamRef.current.video;
      if (video.srcObject !== preloadedStream) {
        video.srcObject = preloadedStream;
        video.play().catch((err) => console.warn('Video play error:', err));
      }
    }
  }, [preloadedStream, cameraActive]);

  useEffect(() => {
    return () => { voiceFeedbackService.cleanup(); };
  }, []);

  // debounced ui update handler
  const updateUIWithData = useCallback((data: any) => {
    setJointAngles([
      { joint: 'Hip', angle: Math.round(data.angles.Hip), accuracy: data.accuracy.Hip },
      { joint: 'Knee', angle: Math.round(data.angles.Knee), accuracy: data.accuracy.Knee },
      { joint: 'Elbow', angle: Math.round(data.angles.Elbow), accuracy: data.accuracy.Elbow },
      { joint: 'Shoulder', angle: Math.round(data.angles.Shoulder), accuracy: data.accuracy.Shoulder },
      { joint: 'Back', angle: Math.round(data.angles.BackStraightness), accuracy: data.accuracy.BackStraightness },
    ]);

    setPostureAccuracy(data.overallAccuracy);

    if (data.overallAccuracy > 0) {
      setAccuracyReadings((prev) => [...prev, data.overallAccuracy]);
    }

    setPostureStatus(data.overallAccuracy >= 85 ? 'CORRECT' : 'INCORRECT');

    const goodFeedback = data.feedback.filter((item: any) => item.status === 'good');
    const improvementFeedback = data.feedback.filter((item: any) => item.status === 'warning' || item.status === 'error');

    setFeedbackItems([
      { text: 'Good Form:', status: 'good' as const },
      ...goodFeedback,
      { text: 'Needs Improvement:', status: 'warning' as const },
      ...improvementFeedback,
    ]);

    voiceFeedbackService.addFeedback(improvementFeedback);
  }, []);

  // debounce processing loop
  useEffect(() => {
    const processDebounce = () => {
      const now = Date.now();
      if (pendingData.current && now - lastUpdateTime.current > 500) {
        updateUIWithData(pendingData.current);
        lastUpdateTime.current = now;
        pendingData.current = null;
      }
      requestAnimationFrame(processDebounce);
    };
    const id = requestAnimationFrame(processDebounce);
    return () => cancelAnimationFrame(id);
  }, [updateUIWithData]);

  // pose detection callbacks
  const onPoseData = useCallback((data: any) => {
    pendingData.current = data;
  }, []);

  const onPoseReady = useCallback(() => {
    setIsPoseReady(true);
  }, []);

  const checkSegmentMatch = useCallback((traineeAngles: any) => {
    if (!segmentState.isActive || segmentState.isAnalyzing || segmentState.segments.length === 0) return;

    const currentSegment = segmentState.segments[segmentState.currentSegmentIndex];
    if (!currentSegment || segmentState.segmentStatus !== 'waiting') return;

    const { accuracy, matched } = calculateSegmentMatch(traineeAngles, currentSegment);

    if (matched) {
      if (holdStartTimeRef.current === 0) holdStartTimeRef.current = Date.now();
      const heldTime = Date.now() - holdStartTimeRef.current;
      const holdProgress = Math.min(100, (heldTime / HOLD_DURATION_MS) * 100);

      setSegmentState((prev) => ({ ...prev, matchAccuracy: accuracy, holdProgress }));

      if (heldTime >= HOLD_DURATION_MS) advanceToNextSegment();
    } else {
      holdStartTimeRef.current = 0;
      setSegmentState((prev) => ({ ...prev, matchAccuracy: accuracy, holdProgress: 0 }));
    }
  }, [segmentState]);

  // use the extracted pose detection hook
  usePoseDetection({
    detector,
    webcamRef: webcamRef as React.RefObject<Webcam | null>,
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement | null>,
    traineeJointCanvasRef: traineeJointCanvasRef as React.RefObject<HTMLCanvasElement | null>,
    isDetecting,
    isTraining,
    trainerPose,
    trainerAngles,
    onPoseData,
    onPoseReady,
    onSegmentCheck: checkSegmentMatch,
    segmentActive: segmentState.isActive,
    segmentWaiting: segmentState.segmentStatus === 'waiting',
  });

  // segment mode functions
  const startSegmentMode = async () => {
    if (!trainerVideoRef.current || !detector || !trainerVideoUrl) return;

    setSegmentState((prev) => ({ ...prev, isActive: false, isAnalyzing: true, analysisProgress: 0, segments: [] }));

    try {
      const segments = await analyzeVideoForSegments(
        trainerVideoRef.current,
        detector,
        { angleThreshold: 15, minSegmentDuration: 1.0 },
        (progress) => setSegmentState((prev) => ({ ...prev, analysisProgress: progress }))
      );

      if (segments.length === 0) {
        setSegmentState(initialSegmentState);
        return;
      }

      setSegmentState((prev) => ({
        ...prev, isAnalyzing: false, segments, currentSegmentIndex: 0, segmentStatus: 'idle', holdProgress: 0,
      }));

      setLastAnalyzedVideoUrl(trainerVideoUrl);
    } catch (error) {
      console.error('Error analyzing video:', error);
      setSegmentState(initialSegmentState);
    }
  };

  const advanceToNextSegment = () => {
    const nextIndex = segmentState.currentSegmentIndex + 1;
    const updatedSegments = [...segmentState.segments];
    updatedSegments[segmentState.currentSegmentIndex].matched = true;

    if (nextIndex >= segmentState.segments.length) {
      setSegmentState((prev) => ({ ...prev, segments: updatedSegments, segmentStatus: 'completed', holdProgress: 0 }));
      if (trainerVideoRef.current) { trainerVideoRef.current.pause(); setIsPlaying(false); }
      return;
    }

    const nextSegment = segmentState.segments[nextIndex];
    holdStartTimeRef.current = 0;

    setSegmentState((prev) => ({
      ...prev, segments: updatedSegments, currentSegmentIndex: nextIndex, segmentStatus: 'playing', holdProgress: 0, matchAccuracy: 0,
    }));

    if (trainerVideoRef.current) {
      trainerVideoRef.current.currentTime = nextSegment.startTime;
      trainerVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const exitSegmentMode = () => {
    setSegmentState(initialSegmentState);
    holdStartTimeRef.current = 0;
    if (trainerVideoRef.current) { trainerVideoRef.current.pause(); setIsPlaying(false); }
  };

  // video upload & selection
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (trainerVideoUrl) URL.revokeObjectURL(trainerVideoUrl);
    const url = URL.createObjectURL(file);

    setExerciseCategories((prev) =>
      prev.map((cat) =>
        cat.name === selectedCategory ? { ...cat, videos: [...cat.videos, { name: file.name, url }] } : cat
      )
    );

    setTrainerVideoUrl(url);
    setSelectedVideo({ name: file.name, url });
    setIsPlaying(false);
    if (trainerVideoRef.current) { trainerVideoRef.current.load(); trainerVideoRef.current.currentTime = 0; }
    setShowVideoDropdown(false);
  };

  const loadVideo = (video: ExerciseVideo) => {
    setTrainerVideoUrl(video.url);
    setSelectedVideo(video);
    setIsPlaying(false);
    if (trainerVideoRef.current) trainerVideoRef.current.currentTime = 0;
    setShowVideoDropdown(false);
  };

  // playback controls
  const togglePlayPause = () => {
    if (!isTraining) { alert('Please click "Start Training" first to begin the session.'); return; }
    if (trainerVideoRef.current) {
      if (isPlaying) { trainerVideoRef.current.pause(); setIsPlaying(false); }
      else { trainerVideoRef.current.play(); setIsPlaying(true); }
    }
  };

  const skipBackward = () => { if (trainerVideoRef.current) trainerVideoRef.current.currentTime -= 5; };
  const skipForward = () => { if (trainerVideoRef.current) trainerVideoRef.current.currentTime += 5; };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // training controls
  const startTraining = () => {
    if (!trainerVideoUrl) { alert('Please load a trainer video first to start training.'); return; }
    if (segmentState.isAnalyzing) { alert('Please wait for video analysis to complete before starting training.'); return; }

    setAccuracyReadings([]);
    setShowCountdown(true);
    setCountdownValue(3);

    const interval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowCountdown(false);
          setIsTraining(true);
          setTrainingStartTime(Date.now());

          if (segmentState.segments.length > 0 && !segmentState.isActive) {
            setSegmentState((p) => ({ ...p, isActive: true, segmentStatus: 'playing', currentSegmentIndex: 0 }));
            if (trainerVideoRef.current) {
              trainerVideoRef.current.currentTime = segmentState.segments[0].startTime;
              trainerVideoRef.current.play();
              setIsPlaying(true);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTraining = async () => {
    setIsTraining(false);
    if (trainerVideoRef.current) trainerVideoRef.current.pause();
    setIsPlaying(false);

    if (trainingStartTime && isLoggedIn) {
      const durationMinutes = (Date.now() - trainingStartTime) / 60000;
      const avgAccuracy = accuracyReadings.length > 0
        ? accuracyReadings.reduce((a, b) => a + b, 0) / accuracyReadings.length
        : postureAccuracy;

      if (durationMinutes >= 0.17) {
        try {
          const exerciseName = selectedCategory || 'General Workout';
          const result = await completeWorkout(avgAccuracy, durationMinutes, exerciseName);
          if (result.newBadges?.length > 0) {
            alert(`Congrats!! New Badge Earned: ${result.newBadges.join(', ')}!\n+${result.xpGained} XP`);
          }
        } catch (error) {
          console.error('Error saving workout:', error);
        }
      }
    }

    setTrainingStartTime(null);
    setAccuracyReadings([]);
    setPostureAccuracy(85);
    setPostureStatus('CORRECT');
    setJointAngles([
      { joint: 'Hip', angle: 120, accuracy: 85 },
      { joint: 'Knee', angle: 145, accuracy: 45 },
      { joint: 'Elbow', angle: 90, accuracy: 65 },
      { joint: 'Shoulder', angle: 180, accuracy: 75 },
      { joint: 'Back', angle: 180, accuracy: 100 },
    ]);
    setFeedbackItems([{ text: 'Position yourself in front of the camera', status: 'warning' }]);
  };

  // category management
  const addNewCategory = () => {
    if (!newCategoryName.trim()) return;
    setExerciseCategories((prev) => [...prev, { name: newCategoryName, videos: [] }]);
    setNewCategoryName('');
    setShowAddCategoryModal(false);
  };

  const getCurrentCategoryVideos = () => exerciseCategories.find((cat) => cat.name === selectedCategory)?.videos || [];

  const deleteVideo = (videoName: string) => {
    if (!confirm(`Are you sure you want to delete the video "${videoName}"?`)) return;
    setExerciseCategories((prev) =>
      prev.map((cat) =>
        cat.name === selectedCategory ? { ...cat, videos: cat.videos.filter((v) => v.name !== videoName) } : cat
      )
    );
    if (selectedVideo?.name === videoName) { setSelectedVideo(null); setTrainerVideoUrl(null); }
  };

  const deleteCategory = (categoryName: string) => {
    if (exerciseCategories.length <= 1) { alert('You cannot delete the last category.'); return; }
    if (!confirm(`Are you sure you want to delete the category "${categoryName}" and all its videos?`)) return;

    const updated = exerciseCategories.filter((cat) => cat.name !== categoryName);
    setExerciseCategories(updated);
    if (selectedCategory === categoryName) { setSelectedCategory(updated[0].name); setSelectedVideo(null); setTrainerVideoUrl(null); }
  };

  // close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showVideoDropdown && videoBtnRef.current && videoDropdownRef.current &&
        !videoBtnRef.current.contains(event.target as Node) && !videoDropdownRef.current.contains(event.target as Node)) {
        setShowVideoDropdown(false);
      }
      if (showCategoryDropdown && categoryBtnRef.current && categoryDropdownRef.current &&
        !categoryBtnRef.current.contains(event.target as Node) && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVideoDropdown, showCategoryDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 flex flex-col">
      {/* header bar */}
      <header ref={headerRef} className="bg-gradient-to-r from-orange-50 to-amber-50 backdrop-blur-lg border-b border-orange-200 shadow-lg sticky top-0 z-50">
        <div className="absolute -top-20 left-1/3 w-64 h-64 bg-orange-100 rounded-full filter blur-[100px] opacity-20" />
        <div className="absolute -top-10 right-1/4 w-40 h-40 bg-amber-100 rounded-full filter blur-[80px] opacity-10" />

        <div className="container mx-auto py-2 px-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-center lg:justify-end relative z-[100] gap-2 sm:gap-4 mobile-header-controls">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mobile-header-controls">
              {/* video upload dropdown */}
              <div className="dropdown-container">
                <button
                  ref={videoBtnRef}
                  onClick={() => { if (!isTraining && !segmentState.isAnalyzing) setShowVideoDropdown(!showVideoDropdown); }}
                  disabled={isTraining || segmentState.isAnalyzing}
                  className={`trainer-button flex items-center justify-center transition-all text-xs sm:text-sm ${(isTraining || segmentState.isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload size={14} className="mr-1.5" />
                  <span className="hidden sm:inline">{selectedVideo ? 'Change Video' : 'Upload Video'}</span>
                  <span className="sm:hidden">Video</span>
                </button>

                {showVideoDropdown && (
                  <div ref={videoDropdownRef} className="dropdown-menu absolute top-full mt-2 left-0 w-64 max-h-[80vh] z-[99999]">
                    <div className="p-2 border-b border-gray-200 bg-gray-50">
                      <label className="inline-flex items-center w-full trainer-button cursor-pointer">
                        <Upload size={16} className="mr-2" /><span>Upload New Video</span>
                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                      </label>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {getCurrentCategoryVideos().length > 0 ? (
                        getCurrentCategoryVideos().map((video, index) => (
                          <div key={index} className="p-3 border-b border-gray-100 hover:bg-orange-50 cursor-pointer flex justify-between items-center group">
                            <span className="truncate group-hover:text-orange-600 transition-colors flex-grow font-medium" onClick={() => loadVideo(video)}>{video.name}</span>
                            <div className="flex items-center gap-2">
                              <button className="text-orange-600 hover:text-orange-800 text-sm font-semibold px-2 py-1 rounded hover:bg-orange-50" onClick={() => loadVideo(video)}>Load</button>
                              <button className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" onClick={(e) => { e.stopPropagation(); deleteVideo(video.name); }}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">No videos in this category</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* category dropdown */}
              <div className="dropdown-container">
                <button
                  ref={categoryBtnRef}
                  className={`trainer-button flex items-center justify-center transition-all text-xs sm:text-sm ${(isTraining || segmentState.isAnalyzing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => { if (!isTraining && !segmentState.isAnalyzing) setShowCategoryDropdown(!showCategoryDropdown); }}
                  disabled={isTraining || segmentState.isAnalyzing}
                >
                  <FolderOpen size={14} className="mr-1.5" />
                  <span className="hidden sm:inline">{selectedCategory || 'Select Category'}</span>
                  <span className="sm:hidden">Category</span>
                  <ChevronDown size={14} className="ml-1.5" />
                </button>

                {showCategoryDropdown && (
                  <div ref={categoryDropdownRef} className="dropdown-menu absolute top-full mt-2 left-0 w-64 max-h-[80vh] z-[99999]">
                    {exerciseCategories.map((category, index) => (
                      <div key={index} className="p-3 border-b border-gray-100 hover:bg-orange-50 cursor-pointer flex items-center justify-between group">
                        <span className="truncate group-hover:text-orange-600 transition-colors flex-grow font-medium" onClick={() => { setSelectedCategory(category.name); setShowCategoryDropdown(false); }}>{category.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{category.videos?.length || 0} videos</span>
                          {exerciseCategories.length > 1 && (
                            <button className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" onClick={(e) => { e.stopPropagation(); deleteCategory(category.name); }}><Trash2 size={14} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="p-3 border-t border-gray-200 hover:bg-orange-50 cursor-pointer flex items-center text-orange-600 font-medium" onClick={() => { setShowCategoryDropdown(false); setShowAddCategoryModal(true); }}>
                      <Plus size={16} className="mr-2" /> Add New Category
                    </div>
                  </div>
                )}
              </div>

              {/* training button */}
              <div className="p-2 flex justify-center space-x-3">
                <button
                  className={`${isTraining ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700' : 'trainer-button'} text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all font-semibold text-sm`}
                  onClick={isTraining ? stopTraining : startTraining}
                >
                  {isTraining ? 'Stop Training' : 'Start Training'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* main content area */}
      <div className="flex-1 p-4 flex flex-col gap-6 relative">
        <div style={{ position: 'fixed', bottom: 0, left: '15%', width: '550px', height: '550px', background: 'linear-gradient(to bottom right, rgba(249, 115, 22, 0.6), rgba(251, 191, 36, 0.6))', borderRadius: '20%', filter: 'blur(70px)', opacity: 0.35, animation: 'float-gradient-3 10s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: 99, left: '55%', width: '350px', height: '350px', background: 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.6), rgba(251, 146, 60, 0.6))', borderRadius: '20%', filter: 'blur(70px)', opacity: 0.35, animation: 'float-gradient-3 5s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-100 rounded-full filter blur-[150px] opacity-20 z-0" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-amber-100 rounded-full filter blur-[120px] opacity-20 z-0" />

        {/* video panels grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* trainer video panel */}
          <div className="trainer-card rounded-2xl overflow-hidden flex flex-col video-panel order-2 lg:order-1">
            <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <p className="text-xs text-center font-semibold text-gray-700">
                {selectedVideo ? `Trainer Video: ${selectedVideo.name}` : 'Trainer Video Preview'}
              </p>
            </div>
            <div className="flex-1 bg-gray-900 m-3 rounded-xl flex items-center justify-center relative overflow-hidden"
              onMouseEnter={() => setShowVideoControls(true)} onMouseLeave={() => setShowVideoControls(false)}>
              {trainerVideoUrl ? (
                <>
                  <video
                    ref={trainerVideoRef}
                    src={trainerVideoUrl}
                    className="w-full h-full object-contain bg-black"
                    onEnded={() => { if (!isLooping) setIsPlaying(false); }}
                    playsInline loop={isLooping}
                    onLoadedMetadata={() => { if (trainerVideoRef.current) setVideoDuration(trainerVideoRef.current.duration); }}
                    onLoadedData={() => {
                      if (trainerVideoRef.current) trainerVideoRef.current.playbackRate = playbackRate;
                      if (detector && trainerVideoUrl && trainerVideoUrl !== lastAnalyzedVideoUrl && !segmentState.isAnalyzing) {
                        setSegmentState(initialSegmentState);
                        startSegmentMode();
                      }
                    }}
                    onTimeUpdate={() => {
                      if (!trainerVideoRef.current) return;
                      const ct = trainerVideoRef.current.currentTime;
                      setVideoCurrentTime(ct);
                      setVideoProgress((ct / trainerVideoRef.current.duration) * 100);

                      if (segmentState.isActive && segmentState.segmentStatus === 'playing') {
                        const seg = segmentState.segments[segmentState.currentSegmentIndex];
                        if (seg && ct >= seg.endTime - 0.1) {
                          trainerVideoRef.current.pause();
                          setIsPlaying(false);
                          setSegmentState((prev) => ({ ...prev, segmentStatus: 'waiting' }));
                        }
                      }
                    }}
                  />
                  <canvas ref={trainerCanvasRef} className="absolute top-0 left-0 w-full h-full object-contain" />
                  {(!isTrainerReady || segmentState.isAnalyzing) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-xl">
                      <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-white text-sm font-medium">
                        {segmentState.isAnalyzing ? `Analyzing video segments... ${Math.round(segmentState.analysisProgress)}%` : 'Analyzing trainer pose...'}
                      </p>
                      {segmentState.isAnalyzing && (
                        <div className="w-48 bg-white/20 rounded-full h-2 mt-3 overflow-hidden">
                          <div className="h-full bg-orange-500 transition-all duration-200" style={{ width: `${segmentState.analysisProgress}%` }} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* video controls overlay */}
                  {showVideoControls && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 backdrop-blur-sm rounded-b-xl">
                      <div ref={progressBarRef} className="h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer group"
                        onClick={(e) => { if (progressBarRef.current && trainerVideoRef.current) { const rect = progressBarRef.current.getBoundingClientRect(); trainerVideoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * videoDuration; } }}>
                        <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full relative" style={{ width: `${videoProgress}%` }}>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button className="text-white hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-white/20" onClick={skipBackward}><SkipBack size={18} /></button>
                          <button className="text-white hover:text-orange-400 transition-colors p-2 rounded-lg hover:bg-white/20 bg-white/10" onClick={togglePlayPause}>{isPlaying ? <Pause size={22} /> : <Play size={22} />}</button>
                          <button className="text-white hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-white/20" onClick={skipForward}><SkipForward size={18} /></button>
                          <span className="text-white/80 text-xs font-mono ml-2">{formatTime(videoCurrentTime)} / {formatTime(videoDuration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="relative">
                            <button className={`text-white hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-white/20 flex items-center gap-1 text-xs ${playbackRate !== 1 ? 'text-orange-400' : ''}`} onClick={() => setShowSpeedMenu(!showSpeedMenu)}>
                              <Gauge size={16} /><span>{playbackRate}x</span>
                            </button>
                            {showSpeedMenu && (
                              <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg py-1 shadow-xl border border-white/10 z-50">
                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                  <button key={rate} className={`block w-full px-4 py-1.5 text-xs text-left hover:bg-white/10 transition-colors ${playbackRate === rate ? 'text-orange-400 bg-white/5' : 'text-white'}`}
                                    onClick={() => { setPlaybackRate(rate); if (trainerVideoRef.current) trainerVideoRef.current.playbackRate = rate; setShowSpeedMenu(false); }}>
                                    {rate}x
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button className={`text-white hover:text-orange-400 transition-colors p-1.5 rounded-lg hover:bg-white/20 ${isLooping ? 'text-orange-400 bg-white/10' : ''}`} onClick={() => setIsLooping(!isLooping)} title="Loop video"><Repeat size={16} /></button>
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

          {/* joint line comparison panel */}
          <div className="trainer-card rounded-2xl overflow-hidden flex flex-col video-panel order-3 lg:order-2">
            <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <p className="text-xs text-center font-semibold text-gray-700">Joint Line Comparison</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 m-3">
              <div className="bg-white rounded-xl flex items-center justify-center relative border-2 border-gray-100">
                <p className="text-orange-600 absolute top-2 left-2 text-xs font-semibold">Trainer Joint Lines</p>
                <canvas ref={trainerJointCanvasRef} className="w-full h-full object-contain" />
              </div>
              <div className="bg-white rounded-xl flex items-center justify-center relative border-2 border-gray-100">
                <p className="text-red-600 absolute top-2 left-2 text-xs font-semibold z-10">Trainee Joint Lines</p>
                <canvas ref={traineeJointCanvasRef} className="w-full h-full object-contain" />
                {!isPoseReady && cameraActive && (
                  <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-xl">
                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Detecting pose...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* trainee camera panel */}
          <div className="trainer-card rounded-2xl overflow-hidden flex flex-col video-panel order-1 lg:order-3">
            <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">Trainee's Cam</p>
                <button
                  onClick={() => setCameraActive(!cameraActive)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${cameraActive ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300' : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'}`}
                >
                  {cameraActive ? (<><Camera className="h-3 w-3" /><span>ON</span></>) : (<><CameraOff className="h-3 w-3" /><span>OFF</span></>)}
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-900 m-3 rounded-xl flex items-center justify-center relative overflow-hidden">
              {cameraActive ? (
                <>
                  <Webcam ref={webcamRef} mirrored className="absolute top-0 left-0 w-full h-full object-contain rounded-xl" onLoadedMetadata={() => setIsDetecting(true)} videoConstraints={{ width: 640, height: 480, facingMode: 'user' }} playsInline />
                  <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-contain z-10" />
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
          {!isTraining && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 rounded-2xl flex items-center justify-center">
              <div className="text-center px-4">
                <div className="mb-3"><Play className="h-16 w-16 text-gray-400 mx-auto" /></div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Start Training to Unlock</h3>
                <p className="text-sm text-gray-500">Click "Start Training" to access feedback, segment training, and metrics</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            <FeedbackPanel
              feedbackItems={feedbackItems}
              segmentState={segmentState}
              voiceFeedbackActive={voiceFeedbackActive}
              onToggleVoice={() => {
                const newState = !voiceFeedbackActive;
                setVoiceFeedbackActive(newState);
                voiceFeedbackService.setEnabled(newState);
              }}
              onExitSegmentMode={exitSegmentMode}
            />
            <MetricsPanel postureAccuracy={postureAccuracy} postureStatus={postureStatus} jointAngles={jointAngles} />
          </div>
        </div>
      </div>

      {/* add category modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[10000]">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Category</h2>
            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Enter category name"
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm" />
            <div className="mt-4 flex justify-end gap-2">
              <button className="trainer-button-secondary px-4 py-2 rounded-lg text-sm" onClick={() => setShowAddCategoryModal(false)}>Cancel</button>
              <button className="trainer-button px-4 py-2 rounded-lg text-sm" onClick={addNewCategory}>Add Category</button>
            </div>
          </div>
        </div>
      )}

      {/* countdown overlay */}
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
