import { useState, useEffect } from 'react';
import Header from './components/Header';
import FirstPage1 from './pages/FirstPage1';
import LoginCard from './features/auth/LoginCard';
import RoleSelection from './features/auth/RoleSelection';
import AdminRegister from './features/auth/AdminRegister';
import FacultyRegister from './components/faculty/FacultyRegister';
import ForgotPassword from './features/auth/ForgotPassword';
import CheckEmail from './features/auth/CheckEmail';
import ResetPassword from './features/auth/ResetPassword';
import PasswordUpdated from './features/auth/PasswordUpdated';
import SuperAdminDashboard from './components/superAdmin/SuperAdminDashboard'; 
import AdminDashboard from './components/admin/AdminDashboard';
import FacultyDashboard from './components/faculty/FacultyDashboard';
function App() {
  // 1. BULLETPROOF ROUTER MEMORY
  const [view, setView] = useState(() => {
    // First, check if a user is actively logged in. If they are, FORCE them to the dashboard.
    const urlParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    if (pathname.includes('reset-password') || urlParams.has('token')) {
      return 'reset-password';
    }

    const session = localStorage.getItem('iipsCurrentSession');
    if (session) return 'dashboard';

    // If not logged in, check if they were on another specific page (like 'admin-register')
    const savedView = localStorage.getItem('iipsCurrentView');
    return savedView || 'landing';
  });

  const [authOptions, setAuthOptions] = useState({ userId: '', role: null });

  // 2. WATCHER: Save the current page to memory every time it changes
  useEffect(() => {
    localStorage.setItem('iipsCurrentView', view);
  }, [view]);

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
    navigate('dashboard');
  };

  const renderContent = () => {
    switch (view) {
      case 'landing': return <FirstPage1 onProceed={() => navigate('login')} />;
      case 'login': return <LoginCard onNavigate={navigate} onSuccess={handleLoginSuccess} role={authOptions.role} initialEmail={authOptions.userId} />;
      case 'role-selection': return <RoleSelection onNavigate={navigate} />;
      case 'admin-register': return <AdminRegister onNavigate={navigate} />;
      case 'faculty-register': return <FacultyRegister onNavigate={navigate} />;
      case 'forgot-password': return <ForgotPassword onNavigate={navigate} />;  
      case 'reset-code': return <CheckEmail onNavigate={navigate} />;
      case 'reset-password': return <ResetPassword onNavigate={navigate} />;
      case 'password-updated': return <PasswordUpdated onNavigate={navigate} />;
      
      case 'dashboard': {
        const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
        
        if (session.role === 'super_admin' || session.role === 'superadmin') {
          return <SuperAdminDashboard onSignOut={() => {
            // 3. CLEANUP: Wipe all memory when logging out so they start fresh
            localStorage.removeItem('iipsCurrentSession');
            localStorage.removeItem('iipsCurrentView'); 
            localStorage.removeItem('superAdminActiveTab');
            localStorage.removeItem('iipsSettingsTab');
            navigate('login');
          }} />;
        }
        
        if (session.role === 'admin') {
          return <AdminDashboard onSignOut={() => {
            localStorage.removeItem('iipsCurrentSession');
            navigate('login');
          }} />;
        }
        
        if (session.role === 'faculty') {
          return <FacultyDashboard onSignOut={() => {
            localStorage.removeItem('iipsCurrentSession');
            navigate('login');
          }} />;
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