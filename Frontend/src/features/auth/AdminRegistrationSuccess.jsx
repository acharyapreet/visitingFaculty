import React from 'react';

export default function AdminRegistrationSuccess({ onNavigate }) {
  return (
    <div className="flex min-h-[calc(100vh-68px)] items-center justify-center bg-[#F8F9FB] px-4 py-12">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-8 text-center shadow-sm border border-[#C3C5D8]">

        {/* Shield Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF1FF] text-[#004DD2]">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        {/* Title & Body */}
        <h2 className="mb-4 text-2xl font-bold text-[#141B2B]">Registration Submitted!</h2>
        <p className="mb-6 text-sm leading-relaxed text-[#6B7280] px-2">
          Thank you for registering. Your account is currently <strong>pending approval</strong> from the Super Admin. Once approved, you will receive an email containing your unique <strong>User ID</strong>.
        </p>

        {/* Info Box */}
        <div className="mb-8 rounded-lg bg-[#EEF3FF] p-5 text-sm text-[#424656]">
          *Please check your inbox (and spam folder) regularly. You will be able to sign in as soon as you receive your credentials.*
        </div>

        {/* Button */}
        <button
          onClick={() => onNavigate('login')}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#004DD2] py-3.5 font-medium text-white transition-colors hover:bg-[#003bb3]"
        >
          Return to Sign In
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

      </div>
    </div>
  );
}