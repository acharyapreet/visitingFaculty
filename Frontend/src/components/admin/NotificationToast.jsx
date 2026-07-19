import React, { useEffect } from 'react';
import { Mail, X } from 'lucide-react';

export default function NotificationToast({ action, facultyName, email, uvfin, onClose }) {
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isApproved = action === 'approved';

  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-xl text-white mt-4 shadow-sm transition-all duration-300 ${
        isApproved ? 'bg-[#009A5F]' : 'bg-[#EF4444]'
      }`}
    >
      <div className="flex items-center gap-3">
        <Mail size={22} className="opacity-90" />
        <div>
          <p className="font-semibold text-sm">
            {isApproved 
              ? `Approved · User ID: ${uvfin}` 
              : `Rejected: Feedback Sent to ${facultyName}`}
          </p>
          <p className="text-xs opacity-90 mt-0.5">
            · Credentials emailed to {email}
          </p>
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}