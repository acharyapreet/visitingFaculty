export default function PasswordUpdated({ onNavigate }) {
  return (
    <div className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center bg-[#F8F9FB] px-4 py-12">
      
      {/* Main White Card */}
      <div className="w-full max-w-[420px] rounded-2xl border border-[#C3C5D8]/50 bg-white p-8 sm:p-10 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        
        {/* Success Icon (Larger light green circle, thick green stroke) */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5E9] text-[#12A454]">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="M22 4L12 14.01l-3-3" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#141B2B]">Password Updated</h2>
        <p className="mt-3 text-sm text-[#585F6C] leading-relaxed px-2">
          Your password has been successfully updated. You can now use your new credentials to access your account.
        </p>

        <button
          onClick={() => onNavigate('login')}
          className="mt-8 w-full rounded-xl bg-[#004DD2] py-3.5 font-medium text-white transition-all hover:bg-[#003bb3] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          Go to Login
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        {/* Horizontal Divider */}
        <hr className="my-8 border-t border-[#E5E7EB]" />

        {/* Security Alert Box (No border, soft background) */}
        <div className="rounded-xl bg-[#F4F6FB] p-5 text-left">
          <div className="flex items-center gap-2 mb-1.5">
            {/* Outline Shield Icon */}
            <svg className="h-4 w-4 text-[#141B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-sm font-bold text-[#141B2B]">Security Alert</span>
          </div>
          <p className="text-[13px] text-[#585F6C] leading-relaxed">
            If you did not perform this action, please contact IIPS Faculty Support immediately to secure your account.
          </p>
        </div>

      </div>

      {/* Back to Homepage Link (Home Icon) */}
      <button 
        onClick={() => onNavigate('landing')}
        className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-[#004DD2] hover:underline transition-all"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Back to Homepage
      </button>

    </div>
  );
}