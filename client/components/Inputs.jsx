import React from "react";

export default function Inputs({ from, to, onChange, className = "" }) {
  return (
    <div
      className={
        "w-full max-w-xl rounded-2xl bg-white/80 dark:bg-slate-900/70 shadow-xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur p-3 sm:p-4 " +
        className
      }
    >
      <label className="sr-only" htmlFor="from">From</label>
      <input
        id="from"
        name="from"
        value={from}
        onChange={(e) => onChange("from", e.target.value)}
        placeholder="From"
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="h-3" />
      <label className="sr-only" htmlFor="to">To</label>
      <input
        id="to"
        name="to"
        value={to}
        onChange={(e) => onChange("to", e.target.value)}
        placeholder="To"
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          formAction="/"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-white shadow hover:from-indigo-500 hover:to-sky-400 active:scale-[0.98]"
        >
          Search Route
        </button>
      </div>
    </div>
  );
}
