import React, { useState, useEffect, useMemo, useRef } from "react";
import { Download, Calendar, Clock, IndianRupee, ChevronDown, Filter, ChevronLeft, ChevronRight, Loader2, Check, ArrowUpDown } from "lucide-react";
import PageHeader from "./shared/PageHeader";
import axios from "axios";

const typeStyles = {
  Theory: "bg-brand-100 text-brand-700",
  Practical: "bg-brand-50 text-brand-600",
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [facultyName, setFacultyName] = useState("");
  
  // Filtering & Sorting State
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedTimeRange, setSelectedTimeRange] = useState("All Time");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = Newest First, 'asc' = Oldest First
  
  // Dropdown UI State
  const [activeDropdown, setActiveDropdown] = useState(null); // 'subject' | 'time' | null
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Refs for click-outside handling
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchData();
    
    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
      setFacultyName(session.name || "Faculty Member");
      const targetId = session.userId;
      const headers = { 'Authorization': `Bearer ${session.token}` };

      // Fetch History and Allocations concurrently
      const [historyRes, allocationsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/attendance/history/${targetId}`, { headers }),
        axios.get(`http://localhost:5000/api/attendance/my-allocations/${targetId}`, { headers }).catch(() => ({ data: { allocations: [] } })) // Fallback if allocations fails
      ]);

      if (historyRes.data.success) {
        setHistory(historyRes.data.data || []);
      }
      
      if (allocationsRes.data.success) {
        setAllocations(allocationsRes.data.allocations || []);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FILTERING & SORTING LOGIC ---
  const processedRecords = useMemo(() => {
    let result = [...history];

    // 1. Filter by Subject
    if (selectedSubject !== "All") {
      result = result.filter(r => r.subject_code === selectedSubject);
    }

    // 2. Filter by Time Range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedTimeRange === "Today") {
      const todayStr = today.toISOString().split('T')[0];
      result = result.filter(r => r.attendance_date === todayStr);
    } 
    else if (selectedTimeRange === "This Week") {
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      result = result.filter(r => new Date(r.attendance_date) >= lastWeek);
    } 
    else if (selectedTimeRange === "This Month") {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      result = result.filter(r => {
        const d = new Date(r.attendance_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }

    // 3. Sort by Date and Time
    result.sort((a, b) => {
      const dateA = new Date(`${a.attendance_date}T${a.start_time}`);
      const dateB = new Date(`${b.attendance_date}T${b.start_time}`);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [history, selectedSubject, selectedTimeRange, sortOrder]);

  // --- DYNAMIC SUMMARY CALCULATIONS ---
  const summary = useMemo(() => {
    const totalEarnings = processedRecords.reduce((sum, record) => {
      const hrs = parseFloat(record.hours) || 0;
      const rate = parseFloat(record.rate_per_hour) || 0;
      return sum + (hrs * rate);
    }, 0);

    const totalHours = processedRecords.reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);

    return {
      classes: processedRecords.length,
      hours: totalHours,
      earnings: totalEarnings
    };
  }, [processedRecords]);

  // Handle filter changes (and reset pagination)
  const handleFilterChange = (type, value) => {
    if (type === 'subject') setSelectedSubject(value);
    if (type === 'time') setSelectedTimeRange(value);
    setCurrentPage(1);
    setActiveDropdown(null);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setCurrentPage(1);
  };

  // Helper functions for formatting
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
  };

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = processedRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.max(1, Math.ceil(processedRecords.length / recordsPerPage));

  return (
    <div className="pb-12">
      <PageHeader
        title="Attendance History"
        right={
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors bg-white shadow-sm">
            <Download className="h-4 w-4" /> Export
          </button>
        }
      />

      <div className="px-4 py-6 sm:px-8">
        <h2 className="text-2xl font-bold text-slate-900">{facultyName}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Complete Attendance Record
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Calendar} label="Classes Filtered" value={summary.classes} />
          <StatCard icon={Clock} label="Hours Logged" value={summary.hours} />
          <StatCard 
            icon={IndianRupee} 
            label="Calculated Earnings" 
            value={`₹${summary.earnings.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} 
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          
          {/* --- FILTER & SORT CONTROLS --- */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4" ref={dropdownRef}>
            <div className="flex flex-wrap gap-3">
              
              {/* Subject Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'subject' ? null : 'subject')}
                  className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-colors ${
                    activeDropdown === 'subject' || selectedSubject !== 'All' 
                      ? 'border-brand-300 bg-brand-50 text-brand-700' 
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {selectedSubject === 'All' ? 'All Subjects' : selectedSubject} 
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                
                {activeDropdown === 'subject' && (
                  <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl z-10">
                    <button 
                      onClick={() => handleFilterChange('subject', 'All')}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${selectedSubject === 'All' ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      All Subjects
                      {selectedSubject === 'All' && <Check className="w-4 h-4" />}
                    </button>
                    
                    {/* Extract unique subjects either from allocations OR fallback to history if allocations is empty */}
                    {(allocations.length > 0 ? allocations : Array.from(new Set(history.map(h => h.subject_code))).map(code => ({ subject_code: code, subject_name: history.find(h => h.subject_code === code)?.subject_name })))
                      .filter((v, i, a) => a.findIndex(t => (t.subject_code === v.subject_code)) === i) // Ensure uniqueness
                      .map((alloc) => (
                      <button 
                        key={alloc.subject_code}
                        onClick={() => handleFilterChange('subject', alloc.subject_code)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left ${selectedSubject === alloc.subject_code ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="truncate pr-2">{alloc.subject_name} ({alloc.subject_code})</span>
                        {selectedSubject === alloc.subject_code && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Range Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
                  className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-colors ${
                    activeDropdown === 'time' || selectedTimeRange !== 'All Time' 
                      ? 'border-brand-300 bg-brand-50 text-brand-700' 
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {selectedTimeRange} <ChevronDown className="h-3.5 w-3.5" />
                </button>
                
                {activeDropdown === 'time' && (
                  <div className="absolute top-full left-0 mt-1.5 w-40 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl z-10">
                    {['All Time', 'Today', 'This Week', 'This Month'].map((range) => (
                      <button 
                        key={range}
                        onClick={() => handleFilterChange('time', range)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${selectedTimeRange === range ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {range}
                        {selectedTimeRange === range && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sort Button */}
            <button 
              onClick={toggleSortOrder}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <ArrowUpDown className="h-4 w-4" /> 
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>

          {/* --- TABLE / DATA DISPLAY --- */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin w-8 h-8 text-brand-600 mb-3" />
              Loading history...
            </div>
          ) : processedRecords.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Filter className="w-8 h-8 text-slate-300 mb-3" />
              <p>No records found matching your filters.</p>
              {(selectedSubject !== 'All' || selectedTimeRange !== 'All Time') && (
                <button 
                  onClick={() => { setSelectedSubject('All'); setSelectedTimeRange('All Time'); }}
                  className="mt-2 text-brand-600 text-sm font-medium hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block min-h-[400px]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Sn.</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Subject Code</th>
                      <th className="px-4 py-3 font-semibold">Subject Name</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Time</th>
                      <th className="px-4 py-3 font-semibold">Hours</th>
                      <th className="px-4 py-3 font-semibold">Rate</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((r, index) => {
                      const amount = (parseFloat(r.hours) || 0) * (parseFloat(r.rate_per_hour) || 0);
                      const sessionType = r.session_type || "Theory";
                      
                      return (
                        <tr key={r.attendance_id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-b-0">
                          <td className="px-4 py-4 text-slate-500">{indexOfFirstRecord + index + 1}</td>
                          <td className="px-4 py-4 text-slate-700">{formatDate(r.attendance_date)}</td>
                          <td className="px-4 py-4 font-semibold text-brand-600">{r.subject_code}</td>
                          <td className="px-4 py-4 text-slate-800 truncate max-w-[200px]">{r.subject_name}</td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${typeStyles[sessionType] || typeStyles.Theory}`}>
                              {sessionType}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                            {formatTime(r.start_time)} - {formatTime(r.end_time)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-800">{parseFloat(r.hours)}</td>
                          <td className="px-4 py-4 text-slate-600">₹{parseFloat(r.rate_per_hour || 0)}</td>
                          <td className="px-4 py-4 font-bold text-brand-600">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {currentRecords.map((r) => {
                  const amount = (parseFloat(r.hours) || 0) * (parseFloat(r.rate_per_hour) || 0);
                  const sessionType = r.session_type || "Theory";

                  return (
                    <div key={r.attendance_id} className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-brand-600">{r.subject_code}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeStyles[sessionType] || typeStyles.Theory}`}>
                          {sessionType}
                        </span>
                      </div>
                      <p className="mt-1 font-medium text-slate-800">{r.subject_name}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>{formatDate(r.attendance_date)}</span>
                        <span>{formatTime(r.start_time)} - {formatTime(r.end_time)}</span>
                        <span>{parseFloat(r.hours)} hrs</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Rate ₹{parseFloat(r.rate_per_hour || 0)}</span>
                        <span className="font-bold text-brand-600">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {!isLoading && processedRecords.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, processedRecords.length)} of {processedRecords.length} records
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1}
                  className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex gap-1 overflow-x-auto max-w-[150px] sm:max-w-none">
                  {[...Array(totalPages)].map((_, i) => {
                    // Simple pagination logic to prevent showing 50 pages at once
                    if (totalPages > 5 && i !== 0 && i !== totalPages - 1 && Math.abs(currentPage - 1 - i) > 1) {
                      if (Math.abs(currentPage - 1 - i) === 2) return <span key={i} className="px-1 text-slate-400">...</span>;
                      return null;
                    }
                    return (
                      <button 
                        key={i} 
                        onClick={() => setCurrentPage(i + 1)} 
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                          currentPage === i + 1 
                            ? "bg-brand-600 text-white shadow-sm" 
                            : "text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}