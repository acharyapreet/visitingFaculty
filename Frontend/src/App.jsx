import { useState } from 'react';
import Header from './components/Header';
import FirstPage1 from './pages/FirstPage1';
import LoginCard from './features/auth/LoginCard';
import RoleSelection from './features/auth/RoleSelection';
import AdminRegister from './features/auth/AdminRegister';
import FacultyRegister from './components/faculty/FacultyRegister';
import ForgotPassword from './features/auth/ForgotPassword';
import VerifyOtp from './features/auth/VerifyOtp';
import ResetPassword from './features/auth/ResetPassword';
import PasswordUpdated from './features/auth/PasswordUpdated';

import SuperAdminDashboard from './components/superAdmin/SuperAdminDashboard'; 

function App() {
  const [view, setView] = useState('landing');
  const [authOptions, setAuthOptions] = useState({ userId: '', role: null });

  const navigate = (nextView, options = {}) => {
    if (options.role) {
      setAuthOptions({
        userId: options.initialUserId || '',
        role: options.role
      });
    }
    setView(nextView);
  };

  const handleLoginSuccess = (user) => {
    // Keep your original navigation command
    navigate('dashboard');
  };

  const renderContent = () => {
    switch (view) {
      case 'landing': return <FirstPage1 onProceed={() => navigate('login')} />;
      case 'login': return <LoginCard onNavigate={navigate} onSuccess={handleLoginSuccess} role={authOptions.role} initialUserId={authOptions.userId} />;
      case 'role-selection': return <RoleSelection onNavigate={navigate} />;
      case 'admin-register': return <AdminRegister onNavigate={navigate} />;
      case 'faculty-register': return <FacultyRegister onNavigate={navigate} />;
      case 'forgot-password': return <ForgotPassword onNavigate={navigate} />;  
      case 'reset-code': return <VerifyOtp onNavigate={navigate} />;
      case 'reset-password': return <ResetPassword onNavigate={navigate} />;
      case 'password-updated': return <PasswordUpdated onNavigate={navigate} />;
      
      // RESTORED: Your original dashboard logic!
      case 'dashboard': {
        const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
        
        // Checking for both spellings just in case
        if (session.role === 'super_admin' || session.role === 'superadmin') {
          return <SuperAdminDashboard onSignOut={() => {
            localStorage.removeItem('iipsCurrentSession');
            navigate('login');
          }} />;
        }
        
        if (session.role === 'admin') {
          return <div className="p-10">Admin Dashboard - Coming Soon</div>;
        }
        
        if (session.role === 'faculty') {
          return <div className="p-10">Faculty Dashboard - Coming Soon</div>;
        }
        
        // If no valid session is found, send them back to login
        return <LoginCard onNavigate={navigate} />;
      }
        
      default: return <FirstPage1 onProceed={() => navigate('login')} />;
    }
  };

  const isDashboard = view.includes('dashboard');

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      {!isDashboard && <Header onNavigate={navigate} />}
      
      <main className={isDashboard ? "" : "flex-grow"}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;