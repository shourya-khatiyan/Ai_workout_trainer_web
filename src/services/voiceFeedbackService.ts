// Voice Feedback Service for AI Workout Trainer
// Manages intelligent voice feedback with dialogue variations, priority queue, and voting mechanism

interface FeedbackItem {
    text: string;
    status: 'good' | 'warning' | 'error';
    type?: string; // Type of feedback for dialogue selection
    priority?: number; // Priority for queue sorting (higher = more urgent)
}

interface QueuedFeedback {
    feedback: FeedbackItem;
    firstSeenTime: number;
    lastSeenTime: number;
    spokenCount: number;
}

interface DialogueDatabase {
    [key: string]: string[];
}

class VoiceFeedbackService {
    private isEnabled: boolean = false;
    private feedbackQueue: Map<string, QueuedFeedback> = new Map();
    private dialogueHistory: Map<string, number[]> = new Map(); // Track recently used dialogue indices
    private isSpeaking: boolean = false;
    private processingInterval: number | null = null;
    private longDurationThreshold: number = 10000; // 10 seconds for correction guidance
    private votingThreshold: number = 1500; // 1.5 seconds for voting mechanism
    private speechSynthesis: SpeechSynthesis;
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    // Dialogue database with natural-sounding variations
    private dialogues: DialogueDatabase = {
        // Hip feedback
        hip_more: [
            "Bend your hips a bit more",
            "Lower your hips down",
            "Deepen your hip bend",
            "Try bending at the hips a little more",
            "Your hips need to go lower"
        ],
        hip_less: [
            "Straighten your hips a bit",
            "Raise your hips up",
            "Don't bend your hips as much",
            "Lift your hips slightly",
            "Your hips are too low, come up a bit"
        ],

        // Knee feedback
        knee_more: [
            "Bend your knees more",
            "Lower down by bending your knees",
            "Your knees need more bend",
            "Try bending your knees deeper",
            "Sink down into your knees"
        ],
        knee_less: [
            "Straighten your knees a little",
            "Don't bend your knees as much",
            "Your knees are too bent, straighten up",
            "Raise up by straightening your knees",
            "Less bend in the knees"
        ],

        // Elbow feedback
        elbow_more: [
            "Bend your elbows more",
            "Your elbows need more bend",
            "Bring your hands closer by bending elbows",
            "Increase the bend in your elbows",
            "Elbows need to come in more"
        ],
        elbow_less: [
            "Straighten your elbows out",
            "Your elbows are too bent",
            "Extend your arms more",
            "Less bend in the elbows",
            "Push your arms straighter"
        ],

        // Shoulder feedback
        shoulder_more: [
            "Adjust your shoulder angle",
            "Rotate your shoulders forward slightly",
            "Your shoulder position needs adjustment",
            "Modify your shoulder alignment",
            "Bring your shoulders forward a bit"
        ],
        shoulder_less: [
            "Pull your shoulders back",
            "Your shoulders are too forward",
            "Open up your chest and shoulders",
            "Retract your shoulders slightly",
            "Roll your shoulders back"
        ],

        // Back straightness feedback
        back_upper: [
            "Straighten your upper back",
            "Keep your upper back straight",
            "Your neck and upper back need alignment",
            "Lift your chest and straighten your upper back",
            "Don't hunch your upper back"
        ],
        back_mid: [
            "Engage your core for better mid-back position",
            "Straighten your mid-back",
            "Your middle back is rounding, engage your core",
            "Keep your torso upright",
            "Activate your core muscles"
        ],
        back_lower: [
            "Maintain neutral lower back position",
            "Your lower back needs adjustment",
            "Keep a neutral spine in your lower back",
            "Don't arch your lower back too much",
            "Align your lower back"
        ],

        // Distance feedback
        distance_close: [
            "Step back from the camera",
            "You're too close, move back a bit",
            "Take a step back",
            "Move farther from the camera",
            "Back up a little please"
        ],
        distance_far: [
            "Move closer to the camera",
            "You're too far, step forward",
            "Come closer to the camera",
            "Take a step forward",
            "Move in a bit closer"
        ],

        // Visibility feedback
        visibility: [
            "Position yourself in front of the camera",
            "Make sure you're fully visible",
            "Center yourself in the camera view",
            "I can't see you properly, adjust your position",
            "Get into the camera frame"
        ]
    };

    // Correction guidance for long-duration errors
    private correctionGuidance: { [key: string]: string } = {
        hip: "To correct your hip position: First, imagine sitting back into a chair. Keep your weight on your heels. Your knees should track over your toes.",
        knee: "For proper knee alignment: Make sure your knees don't go past your toes. Keep them aligned with your feet. Distribute your weight evenly.",
        elbow: "To fix your elbow position: Keep your elbows close to your body. Bend from the elbow joint, not the shoulder. Maintain control throughout the movement.",
        shoulder: "For better shoulder alignment: Roll your shoulders back and down. Keep your chest up. Imagine squeezing a pencil between your shoulder blades.",
        back: "To straighten your back: Engage your core muscles. Keep your chest lifted. Imagine a string pulling the top of your head toward the ceiling. Maintain a neutral spine.",
        distance: "Adjust your distance from the camera so your full body is visible. You should be able to see from your head to below your knees.",
        visibility: "Position yourself in the center of the camera frame. Make sure there's good lighting and your entire body is visible."
    };

    constructor() {
        this.speechSynthesis = window.speechSynthesis;
    }

    // Enable or disable voice feedback
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;

        if (enabled && !this.processingInterval) {
            this.startProcessing();
        } else if (!enabled && this.processingInterval) {
            this.stopProcessing();
            this.cancelCurrentSpeech();
        }
    }

    // Check if voice feedback is enabled
    isActive(): boolean {
        return this.isEnabled;
    }

    // Add feedback to the voting queue
    addFeedback(feedbackItems: FeedbackItem[]): void {
        if (!this.isEnabled) return;

        const currentTime = Date.now();
        const activeKeys = new Set<string>();

        // Process only error and warning feedback (wrong posture only)
        const relevantFeedback = feedbackItems.filter(
            item => item.status === 'error' || item.status === 'warning'
        );

        relevantFeedback.forEach(item => {
            const key = this.generateFeedbackKey(item);
            activeKeys.add(key);

            if (this.feedbackQueue.has(key)) {
                // Update existing feedback
                const queued = this.feedbackQueue.get(key)!;
                queued.lastSeenTime = currentTime;
                queued.feedback = item; // Update with latest version
            } else {
                // Add new feedback
                this.feedbackQueue.set(key, {
                    feedback: item,
                    firstSeenTime: currentTime,
                    lastSeenTime: currentTime,
                    spokenCount: 0
                });
            }
        });

        // Remove feedback that's no longer active
        const keysToRemove: string[] = [];
        this.feedbackQueue.forEach((_, key) => {
            if (!activeKeys.has(key)) {
                keysToRemove.push(key);
            }
        });
        keysToRemove.forEach(key => this.feedbackQueue.delete(key));
    }

    // Generate unique key for feedback item
    private generateFeedbackKey(item: FeedbackItem): string {
        return `${item.text}-${item.status}`;
    }

    // Start processing feedback queue
    private startProcessing(): void {
        this.processingInterval = window.setInterval(() => {
            this.processFeedbackQueue();
        }, 500); // Check every 500ms
    }

    // Stop processing feedback queue
    private stopProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        this.feedbackQueue.clear();
    }

    // Process the feedback queue
    private processFeedbackQueue(): void {
        if (!this.isEnabled || this.isSpeaking) return;

        const currentTime = Date.now();
        const eligibleFeedback: QueuedFeedback[] = [];

        // Find feedback that has persisted long enough
        this.feedbackQueue.forEach(queued => {
            const persistenceDuration = currentTime - queued.firstSeenTime;

            // Check if feedback has persisted for voting threshold
            if (persistenceDuration >= this.votingThreshold) {
                eligibleFeedback.push(queued);
            }
        });

        if (eligibleFeedback.length === 0) return;

        // Sort by priority (error > warning) and then by persistence duration
        eligibleFeedback.sort((a, b) => {
            const priorityA = this.getPriority(a.feedback);
            const priorityB = this.getPriority(b.feedback);

            if (priorityA !== priorityB) {
                return priorityB - priorityA; // Higher priority first
            }

            // If same priority, speak the one that's been waiting longer
            return a.firstSeenTime - b.firstSeenTime;
        });

        // Speak the highest priority feedback
        const toSpeak = eligibleFeedback[0];
        this.speakFeedback(toSpeak);
    }

    // Get priority value for feedback
    private getPriority(feedback: FeedbackItem): number {
        if (feedback.priority !== undefined) return feedback.priority;

        // Default priority based on status
        switch (feedback.status) {
            case 'error':
                return 3;
            case 'warning':
                return 2;
            default:
                return 1;
        }
    }

    // Speak feedback with natural voice
    private speakFeedback(queued: QueuedFeedback): void {
        const currentTime = Date.now();
        const persistenceDuration = currentTime - queued.firstSeenTime;

        let textToSpeak: string;

        // Check if this is a long-duration error that needs correction guidance
        if (persistenceDuration >= this.longDurationThreshold && queued.spokenCount > 0) {
            textToSpeak = this.getCorrectionGuidance(queued.feedback);
        } else {
            textToSpeak = this.getDialogueVariation(queued.feedback);
        }

        if (!textToSpeak) return;

        this.isSpeaking = true;

        // Cancel any ongoing speech
        this.cancelCurrentSpeech();

        // Create and configure utterance
        this.currentUtterance = new SpeechSynthesisUtterance(textToSpeak);

        // Configure for natural-sounding speech
        this.currentUtterance.rate = 0.95; // Slightly slower for clarity
        this.currentUtterance.pitch = 1.0; // Normal pitch
        this.currentUtterance.volume = 1.0; // Full volume

        // Try to use a natural-sounding voice
        const voices = this.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.lang.startsWith('en') && (voice.name.includes('Natural') || voice.name.includes('Premium'))
        ) || voices.find(voice => voice.lang.startsWith('en'));

        if (preferredVoice) {
            this.currentUtterance.voice = preferredVoice;
        }

        // Handle speech end
        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            queued.spokenCount++;
            queued.firstSeenTime = Date.now(); // Reset timer for long-duration guidance
            this.currentUtterance = null;
        };

        // Handle speech error
        this.currentUtterance.onerror = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
        };

        // Speak
        this.speechSynthesis.speak(this.currentUtterance);
    }

    // Cancel current speech
    private cancelCurrentSpeech(): void {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        this.currentUtterance = null;
    }

    // Get dialogue variation for feedback
    private getDialogueVariation(feedback: FeedbackItem): string {
        const dialogueKey = this.identifyDialogueType(feedback);

        if (!dialogueKey || !this.dialogues[dialogueKey]) {
            return feedback.text; // Fallback to original text
        }

        const variations = this.dialogues[dialogueKey];
        if (variations.length === 0) return feedback.text;

        // Get recently used indices for this dialogue type
        const recentIndices = this.dialogueHistory.get(dialogueKey) || [];

        // Find an index that hasn't been used recently
        let selectedIndex: number;
        if (recentIndices.length >= variations.length) {
            // All variations have been used, clear history and start fresh
            selectedIndex = 0;
            this.dialogueHistory.set(dialogueKey, []);
        } else {
            // Find unused variation
            const availableIndices = variations
                .map((_, index) => index)
                .filter(index => !recentIndices.includes(index));

            selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        }

        // Update history (keep last 3 used indices)
        const updatedHistory = [...recentIndices, selectedIndex].slice(-3);
        this.dialogueHistory.set(dialogueKey, updatedHistory);

        return variations[selectedIndex];
    }

    // Identify dialogue type from feedback
    private identifyDialogueType(feedback: FeedbackItem): string | null {
        const text = feedback.text.toLowerCase();

        // Distance checks
        if (text.includes('move back') || text.includes('too close')) {
            return 'distance_close';
        }
        if (text.includes('move closer') || text.includes('too far')) {
            return 'distance_far';
        }

        // Visibility check
        if (text.includes('position yourself') || text.includes('camera')) {
            return 'visibility';
        }

        // Back checks
        if (text.includes('upper back') || text.includes('neck')) {
            return 'back_upper';
        }
        if (text.includes('mid-back') || text.includes('core')) {
            return 'back_mid';
        }
        if (text.includes('lower back')) {
            return 'back_lower';
        }

        // Joint checks with direction
        const joints = ['hip', 'knee', 'elbow', 'shoulder'];
        for (const joint of joints) {
            if (text.includes(joint)) {
                if (text.includes('more') || text.includes('bend') || text.includes('lower')) {
                    return `${joint}_more`;
                }
                if (text.includes('less') || text.includes('straighten') || text.includes('raise')) {
                    return `${joint}_less`;
                }
            }
        }

        return null;
    }

    // Get correction guidance for long-duration errors
    private getCorrectionGuidance(feedback: FeedbackItem): string {
        const text = feedback.text.toLowerCase();

        // Identify the body part that needs correction
        if (text.includes('hip')) return this.correctionGuidance.hip;
        if (text.includes('knee')) return this.correctionGuidance.knee;
        if (text.includes('elbow')) return this.correctionGuidance.elbow;
        if (text.includes('shoulder')) return this.correctionGuidance.shoulder;
        if (text.includes('back')) return this.correctionGuidance.back;
        if (text.includes('camera') && (text.includes('back') || text.includes('closer'))) {
            return this.correctionGuidance.distance;
        }
        if (text.includes('position') || text.includes('visible')) {
            return this.correctionGuidance.visibility;
        }

        return feedback.text; // Fallback
    }

    // Clean up
    cleanup(): void {
        this.stopProcessing();
        this.cancelCurrentSpeech();
        this.feedbackQueue.clear();
        this.dialogueHistory.clear();
    }
}

// Export singleton instance
export const voiceFeedbackService = new VoiceFeedbackService();
