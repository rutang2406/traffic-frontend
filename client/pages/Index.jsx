import React, { useState } from "react";
import SimpleMapComponent from "@/components/SimpleMapComponent";
import Inputs from "@/components/Inputs";
import Buttons from "@/components/Buttons";
import UserDropdown from "@/components/UserDropdown";
import PredictionForm from "@/components/PredictionForm";
import ReportForm from "@/components/ReportForm";
import PredictionResultPopup from "@/components/PredictionResultPopup";
import ReportThankYouPopup from "@/components/ReportThankYouPopup";

export default function Index({ user, onSignOut, onOpenIncidentReport }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [currentView, setCurrentView] = useState("navigation");
  const [showPredictionPopup, setShowPredictionPopup] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [showReportThankYou, setShowReportThankYou] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [showCarAnimation, setShowCarAnimation] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  const handleChange = (field, value) => {
    if (field === "from") setFrom(value);
    else setTo(value);
  };

  const handleSearch = () => {
    if (from && to) {
      setIsCalculatingRoute(true);
      setShowCarAnimation(false); // Stop any existing animation
      setFromLocation(from);
      setToLocation(to);
      console.log("Calculating route from", from, "to", to);
    }
  };

  const handleRouteCalculated = (info) => {
    setRouteInfo(info);
    setIsCalculatingRoute(false);
    setIsFormExpanded(false); // Reset form to minimized state
    
    // Auto-start car animation after 1 second
    setTimeout(() => {
      setShowCarAnimation(true);
    }, 1000);
  };

  const handlePredict = () => {
    setCurrentView("prediction");
  };

  const handlePredictionSubmit = async (predictionData) => {
    console.log("Prediction requested for:", predictionData);
    
    // Simulate prediction logic - randomly assign traffic levels
    const trafficLevels = ['low', 'moderate', 'high'];
    const randomLevel = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
    
    setPredictionResult({
      data: predictionData,
      trafficLevel: randomLevel
    });
    setShowPredictionPopup(true);
    setCurrentView("navigation"); // Go back to navigation view
  };

  const handleNavigation = () => {
    setCurrentView("navigation");
  };

  const handleReport = () => {
    setCurrentView("report");
  };

  const handleReportSubmit = async (reportData) => {
    console.log("Incident reported:", reportData);
    
    // Store the report data and show thank you popup
    setSubmittedReport(reportData);
    setShowReportThankYou(true);
    setCurrentView("navigation"); // Go back to navigation view
  };

  const handleBackToNavigation = () => {
    setCurrentView("navigation");
  };

  const handleModifyRoute = () => {
    setIsFormExpanded(true);
  };

  const handleMinimizeForm = () => {
    setIsFormExpanded(false);
  };

  const closePredictionPopup = () => {
    setShowPredictionPopup(false);
    setPredictionResult(null);
  };

  const closeReportThankYou = () => {
    setShowReportThankYou(false);
    setSubmittedReport(null);
  };

  return (
    <main className="relative h-screen w-full bg-background overflow-hidden">
            <SimpleMapComponent 
        className="h-full"
        fromLocation={fromLocation}
        toLocation={toLocation} 
        onRouteCalculated={handleRouteCalculated}
        showCarAnimation={showCarAnimation}
      />

      {/* Top brand banner */}
      <div className="absolute left-4 top-4 z-[1001] flex items-center gap-3 rounded-full bg-white shadow-lg px-4 py-2 border border-gray-200">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F70e6f5bf64cd4c70b2f1db527b7e88f8%2F6a1cdfc7621e4323a5b54052454108b4?format=webp&width=64"
          alt="Pravah logo"
          className="w-10 h-10 rounded-full bg-white border border-gray-200"
        />
        <div className="flex flex-col">
          <span className="font-extrabold text-lg text-gray-900 leading-tight">Pravah</span>
          <span className="text-xs text-gray-600 -mt-1">Navigate India's Traffic, Smartly</span>
        </div>
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
              onNavigation={handleNavigation}
              onPrediction={handlePredict}
              onReport={handleReport}
            />
          </div>
          <div className={`transition-all duration-300 ease-in-out rounded-3xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-black/40 ${
            routeInfo && currentView === "navigation" && !isFormExpanded
              ? "w-auto max-w-md p-3" 
              : "w-[50vw] max-w-xl p-6"
          }`}>
            {currentView === "navigation" && (
              <>
                {routeInfo && !isFormExpanded ? (
                  // Minimized route info display
                  <div className="text-center">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-blue-600 dark:text-blue-400 font-medium ">
                        ETA: {routeInfo.duration}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        Distance: {routeInfo.distance}
                      </span>
                    </div>
                    <button
                      onClick={handleModifyRoute}
                      className="text-s text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      Click to modify route
                    </button>
                  </div>
                ) : (
                  // Full input form (either no route or expanded)
                  <div className="relative">
                    {routeInfo && isFormExpanded && (
                      <button
                        onClick={handleMinimizeForm}
                        className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-slate-500 hover:bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors z-10"
                        title="Minimize form"
                      >
                        ×
                      </button>
                    )}
                    <Inputs 
                      from={from} 
                      to={to} 
                      onChange={handleChange}
                      onSearch={handleSearch}
                      routeInfo={routeInfo}
                      isCalculating={isCalculatingRoute}
                    />
                  </div>
                )}
              </>
            )}
            {currentView === "prediction" && (
              <PredictionForm
                onBack={handleBackToNavigation}
                onPredict={handlePredictionSubmit}
              />
            )}
            {currentView === "report" && (
              <ReportForm
                onBack={handleBackToNavigation}
                onReport={handleReportSubmit}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile layout: buttons centered above inputs */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 md:hidden z-[1001]">
        <div className={`pointer-events-auto transition-all duration-300 ease-in-out rounded-2xl border border-white/20 bg-white/80 shadow-xl backdrop-blur dark:border-white/10 dark:bg-black/40 ${
          routeInfo && currentView === "navigation" && !isFormExpanded ? "p-3" : "p-4"
        }`}>
          <div className="mb-3 flex items-center justify-center gap-4">
            <Buttons 
              onNavigation={handleNavigation}
              onPrediction={handlePredict}
              onReport={handleReport}
            />
          </div>
          {currentView === "navigation" && (
            <>
              {routeInfo && !isFormExpanded ? (
                // Minimized route info display for mobile
                <div className="text-center">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      ETA: {routeInfo.duration}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      Distance: {routeInfo.distance}
                    </span>
                  </div>
                  <button
                    onClick={handleModifyRoute}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    Tap to modify route
                  </button>
                </div>
              ) : (
                // Full input form for mobile (either no route or expanded)
                <div className="relative">
                  {routeInfo && isFormExpanded && (
                    <button
                      onClick={handleMinimizeForm}
                      className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-slate-500 hover:bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors z-10"
                      title="Minimize form"
                    >
                      ×
                    </button>
                  )}
                  <Inputs 
                    from={from} 
                    to={to} 
                    onChange={handleChange}
                    onSearch={handleSearch}
                    routeInfo={routeInfo}
                    isCalculating={isCalculatingRoute}
                  />
                </div>
              )}
            </>
          )}
          {currentView === "prediction" && (
            <PredictionForm
              onBack={handleBackToNavigation}
              onPredict={handlePredictionSubmit}
            />
          )}
          {currentView === "report" && (
            <ReportForm
              onBack={handleBackToNavigation}
              onReport={handleReportSubmit}
            />
          )}
        </div>
      </div>

      {/* Route Info and Car Controls */}
      {routeInfo && (
        <></>
      )}

      {/* Prediction Result Popup */}
      {showPredictionPopup && predictionResult && (
        <PredictionResultPopup
          isOpen={showPredictionPopup}
          onClose={closePredictionPopup}
          predictionData={predictionResult.data}
          trafficLevel={predictionResult.trafficLevel}
        />
      )}

      {/* Report Thank You Popup */}
      {showReportThankYou && submittedReport && (
        <ReportThankYouPopup
          isOpen={showReportThankYou}
          onClose={closeReportThankYou}
          reportData={submittedReport}
        />
      )}
    </main>
  );
}
