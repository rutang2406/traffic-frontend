import React, { useState, useEffect, useRef } from "react";

export default function Inputs({ from, to, onChange, onSearch, routeInfo, isCalculating, className = "" }) {
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [isLoadingFromSuggestions, setIsLoadingFromSuggestions] = useState(false);
  const [isLoadingToSuggestions, setIsLoadingToSuggestions] = useState(false);
  
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromSuggestionsRef = useRef(null);
  const toSuggestionsRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
    }
  };

  // Debounce function to avoid too many API calls
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Fetch location suggestions from Nominatim API
  const fetchLocationSuggestions = async (query, setSuggestions, setIsLoading) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=IN&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      // Filter out duplicate display_names
      const seen = new Set();
      const suggestions = data
        .map(item => ({
          display_name: item.display_name,
          name: item.name || item.display_name.split(',')[0],
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon)
        }))
        .filter(suggestion => {
          if (seen.has(suggestion.display_name)) return false;
          seen.add(suggestion.display_name);
          return true;
        });
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced fetch functions
  const debouncedFetchFromSuggestions = debounce(
    (query) => fetchLocationSuggestions(query, setFromSuggestions, setIsLoadingFromSuggestions),
    300
  );
  
  const debouncedFetchToSuggestions = debounce(
    (query) => fetchLocationSuggestions(query, setToSuggestions, setIsLoadingToSuggestions),
    300
  );

  // Handle input changes and fetch suggestions
  const handleFromChange = (value) => {
    onChange("from", value);
    if (value.length >= 2) {
      setShowFromSuggestions(true);
      debouncedFetchFromSuggestions(value);
    } else {
      setShowFromSuggestions(false);
      setFromSuggestions([]);
    }
  };

  const handleToChange = (value) => {
    onChange("to", value);
    if (value.length >= 2) {
      setShowToSuggestions(true);
      debouncedFetchToSuggestions(value);
    } else {
      setShowToSuggestions(false);
      setToSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleFromSuggestionClick = (suggestion) => {
    onChange("from", suggestion.name);
    setShowFromSuggestions(false);
    setFromSuggestions([]);
  };

  const handleToSuggestionClick = (suggestion) => {
    onChange("to", suggestion.name);
    setShowToSuggestions(false);
    setToSuggestions([]);
  };

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromSuggestionsRef.current && !fromSuggestionsRef.current.contains(event.target) && 
          !fromInputRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toSuggestionsRef.current && !toSuggestionsRef.current.contains(event.target) && 
          !toInputRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleFromKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowFromSuggestions(false);
    }
  };

  const handleToKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowToSuggestions(false);
    }
  };

  return (
    <div
      className={
        "w-full max-w-xl rounded-3xl bg-white/80 dark:bg-slate-900/70 shadow-xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur p-4 sm:p-6 " +
        className
      }
    >
      <form onSubmit={handleSubmit}>
        {/* From Input with Suggestions */}
        <div className="relative">
          <label className="sr-only" htmlFor="from">From</label>
          <input
            ref={fromInputRef}
            id="from"
            name="from"
            value={from}
            onChange={(e) => handleFromChange(e.target.value)}
            onKeyDown={handleFromKeyDown}
            onFocus={() => {
              if (from.length >= 2 && fromSuggestions.length > 0) {
                setShowFromSuggestions(true);
              }
            }}
            placeholder="Enter starting location (e.g., Delhi, Mumbai, New York)"
            className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-6 py-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-base"
            autoComplete="off"
          />
          
          {/* From Suggestions Dropdown */}
          {showFromSuggestions && (fromSuggestions.length > 0 || isLoadingFromSuggestions) && (
            <div
              ref={fromSuggestionsRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg"
            >
              {isLoadingFromSuggestions ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Loading suggestions...</span>
                </div>
              ) : (
                fromSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleFromSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:bg-slate-50 dark:focus:bg-slate-700/50 focus:outline-none transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {suggestion.display_name}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="h-4" />

        {/* To Input with Suggestions */}
        <div className="relative">
          <label className="sr-only" htmlFor="to">To</label>
          <input
            ref={toInputRef}
            id="to"
            name="to"
            value={to}
            onChange={(e) => handleToChange(e.target.value)}
            onKeyDown={handleToKeyDown}
            onFocus={() => {
              if (to.length >= 2 && toSuggestions.length > 0) {
                setShowToSuggestions(true);
              }
            }}
            placeholder="Enter destination (e.g., Bangalore, London, Tokyo)"
            className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-6 py-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-base"
            autoComplete="off"
          />
          
          {/* To Suggestions Dropdown */}
          {showToSuggestions && (toSuggestions.length > 0 || isLoadingToSuggestions) && (
            <div
              ref={toSuggestionsRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg"
            >
              {isLoadingToSuggestions ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Loading suggestions...</span>
                </div>
              ) : (
                toSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleToSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:bg-slate-50 dark:focus:bg-slate-700/50 focus:outline-none transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {suggestion.display_name}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={isCalculating || !from || !to}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-white shadow hover:bg-slate-800 active:scale-[0.98] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Calculating...
              </>
            ) : (
              "Get Route"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
