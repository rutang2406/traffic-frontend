import React from 'react';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import X from 'lucide-react/dist/esm/icons/x';

export default function ReportThankYouPopup({ isOpen, onClose, reportData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-50 px-6 py-4 border-b border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-green-900">Thank You!</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-green-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-green-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Thank You Message */}
          <div className="text-center mb-6">
            <div className="mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Thank you for your contribution!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your report has been submitted successfully. This helps make our roads safer for everyone.
            </p>
          </div>

          {/* Report Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-sm font-medium text-gray-700 mb-3">Report Summary</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Incident Type:</span>
                <span className="font-medium text-gray-900">{reportData.incidentType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-900">{reportData.location}</span>
              </div>
              {reportData.image && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Photo:</span>
                  <span className="font-medium text-green-600">✓ Attached</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
