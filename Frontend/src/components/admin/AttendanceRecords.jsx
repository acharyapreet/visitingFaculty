import React, { useEffect, useMemo, useState, useRef } from "react";
import { Search, Download, Calendar, Clock, IndianRupee, Filter } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import axios from "axios";

const PAGE_SIZE = 7;

export default function AttendanceRecords() {
  // --- STATE: Data & Auth ---
  const getAxiosConfig = () => {
    const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
    return {
      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json"
      }
    };
  };

  // --- STATE: Faculty Search ---
  const [facultySearch, setFacultySearch] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // --- STATE: Main UI ---
  const [activeFaculty, setActiveFaculty] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [page, setPage] = useState(1);

  // ==========================================
  // 1. EVENT LISTENERS
  // ==========================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFacultyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // 2. LIVE FACULTY SEARCH
  // ==========================================
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!facultySearch.trim()) {
        setFacultyOptions([]);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/search-faculty?q=${facultySearch}`, 
          getAxiosConfig()
        );
        setFacultyOptions(res.data.data || []);
      } catch (err) {
        setFacultyOptions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [facultySearch]);

  // ==========================================
  // 3. FETCH HISTORY
  // ==========================================
  const handleSearch = async () => {
    if (!selectedFacultyId) {
      setError("Please select a faculty member from the dropdown first.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Endpoint 5: Attendance History
      const res = await axios.get(`http://localhost:5000/api/attendance/history/${selectedFacultyId}`, getAxiosConfig());
      
      const fetchedRecords = res.data.data || [];
      setRecords(Array.isArray(fetchedRecords) ? fetchedRecords : []);
      
      // Save active faculty details for the dashboard header
      const selected = facultyOptions.find(f => f.user_id === selectedFacultyId);
      setActiveFaculty({
        name: selected?.full_name || facultySearch,
        session: "2024-25" // Defaulting to current session
      });
      
    } catch (err) {
      setError(err?.response?.data?.message || "No attendance records found for this faculty.");
      setRecords([]);
      setActiveFaculty(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 4. DATA PROCESSING & FILTERS
  // ==========================================
  const subjects = useMemo(
    () => [...new Set(records.map((r) => r.Allocation?.Subject?.subject_name).filter(Boolean))],
    [records]
  );

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSubject = !subjectFilter || r.Allocation?.Subject?.subject_name === subjectFilter;
      const matchesDay = !dayFilter || r.attendance_date === dayFilter;
      return matchesSubject && matchesDay;
    });
  }, [records, subjectFilter, dayFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  
  useEffect(() => setPage(1), [subjectFilter, dayFilter, records]);

  // Map and calculate totals dynamically based on Allocation rates and marked hours
  const totals = useMemo(() => {
    const classes = filtered.length;
    const hours = filtered.reduce((sum, r) => sum + (Number(r.hours) || 0), 0);
    const earnings = filtered.reduce((sum, r) => {
      const rate = Number(r.Allocation?.rate_per_hour) || 0;
      const hrs = Number(r.hours) || 0;
      return sum + (hrs * rate);
    }, 0);
    return { classes, hours, earnings };
  }, [filtered]);

  // ==========================================
  // 5. EXPORT
  // ==========================================
  const handleExport = () => {
    const headers = ["Date", "Subject Code", "Subject Name", "Type", "Hours", "Rate", "Amount"];
    const rows = filtered.map((r) => {
      const rate = Number(r.Allocation?.rate_per_hour) || 0;
      const hrs = Number(r.hours) || 0;
      return [
        r.attendance_date,
        r.Allocation?.Subject?.subject_code || "N/A",
        r.Allocation?.Subject?.subject_name || "N/A",
        r.Allocation?.session_type || "N/A",
        r.hours,
        rate,
        (hrs * rate)
      ];
    });
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeFaculty?.name?.replace(/\s+/g, '_')}_Attendance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="p-4 sm:p-6 space-y-5 w-full">
      
      {/* SEARCH BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-stretch shadow-sm">
        <div className="flex-1 relative" ref={dropdownRef}>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Faculty Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={facultySearch}
              onChange={(e) => {
                setFacultySearch(e.target.value);
                setSelectedFacultyId("");
                setShowFacultyDropdown(true);
              }}
              onFocus={() => setShowFacultyDropdown(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search faculty name..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          
          {/* Dropdown Menu */}
          {showFacultyDropdown && facultyOptions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {facultyOptions.map((f) => (
                <li
                  key={f.user_id}
                  onClick={() => {
                    setSelectedFacultyId(f.user_id);
                    setFacultySearch(`${f.full_name} (${f.email})`);
                    setShowFacultyDropdown(false);
                  }}
                  className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                >
                  {f.full_name} ({f.email})
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="self-end flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0b57d0] text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Search size={16} /> Search
        </button>
      </div>

      {loading && <LoadingSpinner fullPage label="Fetching attendance history..." />}

      {!loading && error && (
        <p className="text-sm text-red-500 text-center py-6 bg-red-50 rounded-lg border border-red-100">{error}</p>
      )}

      {/* DASHBOARD PREVIEW */}
      {!loading && activeFaculty && (
        <>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{activeFaculty.name}</h2>
            <p className="text-sm text-slate-400">
              {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })} · Session{" "}
              {activeFaculty.session || "2024-25"}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard icon={Calendar} label="Classes Submitted" value={totals.classes} />
            <StatCard icon={Clock} label="Total Hours" value={`${totals.hours} hrs`} />
            <StatCard icon={IndianRupee} label="Total Earnings" value={`₹${totals.earnings.toLocaleString("en-IN")}`} />
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex flex-wrap gap-3">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Day</option>
                  {[...new Set(records.map((r) => r.attendance_date))].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter size={15} /> Filter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3">SN.</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Subject Code</th>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                        No attendance records found for these filters.
                      </td>
                    </tr>
                  )}
                  {paginated.map((r, idx) => {
                    const rate = Number(r.Allocation?.rate_per_hour) || 0;
                    const hours = Number(r.hours) || 0;
                    const amount = rate * hours;

                    return (
                      <tr key={r.attendance_id || idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
                        <td className="px-4 py-4 text-slate-500">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-4 py-4 text-slate-600 font-medium">{r.attendance_date}</td>
                        <td className="px-4 py-4 font-semibold text-blue-600">{r.Allocation?.Subject?.subject_code || "N/A"}</td>
                        <td className="px-4 py-4 text-slate-700">{r.Allocation?.Subject?.subject_name || "N/A"}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                              r.Allocation?.session_type?.toLowerCase() === "practical"
                                ? "bg-purple-50 text-purple-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {r.Allocation?.session_type || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-700">{hours}h</td>
                        <td className="px-4 py-4 text-slate-500">₹{rate}</td>
                        <td className="px-4 py-4 font-semibold text-blue-600">₹{amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-sm">
              <span className="text-slate-400">Showing {paginated.length} records</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page ? "bg-[#0b57d0] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    ›
                  </button>
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors"
                >
                  <Download size={15} /> Export
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !activeFaculty && !error && (
        <p className="text-center text-slate-400 text-sm py-16">
          Search for a faculty member to view their attendance history.
        </p>
      )}
    </main>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}