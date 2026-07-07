import React from "react";
import { AlertCircle, Search, ShieldCheck } from "lucide-react";

export default function Topbar({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white gap-4 flex-wrap">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 font-semibold text-sm px-4 py-2 rounded-full">
          <AlertCircle className="w-4 h-4" />
          3 pending
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-56">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-gray-600 w-full placeholder:text-gray-400"
          />
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
        </div>
      </div>
    </div>
  );
}
