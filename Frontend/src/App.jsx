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

  // Logic to handle where to send the user after a successful login
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
      case 'landing':
        return <FirstPage1 onProceed={() => navigate('login')} />;
      case 'login':
        return (
          <LoginCard 
            onNavigate={navigate} 
            onSuccess={handleLoginSuccess} // Pass the success handler here
            role={authOptions.role} 
            initialUserId={authOptions.userId} 
          />
        );
      case 'role-selection':
        return <RoleSelection onNavigate={navigate} />;
      case 'admin-register':
        return <AdminRegister onNavigate={navigate} />;
      case 'faculty-register':
        return <FacultyRegister onNavigate={navigate} />;
      case 'forgot-password':
        return <ForgotPassword onNavigate={navigate} />;  
      case 'reset-code':
        return <VerifyOtp onNavigate={navigate} />;
      case 'reset-password':
        return <ResetPassword onNavigate={navigate} />;
      case 'password-updated':
        return <PasswordUpdated onNavigate={navigate} />;
      default:
        return <FirstPage1 onProceed={() => navigate('login')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      {view !== 'landing' && <Header onNavigate={navigate} />}
      <main className="flex-grow flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;