import { useState } from 'react';

export default function VerifyOtp({ onNavigate }) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    // Here you would call your Node.js API to verify the OTP
    setTimeout(() => {
      setIsVerifying(false);
      onNavigate('reset-password'); // Move to final password update
    }, 1000);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-68px)] flex-col items-center justify-center bg-[#F8F9FB] px-4 py-12">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#C3C5D8] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3FF] text-[#004DD2]">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#141B2B]">Verify Code</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          We've sent a 6-digit verification code to your registered email address.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 text-left">
          <label className="mb-1.5 block text-sm font-medium text-[#424656]">Verification Code</label>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full rounded-lg border border-[#C3C5D8] px-4 py-3 text-center text-2xl tracking-[0.5em] text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 transition-all"
            required
          />

          <button
            type="submit"
            disabled={isVerifying}
            className="mt-6 w-full rounded-lg bg-[#004DD2] py-3 font-medium text-white transition hover:bg-[#003bb3] disabled:opacity-70"
          >
            {isVerifying ? 'Verifying...' : 'Verify Code →'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => onNavigate('forgot-password')}
          className="mt-6 text-sm font-semibold text-[#004DD2] hover:underline"
        >
          &lt; Back to Email Entry
        </button>
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 text-right text-[11px] font-medium text-[#9CA3AF] sm:text-xs">
        © 2026 International Institute of Professional Studies. All rights reserved.
      </div>
    </div>
  );
}