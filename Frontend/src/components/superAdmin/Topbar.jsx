import React, { useState, useEffect } from "react";
import { AlertCircle, Search, ShieldCheck } from "lucide-react";
import axios from "axios";

// Added showSearch prop (defaults to true if you don't specify it)
export default function Topbar({ title, subtitle, onSearch, onPendingClick, showSearch = true }) {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchTopbarCount = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
        const response = await axios.get("http://localhost:5000/api/super_admin/pendingAdmin", {
          headers: { 'Authorization': `Bearer ${session.token}` }
        });
        setPendingCount(response.data.data.length);
      } catch (err) {
        console.error("Error fetching Topbar count", err);
      }
    };
    fetchTopbarCount();
  }, []);

  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white gap-4 flex-wrap">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        {/* Clickable Dynamic Badge */}
        {pendingCount > 0 && (
          <div 
            onClick={onPendingClick}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 font-semibold text-sm px-4 py-2 rounded-full cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            {pendingCount} pending
          </div>
        )}
        
        {/* Conditionally Render Search Bar */}
        {showSearch && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-56">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins..."
              onChange={(e) => onSearch && onSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-600 w-full placeholder:text-gray-400"
            />
          </div>
        )}
        
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
        </div>
      </div>
    </div>
  );
}