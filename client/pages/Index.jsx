import React, { useState } from "react";
import MapComponent from "@/components/MapComponent";
import Inputs from "@/components/Inputs";
import Buttons from "@/components/Buttons";
import UserDropdown from "@/components/UserDropdown";
import PredictionPopup from "@/components/PredictionPopup";

export default function Index({ user, onSignOut, onOpenIncidentReport }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [showPredictionPopup, setShowPredictionPopup] = useState(false);

  const handleChange = (field, value) => {
    if (field === "from") setFrom(value);
    else setTo(value);
  };

  const handleSearch = () => {
    if (from && to) {
      setIsCalculatingRoute(true);
      setFromLocation(from);
      setToLocation(to);
      console.log("Calculating route from", from, "to", to);
    }
  };

  const handleRouteCalculated = (info) => {
    setRouteInfo(info);
    setIsCalculatingRoute(false);
  };

  const handlePredict = () => {
    setShowPredictionPopup(true);
  };

  const handlePredictionSubmit = async (predictionData) => {
    console.log("Prediction requested for:", predictionData);
    // Here you can call your prediction API
    // For now, just simulate a prediction
    alert(`Prediction: Traffic is expected to be moderate on ${predictionData.day} at ${predictionData.time} from ${predictionData.from} to ${predictionData.to}`);
  };

  const handleClosePredictionPopup = () => {
    setShowPredictionPopup(false);
  };

  const handleCongestion = () => console.log("congestion");
  const handleReport = () => {
    onOpenIncidentReport();
  };

  return (
    <main className="relative h-screen w-full bg-background overflow-hidden">
      <MapComponent 
        className="absolute inset-0 z-0" 
        fromLocation={fromLocation}
        toLocation={toLocation}
        onRouteCalculated={handleRouteCalculated}
      />

      {/* Top brand bar */}
      <div className="absolute left-4 top-4 z-[1001] flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow backdrop-blur dark:bg-black/40">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F70e6f5bf64cd4c70b2f1db527b7e88f8%2F6a1cdfc7621e4323a5b54052454108b4?format=webp&width=64"
          alt="Pravah logo"
          className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
        />
        <span className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">Pravah</span>
      </div>

      {/* User dropdown */}
      <div className="absolute right-4 top-4 z-[1001]">
        <UserDropdown user={user} onSignOut={onSignOut} />
      </div>

      {/* Desktop / laptop form panel */}
      <div className="pointer-events-none absolute left-1/2 bottom-6 hidden md:block transform -translate-x-1/2 z-[1001]">
        <div className="relative pointer-events-auto">
          <div className="mb-3 flex items-center justify-center gap-3">
            <Buttons 
              onCongestion={handleCongestion}
              onPrediction={handlePredict}
              onReport={handleReport}
            />
          </div>
          <div className="w-[50vw] max-w-xl rounded-3xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-black/40">
            <Inputs 
              from={from} 
              to={to} 
              onChange={handleChange}
              onSearch={handleSearch}
              routeInfo={routeInfo}
              isCalculating={isCalculatingRoute}
            />
          </div>
        </div>
      </div>

      {/* Mobile layout: buttons centered above inputs */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 md:hidden z-[1001]">
        <div className="pointer-events-auto rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-black/40">
          <div className="mb-3 flex items-center justify-center gap-4">
            <Buttons 
              onCongestion={handleCongestion}
              onPrediction={handlePredict}
              onReport={handleReport}
            />
          </div>
          <Inputs 
            from={from} 
            to={to} 
            onChange={handleChange}
            onSearch={handleSearch}
            routeInfo={routeInfo}
            isCalculating={isCalculatingRoute}
          />
        </div>
      </div>

      {/* Prediction Popup */}
      <PredictionPopup
        isOpen={showPredictionPopup}
        onClose={handleClosePredictionPopup}
        onPredict={handlePredictionSubmit}
      />
    </main>
  );
}
