// voice feedback service - handles all the speech stuff for correcting posture

interface FeedbackItem {
    text: string;
    status: 'good' | 'warning' | 'error';
    type?: string;
    priority?: number;
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
    private dialogueHistory: Map<string, number[]> = new Map();
    private isSpeaking: boolean = false;
    private processingInterval: number | null = null;
    private longDurationThreshold: number = 10000; // 10 seconds before giving detailed help
    private votingThreshold: number = 1500; // 1.5 seconds before speaking
    private speechSynthesis: SpeechSynthesis;
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    // all the different ways to say feedback
    private dialogues: DialogueDatabase = {
        // hip stuff
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
        // knee stuff
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
        // elbow stuff
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
        // shoulder stuff
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
        // back stuff
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
        // camera distance
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
        // visibility
        visibility: [
            "Position yourself in front of the camera",
            "Make sure you're fully visible",
            "Center yourself in the camera view",
            "I can't see you properly, adjust your position",
            "Get into the camera frame"
        ]
    };

    // detailed help for when someone keeps messing up the same thing
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

    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;

        if (enabled && !this.processingInterval) {
            this.startProcessing();
        } else if (!enabled && this.processingInterval) {
            this.stopProcessing();
            this.cancelCurrentSpeech();
        }
    }

    isActive(): boolean {
        return this.isEnabled;
    }

    // add feedback to the queue
    addFeedback(feedbackItems: FeedbackItem[]): void {
        if (!this.isEnabled) return;

        const currentTime = Date.now();
        const activeKeys = new Set<string>();

        // only care about errors and warnings
        const relevantFeedback = feedbackItems.filter(
            item => item.status === 'error' || item.status === 'warning'
        );

        relevantFeedback.forEach(item => {
            const key = this.generateFeedbackKey(item);
            activeKeys.add(key);

            if (this.feedbackQueue.has(key)) {
                const queued = this.feedbackQueue.get(key)!;
                queued.lastSeenTime = currentTime;
                queued.feedback = item;
            } else {
                this.feedbackQueue.set(key, {
                    feedback: item,
                    firstSeenTime: currentTime,
                    lastSeenTime: currentTime,
                    spokenCount: 0
                });
            }
        });

        // remove old feedback that's not happening anymore
        const keysToRemove: string[] = [];
        this.feedbackQueue.forEach((_, key) => {
            if (!activeKeys.has(key)) {
                keysToRemove.push(key);
            }
        });
        keysToRemove.forEach(key => this.feedbackQueue.delete(key));
    }

    private generateFeedbackKey(item: FeedbackItem): string {
        return `${item.text}-${item.status}`;
    }

    private startProcessing(): void {
        this.processingInterval = window.setInterval(() => {
            this.processFeedbackQueue();
        }, 500);
    }

    private stopProcessing(): void {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        this.feedbackQueue.clear();
    }

    private processFeedbackQueue(): void {
        if (!this.isEnabled || this.isSpeaking) return;

        const currentTime = Date.now();
        const eligibleFeedback: QueuedFeedback[] = [];

        // find feedback thats been around long enough
        this.feedbackQueue.forEach(queued => {
            const persistenceDuration = currentTime - queued.firstSeenTime;
            if (persistenceDuration >= this.votingThreshold) {
                eligibleFeedback.push(queued);
            }
        });

        if (eligibleFeedback.length === 0) return;

        // sort by priority and time
        eligibleFeedback.sort((a, b) => {
            const priorityA = this.getPriority(a.feedback);
            const priorityB = this.getPriority(b.feedback);

            if (priorityA !== priorityB) {
                return priorityB - priorityA;
            }
            return a.firstSeenTime - b.firstSeenTime;
        });

        const toSpeak = eligibleFeedback[0];
        this.speakFeedback(toSpeak);
    }

    private getPriority(feedback: FeedbackItem): number {
        if (feedback.priority !== undefined) return feedback.priority;

        switch (feedback.status) {
            case 'error':
                return 3;
            case 'warning':
                return 2;
            default:
                return 1;
        }
    }

    private speakFeedback(queued: QueuedFeedback): void {
        const currentTime = Date.now();
        const persistenceDuration = currentTime - queued.firstSeenTime;

        let textToSpeak: string;

        // give detailed help if they keep messing up
        if (persistenceDuration >= this.longDurationThreshold && queued.spokenCount > 0) {
            textToSpeak = this.getCorrectionGuidance(queued.feedback);
        } else {
            textToSpeak = this.getDialogueVariation(queued.feedback);
        }

        if (!textToSpeak) return;

        this.isSpeaking = true;
        this.cancelCurrentSpeech();

        this.currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
        this.currentUtterance.rate = 0.95;
        this.currentUtterance.pitch = 1.0;
        this.currentUtterance.volume = 1.0;

        // try to find a nice voice
        const voices = this.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
            voice.lang.startsWith('en') && (voice.name.includes('Natural') || voice.name.includes('Premium'))
        ) || voices.find(voice => voice.lang.startsWith('en'));

        if (preferredVoice) {
            this.currentUtterance.voice = preferredVoice;
        }

        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            queued.spokenCount++;
            queued.firstSeenTime = Date.now();
            this.currentUtterance = null;
        };

        this.currentUtterance.onerror = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
        };

        this.speechSynthesis.speak(this.currentUtterance);
    }

    private cancelCurrentSpeech(): void {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        this.currentUtterance = null;
    }

    // pick a random variation so it doesnt sound robotic
    private getDialogueVariation(feedback: FeedbackItem): string {
        const dialogueKey = this.identifyDialogueType(feedback);

        if (!dialogueKey || !this.dialogues[dialogueKey]) {
            return feedback.text;
        }

        const variations = this.dialogues[dialogueKey];
        if (variations.length === 0) return feedback.text;

        const recentIndices = this.dialogueHistory.get(dialogueKey) || [];

        let selectedIndex: number;
        if (recentIndices.length >= variations.length) {
            selectedIndex = 0;
            this.dialogueHistory.set(dialogueKey, []);
        } else {
            const availableIndices = variations
                .map((_, index) => index)
                .filter(index => !recentIndices.includes(index));

            selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        }

        const updatedHistory = [...recentIndices, selectedIndex].slice(-3);
        this.dialogueHistory.set(dialogueKey, updatedHistory);

        return variations[selectedIndex];
    }

    // figure out what kind of feedback this is
    private identifyDialogueType(feedback: FeedbackItem): string | null {
        const text = feedback.text.toLowerCase();

        if (text.includes('move back') || text.includes('too close')) {
            return 'distance_close';
        }
        if (text.includes('move closer') || text.includes('too far')) {
            return 'distance_far';
        }
        if (text.includes('position yourself') || text.includes('camera')) {
            return 'visibility';
        }
        if (text.includes('upper back') || text.includes('neck')) {
            return 'back_upper';
        }
        if (text.includes('mid-back') || text.includes('core')) {
            return 'back_mid';
        }
        if (text.includes('lower back')) {
            return 'back_lower';
        }

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

    private getCorrectionGuidance(feedback: FeedbackItem): string {
        const text = feedback.text.toLowerCase();

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

        return feedback.text;
    }

    cleanup(): void {
        this.stopProcessing();
        this.cancelCurrentSpeech();
        this.feedbackQueue.clear();
        this.dialogueHistory.clear();
    }
}

export const voiceFeedbackService = new VoiceFeedbackService();
