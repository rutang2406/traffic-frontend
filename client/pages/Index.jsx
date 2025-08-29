import React, { useState } from "react";
import MapComponent from "@/components/MapComponent";
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
  const [currentView, setCurrentView] = useState("navigation"); // "navigation", "prediction", "report"
  const [showPredictionPopup, setShowPredictionPopup] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [showReportThankYou, setShowReportThankYou] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);

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
      <MapComponent 
        className="absolute inset-0 z-0" 
        fromLocation={fromLocation}
        toLocation={toLocation}
        onRouteCalculated={handleRouteCalculated}
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
          <div className="w-[50vw] max-w-xl rounded-3xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-black/40">
            {currentView === "navigation" && (
              <Inputs 
                from={from} 
                to={to} 
                onChange={handleChange}
                onSearch={handleSearch}
                routeInfo={routeInfo}
                isCalculating={isCalculatingRoute}
              />
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
        <div className="pointer-events-auto rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-black/40">
          <div className="mb-3 flex items-center justify-center gap-4">
            <Buttons 
              onNavigation={handleNavigation}
              onPrediction={handlePredict}
              onReport={handleReport}
            />
          </div>
          {currentView === "navigation" && (
            <Inputs 
              from={from} 
              to={to} 
              onChange={handleChange}
              onSearch={handleSearch}
              routeInfo={routeInfo}
              isCalculating={isCalculatingRoute}
            />
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
