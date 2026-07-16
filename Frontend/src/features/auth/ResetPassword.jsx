import { useState, useEffect } from 'react';
import { resetPassword } from '../../api/authApi';

export default function ResetPassword({ onNavigate }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // New States for API
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically grab the token from the URL if they clicked an email link!
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) setToken(urlToken);
  }, []);

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One special symbol (e.g., @, #, $)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: 'At least one number', met: /\d/.test(password) },
  ];

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!requirements.every(r => r.met)) {
      setError('Please meet all password requirements.');
      return;
    }
    if (!token) {
      setError('Missing reset token. Please check your email link.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      onNavigate('password-updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center bg-[#F8F9FB] px-4 py-12">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#C3C5D8] bg-white p-8 shadow-sm">
        
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3FF] text-[#004DD2]">
          <svg className="h-8 w-8 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M21 21v-5h-5" />
          </svg>
        </div>

        <h2 className="text-center text-2xl font-bold text-[#141B2B]">Create New Password</h2>
        <p className="mt-2 text-center text-sm text-[#6B7280]">Secure your account with a strong, memorable password.</p>

        <form onSubmit={handleReset} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-xl border border-[#F7C4C4] bg-[#FFF1F1] px-4 py-3 text-center text-sm font-medium text-[#EF4444]">
              {error}
            </div>
          )}

          {/* Token Input (Hidden if token was found in URL, visible if they need to paste it) */}
          {!token && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#424656]">Reset Token (from email)</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token here"
                className="w-full rounded-lg border border-[#C3C5D8] py-3 px-4 focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                required
              />
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#424656]">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#C3C5D8] py-3 pl-4 pr-12 focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#9CA3AF] hover:text-[#004DD2] transition-colors focus:outline-none"
              >
                {showPassword ? (
                <svg className="h-5 w-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg className="h-5 w-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
              </button>
            </div>
          </div>

          {/* Requirements Box */}
          <div className="rounded-xl bg-[#F7F6FF] p-4 text-sm text-[#585F6C] space-y-2">
            <p className="font-bold text-[#141B2B] text-xs uppercase mb-2">Password Requirements</p>
            {requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-4 w-4 flex-none rounded-full border-2 transition-colors ${req.met ? 'bg-[#004DD2] border-[#004DD2]' : 'border-[#C3C5D8]'}`} />
                <span className={req.met ? 'text-[#141B2B]' : 'text-[#585F6C]'}>{req.label}</span>
              </div>
            ))}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#424656]">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-[#C3C5D8] py-3 pl-4 pr-12 focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#9CA3AF] hover:text-[#004DD2] transition-colors focus:outline-none"
              >
                {showConfirmPassword ? (
                <svg className="h-5 w-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg className="h-5 w-5 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full rounded-lg bg-[#004DD2] py-3 font-medium text-white transition-all shadow-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#003bb3]'}`}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <button onClick={() => onNavigate('login')} className="block w-full mt-6 text-center text-sm font-bold text-[#004DD2] hover:underline">
          Back to Login
        </button>
      </div>
      
      <div className="mt-8 text-center text-xs text-[#9CA3AF]">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <svg className="h-4 w-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secured by IIPS
        </span>
      </div>
    </div>
  );
}