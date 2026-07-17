export default function CheckEmail({ onNavigate }) {
  return (
    <div className="relative flex min-h-[calc(100vh-68px)] flex-col items-center justify-center bg-[#F8F9FB] px-4 py-12">
      <div className="w-full max-w-[420px] rounded-2xl border border-[#C3C5D8] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3FF] text-[#004DD2]">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#141B2B]">Check Your Email</h2>
        <p className="mt-4 text-sm text-[#6B7280] leading-relaxed">
          We've sent a secure password reset link to your registered email address. 
        </p>
        <p className="mt-2 text-sm text-[#6B7280] font-medium">
          Please click the link in the email to create a new password.
        </p>

        <button
          onClick={() => onNavigate('login')}
          className="mt-8 w-full rounded-lg bg-[#004DD2] py-3 font-medium text-white transition hover:bg-[#003bb3]"
        >
          Return to Login
        </button>
        
        {/* Hidden shortcut just for testing so you can jump to the next page without clicking a real email link */}
        <button onClick={() => onNavigate('reset-password')} className="mt-4 text-xs text-transparent hover:text-gray-300">
          Developer bypass
        </button>
      </div>
    </div>
  );
}