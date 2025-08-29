import React from "react";
import BrainCircuit from "lucide-react/dist/esm/icons/brain-circuit";
import TrafficCone from "lucide-react/dist/esm/icons/traffic-cone";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";

function Action({ label, Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group relative grid size-14 place-items-center rounded-full bg-black text-white shadow-lg ring-1 ring-black/30 transition-transform hover:scale-105 hover:bg-neutral-900 focus:outline-none focus:ring-4 focus:ring-black/30 sm:size-16"
    >
      <Icon className="size-6 sm:size-7 drop-shadow-sm" />
      <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-[10px] text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

export default function Buttons({ orientation = "horizontal", onCongestion, onPrediction, onReport, className = "" }) {
  return (
    <div className={(orientation === "vertical" ? "flex-col" : "flex-row") + " flex gap-3 sm:gap-4 " + className}>
      <Action label="Congestion" Icon={TrafficCone} onClick={onCongestion} />
      <Action label="Prediction" Icon={BrainCircuit} onClick={onPrediction} />
      <Action label="Report" Icon={AlertTriangle} onClick={onReport} />
    </div>
  );
}
