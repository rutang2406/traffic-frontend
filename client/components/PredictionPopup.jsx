import React, { useState, useEffect } from "react";

export default function PredictionPopup({ isOpen, onClose, onPredict }) {
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    day: "",
    time: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Days of the week
  const daysOfWeek = [
    "Monday",
    "Tuesday", 
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.from.trim()) {
      newErrors.from = "Please enter starting location";
    }
    
    if (!formData.to.trim()) {
      newErrors.to = "Please enter destination";
    }
    
    if (!formData.day) {
      newErrors.day = "Please select a day";
    }
    
    if (!formData.time) {
      newErrors.time = "Please select a time";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the prediction function
      if (onPredict) {
        await onPredict(formData);
      }
      
      // Reset form
      setFormData({
        from: "",
        to: "",
        day: "",
        time: ""
      });
      
      // Close popup
      onClose();
    } catch (error) {
      console.error('Error getting prediction:', error);
      alert('Failed to get prediction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        // Close popup if clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Popup Container - centered */}
      <div 
        className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()} // Prevent popup close when clicking inside
      >
        {/* Header - Black theme */}
        <div className="bg-black text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Traffic Prediction</h3>
              <p className="text-sm text-gray-300">Predict traffic conditions for your route</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close popup"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* From Field */}
            <div>
              <label htmlFor="pred-from" className="block text-sm font-medium text-gray-800 mb-1">
                From <span className="text-red-500">*</span>
              </label>
              <input
                id="pred-from"
                name="from"
                type="text"
                value={formData.from}
                onChange={handleInputChange}
                placeholder="Enter starting location"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-gray-50 ${
                  errors.from ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.from && (
                <p className="mt-1 text-xs text-red-600">{errors.from}</p>
              )}
            </div>

            {/* To Field */}
            <div>
              <label htmlFor="pred-to" className="block text-sm font-medium text-gray-800 mb-1">
                To <span className="text-red-500">*</span>
              </label>
              <input
                id="pred-to"
                name="to"
                type="text"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="Enter destination"
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-gray-50 ${
                  errors.to ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.to && (
                <p className="mt-1 text-xs text-red-600">{errors.to}</p>
              )}
            </div>

            {/* Day and Time Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Day Field */}
              <div>
                <label htmlFor="pred-day" className="block text-sm font-medium text-gray-800 mb-1">
                  Day <span className="text-red-500">*</span>
                </label>
                <select
                  id="pred-day"
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-gray-50 ${
                    errors.day ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                {errors.day && (
                  <p className="mt-1 text-xs text-red-600">{errors.day}</p>
                )}
              </div>

              {/* Time Field */}
              <div>
                <label htmlFor="pred-time" className="block text-sm font-medium text-gray-800 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="pred-time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-gray-50 ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.time && (
                  <p className="mt-1 text-xs text-red-600">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Predicting...
                  </div>
                ) : (
                  "Get Prediction"
                )}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
