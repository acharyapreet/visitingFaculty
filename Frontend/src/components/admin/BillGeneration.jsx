import React, { useEffect, useMemo, useState } from "react";
import { Search, Download, FileText } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import LoadingSpinner from "./LoadingSpinner";
import adminApi from "../../api/adminApi";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const PAGE_SIZE = 6;

const statusStyles = {
  paid: "bg-green-50 text-green-600",
  pending: "bg-amber-50 text-amber-600",
  draft: "bg-slate-100 text-slate-500",
};

export default function BillGeneration() {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("December");
  const [session, setSession] = useState("2024-25");
  const [bill, setBill] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const data = await adminApi.getBillHistory({ month, session });
        setHistory(Array.isArray(data) ? data : data?.bills ?? []);
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, [month, session]);

  const handleGenerate = async () => {
    if (!query.trim()) {
      setError("Enter a faculty name or UVFIN to generate a bill.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const data = await adminApi.generateBill({ faculty: query.trim(), month, session });
      setBill(data?.bill ?? data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate bill.");
      setBill(null);
    } finally {
      setGenerating(false);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history;
    const q = historySearch.toLowerCase();
    return history.filter(
      (b) => b.facultyName?.toLowerCase().includes(q) || b.billNo?.toLowerCase().includes(q)
    );
  }, [history, historySearch]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const paginated = filteredHistory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [historySearch]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar showSearch={false} title="View Bill" breadcrumb={["Admin", "Bill Generation"]} />

        <main className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Bill Generation</h1>
              <p className="text-sm text-slate-400">Official DAVV remuneration bill</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Faculty Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name or UVFIN-ID (e.g. UVFIN-2024-001)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              <Search size={16} /> {generating ? "Generating..." : "Search"}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {generating && <LoadingSpinner fullPage label="Generating bill preview..." />}

          {!generating && bill && <BillPreview bill={bill} />}

          {/* Bill history */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <h2 className="font-semibold text-slate-800">Bill History</h2>
              </div>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search bills..."
                  className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-56"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-3">Bill No.</th>
                    <th className="px-6 py-3">Faculty</th>
                    <th className="px-6 py-3">Month</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading && (
                    <tr>
                      <td colSpan={6} className="py-10">
                        <LoadingSpinner label="Loading bill history..." />
                      </td>
                    </tr>
                  )}
                  {!historyLoading && paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                        No bills generated yet.
                      </td>
                    </tr>
                  )}
                  {!historyLoading &&
                    paginated.map((b, idx) => (
                      <tr key={b.id || idx} className="border-b border-slate-50 last:border-0">
                        <td className="px-6 py-4 font-medium text-slate-700">{b.billNo}</td>
                        <td className="px-6 py-4 text-slate-700">{b.facultyName}</td>
                        <td className="px-6 py-4 text-slate-500">{b.month}</td>
                        <td className="px-6 py-4 font-semibold text-blue-600">₹{b.amount}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              statusStyles[b.status?.toLowerCase()] || "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="flex items-center gap-1 text-blue-600 text-xs font-medium hover:underline">
                            <Download size={13} /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-sm">
              <span className="text-slate-400">
                Showing {paginated.length} of {filteredHistory.length} bills
              </span>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function BillPreview({ bill }) {
  const items = bill.items || [];
  const total = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800">Bill Preview</h2>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
        >
          <Download size={15} /> Download PDF
        </button>
      </div>

      <div className="border border-slate-200 rounded-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">DEVI AHILYA VISHWAVIDYALAYA, INDORE</h3>
          <p className="text-xs text-slate-400 mt-1">
            Established by M.P. Govt. Act No. 22/1964 • NAAC Grade A+ • Category I University
          </p>
          <div className="inline-block border border-slate-300 px-4 py-1.5 mt-3 text-sm font-semibold text-slate-700">
            VISITING FACULTY REMUNERATION BILL
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2 text-sm border-t border-b border-slate-200 py-3 mb-4">
          <span>Bill No.: {bill.billNo}</span>
          <span>Month / Year: {bill.month}</span>
          <span>Date of Submission: {bill.submittedOn}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <p><span className="text-slate-400">UVFIN:</span> {bill.uvfin}</p>
          <p><span className="text-slate-400">Name:</span> {bill.facultyName}</p>
          <p><span className="text-slate-400">Qualification:</span> {bill.qualification}</p>
          <p><span className="text-slate-400">Program:</span> {bill.program}</p>
          <p><span className="text-slate-400">Semester:</span> {bill.semester}</p>
          <p><span className="text-slate-400">Session:</span> {bill.session}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="px-3 py-2">Sr.</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Subject Name</th>
              <th className="px-3 py-2">T/P</th>
              <th className="px-3 py-2">Hrs</th>
              <th className="px-3 py-2">Rate (₹)</th>
              <th className="px-3 py-2">Amt (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{i.date}</td>
                <td className="px-3 py-2">{i.code}</td>
                <td className="px-3 py-2">{i.subjectName}</td>
                <td className="px-3 py-2">{i.type}</td>
                <td className="px-3 py-2">{i.hours}</td>
                <td className="px-3 py-2">{i.rate}</td>
                <td className="px-3 py-2">{i.amount}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-semibold">
              <td colSpan={7} className="px-3 py-2 text-right">
                TOTAL AMOUNT (₹)
              </td>
              <td className="px-3 py-2">{total}</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-4 text-sm border-t border-slate-200 pt-4 mt-6 text-center">
          <p className="border-t border-slate-300 pt-2">SIGN OF FACULTY</p>
          <p className="border-t border-slate-300 pt-2">HEAD OF DEPT.</p>
          <p className="border-t border-slate-300 pt-2">FINANCE OFFICER</p>
        </div>
      </div>
    </div>
  );
}
