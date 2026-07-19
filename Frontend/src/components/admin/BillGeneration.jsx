import React, { useEffect, useMemo, useState, useRef } from "react";
import { Search, Download, FileText } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import axios from "axios";

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

  // --- STATE: Form & UI ---
  const [facultySearch, setFacultySearch] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  
  const [month, setMonth] = useState("July");
  const [sessionYear, setSessionYear] = useState("2026-27");
  const [bill, setBill] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState("");
  const [page, setPage] = useState(1);

  const dropdownRef = useRef(null);

  // ==========================================
  // 1. INITIAL LOAD & EVENT LISTENERS
  // ==========================================
  useEffect(() => {
    loadHistory();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowFacultyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      // Endpoint 2: Get All Bills
      const res = await axios.get("http://localhost:5000/api/bills", getAxiosConfig());
      setHistory(res.data.data || res.data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

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
  // 3. GENERATE BILL
  // ==========================================
  const handleGenerate = async () => {
    if (!selectedFacultyId) {
      setError("Please select a faculty member from the dropdown first.");
      return;
    }
    
    setGenerating(true);
    setError("");
    
    try {
      // Map Strings to API Integers (e.g., "July" -> 7, "2026-27" -> 2026)
      const monthInt = MONTHS.indexOf(month) + 1;
      const yearInt = parseInt(sessionYear.split("-")[0]);

      // Endpoint 1: Generate Bill
      const payload = {
        facultyId: selectedFacultyId,
        month: monthInt,
        year: yearInt
      };

      const res = await axios.post("http://localhost:5000/api/bills/generate", payload, getAxiosConfig());
      setBill(res.data.data || res.data.bill || res.data);
      
      // Refresh history table to show the new bill
      loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to generate bill.");
      setBill(null);
    } finally {
      setGenerating(false);
    }
  };

  // ==========================================
  // 4. DOWNLOAD PDF SECURELY
  // ==========================================
  const handleDownloadPDF = async (billId) => {
    try {
      // Using blob response type so Axios handles the binary PDF file correctly
      const res = await axios.get(`http://localhost:5000/api/bills/download/${billId}`, {
        ...getAxiosConfig(),
        responseType: 'blob'
      });
      
      // Create a temporary hidden link to force the browser download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bill_${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF.");
      console.error(err);
    }
  };


  // ==========================================
  // 5. TABLE FILTERING
  // ==========================================
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history;
    const q = historySearch.toLowerCase();
    return history.filter(
      (b) => 
        (b.facultyName || b.User?.full_name)?.toLowerCase().includes(q) || 
        (b.billNo || b.id)?.toString().toLowerCase().includes(q)
    );
  }, [history, historySearch]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const paginated = filteredHistory.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [historySearch]);

  return (
    <main className="p-4 sm:p-6 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bill Generation</h1>
          <p className="text-sm text-slate-400">Official DAVV remuneration bill</p>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-end shadow-sm">
        
        {/* Smart Faculty Search */}
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

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Session</label>
          <select
            value={sessionYear}
            onChange={(e) => setSessionYear(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="2024-25">2024-25</option>
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0b57d0] text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          <Search size={16} /> {generating ? "Generating..." : "Generate"}
        </button>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

      {generating && <LoadingSpinner fullPage label="Generating bill preview..." />}

      {/* RENDER BILL PREVIEW IF GENERATED */}
      {!generating && bill && <BillPreview bill={bill} onDownload={() => handleDownloadPDF(bill.id || bill.billId)} />}

      {/* BILL HISTORY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
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
              className="pl-9 pr-3 py-2 rounded-md border border-slate-200 text-sm w-full sm:w-56 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3">Bill No.</th>
                <th className="px-6 py-3">Faculty</th>
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
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
                  <tr key={b.id || idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-700">#{b.billNo || b.id}</td>
                    <td className="px-6 py-4 text-slate-700">{b.facultyName || b.User?.full_name}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {typeof b.month === "number" ? MONTHS[b.month - 1] : b.month} {b.year}
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600">₹{b.amount || b.total_amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          statusStyles[b.status?.toLowerCase()] || statusStyles.draft
                        }`}
                      >
                        {b.status || "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDownloadPDF(b.id || b.billNo)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
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
        </div>
      </div>
    </main>
  );
}

// Added onDownload prop to connect the button securely
function BillPreview({ bill, onDownload }) {
  const items = bill.items || bill.Allocations || [];
  const total = items.reduce((sum, i) => sum + (Number(i.amount) || Number(i.rate_per_hour * i.hours) || 0), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800">Bill Preview</h2>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
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

        <div className="flex flex-wrap justify-between gap-2 text-sm border-t border-b border-slate-200 py-3 mb-4 bg-slate-50/50 px-2">
          <span className="font-medium text-slate-700">Bill No.: <span className="font-normal">{bill.billNo || bill.id}</span></span>
          <span className="font-medium text-slate-700">Month / Year: <span className="font-normal">{typeof bill.month === "number" ? MONTHS[bill.month - 1] : bill.month} {bill.year}</span></span>
          <span className="font-medium text-slate-700">Date of Submission: <span className="font-normal">{bill.submittedOn || new Date().toLocaleDateString()}</span></span>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm mb-6 px-2">
          <p><span className="text-slate-500 font-medium">UVFIN:</span> {bill.uvfin || bill.User?.FacultyApproval?.uvfin}</p>
          <p><span className="text-slate-500 font-medium">Name:</span> {bill.facultyName || bill.User?.full_name}</p>
          <p><span className="text-slate-500 font-medium">Qualification:</span> {bill.qualification || bill.User?.qualification}</p>
          <p><span className="text-slate-500 font-medium">Program:</span> {bill.program}</p>
          <p><span className="text-slate-500 font-medium">Semester:</span> {bill.semester}</p>
          <p><span className="text-slate-500 font-medium">Session:</span> {bill.session || bill.year}</p>
        </div>

        <table className="w-full text-sm mb-4 border border-slate-100">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600 border-b border-slate-200">
              <th className="px-4 py-2.5">Sr.</th>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Code</th>
              <th className="px-4 py-2.5">Subject Name</th>
              <th className="px-4 py-2.5">T/P</th>
              <th className="px-4 py-2.5">Hrs</th>
              <th className="px-4 py-2.5">Rate (₹)</th>
              <th className="px-4 py-2.5 text-right">Amt (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{i.date}</td>
                <td className="px-4 py-2">{i.code || i.Subject?.subject_code}</td>
                <td className="px-4 py-2">{i.subjectName || i.Subject?.subject_name}</td>
                <td className="px-4 py-2">{i.type || i.session_type}</td>
                <td className="px-4 py-2">{i.hours}</td>
                <td className="px-4 py-2">{i.rate || i.rate_per_hour}</td>
                <td className="px-4 py-2 text-right">{i.amount || (i.hours * i.rate_per_hour)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
              <td colSpan={7} className="px-4 py-3 text-right text-slate-700">
                TOTAL AMOUNT (₹)
              </td>
              <td className="px-4 py-3 text-right text-blue-700 text-base">{total}</td>
            </tr>
          </tbody>
        </table>

        <div className="grid grid-cols-3 gap-6 text-sm border-t border-slate-200 pt-12 mt-8 text-center text-slate-600">
          <p className="border-t border-slate-300 pt-2 font-medium">SIGNATURE OF FACULTY</p>
          <p className="border-t border-slate-300 pt-2 font-medium">HEAD OF DEPARTMENT</p>
          <p className="border-t border-slate-300 pt-2 font-medium">FINANCE OFFICER</p>
        </div>
      </div>
    </div>
  );
}