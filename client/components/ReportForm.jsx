import React, { useState, useEffect } from 'react';

import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

export default function ReportForm({ onBack, onReport }) {
  const [location, setLocation] = useState('');
  // Auto-fetch user's current location on mount
  useEffect(() => {
    if (location) return; // Don't overwrite if already set
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // Fetch address from OpenStreetMap Nominatim
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data && data.display_name) {
              setLocation(data.display_name);
            } else {
              setLocation(`${latitude}, ${longitude}`);
            }
          } catch (error) {
            setLocation(`${latitude}, ${longitude}`);
          }
        },
        (err) => {
          setLocation('Unable to fetch location');
        }
      );
    } else {
      setLocation('Geolocation not supported');
    }
  }, []);
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location && incidentType && description) {
      onReport({ location, incidentType, description, image });
      // Reset form
      setLocation('');
      setIncidentType('');
      setDescription('');
      setImage(null);
      // Don't go back immediately - let the thank you popup show first
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  // Placeholder for API call to generate description
  const generateDescription = async (incidentType, image) => {
    // You should replace this with your actual API call
    // For now, just return a mock description
    return `Detected incident: ${incidentType}. Image analysis suggests possible details.`;
  };

  useEffect(() => {
    const autoGenerate = async () => {
      if (incidentType && image) {
        setIsGenerating(true);
        const desc = await generateDescription(incidentType, image);
        setDescription(desc);
        setIsGenerating(false);
      }
    };
    autoGenerate();
  }, [incidentType, image]);


  const incidentTypes = [
    { label: 'Crash', value: 'Crash', icon: '🚗💥', color: 'bg-red-100' },
    { label: 'Slowdown', value: 'Slowdown', icon: '🐢', color: 'bg-blue-100' },
    { label: 'Construction', value: 'Construction', icon: '🚧', color: 'bg-yellow-100' },
    { label: 'Lane closure', value: 'Lane closure', icon: '⛔', color: 'bg-orange-100' },
    { label: 'Stalled vehicle', value: 'Stalled vehicle', icon: '🚙', color: 'bg-gray-100' },
    { label: 'Object on road', value: 'Object on road', icon: '⚠️', color: 'bg-pink-100' },
  ];

  const severityLevels = ['Low', 'Medium', 'High', 'Critical'];

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
        <h2 className="text-lg font-semibold text-gray-900">Report Incident</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Incident location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
          readOnly
        />

        <div>
          <div className="mb-2 text-gray-700 font-medium">Select incident type</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {incidentTypes.map((type) => (
              <button
                type="button"
                key={type.value}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-colors cursor-pointer ${type.color} ${incidentType === type.value ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`}
                onClick={() => setIncidentType(type.value)}
              >
                <span className="text-3xl mb-1">{type.icon}</span>
                <span className="text-sm font-semibold text-gray-800">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {image ? (
              <span className="text-gray-700 text-sm flex items-center gap-2">
                <span className="text-xl">📷</span> {image.name}
              </span>
            ) : (
              <span className="text-gray-500 text-sm flex items-center gap-2">
                <span className="text-xl">📷</span> Upload incident photo
              </span>
            )}
          </label>
        </div>

        <textarea
          placeholder="Describe the incident..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          required
          disabled={isGenerating}
        />
        {isGenerating && (
          <div className="text-blue-500 text-sm">Generating description...</div>
        )}

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-3 px-6 rounded-2xl font-medium hover:bg-red-700 transition-colors"
        >
          Submit Report
        </button>
      </div>
    </form>
  );
}
