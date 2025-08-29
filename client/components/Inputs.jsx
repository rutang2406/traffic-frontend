import React from "react";

export default function Inputs({ from, to, onChange, onSearch, routeInfo, isCalculating, className = "" }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch();
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
        <label className="sr-only" htmlFor="from">From</label>
        <input
          id="from"
          name="from"
          value={from}
          onChange={(e) => onChange("from", e.target.value)}
          placeholder="From"
          className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-6 py-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-base"
        />
        <div className="h-4" />
        <label className="sr-only" htmlFor="to">To</label>
        <input
          id="to"
          name="to"
          value={to}
          onChange={(e) => onChange("to", e.target.value)}
          placeholder="To"
          className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-6 py-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-base"
        />
        
        {/* Route Information */}
        {routeInfo && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                ETA: {routeInfo.duration}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                Distance: {routeInfo.distance}
              </span>
            </div>
          </div>
        )}
        
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
