interface JointAngle {
  joint: string;
  angle: number;
  accuracy: number;
}

interface MetricsPanelProps {
  postureAccuracy: number;
  postureStatus: string;
  jointAngles: JointAngle[];
}

/**
 * displays overall posture accuracy and per-joint accuracy bars.
 */
export default function MetricsPanel({
  postureAccuracy,
  postureStatus,
  jointAngles,
}: MetricsPanelProps) {
  const getColor = (accuracy: number) => {
    if (accuracy >= 85) return { text: 'text-green-700', bg: 'bg-green-500', light: 'bg-green-100' };
    if (accuracy >= 70) return { text: 'text-orange-700', bg: 'bg-orange-500', light: 'bg-orange-100' };
    if (accuracy >= 50) return { text: 'text-amber-700', bg: 'bg-amber-500', light: 'bg-amber-100' };
    return { text: 'text-red-700', bg: 'bg-red-500', light: 'bg-red-100' };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Overall</div>
            <div
              className={`text-2xl font-black leading-none ${
                postureAccuracy >= 85
                  ? 'text-green-600'
                  : postureAccuracy >= 70
                  ? 'text-orange-500'
                  : 'text-red-500'
              }`}
            >
              {postureAccuracy}%
            </div>
          </div>
          <div
            className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
              postureStatus === 'CORRECT'
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-red-50 text-red-700 border-red-300'
            }`}
          >
            {postureStatus}
          </div>
        </div>
      </div>

      <div className="p-2.5">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-0.5">
          Joint Accuracy
        </div>

        <div className="space-y-2">
          {jointAngles.map((item, index) => {
            const color = getColor(item.accuracy);
            return (
              <div key={index} className="bg-gray-50 rounded px-2 py-1.5 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-gray-700 uppercase">{item.joint}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${color.text}`}>{item.accuracy}%</span>
                    <span className="text-[10px] text-gray-500">&bull;</span>
                    <span className="text-xs font-semibold text-gray-600">{item.angle}&deg;</span>
                  </div>
                </div>
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
  );
}
