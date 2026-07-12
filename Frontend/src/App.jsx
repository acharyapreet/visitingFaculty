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
import PendingApprovalsPage from './components/superAdmin/PendingApprovals'; // Fixed: Uppercase P
import Sidebar from './components/superAdmin/Sidebar';
import Topbar from './components/superAdmin/Topbar';

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
    if (user.role === 'superadmin') {
      navigate('superadmin-dashboard');
    } else if (user.role === 'admin') {
      navigate('admin-dashboard');
    } else {
      navigate('faculty-dashboard');
    }
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
      
      case 'dashboard': {
        const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
        
        // Return only the specific page component content
        if (session.role === 'super_admin') return <PendingApprovalsPage onNavigate={navigate} />;
        if (session.role === 'admin') return <div className="p-10">Admin Dashboard - Coming Soon</div>;
        if (session.role === 'faculty') return <div className="p-10">Faculty Dashboard - Coming Soon</div>;
        
        return <LoginCard onNavigate={navigate} />;
      }
      default: return <FirstPage1 onProceed={() => navigate('login')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      {/* 1. Header is hidden when view is dashboard */}
      {view !== 'dashboard' && <Header onNavigate={navigate} />}
      
      {/* 2. Dashboard Layout Shell: Sidebar + Topbar + Content */}
      {view === 'dashboard' ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar onNavigate={navigate} />
          <div className="flex flex-1 flex-col overflow-hidden">
            
            <main className="flex-1 overflow-y-auto bg-gray-50">
              {renderContent()}
            </main>
          </div>
        </div>
      ) : (
        <main className="flex-grow">
          {renderContent()}
        </main>
      )}
    </div>
  );
}

export default App;