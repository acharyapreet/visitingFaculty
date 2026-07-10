import { useState } from 'react';

export default function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="relative flex min-h-[calc(100vh-68px)] flex-col items-center justify-center bg-[#F8F9FB] px-4 py-12">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#C3C5D8] bg-white p-8 text-center shadow-sm">
        
        {/* Precise match for the 'refresh' icon from your screenshot */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3FF] text-[#004DD2]">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M21 21v-5h-5" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#141B2B]">Forgot Password</h2>
        <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
          Enter your institutional email address and we'll send you a verification code to reset your account.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); onNavigate('reset-code'); }} className="mt-8 text-left">
          <label className="mb-1.5 block text-sm font-medium text-[#424656]">Registered Email Address</label>
          
          {/* Input with Mail Icon */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="e.g. professor.name@iips.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#C3C5D8] pl-10 pr-4 py-3 text-[#141B2B] placeholder-[#9CA3AF] focus:border-[#004DD2] focus:outline-none focus:ring-2 focus:ring-[#004DD2]/20 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-[#004DD2] py-3 font-medium text-white transition hover:bg-[#003bb3]"
          >
            Send Reset Code →
          </button>
        </form>

        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="mt-6 text-sm font-bold text-[#004DD2] hover:underline"
        >
          &lt; Back to Login
        </button>
      </div>
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 text-right text-[11px] font-medium text-[#9CA3AF] sm:text-xs">
        © 2026 International Institute of Professional Studies. All rights reserved.
      </div>
    </div>
  );
}