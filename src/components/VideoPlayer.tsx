import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Gauge } from 'lucide-react';
import './VideoPlayer.css';

export interface VideoPlayerRef {
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    getVideo: () => HTMLVideoElement | null;
}

interface VideoPlayerProps {
    src: string | null;
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    onLoadedData?: () => void;
    isTrainingMode?: boolean;
    showOverlay?: boolean;
    overlayCanvas?: React.RefObject<HTMLCanvasElement>;
    className?: string;
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
    src,
    onTimeUpdate,
    onPlay,
    onPause,
    onEnded,
    onLoadedData,
    isTrainingMode = false,
    showOverlay = false,
    overlayCanvas,
    className = ''
}, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isLooping, setIsLooping] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        play: () => videoRef.current?.play(),
        pause: () => videoRef.current?.pause(),
        seek: (time: number) => {
            if (videoRef.current) videoRef.current.currentTime = time;
        },
        getCurrentTime: () => videoRef.current?.currentTime || 0,
        getDuration: () => videoRef.current?.duration || 0,
        getVideo: () => videoRef.current
    }));

    // Handle video events
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            onTimeUpdate?.(video.currentTime, video.duration);
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleLoadedData = () => {
            onLoadedData?.();
        };

        const handlePlay = () => {
            setIsPlaying(true);
            onPlay?.();
        };

        const handlePause = () => {
            setIsPlaying(false);
            onPause?.();
        };

        const handleEnded = () => {
            setIsPlaying(false);
            onEnded?.();
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
        };
    }, [onTimeUpdate, onPlay, onPause, onEnded, onLoadedData]);

    // Update video properties
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.loop = isLooping;
        }
    }, [isLooping]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isTrainingMode === false) {
            // Don't require training mode if not specified
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        } else {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const skipBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
        }
    };

    const skipForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !videoRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * duration;
    };

    const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !progressRef.current || !videoRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        videoRef.current.currentTime = pos * duration;
    };

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!src) {
        return (
            <div className={`video-player-container video-player-empty ${className}`}>
                <div className="video-player-placeholder">
                    <Play size={48} className="placeholder-icon" />
                    <p>No trainer video loaded</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`video-player-container ${className}`}>
            {/* Video element */}
            <div className="video-wrapper">
                <video
                    ref={videoRef}
                    src={src}
                    className="video-element"
                    playsInline
                />

                {/* Overlay canvas for pose detection */}
                {showOverlay && overlayCanvas && (
                    <canvas
                        ref={overlayCanvas}
                        className="video-overlay-canvas"
                    />
                )}

                {/* Click to play/pause overlay */}
                <div className="video-click-overlay" onClick={togglePlay}>
                    {!isPlaying && (
                        <div className="play-overlay-icon">
                            <Play size={64} fill="white" />
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="video-controls">
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    className="progress-bar-container"
                    onClick={handleProgressClick}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                    onMouseMove={handleProgressDrag}
                >
                    <div className="progress-bar-background" />
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercent}%` }}
                    />
                    <div
                        className="progress-bar-thumb"
                        style={{ left: `${progressPercent}%` }}
                    />
                </div>

                {/* Control buttons */}
                <div className="controls-row">
                    {/* Left controls */}
                    <div className="controls-left">
                        <button className="control-btn" onClick={skipBackward} title="Skip back 5s">
                            <SkipBack size={18} />
                        </button>

                        <button className="control-btn play-btn" onClick={togglePlay}>
                            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                        </button>

                        <button className="control-btn" onClick={skipForward} title="Skip forward 5s">
                            <SkipForward size={18} />
                        </button>

                        <span className="time-display">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right controls */}
                    <div className="controls-right">
                        {/* Speed control */}
                        <div className="speed-control">
                            <button
                                className={`control-btn ${playbackRate !== 1 ? 'active' : ''}`}
                                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                title="Playback speed"
                            >
                                <Gauge size={18} />
                                <span className="speed-label">{playbackRate}x</span>
                            </button>

                            {showSpeedMenu && (
                                <div className="speed-menu">
                                    {playbackRates.map(rate => (
                                        <button
                                            key={rate}
                                            className={`speed-option ${playbackRate === rate ? 'active' : ''}`}
                                            onClick={() => {
                                                setPlaybackRate(rate);
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
                            className={`control-btn ${isLooping ? 'active' : ''}`}
                            onClick={() => setIsLooping(!isLooping)}
                            title="Loop video"
                        >
                            <Repeat size={18} />
                        </button>

                        {/* Volume control */}
                        <button
                            className="control-btn"
                            onClick={() => setIsMuted(!isMuted)}
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
