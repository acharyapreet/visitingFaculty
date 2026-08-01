import React, { useEffect } from 'react';
import { Mail, X } from 'lucide-react';

export default function NotificationToast({ action, facultyName, email, uvfin, onClose }) {
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isApproved = action === 'approved';
  
  // Fallbacks to prevent "undefined" from showing
  const name = facultyName || "Faculty member";
  const displayEmail = email ? `(${email})` : "";

  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-xl text-white mt-4 shadow-sm transition-all duration-300 ${
        isApproved ? 'bg-[#009A5F]' : 'bg-[#EF4444]'
      }`}
    >
      <div className="flex items-start gap-3">
        <Mail size={22} className="opacity-90 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">
            {isApproved 
              ? `Prof. ${name} was approved by the admin.` 
              : `${name} was rejected by the admin.`}
          </p>
          <p className="text-xs opacity-90 mt-1 leading-relaxed">
            {isApproved
              ? `An approval email has been mailed to the registered email address ${displayEmail}.`
              : `A rejection email with remarks has been mailed to the registered email address ${displayEmail}.`}
          </p>
          {/* Keep UVFIN visible for approvals if it exists */}
          {isApproved && uvfin && (
             <p className="text-[11px] font-medium bg-white/20 inline-block px-1.5 py-0.5 rounded mt-1.5">
               Generated UVFIN: {uvfin}
             </p>
          )}
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="p-1 hover:bg-white/20 rounded-lg transition-colors self-start"
      >
        <X size={18} />
      </button>
    </div>
  );
}