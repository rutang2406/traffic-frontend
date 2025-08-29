import React, { useState } from "react";

export default function UserDropdown({ user, onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow backdrop-blur hover:bg-white/90 transition-colors dark:bg-black/40 dark:hover:bg-black/50"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
        />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {user.name}
        </span>
        <svg
          className={`h-4 w-4 text-slate-600 dark:text-slate-300 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black/5 dark:bg-gray-800 z-20">
            <div className="p-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
            <div className="p-1">
              <button
                onClick={onSignOut}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
