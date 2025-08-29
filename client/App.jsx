import "./global.css";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IncidentReport from "./pages/IncidentReport";
import Auth from "./components/Auth";
import NotFound from "./pages/NotFound";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showIncidentReport, setShowIncidentReport] = useState(false);

  useEffect(() => {
    
    const savedUser = localStorage.getItem("pravah_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("pravah_user", JSON.stringify(userData));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem("pravah_user");
    setShowIncidentReport(false);
  };

  const handleOpenIncidentReport = () => {
    setShowIncidentReport(true);
  };

  const handleCloseIncidentReport = () => {
    setShowIncidentReport(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuth={handleLogin} />;
  }

  return (
    <>
      <Index 
        user={user} 
        onSignOut={handleSignOut} 
        onOpenIncidentReport={handleOpenIncidentReport} 
      />
      <IncidentReport 
        user={user} 
        onClose={handleCloseIncidentReport} 
        isOpen={showIncidentReport} 
      />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
