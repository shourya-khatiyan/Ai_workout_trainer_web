import { CheckCircle2, AlertTriangle, XCircle, Mic, MicOff } from 'lucide-react';
import { SegmentTrainingState } from '../../utils/segmentAnalyzer';

interface FeedbackItem {
  text: string;
  status: 'good' | 'warning' | 'error';
}

interface FeedbackPanelProps {
  feedbackItems: FeedbackItem[];
  segmentState: SegmentTrainingState;
  voiceFeedbackActive: boolean;
  onToggleVoice: () => void;
  onExitSegmentMode: () => void;
}

/**
 * shows good form feedback, improvement suggestions, and
 * segment training progress in the trainer ui.
 */
export default function FeedbackPanel({
  feedbackItems,
  segmentState,
  voiceFeedbackActive,
  onToggleVoice,
  onExitSegmentMode,
}: FeedbackPanelProps) {
  const goodFeedback = feedbackItems.filter((item) => item.status === 'good');
  const improvementFeedback = feedbackItems.filter(
    (item) => item.status === 'warning' || item.status === 'error'
  );

  return (
    <div className="trainer-card rounded-2xl p-4 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        {segmentState.isActive && segmentState.segments.length > 0 ? (
          <SegmentInfo segmentState={segmentState} onExit={onExitSegmentMode} />
        ) : (
          <>
            <h2 className="text-base font-bold mb-3 text-green-700 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Good Form
            </h2>
            <div className="max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {goodFeedback.length > 0 ? (
                <ul className="space-y-2">
                  {goodFeedback.map((item, index) => (
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

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-orange-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Needs Improvement
          </h2>
          <button
            onClick={onToggleVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              voiceFeedbackActive
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
          {improvementFeedback.length > 0 ? (
            <ul className="space-y-2">
              {improvementFeedback.map((item, index) => (
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
  );
}

function SegmentInfo({
  segmentState,
  onExit,
}: {
  segmentState: SegmentTrainingState;
  onExit: () => void;
}) {
  return (
    <>
      <h2 className="text-base font-bold mb-3 text-purple-700 flex items-center">
        Segment Training
      </h2>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-gray-500 mb-1.5">Progress</div>
          <div className="flex items-center gap-1">
            {segmentState.segments.map((segment, idx) => (
              <div
                key={segment.id}
                className={`h-2 flex-1 rounded-full transition-all ${
                  segment.matched
                    ? 'bg-green-500'
                    : idx === segmentState.currentSegmentIndex
                    ? 'bg-orange-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-semibold text-gray-800">
            Segment {segmentState.currentSegmentIndex + 1} of {segmentState.segments.length}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {segmentState.segments[segmentState.currentSegmentIndex]?.description || 'Match this pose'}
          </div>
        </div>

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
            <div className="text-lg font-bold text-green-600">Complete!</div>
            <button
              className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
              onClick={onExit}
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
  );
}
