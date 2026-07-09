import { useState } from 'react';

const DEMO_ADMIN_ACCOUNT = {
  role: 'admin',
  userId: 'ADMIN-2026-001',
  password: 'Admin@123',
};

const loadStoredAccounts = () => {
  try {
    const rawAccounts = localStorage.getItem('iipsPortalAccounts');
    return rawAccounts ? JSON.parse(rawAccounts) : [];
  } catch {
    return [];
  }
};

const LoginCard = ({ onNavigate, role = 'faculty', initialUserId = '' }) => {
  const [userId, setUserId] = useState(() => initialUserId);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successRole, setSuccessRole] = useState(null);
  const [storedAccounts] = useState(() => loadStoredAccounts());
  const [isLoading, setIsLoading] = useState(false);

  const roleLabel = role === 'admin' ? 'Admin' : 'Faculty';

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const normalizedUserId = userId.trim().toLowerCase();
      const roleAccounts = storedAccounts.filter((account) => account.role === role);
      const matchedAccount = roleAccounts.find((account) => {
        const storedIdentifiers = [account.userId, account.email]
          .filter(Boolean)
          .map((value) => value.toLowerCase());

        return storedIdentifiers.includes(normalizedUserId) && account.password === password;
      });

      const demoAdminMatch =
        role === 'admin' &&
        normalizedUserId === DEMO_ADMIN_ACCOUNT.userId.toLowerCase() &&
        password === DEMO_ADMIN_ACCOUNT.password;

      if (matchedAccount || demoAdminMatch) {
        setSuccessRole(roleLabel);
        localStorage.setItem(
          'iipsCurrentSession',
          JSON.stringify({ role, userId: matchedAccount?.userId || DEMO_ADMIN_ACCOUNT.userId }),
        );
      } else {
        setErrorMessage(
          'Invalid credentials. Please check your Institute User ID and password and try again.',
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Could not sign in right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {successRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141B2B]/40 backdrop-blur-sm px-3 sm:px-4">
          <div className="animate-in fade-in zoom-in duration-200 w-full max-w-sm rounded-2xl border border-[#C3C5D8] bg-white p-6 text-center shadow-2xl sm:p-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E1FDEB] text-[#10B981] shadow-sm">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="mb-2 text-2xl font-bold text-[#141B2B]">Login Successful</h3>

            <p className="mb-8 text-sm leading-relaxed text-[#585F6C]">
              Welcome back! You have successfully authenticated to the IIPS portal as a <span className="font-bold text-[#004DD2]">{successRole}</span>.
            </p>

            <button
              onClick={() => {
                setSuccessRole(null);
                setUserId('');
                setPassword('');
              }}
              className="w-full rounded-lg bg-[#004DD2] py-3 font-medium text-white shadow-md transition hover:bg-[#003bb3] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center bg-[#F8F9FB] px-3 py-8 sm:px-4 sm:py-12">
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

          <form onSubmit={handleSignIn} className="space-y-5">
            {errorMessage && (
              <div className="mb-2 rounded-xl border border-[#F7C4C4] bg-[#FFF1F1] px-4 py-3 text-center text-sm font-medium leading-relaxed text-[#EF4444]">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-xl border border-[#DDE3F0] bg-[#EEF3FF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#004DD2] shadow-sm">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Selected Role</p>
                  <p className="text-sm font-bold text-[#141B2B]">{roleLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('role-selection')}
                className="self-start text-sm font-semibold text-[#004DD2] hover:underline sm:self-auto"
              >
                Change
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#424656]">Institute User ID</label>
              <input
                type="text"
                placeholder="IIPS-2K26-002"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setErrorMessage('');
                }}
                disabled={isLoading}
                className={`w-full rounded-lg border px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 ${
                  errorMessage
                    ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                    : 'border-[#C3C5D8] focus:border-[#004DD2] focus:ring-[#004DD2]/20'
                } ${isLoading ? 'cursor-not-allowed bg-gray-50 opacity-50' : 'bg-white'}`}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#424656]">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage('');
                }}
                disabled={isLoading}
                className={`w-full rounded-lg border px-4 py-2.5 text-[#141B2B] placeholder-[#9CA3AF] transition-colors focus:outline-none focus:ring-2 ${
                  errorMessage
                    ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20'
                    : 'border-[#C3C5D8] focus:border-[#004DD2] focus:ring-[#004DD2]/20'
                } ${isLoading ? 'cursor-not-allowed bg-gray-50 opacity-50' : 'bg-white'}`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-2 flex w-full items-center justify-center rounded-lg py-3 font-medium text-white transition-all focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30 ${
                isLoading ? 'cursor-not-allowed bg-[#004DD2]/70' : 'bg-[#004DD2] hover:bg-[#003bb3]'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-4 mb-6 sm:mt-5 sm:mb-8">
            <button type="button" className="text-sm font-bold text-[#004DD2] hover:underline focus:outline-none">
              Forget Password ?
            </button>
          </div>

          {role === 'faculty' ? (
            <div className="flex flex-col items-start">
              <p className="mb-3 ml-1 text-xs font-bold text-[#004DD2]">Don't Have an Account ?</p>
              <button
                type="button"
                onClick={() => onNavigate('faculty-register')}
                className="w-full rounded-lg bg-[#004DD2] py-3 font-medium text-white transition-all hover:bg-[#003bb3] focus:outline-none focus:ring-4 focus:ring-[#004DD2]/30"
              >
                Register Now
              </button>
            </div>
          ) : (
            <div className="text-center text-xs text-[#6B7280]">Need admin access? Contact the system administrator.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginCard;