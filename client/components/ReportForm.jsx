import React, { useState } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

export default function ReportForm({ onBack, onReport }) {
  const [location, setLocation] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

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

  const incidentTypes = [
    'Traffic Jam',
    'Accident',
    'Road Construction',
    'Vehicle Breakdown',
    'Road Closure',
    'Weather Hazard',
    'Other'
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
        />

        <select
          value={incidentType}
          onChange={(e) => setIncidentType(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select incident type</option>
          {incidentTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

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
              <span className="text-gray-700 text-sm">
                📷 {image.name}
              </span>
            ) : (
              <span className="text-gray-500 text-sm">
                Upload incident photo
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
        />

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
