import React, { useState, useEffect } from "react";

export default function IncidentReport({ user, onClose, isOpen }) {
  const [formData, setFormData] = useState({
    roadSegment: "",
    type: "Accident",
    description: "",
    image: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roadSegments = [
    "Valsad-Anand",
    "Anand-Vadodara",
    "Vadodara-Ahmedabad",
    "Ahmedabad-Gandhinagar",
    "Gandhinagar-Mehsana",
    "Delhi-Gurgaon",
    "Mumbai-Pune",
    "Bangalore-Chennai"
  ];

  const incidentTypes = [
    "Accident",
    "Traffic Jam",
    "Road Block",
    "Construction",
    "Vehicle Breakdown",
    "Weather Issue",
    "Police Activity",
    "Other"
  ];

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.roadSegment) {
      newErrors.roadSegment = "Please select a road segment";
    }
    
    if (!formData.type) {
      newErrors.type = "Please select an incident type";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Please provide a description";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
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
      const formDataToSend = new FormData();
      formDataToSend.append('roadSegment', formData.roadSegment);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('reportedBy', user.email);
      formDataToSend.append('reporterName', user.name);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      // This will be the API call when backend is ready
      const response = await fetch('/api/incidents/report', {
        method: 'POST',
        body: formDataToSend
      });
      
      if (response.ok) {
        alert('Incident reported successfully!');
        // Reset form
        setFormData({
          roadSegment: "",
          type: "Accident",
          description: "",
          image: null
        });
        // Reset file input
        document.getElementById('imageInput').value = '';
        // Close modal
        onClose();
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndAddAnother = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    
    await handleSubmit(e);
    // Reset form for another entry
    setFormData({
      roadSegment: "",
      type: "Accident",
      description: "",
      image: null
    });
    document.getElementById('imageInput').value = '';
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Report Incident</h2>
              <p className="text-sm text-gray-600 mt-1">
                Report traffic incidents on {formData.roadSegment || "selected road segment"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-4 sm:p-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Road Segment */}
              <div>
                <label htmlFor="roadSegment" className="block text-sm font-medium text-gray-700 mb-2">
                  Road segment: <span className="text-red-500">*</span>
                </label>
                <select
                  id="roadSegment"
                  name="roadSegment"
                  value={formData.roadSegment}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                    errors.roadSegment ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a road segment</option>
                  {roadSegments.map(segment => (
                    <option key={segment} value={segment}>{segment}</option>
                  ))}
                </select>
                {errors.roadSegment && (
                  <p className="mt-1 text-sm text-red-600">{errors.roadSegment}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type: <span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {incidentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description: <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the incident in detail..."
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-sm sm:text-base ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={500}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="imageInput" className="block text-sm font-medium text-gray-700 mb-2">
                  Image:
                </label>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.image && (
                  <p className="mt-1 text-sm text-green-600">
                    Selected: {formData.image.name}
                  </p>
                )}
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Optional: Upload an image of the incident (Max 10MB)
                </p>
              </div>

              {/* Reporter Info */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Reporter Information</h3>
                <div className="text-xs sm:text-sm text-blue-700 space-y-1">
                  <p><span className="font-medium">Name:</span> {user.name}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Time:</span> {new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  {isSubmitting ? 'Submitting...' : 'SAVE'}
                </button>
                
                <button
                  type="button"
                  onClick={handleSaveAndAddAnother}
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Save and add another
                </button>
                
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
