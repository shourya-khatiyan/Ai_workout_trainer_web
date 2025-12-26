import * as poseDetection from '@tensorflow-models/pose-detection';
import { calculateAngles } from './poseUtils';

//represents a key pose segment in the video
export interface PoseSegment {
    id: number;
    startTime: number;
    endTime: number;
    targetPose: poseDetection.Pose;
    targetAngles: {
        Hip: number;
        Knee: number;
        Elbow: number;
        Shoulder: number;
        BackStraightness: number;
    };
    description: string;
    matched: boolean;
}

//configuration for segment detection
export interface SegmentConfig {
    //minimum angle change to detect a new segment (degrees)
    angleThreshold: number;
    //minimum time between segments (seconds)
    minSegmentDuration: number;
    //sample interval for video analysis (seconds)
    sampleInterval: number;
    //required accuracy to match a segment (0-100)
    matchAccuracyThreshold: number;
    //time trainee must hold correct pose (seconds)
    holdDuration: number;
}

const DEFAULT_CONFIG: SegmentConfig = {
    angleThreshold: 15,        //15 degree change triggers new segment
    minSegmentDuration: 1.0,   //at least 1 second between segments
    sampleInterval: 0.5,       //sample every 0.5 seconds
    matchAccuracyThreshold: 75, //75% accuracy to match
    holdDuration: 1.5          //hold for 1.5 seconds
};


//analyze a video to extract key pose segments
export async function analyzeVideoForSegments(
    video: HTMLVideoElement,
    detector: poseDetection.PoseDetector,
    config: Partial<SegmentConfig> = {},
    onProgress?: (progress: number) => void
): Promise<PoseSegment[]> {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const segments: PoseSegment[] = [];

    if (!video.duration || video.duration === Infinity) {
        console.warn('Video duration not available');
        return [];
    }

    const duration = video.duration;
    let lastAngles: any = null;
    let segmentId = 0;

    //pause video for analysis
    const wasPlaying = !video.paused;
    video.pause();
    const originalTime = video.currentTime;

    try {
        //sample video at regular intervals
        for (let time = 0; time < duration; time += cfg.sampleInterval) {
            //seek to time
            video.currentTime = time;

            //wait for seek to complete
            await new Promise<void>((resolve) => {
                const handleSeeked = () => {
                    video.removeEventListener('seeked', handleSeeked);
                    resolve();
                };
                video.addEventListener('seeked', handleSeeked);
            });

            //small delay to ensure frame is ready
            await new Promise(resolve => setTimeout(resolve, 50));

            //detect pose at this frame
            try {
                const poses = await detector.estimatePoses(video);

                if (poses.length > 0) {
                    const pose = poses[0];
                    const angles = calculateAngles(pose.keypoints);

                    //check if this is a significant pose change
                    if (lastAngles === null || isSignificantChange(lastAngles, angles, cfg.angleThreshold)) {
                        //check minimum duration from last segment
                        const lastSegment = segments[segments.length - 1];
                        if (!lastSegment || (time - lastSegment.startTime) >= cfg.minSegmentDuration) {
                            //update end time of previous segment
                            if (lastSegment) {
                                lastSegment.endTime = time;
                            }

                            //create new segment
                            segments.push({
                                id: segmentId++,
                                startTime: time,
                                endTime: duration, //will be updated when next segment starts
                                targetPose: pose,
                                targetAngles: {
                                    Hip: angles.Hip,
                                    Knee: angles.Knee,
                                    Elbow: angles.Elbow,
                                    Shoulder: angles.Shoulder,
                                    BackStraightness: angles.BackStraightness
                                },
                                description: generatePoseDescription(angles, segmentId),
                                matched: false
                            });

                            lastAngles = angles;
                        }
                    }
                }
            } catch (error) {
                console.warn(`Error analyzing frame at ${time}s:`, error);
            }

            //report progress
            if (onProgress) {
                onProgress((time / duration) * 100);
            }
        }
    } finally {
        //restore video state
        video.currentTime = originalTime;
        if (wasPlaying) {
            video.play();
        }
    }

    //if no segments found, create a single segment for the whole video
    if (segments.length === 0) {
        //try to get initial pose
        video.currentTime = 0;
        await new Promise<void>((resolve) => {
            const handleSeeked = () => {
                video.removeEventListener('seeked', handleSeeked);
                resolve();
            };
            video.addEventListener('seeked', handleSeeked);
        });

        const poses = await detector.estimatePoses(video);
        if (poses.length > 0) {
            const pose = poses[0];
            const angles = calculateAngles(pose.keypoints);
            segments.push({
                id: 0,
                startTime: 0,
                endTime: duration,
                targetPose: pose,
                targetAngles: {
                    Hip: angles.Hip,
                    Knee: angles.Knee,
                    Elbow: angles.Elbow,
                    Shoulder: angles.Shoulder,
                    BackStraightness: angles.BackStraightness
                },
                description: 'Starting Position',
                matched: false
            });
        }
    }

    console.log(`Video analysis complete: Found ${segments.length} segments`);
    return segments;
}

//check if angle change is significant enough to mark a new segment
function isSignificantChange(oldAngles: any, newAngles: any, threshold: number): boolean {
    const joints = ['Hip', 'Knee', 'Elbow', 'Shoulder'];

    for (const joint of joints) {
        const diff = Math.abs((oldAngles[joint] || 0) - (newAngles[joint] || 0));
        if (diff >= threshold) {
            return true;
        }
    }

    return false;
}

//generate a human-readable description for a pose
function generatePoseDescription(angles: any, segmentNumber: number): string {
    const descriptions: string[] = [];

    //analyze squat depth
    if (angles.Knee < 100) {
        descriptions.push('Deep squat');
    } else if (angles.Knee < 140) {
        descriptions.push('Squat position');
    } else {
        descriptions.push('Standing');
    }

    //analyze arm position
    if (angles.Elbow < 90) {
        descriptions.push('arms bent');
    } else if (angles.Shoulder > 150) {
        descriptions.push('arms extended');
    }

    //analyze back
    if (angles.BackStraightness < 160) {
        descriptions.push('forward lean');
    }

    if (descriptions.length === 0) {
        return `Pose ${segmentNumber + 1}`;
    }

    return descriptions.join(', ');
}

//calculate how well the trainee matches a target segment
export function calculateSegmentMatch(
    traineeAngles: any,
    segment: PoseSegment
): { accuracy: number; matched: boolean } {
    const targetAngles = segment.targetAngles;
    const tolerances = {
        Hip: 20,
        Knee: 20,
        Elbow: 25,
        Shoulder: 20,
        BackStraightness: 15
    };

    let totalScore = 0;
    let jointCount = 0;

    for (const joint of Object.keys(tolerances) as Array<keyof typeof tolerances>) {
        const target = targetAngles[joint];
        const actual = traineeAngles[joint];

        if (target !== undefined && actual !== undefined) {
            const diff = Math.abs(target - actual);
            const tolerance = tolerances[joint];
            const score = Math.max(0, 100 - (diff / tolerance) * 50);
            totalScore += score;
            jointCount++;
        }
    }

    const accuracy = jointCount > 0 ? totalScore / jointCount : 0;
    const matched = accuracy >= DEFAULT_CONFIG.matchAccuracyThreshold;

    return { accuracy, matched };
}

//segment training state manager
export interface SegmentTrainingState {
    isActive: boolean;
    isAnalyzing: boolean;
    analysisProgress: number;
    segments: PoseSegment[];
    currentSegmentIndex: number;
    segmentStatus: 'idle' | 'playing' | 'waiting' | 'matched' | 'completed';
    holdProgress: number; // 0-100%, how long trainee has held correct pose
    matchAccuracy: number;
}

export const initialSegmentState: SegmentTrainingState = {
    isActive: false,
    isAnalyzing: false,
    analysisProgress: 0,
    segments: [],
    currentSegmentIndex: 0,
    segmentStatus: 'idle',
    holdProgress: 0,
    matchAccuracy: 0
};
