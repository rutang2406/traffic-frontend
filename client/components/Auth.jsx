import React, { useState } from "react";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

export default function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToSignup = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const handleLogin = (userData) => {
    onAuth(userData);
  };

  const handleSignup = (userData) => {
    // In a real app, you might want to store the user in a database here
    // For now, we'll just log them in immediately after signup
    onAuth(userData);
  };

  if (isLogin) {
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignup={handleSwitchToSignup} 
      />
    );
  }

  return (
    <Signup 
      onSignup={handleSignup} 
      onSwitchToLogin={handleSwitchToLogin} 
    />
  );
}
