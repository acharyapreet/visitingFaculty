import React, { useEffect, useMemo, useState, useRef } from "react";
import { Download, Plus, Search, Filter, MoreHorizontal, Eye, BookOpen } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import FacultyModal from "./FacultyModal";
import adminApi from "../../api/adminApi";

const PAGE_SIZE = 5;

const statusStyles = {
  active: "bg-blue-50 text-blue-600",
  inactive: "bg-slate-100 text-slate-500",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-500",
  pending: "bg-amber-50 text-amber-600",
};

export default function FacultyManagement({ setActiveTab }) {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Sorting States
  const [search, setSearch] = useState("");
  const [designation, setDesignation] = useState("");
  const [status, setStatus] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' | 'oldest'
  
  // UI States
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.getAllFaculty();
        const facultyList = response?.data?.data || response?.data || response || [];
        setFaculty(Array.isArray(facultyList) ? facultyList : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load faculty list.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Handle outside clicks for menus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = faculty.filter((f) => {
      // 1. Search Filter
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        f.full_name?.toLowerCase().includes(q) ||
        f.FacultyApproval?.uvfin?.toLowerCase().includes(q) ||
        f.user_id?.toLowerCase().includes(q);
        
      // 2. Designation Filter (Maps to approval status or general role)
      const currentApproval = f.FacultyApproval?.status?.toLowerCase() || "";
      const matchesDesignation = 
        !designation || 
        (designation === "Visiting faculty") || // Assuming all are visiting faculty in this view
        (designation === "pending" && currentApproval === "pending") ||
        (designation === "rejected" && currentApproval === "rejected");
      
      // 3. Status Filter (Active / Inactive)
      const currentStatus = f.is_active ? 'active' : 'inactive';
      const matchesStatus = !status || currentStatus === status.toLowerCase();
      
      return matchesSearch && matchesDesignation && matchesStatus;
    });

    // 4. Sorting logic
    result.sort((a, b) => {
      // Fallback to user_id sorting if created_at doesn't exist
      const dateA = new Date(a.created_at || a.user_id).getTime();
      const dateB = new Date(b.created_at || b.user_id).getTime();
      
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [faculty, search, designation, status, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, designation, status, sortOrder]);

  const handleExport = () => {
    const headers = ["UVFIN", "Name", "Qualification", "Status", "Designation"];
    const rows = filteredAndSorted.map((f) => [
      f.FacultyApproval?.uvfin || "N/A",
      f.full_name,
      f.qualification || "N/A",
      f.is_active ? "Active" : "Inactive",
      "Visiting Faculty"
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faculty_list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="p-4 sm:p-6 space-y-6 w-full relative bg-slate-50/50 min-h-screen">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">All registered visiting faculty members</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => setActiveTab("dashboard")} // Takes you back to dashboard
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Register New
          </button>
        </div>
      </div>

      {/* Controls Container (Figma style) */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 sm:p-3 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or UVFIN..."
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-50 border-transparent text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
        
        <select
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white min-w-[160px] focus:outline-none focus:border-blue-500"
        >
          <option value="">Select Designation</option>
          <option value="Visiting faculty">Visiting faculty</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white min-w-[140px] focus:outline-none focus:border-blue-500"
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors h-full"
          >
            <Filter size={16} className="text-slate-500" /> Filter
          </button>
          
          {filterMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-20">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort by Date</div>
              <button
                onClick={() => { setSortOrder("newest"); setFilterMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${sortOrder === "newest" ? "text-blue-600 font-medium bg-blue-50/50" : "text-slate-700"}`}
              >
                Date: Newest to Oldest
              </button>
              <button
                onClick={() => { setSortOrder("oldest"); setFilterMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${sortOrder === "oldest" ? "text-blue-600 font-medium bg-blue-50/50" : "text-slate-700"}`}
              >
                Date: Oldest to Newest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              {/* Figma Styled Table Header */}
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">UVFIN</th>
                <th className="px-6 py-4">Faculty Name</th>
                <th className="px-6 py-4">Qualification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Allocate Subject</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12">
                    <LoadingSpinner label="Loading faculty..." />
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-red-500 text-sm bg-red-50/50">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                    No faculty found matching your filters.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                paginated.map((f) => {
                  const isActive = f.is_active;
                  
                  return (
                    <tr key={f.user_id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-0">
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {f.FacultyApproval?.uvfin ? (
                          f.FacultyApproval.uvfin
                        ) : (
                          <span className="text-slate-400 font-normal italic">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-[#eff6ff] text-[#2563eb] flex items-center justify-center text-sm font-bold uppercase border border-blue-100">
                            {f.full_name?.charAt(0) ?? "F"}
                          </div>
                          {/* Figma Name style: Darker and bolder */}
                          <span className="font-bold text-slate-900">{f.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{f.qualification || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            isActive ? statusStyles.active : statusStyles.inactive
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {f.allocated ? (
                          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 inline-block">
                            Allocated
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveTab("subject-allocation")}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            Allocate Subject
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 relative text-center">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === f.user_id ? null : f.user_id)
                          }
                          className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {openMenuId === f.user_id && (
                          <div
                            ref={menuRef}
                            className="absolute right-8 z-10 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 text-left"
                          >
                            <button
                              onClick={() => {
                                setViewId(f.user_id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Eye size={15} /> View Profile
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab("subject-allocation");
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <BookOpen size={15} /> Allocate Subject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-sm bg-white">
          <span className="text-slate-500">
            Showing {paginated.length} of {filteredAndSorted.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors text-slate-600"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  p === page ? "bg-[#2563eb] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors text-slate-600"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {viewId && <FacultyModal userId={viewId} onClose={() => setViewId(null)} />}
    </main>
  );
}