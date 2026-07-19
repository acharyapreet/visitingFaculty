import React, { useEffect, useMemo, useState, useRef } from "react";
import { Download, Plus, Search, Filter, MoreHorizontal, Eye, BookOpen } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import FacultyModal from "./FacultyModal";
import adminApi from "../../api/adminApi";

const PAGE_SIZE = 5;

const statusStyles = {
  active: "bg-blue-50 text-blue-600",
  inactive: "bg-slate-100 text-slate-400",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-500",
  pending: "bg-amber-50 text-amber-600",
};

export default function FacultyManagement({ setActiveTab }) {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewId, setViewId] = useState(null);

  const menuRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.getAllFaculty();
        // The API returns { success: true, count: X, data: [...] }
        // Depending on axios config, response might be the data directly, or nested in response.data
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const departments = useMemo(
    () => [...new Set(faculty.map((f) => f.department).filter(Boolean))],
    [faculty]
  );

  const filtered = useMemo(() => {
    return faculty.filter((f) => {
      const q = search.trim().toLowerCase();
      // UPDATED: Mapped to full_name and nested uvfin
      const matchesSearch =
        !q ||
        f.full_name?.toLowerCase().includes(q) ||
        f.FacultyApproval?.uvfin?.toLowerCase().includes(q) ||
        f.user_id?.toLowerCase().includes(q);
        
      const matchesDept = !department || f.department === department;
      
      // UPDATED: Mapped to FacultyApproval.status
      const currentStatus = f.FacultyApproval?.status || (f.is_active ? 'active' : 'pending');
      const matchesStatus = !status || currentStatus.toLowerCase() === status.toLowerCase();
      
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [faculty, search, department, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, department, status]);

  const handleExport = () => {
    const headers = ["UVFIN", "Name", "Qualification", "Status", "Department"];
    const rows = filtered.map((f) => [
      f.FacultyApproval?.uvfin || "N/A", // Mapped from backend structure
      f.full_name,                       // Mapped from backend structure
      f.qualification || "N/A",
      f.FacultyApproval?.status || "Pending",
      f.department || "N/A"
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
    <main className="p-4 sm:p-6 space-y-5 w-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty Management</h1>
          <p className="text-sm text-slate-400">All registered visiting faculty members</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={() => setActiveTab("register-faculty")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <Plus size={16} /> Register New
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or UVFIN..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white"
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white"
        >
          <option value="">Select Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
          <Filter size={15} /> Filter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-100">
                <th className="px-6 py-3">UVFIN</th>
                <th className="px-6 py-3">Faculty Name</th>
                <th className="px-6 py-3">Qualification</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Allocate Subject</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-10">
                    <LoadingSpinner label="Loading faculty..." />
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-red-500 text-sm">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No faculty found matching your filters.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                paginated.map((f) => (
                  <tr key={f.user_id} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {f.FacultyApproval?.uvfin ? (
                        f.FacultyApproval.uvfin
                      ) : (
                        <span className="text-slate-400 font-normal italic">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold uppercase">
                          {f.full_name?.charAt(0) ?? "F"}
                        </div>
                        <span className="font-medium text-slate-800">{f.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{f.qualification || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          statusStyles[f.FacultyApproval?.status?.toLowerCase()] || statusStyles.pending
                        }`}
                      >
                        {f.FacultyApproval?.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {f.allocated ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                          Allocated
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveTab("subject-allocation")}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          Allocate Subject
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === f.user_id ? null : f.user_id)
                        }
                        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openMenuId === f.user_id && (
                        <div
                          ref={menuRef}
                          className="absolute right-6 z-10 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1"
                        >
                          <button
                            onClick={() => {
                              setViewId(f.user_id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Eye size={14} /> View Profile
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("subject-allocation");
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <BookOpen size={14} /> Allocate Subject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-sm">
          <span className="text-slate-400">
            Showing {paginated.length} of {filtered.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
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