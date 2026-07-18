import React, { useEffect, useMemo, useState } from "react";
import { Search, Download, Calendar, Clock, IndianRupee, Filter } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import LoadingSpinner from "./LoadingSpinner";
import adminApi from "../../api/adminApi";

const PAGE_SIZE = 7;

export default function AttendanceRecords() {
  const [query, setQuery] = useState("");
  const [activeFaculty, setActiveFaculty] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      // TODO: backend should resolve faculty by name/UVFIN then return attendance
      const data = await adminApi.getAttendanceByFaculty(query.trim());
      setActiveFaculty(data?.faculty ?? { name: query });
      setRecords(Array.isArray(data?.records) ? data.records : data?.attendance ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "No attendance records found for this faculty.");
      setRecords([]);
      setActiveFaculty(null);
    } finally {
      setLoading(false);
    }
  };

  const subjects = useMemo(
    () => [...new Set(records.map((r) => r.subjectName).filter(Boolean))],
    [records]
  );

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSubject = !subjectFilter || r.subjectName === subjectFilter;
      const matchesDay = !dayFilter || r.date === dayFilter;
      return matchesSubject && matchesDay;
    });
  }, [records, subjectFilter, dayFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [subjectFilter, dayFilter, records]);

  const totals = useMemo(() => {
    const classes = filtered.length;
    const hours = filtered.reduce((sum, r) => sum + (Number(r.hours) || 0), 0);
    const earnings = filtered.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    return { classes, hours, earnings };
  }, [filtered]);

  const handleExport = () => {
    const headers = ["Date", "Subject Code", "Subject Name", "Type", "Time", "Hours", "Rate", "Amount"];
    const rows = filtered.map((r) => [
      r.date,
      r.subjectCode,
      r.subjectName,
      r.type,
      r.time,
      r.hours,
      r.rate,
      r.amount,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar showSearch={false} title="Check Faculty Attendance History" breadcrumb={["Admin", "Attendance Records"]} />

        <main className="p-4 sm:p-6 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Faculty Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Name or UVFIN-ID (e.g. UVF-2024-001)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="self-end flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              <Search size={16} /> Search
            </button>
          </div>

          {loading && <LoadingSpinner fullPage label="Fetching attendance history..." />}

          {!loading && error && (
            <p className="text-sm text-red-500 text-center py-6">{error}</p>
          )}

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

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between px-6 py-4 border-b border-slate-100">
                  <div className="flex gap-3">
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <select
                      value={dayFilter}
                      onChange={(e) => setDayFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                    >
                      <option value="">Select Day</option>
                      {[...new Set(records.map((r) => r.date))].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600">
                    <Filter size={15} /> Filter
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-100">
                        <th className="px-4 py-3">SN.</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Subject Code</th>
                        <th className="px-4 py-3">Subject Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Hours</th>
                        <th className="px-4 py-3">Rate</th>
                        <th className="px-4 py-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                            No attendance records found.
                          </td>
                        </tr>
                      )}
                      {paginated.map((r, idx) => (
                        <tr key={r.id || idx} className="border-b border-slate-50 last:border-0">
                          <td className="px-4 py-4 text-slate-500">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                          <td className="px-4 py-4 text-slate-600">{r.date}</td>
                          <td className="px-4 py-4 font-semibold text-blue-600">{r.subjectCode}</td>
                          <td className="px-4 py-4 text-slate-700">{r.subjectName}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                r.type?.toLowerCase() === "practical"
                                  ? "bg-purple-50 text-purple-600"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {r.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-500">{r.time}</td>
                          <td className="px-4 py-4 font-medium text-slate-700">{r.hours}h</td>
                          <td className="px-4 py-4 text-slate-500">₹{r.rate}</td>
                          <td className="px-4 py-4 font-semibold text-blue-600">₹{r.amount}</td>
                        </tr>
                      ))}
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
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                            p === page ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
                      >
                        ›
                      </button>
                    </div>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900"
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
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-xl font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
