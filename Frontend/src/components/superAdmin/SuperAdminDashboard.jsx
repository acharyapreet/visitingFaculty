import React, { useState } from "react";
import Sidebar from "./Sidebar"; // Adjust this path if necessary
import PendingApprovalsPage from "./PendingApprovals"; // Adjust path
import AllAdminsPage from "./AllAdminsPage"; // Adjust path
import SettingsPage from "./Settings"; // Adjust path

export default function SuperAdminDashboard({ onSignOut }) {
  // State to track which page is currently active. 
  // 'pending' matches the key in your Sidebar navItems array.
  const [activeTab, setActiveTab] = useState("pending");

  // A helper function that returns the correct full-page component
  const renderMainContent = () => {
    switch (activeTab) {
      case "pending":
        return <PendingApprovalsPage />;
      case "admins":
        return <AllAdminsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <PendingApprovalsPage />;
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50">
      {/* 1. Render the Sidebar on the left.
        We pass the activeTab so the sidebar knows which button to highlight.
        We pass setActiveTab so clicking a button updates the state here.
      */}
      <Sidebar 
        active={activeTab} 
        onNavigate={setActiveTab} 
        onSignOut={onSignOut} // Pass it down!
      />

      {/* 2. Render the main content area on the right.
        The switch statement above decides which of your 3 page components renders here.
      */}
      <main className="flex-1 h-screen overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
}