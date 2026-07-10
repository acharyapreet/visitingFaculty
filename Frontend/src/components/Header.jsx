const Header = ({ onNavigate }) => {
  return (
    <header className="w-full bg-white border-b border-[#C3C5D8] px-4 py-3 shadow-sm sm:px-8 md:px-12 md:py-0 md:h-[68px] flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      
      {/* Left side: Institute Title (Clickable) */}
      <div 
        className="flex items-center flex-1 overflow-hidden pr-0 md:pr-4 cursor-pointer group"
        onClick={() => onNavigate('landing')}
      >
        {/* Full title for Desktop */}
        <h1 className="hidden sm:block text-[#004DD2] font-bold text-base tracking-wide truncate group-hover:underline">
          Unified Visiting Faculty Management, IIPS, DAVV
        </h1>
        
        {/* Short title for Mobile */}
        <h1 className="block sm:hidden text-[#004DD2] font-bold text-sm tracking-wide truncate group-hover:underline">
          UVFM, IIPS, DAVV
        </h1>
      </div>

      {/* Right side: Navigation/Actions */}
      <nav className="flex items-center self-start md:self-auto shrink-0">
        <button 
          type="button"
          onClick={() => onNavigate('contact')}
          className="text-sm font-medium text-[#004DD2] hover:underline transition-colors focus:outline-none"
        >
          Contact
        </button>
      </nav>

    </header>
  );
};

export default Header;