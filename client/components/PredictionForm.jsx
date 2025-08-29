import React, { useState } from 'react';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';

export default function PredictionForm({ onBack, onPredict }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (from && to && day && time) {
      onPredict({ from, to, day, time });
      // Reset form
      setFrom('');
      setTo('');
      setDay('');
      setTime('');
      // Don't go back immediately - let the popup show first
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
          placeholder="From location"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />

        <input
          type="text"
          placeholder="To location"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />

        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select day</option>
          {days.map((dayName) => (
            <option key={dayName} value={dayName}>{dayName}</option>
          ))}
        </select>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />

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
