import React, { useState } from 'react';
import Play from 'lucide-react/dist/esm/icons/play';
import Pause from 'lucide-react/dist/esm/icons/pause';
import Square from 'lucide-react/dist/esm/icons/square';
import Settings from 'lucide-react/dist/esm/icons/settings';

const CarAnimationControls = ({ onStartAnimation, onStopAnimation, isAnimating, routeInfo }) => {
  const [speed, setSpeed] = useState(50);
  const [showSettings, setShowSettings] = useState(false);

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    // You can add logic here to update the animation speed in real-time
  };

  if (!routeInfo) return null;

  return (
    <div className="absolute bottom-4 left-4 z-[1002] bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Car Animation</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      {/* Route Info */}
      <div className="mb-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Distance:</span>
          <span className="font-medium">{routeInfo.distance}</span>
        </div>
        <div className="flex justify-between">
          <span>Est. Time:</span>
          <span className="font-medium">{routeInfo.duration}</span>
        </div>
      </div>

      {/* Speed Control */}
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speed: {speed} km/h
          </label>
          <input
            type="range"
            min="20"
            max="120"
            step="10"
            value={speed}
            onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((speed - 20) / 100) * 100}%, #e5e7eb ${((speed - 20) / 100) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>20</span>
            <span>120 km/h</span>
          </div>
        </div>
      )}

      {/* Animation Controls */}
      <div className="flex gap-2">
        {!isAnimating ? (
          <button
            onClick={() => onStartAnimation(speed)}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Animation
          </button>
        ) : (
          <button
            onClick={onStopAnimation}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Square className="w-4 h-4" />
            Stop Animation
          </button>
        )}
      </div>

      {/* Animation Status */}
      {isAnimating && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700">Car is moving at {speed} km/h</span>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Watch the car navigate through traffic lights!
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isAnimating && (
        <div className="mt-3 text-xs text-gray-500">
          <p>• Car will stop at red lights</p>
          <p>• Car will slow down at yellow lights</p>
          <p>• Car moves normally at green lights</p>
        </div>
      )}
    </div>
  );
};

export default CarAnimationControls;
