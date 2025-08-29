import React from 'react';
import logo from '../assets/logo.png'; // Make sure your logo is in client/assets/logo.png

export default function Banner() {
  return (
    <div className="flex items-center bg-white rounded-full shadow-lg px-4 py-2 gap-3 max-w-md mx-auto mt-4" style={{border: '1.5px solid #e5e7eb'}}>
      <img src={logo} alt="Pravah Logo" className="w-10 h-10 rounded-full bg-white border border-gray-200" />
      <div className="flex flex-col">
        <span className="font-extrabold text-lg text-gray-900 leading-tight">Pravah</span>
        <span className="text-xs text-gray-600 -mt-1">Navigate India's Traffic, Smartly</span>
      </div>
    </div>
  );
}
