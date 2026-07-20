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
  const filterRef = useRef(null);

  // --- STATE: Main UI ---
  const [activeFaculty, setActiveFaculty] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filters & Sort
  const [subjectFilter, setSubjectFilter] = useState("");
  const [timelineFilter, setTimelineFilter] = useState(""); // "", "day", "week", "month"
  const [sortOrder, setSortOrder] = useState("newest"); // "newest", "oldest"
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  const [page, setPage] = useState(1);

  // ==========================================
  // 1. EVENT LISTENERS
  // ==========================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFacultyDropdown(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterMenuOpen(false);
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

  const filteredAndSorted = useMemo(() => {
    let result = records.filter((r) => {
      // 1. Subject Filter
      const matchesSubject = !subjectFilter || r.Allocation?.Subject?.subject_name === subjectFilter;
      
      // 2. Timeline Filter Logic
      let matchesTimeline = true;
      if (timelineFilter && r.attendance_date) {
        const recordDate = new Date(r.attendance_date);
        const today = new Date();
        
        if (timelineFilter === "day") {
          // Exact same day
          matchesTimeline = recordDate.toDateString() === today.toDateString();
        } else if (timelineFilter === "week") {
          // Within the last 7 days
          const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesTimeline = recordDate >= oneWeekAgo && recordDate <= today;
        } else if (timelineFilter === "month") {
          // Same Month and Year
          matchesTimeline = recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear();
        }
      }
      
      return matchesSubject && matchesTimeline;
    });

    // 3. Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.attendance_date || 0).getTime();
      const dateB = new Date(b.attendance_date || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [records, subjectFilter, timelineFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  
  useEffect(() => setPage(1), [subjectFilter, timelineFilter, sortOrder, records]);

  // Map and calculate totals dynamically based on Allocation rates and marked hours
  const totals = useMemo(() => {
    const classes = filteredAndSorted.length;
    const hours = filteredAndSorted.reduce((sum, r) => sum + (Number(r.hours) || 0), 0);
    const earnings = filteredAndSorted.reduce((sum, r) => {
      const rate = Number(r.Allocation?.rate_per_hour) || 0;
      const hrs = Number(r.hours) || 0;
      return sum + (hrs * rate);
    }, 0);
    return { classes, hours, earnings };
  }, [filteredAndSorted]);

  // ==========================================
  // 5. EXPORT
  // ==========================================
  const handleExport = () => {
    const headers = ["Date", "Subject Code", "Subject Name", "Type", "Hours", "Rate", "Amount"];
    const rows = filteredAndSorted.map((r) => {
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
    <main className="p-4 sm:p-6 space-y-5 w-full bg-slate-50/50 min-h-screen">
      
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
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          
          {/* Dropdown Menu */}
          {showFacultyDropdown && facultyOptions.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
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
          className="self-end flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0b57d0] text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
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
          <div className="pt-2">
            <h2 className="text-xl font-bold text-slate-800">{activeFaculty.name}</h2>
            <p className="text-sm text-slate-400 mt-1">
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
                
                {/* Dynamic Allocated Subjects */}
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500 min-w-[160px]"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {/* Timeline Dropdown */}
                <select
                  value={timelineFilter}
                  onChange={(e) => setTimelineFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500 min-w-[140px]"
                >
                  <option value="">Current Session</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>

              {/* Advanced Filter / Sort Menu */}
              <div className="relative" ref={filterRef}>
                <button 
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Filter size={16} className="text-slate-500"/> Filter
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

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-5 py-4">SN.</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Subject Code</th>
                    <th className="px-5 py-4">Subject Name</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Hours</th>
                    <th className="px-5 py-4">Rate</th>
                    <th className="px-5 py-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400 text-sm">
                        No attendance records found for these filters.
                      </td>
                    </tr>
                  )}
                  {paginated.map((r, idx) => {
                    const rate = Number(r.Allocation?.rate_per_hour) || 0;
                    const hours = Number(r.hours) || 0;
                    const amount = rate * hours;

                    return (
                      <tr key={r.attendance_id || idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors last:border-0">
                        <td className="px-5 py-4 text-slate-500">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-5 py-4 text-slate-700 font-medium">{r.attendance_date}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{r.Allocation?.Subject?.subject_code || "N/A"}</td>
                        <td className="px-5 py-4 text-slate-600">{r.Allocation?.Subject?.subject_name || "N/A"}</td>
                        <td className="px-5 py-4">
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
                        <td className="px-5 py-4 font-medium text-slate-700">{hours}h</td>
                        <td className="px-5 py-4 text-slate-500">₹{rate}</td>
                        <td className="px-5 py-4 font-semibold text-blue-600">₹{amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-sm bg-white">
              <span className="text-slate-500">Showing {paginated.length} of {filteredAndSorted.length} records</span>
              <div className="flex items-center gap-4">
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
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm"
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
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}