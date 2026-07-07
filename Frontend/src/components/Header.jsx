import React from 'react';

const Header = () => {
  return (
    <header className="w-full h-[68px] bg-white border-b border-[#C3C5D8] flex items-center justify-between px-4 sm:px-8 md:px-12 shadow-sm">
      
      {/* Left side: Institute Title */}
      <div className="flex items-center flex-1 overflow-hidden pr-4">
        {/* Full title for Desktop (Hidden on mobile) */}
        <h1 className="hidden sm:block text-[#004DD2] font-bold text-base tracking-wide truncate">
          Unified Visiting Faculty Management, IIPS, DAVV
        </h1>
        
        {/* Short title for Mobile (Hidden on desktop) */}
        <h1 className="block sm:hidden text-[#004DD2] font-bold text-sm tracking-wide truncate">
          UVFM, IIPS, DAVV
        </h1>
      </div>

      {/* Right side: Navigation/Actions */}
      <nav className="flex items-center shrink-0">
        <a 
          href="#contact" 
          className="text-sm font-medium text-[#004DD2] hover:underline transition-colors focus:outline-none"
        >
          Contact
        </a>
      </nav>

    </header>
  );
};

export default Header;