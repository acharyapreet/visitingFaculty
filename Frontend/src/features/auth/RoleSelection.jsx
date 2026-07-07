import React from 'react';

const RoleSelection = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] bg-[#F8F9FB] px-4 py-12">
      
      {/* Header Section */}
      <div className="text-center mb-10 max-w-lg">
        <h1 className="text-[28px] font-bold text-[#141B2B] mb-3">Select Your Role</h1>
        <p className="text-[#585F6C] text-sm leading-relaxed px-4">
          Choose the portal that matches your professional capacity at the IIPS to proceed with registration.
        </p>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 w-full max-w-3xl">
        
        {/* Admin Card - NOW FULLY CLICKABLE */}
        <div 
          onClick={() => onNavigate('admin-register')}
          className="bg-white border border-[#C3C5D8] rounded-2xl p-8 flex flex-col items-center justify-center w-full sm:w-[320px] cursor-pointer hover:shadow-lg hover:border-[#004DD2]/50 transition-all group"
        >
          <div className="w-14 h-14 bg-[#F1F3FF] rounded-full flex items-center justify-center mb-5 text-[#004DD2] group-hover:bg-[#004DD2] group-hover:text-white transition-colors duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#141B2B] mb-4 group-hover:text-[#004DD2] transition-colors">Admin</h2>
          <div className="text-[#004DD2] text-sm font-medium flex items-center group-hover:underline">
            Request Admin Access
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        {/* Faculty Card - NOW FULLY CLICKABLE */}
        <div 
          onClick={() => onNavigate('faculty-register')}
          className="bg-white border border-[#C3C5D8] rounded-2xl p-8 flex flex-col items-center justify-center w-full sm:w-[320px] cursor-pointer hover:shadow-lg hover:border-[#004DD2]/50 transition-all group"
        >
          <div className="w-14 h-14 bg-[#F1F3FF] rounded-full flex items-center justify-center mb-5 text-[#004DD2] group-hover:bg-[#004DD2] group-hover:text-white transition-colors duration-300">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#141B2B] mb-4 group-hover:text-[#004DD2] transition-colors">Faculty</h2>
          <div className="text-[#004DD2] text-sm font-medium flex items-center group-hover:underline">
            Register as Faculty
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

      </div>

      {/* Back Button */}
      <button 
        onClick={() => onNavigate('login')}
        className="flex items-center text-sm font-medium text-[#585F6C] hover:text-[#141B2B] transition-colors focus:outline-none"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Sign In
      </button>

    </div>
  );
};

export default RoleSelection;