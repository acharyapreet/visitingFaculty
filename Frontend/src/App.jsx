import React, { useState } from 'react';
import Header from './components/Header';
import LoginCard from './features/auth/LoginCard';
import RoleSelection from './features/auth/RoleSelection';
import AdminRegister from './features/auth/AdminRegister';

function App() {
  const [currentView, setCurrentView] = useState('login');

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <LoginCard onNavigate={setCurrentView} />;
      case 'role-selection':
        return <RoleSelection onNavigate={setCurrentView} />;
      case 'admin-register': 
        return <AdminRegister onNavigate={setCurrentView} />;
      // case 'faculty-register': return <FacultyForm />;
      default:
        return <LoginCard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans">
      <Header />
      <main>
        {renderView()}
      </main>
    </div>
  );
}

export default App;