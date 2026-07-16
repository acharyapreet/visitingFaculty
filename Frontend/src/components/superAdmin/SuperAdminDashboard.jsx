import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar"; 
import PendingApprovalsPage from "./PendingApprovals"; 
import AllAdminsPage from "./AllAdminsPage"; 
import SettingsPage from "./Settings"; 

export default function SuperAdminDashboard({ onSignOut }) {
  // 1. Initialize state by checking localStorage first
  // 1. Bulletproof State Initialization
  // By passing a function into useState, React runs this BEFORE the first render.
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("superAdminActiveTab");
    console.log("On refresh, found saved main tab:", savedTab); // For debugging
    return savedTab || "pending"; // Default to pending if nothing is saved
  });
  const [pendingCount, setPendingCount] = useState(0);

  // 2. Save to localStorage whenever the tab changes
  useEffect(() => {
    localStorage.setItem("superAdminActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
        const response = await axios.get("http://localhost:5000/api/super_admin/pendingAdmin", {
          headers: { 'Authorization': `Bearer ${session.token}` }
        });
        setPendingCount(response.data.data.length);
      } catch (err) {
        console.error("Error fetching pending count", err);
      }
    };

    fetchPendingCount();
  }, [activeTab]);

  const handleSignOut = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
      
      // UNCOMMENT THIS when your teammate gives you the logout URL
      /*
      await axios.post("http://localhost:5000/api/auth/logout", {}, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      */

      // Clear all local storage on sign out
      localStorage.removeItem('iipsCurrentSession');
      localStorage.removeItem('superAdminActiveTab'); // Clear the saved tab too!
      
      if (onSignOut) onSignOut();
      
    } catch (err) {
      console.error("Error signing out", err);
      localStorage.removeItem('iipsCurrentSession');
      localStorage.removeItem('iipsAdminActiveTab');
      if (onSignOut) onSignOut();
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "pending":
        return <PendingApprovalsPage onNavigate={setActiveTab} />;
      case "admins":
        return <AllAdminsPage onNavigate={setActiveTab} />;
      case "settings":
        return <SettingsPage onNavigate={setActiveTab} />;
      default:
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