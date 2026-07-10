import { useState } from 'react';
import FirstPage1 from './pages/FirstPage1';
import FacultyRegister from './components/faculty/Register';

const SUPERADMIN_ACCOUNT = {
  role: 'superadmin',
  userId: '',
  email: '',
  password: '',
};

const loadStoredAccounts = () => {
  try {
    const rawAccounts = localStorage.getItem('iipsPortalAccounts');
    return rawAccounts ? JSON.parse(rawAccounts) : [];
  } catch {
    return [];
  }
};

const storeAccount = (account) => {
  const existingAccounts = loadStoredAccounts();
  const nextAccounts = [...existingAccounts.filter((item) => item.userId !== account.userId), account];
  localStorage.setItem('iipsPortalAccounts', JSON.stringify(nextAccounts));
};

const buildInstituteUserId = (prefix) => {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  return `${prefix}-2K${yearSuffix}-${String(Date.now() % 1000 || 1).padStart(3, '0')}`;
};

function CommonLoginScreen({ onNavigate, onSuccess, initialUserId = '' }) {
  const [identifier, setIdentifier] = useState(initialUserId);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const normalizedIdentifier = identifier.trim().toLowerCase();
      const accounts = loadStoredAccounts();
      const allAccounts = [...accounts, SUPERADMIN_ACCOUNT];

      const matchedAccount = allAccounts.find((account) => {
        const identifiers = [account.userId, account.email]
          .filter(Boolean)
          .map((value) => value.toLowerCase());

        return identifiers.includes(normalizedIdentifier);
      });

      if (!matchedAccount) {
        setErrorMessage('No user exists for this account. Please register as a new user.');
        return;
      }

      if (matchedAccount.password !== password) {
        setErrorMessage('Incorrect password. Please try again.');
        return;
      }

      localStorage.setItem(
        'iipsCurrentSession',
        JSON.stringify({
          role: matchedAccount.role,
          userId: matchedAccount.userId,
          email: matchedAccount.email || '',
        }),
      );

      setSuccessMessage('Logged in successfully');
      if (typeof onSuccess === 'function') {
        onSuccess(matchedAccount);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Could not sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center bg-[#F8F9FB] px-3 py-8 sm:px-4 sm:py-12">
      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141B2B]/40 backdrop-blur-sm px-3 sm:px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#C3C5D8] bg-white p-6 text-center shadow-2xl sm:p-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E1FDEB] text-[#10B981] shadow-sm">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="mb-2 text-2xl font-bold text-[#141B2B]">{successMessage}</h3>
            <p className="mb-8 text-sm leading-relaxed text-[#585F6C]">
              Welcome back! You have successfully authenticated to the IIPS portal.
            </p>

            <button
              type="button"
              onClick={() => {
                setSuccessMessage('');
                setIdentifier('');
                setPassword('');
              }}
              className="w-full rounded-lg bg-[#004DD2] py-3 font-medium text-white shadow-md transition hover:bg-[#003bb3] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-col items-center sm:mb-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#004DD2] shadow-md">
          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#141B2B]">Welcome Back</h1>
      </div>

      <div className="w-full max-w-[420px] rounded-2xl border border-[#C3C5D8] bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 sm:mb-6">
          <h2 className="mb-1 text-lg font-bold text-[#141B2B] sm:text-xl">Sign In to Your Account</h2>
          <p className="text-sm text-[#6B7280]">Please fill in the details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="mb-2 rounded-xl border border-[#F7C4C4] bg-[#FFF1F1] px-4 py-3 text-center text-sm font-medium leading-relaxed text-[#EF4444]">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#424656]">Institute User ID or Email</label>
            <input
              type="text"
              placeholder="IIPS-2K26-002 or name@davv.ac.in"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                setErrorMessage('');
              }}
              disabled={isSubmitting}
              className={`w-full rounded-lg border px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 ${
                errorMessage
                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                  : 'border-[#C3C5D8] focus:border-[#004DD2] focus:ring-[#004DD2]/20'
              } ${isSubmitting ? 'cursor-not-allowed bg-gray-50 opacity-50' : 'bg-white'}`}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#424656]">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrorMessage('');
              }}
              disabled={isSubmitting}
              className={`w-full rounded-lg border px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 ${
                errorMessage
                  ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                  : 'border-[#C3C5D8] focus:border-[#004DD2] focus:ring-[#004DD2]/20'
              } ${isSubmitting ? 'cursor-not-allowed bg-gray-50 opacity-50' : 'bg-white'}`}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 flex w-full items-center justify-center rounded-lg py-3 font-medium text-white transition-all focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30 ${
              isSubmitting ? 'cursor-not-allowed bg-[#004DD2]/70' : 'bg-[#004DD2] hover:bg-[#003bb3]'
            }`}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4 mb-6 sm:mt-5 sm:mb-8">
          <button type="button" className="text-sm font-bold text-[#004DD2] hover:underline focus:outline-none">
            Forget Password ?
          </button>
        </div>

        <div className="flex flex-col items-start gap-3">
          <p className="ml-1 text-xs font-bold text-[#004DD2]">New user? Click to Register</p>
          <button
            type="button"
            onClick={() => onNavigate('role-selection')}
            className="w-full rounded-lg bg-[#004DD2] py-3 font-medium text-white transition-all hover:bg-[#003bb3] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30"
          >
            Click to Register
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleSelectionScreen({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] bg-[#F8F9FB] px-3 py-8 sm:px-4 sm:py-12">
      <div className="text-center mb-8 max-w-lg sm:mb-10">
        <h1 className="text-2xl font-bold text-[#141B2B] mb-3 sm:text-[28px]">Choose Registration Type</h1>
        <p className="text-[#585F6C] text-sm leading-relaxed px-2 sm:px-4">
          Choose whether you want to create an admin account or a faculty account.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 sm:gap-6 mb-10 sm:mb-12 w-full max-w-3xl">
        <button
          type="button"
          onClick={() => onNavigate('admin-register')}
          className="bg-white border border-[#C3C5D8] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center w-full sm:w-[320px] cursor-pointer hover:shadow-lg hover:border-[#004DD2]/50 transition-all group"
        >
          <div className="w-14 h-14 bg-[#F1F3FF] rounded-full flex items-center justify-center mb-4 sm:mb-5 text-[#004DD2] group-hover:bg-[#004DD2] group-hover:text-white transition-colors duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#141B2B] mb-3 sm:mb-4 group-hover:text-[#004DD2] transition-colors">Admin</h2>
          <div className="text-[#004DD2] text-sm font-medium flex items-center group-hover:underline text-center justify-center">
            Continue to Admin Registration
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('faculty-register')}
          className="bg-white border border-[#C3C5D8] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center w-full sm:w-[320px] cursor-pointer hover:shadow-lg hover:border-[#004DD2]/50 transition-all group"
        >
          <div className="w-14 h-14 bg-[#F1F3FF] rounded-full flex items-center justify-center mb-4 sm:mb-5 text-[#004DD2] group-hover:bg-[#004DD2] group-hover:text-white transition-colors duration-300">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#141B2B] mb-3 sm:mb-4 group-hover:text-[#004DD2] transition-colors">Faculty</h2>
          <div className="text-[#004DD2] text-sm font-medium flex items-center group-hover:underline text-center justify-center">
            Continue to Faculty Registration
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={() => onNavigate('login')}
        className="flex w-full items-center justify-center text-sm font-medium text-[#585F6C] hover:text-[#141B2B] transition-colors focus:outline-none sm:w-auto"
      >
        Back to Login
      </button>
    </div>
  );
}

function AdminRegisterScreen({ onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'mobile' ? value.replace(/[^0-9]/g, '') : value;

    setFormData((current) => ({
      ...current,
      [name]: nextValue,
    }));
    setFormError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.mobile.length !== 10) {
      setFormError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match. Please try again.');
      return;
    }

    const userId = buildInstituteUserId('IIPS-ADM');
    storeAccount({
      role: 'admin',
      userId,
      email: formData.email.trim(),
      password: formData.password,
      fullName: formData.fullName.trim(),
      mobile: formData.mobile.trim(),
    });

    localStorage.setItem(
      'iipsCurrentSession',
      JSON.stringify({ role: 'admin', userId, email: formData.email.trim() }),
    );

    window.alert('Registered successfully');
    onNavigate('login', { initialUserId: userId });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] bg-[#F8F9FB] px-4 py-12">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 bg-[#004DD2] rounded-xl flex items-center justify-center shadow-md mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#141B2B]">Welcome To IIPS</h1>
      </div>

      <div className="w-full max-w-[520px] bg-white border border-[#C3C5D8] rounded-2xl p-8 shadow-sm">
        <div className="mx-auto w-fit bg-[#F1F3FF] border border-[#DBE1FF] text-[#004DD2] text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm mb-5">
          Admin Portal
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-[22px] font-bold text-[#141B2B] mb-1.5">Create Your Admin Account</h2>
          <p className="text-sm text-[#6B7280]">Enter your professional details to access the university dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] text-xs font-medium px-4 py-3 rounded-lg text-center mb-2">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#424656] mb-1.5">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-[#C3C5D8] rounded-lg px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#424656] mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="admin@davv.ac.in"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-[#C3C5D8] rounded-lg px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#424656] mb-1.5">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="9876543210"
              value={formData.mobile}
              onChange={handleChange}
              maxLength={10}
              className="w-full border border-[#C3C5D8] rounded-lg px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#424656] mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-[#C3C5D8] rounded-lg px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-[#424656] mb-1.5">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-[#C3C5D8] rounded-lg px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 focus:border-[#004DD2] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004DD2] text-white font-medium rounded-lg py-3 mt-4 hover:bg-[#003bb3] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30 transition-all flex justify-center items-center gap-2"
          >
            Submit Registration
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-[#424656]">
            Already have an admin account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#004DD2] font-semibold hover:underline focus:outline-none"
              type="button"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState('landing');
  const [loginUserId, setLoginUserId] = useState('');

  const navigate = (nextView, options = {}) => {
    // Map 'faculty-login' requested by Register.jsx to the common 'login' view
    const targetView = nextView === 'faculty-login' ? 'login' : nextView;
    
    if (Object.prototype.hasOwnProperty.call(options, 'initialUserId')) {
      setLoginUserId(options.initialUserId || '');
    } else if (targetView !== 'login') {
      setLoginUserId('');
    }

    setView(targetView);
  };

  if (view === 'login') {
    return <CommonLoginScreen onNavigate={navigate} initialUserId={loginUserId} />;
  }

  if (view === 'role-selection') {
    return <RoleSelectionScreen onNavigate={navigate} />;
  }

  if (view === 'admin-register') {
    return <AdminRegisterScreen onNavigate={navigate} />;
  }

  if (view === 'faculty-register') {
    return <FacultyRegister onNavigate={navigate} />;
  }

  return <FirstPage1 onProceed={() => navigate('login')} />;
}

export default App;



// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import FacultyLayout from "./components/faculty/layout/FacultyLayout";
// import FacultyDashboard from "./components/faculty/FacultyDashboard";
// import MarkAttendance from "./components/faculty/MarkAttendance";
// import AttendanceHistory from "./components/faculty/AttendanceHistory";
// import ViewBill from "./components/faculty/ViewBill";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route element={<FacultyLayout />}>
//           <Route path="/" element={<FacultyDashboard />} />
//           <Route path="/mark-attendance" element={<MarkAttendance />} />
//           <Route path="/attendance-history" element={<AttendanceHistory />} />
//           <Route path="/view-bill" element={<ViewBill />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }
