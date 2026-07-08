import { useState } from 'react';
import FirstPage1 from './pages/FirstPage1';
import RoleSelection from './features/auth/RoleSelection';
import LoginCard from './features/auth/LoginCard';
import AdminRegister from './features/auth/AdminRegister';
import FacultyRegister from './features/faculty/Register';

function App() {
  const [view, setView] = useState('landing');
  const [loginRole, setLoginRole] = useState('faculty');
  const [loginUserId, setLoginUserId] = useState('');

  const navigate = (nextView, options = {}) => {
    if (Object.prototype.hasOwnProperty.call(options, 'initialRole')) {
      setLoginRole(options.initialRole || 'faculty');
    } else if (nextView === 'login') {
      setLoginRole('faculty');
    }

    if (Object.prototype.hasOwnProperty.call(options, 'initialUserId')) {
      setLoginUserId(options.initialUserId || '');
    } else if (nextView !== 'login') {
      setLoginUserId('');
    }

    setView(nextView);
  };

  if (view === 'role-selection') {
    return <RoleSelection onNavigate={navigate} />;
  }

  if (view === 'login') {
    return <LoginCard onNavigate={navigate} initialRole={loginRole} initialUserId={loginUserId} />;
  }

  if (view === 'admin-register') {
    return <AdminRegister onNavigate={navigate} />;
  }

  if (view === 'faculty-register') {
    return <FacultyRegister onNavigate={navigate} />;
  }

  return <FirstPage1 onProceed={() => navigate('login', { initialRole: 'faculty' })} />;
}

export default App;<<<<<<< HEAD
import { useState } from "react";

import FirstPage1 from "./pages/FirstPage1";
import Sidebar from "./components/superAdmin/Sidebar";
import SettingsPage from "./components/superAdmin/Settings";
import AllAdminsPage from "./components/superAdmin/AllAdminsPage";
import PendingApprovalsPage from "./components/superAdmin/PendingApprovals";

function App() {
  const [active, setActive] = useState("settings");

  return (
    <>
      <FirstPage1 />

      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
        <Sidebar active={active} onNavigate={setActive} />

        {active === "settings" && <SettingsPage />}
        {active === "admins" && <AllAdminsPage />}
        {active === "pending" && <PendingApprovalsPage />}
      </div>
    </>
  );
=======
import { useState } from 'react';
import FirstPage1 from './pages/FirstPage1';
import RoleSelection from './features/auth/RoleSelection';
import LoginCard from './features/auth/LoginCard';
import FacultyLogin from './features/faculty/Login';
import FacultyRegister from './features/faculty/Register';

function App() {
  const [view, setView] = useState('landing');
  const [facultyLoginUserId, setFacultyLoginUserId] = useState('');

  const navigate = (nextView, options = {}) => {
    if (Object.prototype.hasOwnProperty.call(options, 'initialUserId')) {
      setFacultyLoginUserId(options.initialUserId || '');
    } else if (nextView !== 'faculty-login') {
      setFacultyLoginUserId('');
    }

    setView(nextView);
  };

  if (view === 'role-selection') {
    return <RoleSelection onNavigate={navigate} />;
  }

  if (view === 'admin-login') {
    return <LoginCard onNavigate={navigate} role="admin" />;
  }

  if (view === 'faculty-login') {
    return <FacultyLogin onNavigate={navigate} initialUserId={facultyLoginUserId} />;
  }

  if (view === 'faculty-register') {
    return <FacultyRegister onNavigate={navigate} />;
  }

  return <FirstPage1 onProceed={() => navigate('role-selection')} />;
>>>>>>> e1e34c9 (Created Faculty login and registration pages and wired up pages flow)
}

export default App;