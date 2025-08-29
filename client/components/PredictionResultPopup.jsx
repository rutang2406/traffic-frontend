import React from 'react';
import X from 'lucide-react/dist/esm/icons/x';

export default function PredictionResultPopup({ isOpen, onClose, predictionData, trafficLevel }) {
  if (!isOpen) return null;

  const getTrafficColor = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', indicator: 'bg-green-500' };
      case 'moderate':
        return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', indicator: 'bg-orange-500' };
      case 'high':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', indicator: 'bg-red-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', indicator: 'bg-gray-500' };
    }
  };

  const colors = getTrafficColor(trafficLevel);

  const getTrafficDescription = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'Traffic flows smoothly with minimal delays expected.';
      case 'moderate':
        return 'Some congestion expected. Plan for extra travel time.';
      case 'high':
        return 'Heavy traffic expected. Significant delays likely.';
      default:
        return 'Traffic condition unknown.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Traffic Prediction</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Route Info */}
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Route</div>
            <div className="font-medium text-gray-900">
              {predictionData.from} → {predictionData.to}
            </div>
          </div>

          {/* Time Info */}
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">Prediction Time</div>
            <div className="font-medium text-gray-900">
              {predictionData.day} at {predictionData.time}
            </div>
          </div>

          {/* Traffic Level */}
          <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4 mb-6`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`${colors.indicator} w-4 h-4 rounded-full`}></div>
              <span className={`${colors.text} font-bold text-lg capitalize`}>
                {trafficLevel} Traffic
              </span>
            </div>
            <p className={`${colors.text} text-sm`}>
              {getTrafficDescription(trafficLevel)}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}