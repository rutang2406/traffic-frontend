import React, { useState, useEffect } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

export default function PredictionForm({ onBack, onPredict }) {
  const [from, setFrom] = useState('');
  const [coords, setCoords] = useState(null);
  // Removed day and time fields

  const handleSubmit = (e) => {
    e.preventDefault();
    if (from && coords) {
      onPredict({ location: from, coords, radius: 1 }); // radius in km
      // Reset form
      setFrom('');
      setCoords(null);
      // Don't go back immediately - let the popup show first
    }
  };
  // Auto-fetch user's current location and address
  useEffect(() => {
    if (from) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ latitude, longitude });
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.display_name) {
              setFrom(data.display_name);
            } else {
              setFrom(`${latitude}, ${longitude}`);
            }
          } catch (error) {
            setFrom(`${latitude}, ${longitude}`);
          }
        },
        (err) => {
          setFrom('Unable to fetch location');
        }
      );
    } else {
      setFrom('Geolocation not supported');
    }
  }, []);

  // Removed days array

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Traffic Prediction</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Current location"
          value={from}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          readOnly
        />

  {/* Removed day and time fields */}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-2xl font-medium hover:bg-blue-700 transition-colors"
        >
          Get Prediction
        </button>
      </div>
    </form>
  );
}
