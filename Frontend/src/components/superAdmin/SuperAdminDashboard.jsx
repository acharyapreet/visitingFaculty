import React, { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import Sidebar from "./Sidebar"; 
import PendingApprovalsPage from "./PendingApprovals"; 
import AllAdminsPage from './AllAdminsPage'; 
import SettingsPage from "./Settings"; 
import ProgramsPage from "./ProgramPage";
import MonthlySummary from "./MonthlySummary";

export default function SuperAdminDashboard({ onSignOut }) {
  // 1. Bulletproof State Initialization
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("superAdminActiveTab");
    console.log("On refresh, found saved main tab:", savedTab); // For debugging
    return savedTab || "pending"; 
  });
  const [pendingCount, setPendingCount] = useState(0);

  // 2. Save to localStorage whenever the tab changes
  useEffect(() => {
    localStorage.setItem("superAdminActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        // CLEANED: Manual headers removed!
        const response = await api.get("/super_admin/pendingAdmin");
        setPendingCount(response.data.data.length);
      } catch (err) {
        console.error("Error fetching pending count", err);
      }
    };

    fetchPendingCount();
  }, [activeTab]);

  const handleSignOut = async () => {
    try {
      // CLEANED: Manual headers removed for your future logout logic!
      /*
      await api.post("/auth/logout", {});
      */

      // Clear all local storage on sign out
      localStorage.removeItem('iipsCurrentSession');
      localStorage.removeItem('superAdminActiveTab'); 
      
      if (onSignOut) onSignOut();
      
    } catch (err) {
      console.error("Error signing out", err);
      localStorage.removeItem('iipsCurrentSession');
      localStorage.removeItem('superAdminActiveTab'); 
      if (onSignOut) onSignOut();
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "pending":
        return <PendingApprovalsPage onNavigate={setActiveTab} />;
        
      // 🛑 CHECK YOUR SIDEBAR.JSX! 🛑 
      // If your sidebar passes "allAdmins" or "all_admins", change the string below to match it!
      case "programincharges":
        return <AllAdminsPage onNavigate={setActiveTab} />;
        
      case "programs":
        return <ProgramsPage onNavigate={setActiveTab} />;
      case "monthly-summary":
        return <MonthlySummary />;
      case "settings":
        return <SettingsPage onNavigate={setActiveTab} />;
      default:
        // This default fallback is why PendingApprovals kept showing up!
        return <PendingApprovalsPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        active={activeTab} 
        onNavigate={setActiveTab} 
        onSignOut={handleSignOut} 
        pendingCount={pendingCount} 
      />

      <main className="flex-1 h-screen overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
}