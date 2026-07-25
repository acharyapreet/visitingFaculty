import React, { useEffect, useMemo, useState, useRef } from "react";
import { Search, Download, FileText, TableProperties, Calendar } from "lucide-react";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner"; 

// Import the logo correctly for Vite/React
import davvLogo from "../../assets/image.png";

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

// Helper function to convert numbers to words (Indian Rupee Format)
function convertAmountToWords(amount) {
  if (!amount || amount === 0) return "Zero Rupees Only";
  
  const num = Math.floor(amount);
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty ','Thirty ','Forty ','Fifty ', 'Sixty ','Seventy ','Eighty ','Ninety '];
  
  if (num.toString().length > 9) return 'Amount too large';
  
  const n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + a[n[5][1]]) : '';
  
  return str.trim() + " Rupees Only";
}

// Component to render UVFIN in boxes
const UVFINBlocks = ({ uvfin }) => {
  const chars = (uvfin || "").padEnd(15, " ").split("").slice(0, 15);
  return (
    <div className="flex">
      {chars.map((c, i) => (
        <div key={i} className="flex h-5 w-5 items-center justify-center border border-black text-xs font-bold uppercase sm:h-6 sm:w-6">
          {c.trim()}
        </div>
      ))}
    </div>
  );
};

export default function BillGeneration() {
  const getAxiosConfig = () => {
    const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
    return {
      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json"
      }
    };
  };

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
      const res = await axios.get("http://localhost:5000/api/bills", getAxiosConfig());
      setHistory(res.data.data || res.data || []);
    } catch {
      setHistory([]); 
    } finally {
      setHistoryLoading(false);
    }
  };

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

  const handleGenerate = async () => {
    if (!selectedFacultyId) {
      setError("Please search and select a faculty member first.");
      return;
    }
    
    setGenerating(true);
    setError("");
    setBill(null);
    
    try {
      const yearInt = parseInt(sessionYear.split("-")[0]);

      const profileRes = await axios.get(
        `http://localhost:5000/api/admin/faculty/${selectedFacultyId}`, 
        getAxiosConfig()
      );
      const facultyData = profileRes.data.data;

      const attendanceRes = await axios.get(
        `http://localhost:5000/api/attendance/monthly/${selectedFacultyId}?month=${month}&year=${yearInt}`, 
        getAxiosConfig()
      );

      const records = attendanceRes.data.data || [];

      if (records.length === 0) {
        setError(`No attendance records found for ${facultyData.full_name} in ${month} ${yearInt}.`);
        setGenerating(false);
        return;
      }

      // Populate dynamicBill with ALL required banking and personal info
      // Populate dynamicBill with safe fallbacks in case DB fields are null
      const dynamicBill = {
        billNo: `BILL-${Date.now().toString().slice(-6)}`,
        month: month,
        year: yearInt,
        session: sessionYear,
        submittedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        facultyName: facultyData.full_name || "Name Missing",
        uvfin: facultyData.uvfin || "",
        qualification: facultyData.qualification || "",
        address: facultyData.address || "",
        mobile: facultyData.phone_number || "",
        pan: facultyData.pan_card_no || "",
        account: facultyData.account_no || "",
        bankName: facultyData.bank_name || "",
        ifsc: facultyData.ifsc_code || "",
        aadhaar: facultyData.aadhaar_no || "",
        program: records[0]?.course_name || "N/A",
        semester: records[0]?.semester_number ? `Semester ${records[0].semester_number}` : "N/A",
        items: records 
      };

      setBill(dynamicBill);
      
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to retrieve data for bill generation.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async (billId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bills/download/${billId}`, {
        ...getAxiosConfig(),
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bill_${billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: Trigger browser print
      window.print();
    }
  };

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
    <main className="p-4 sm:p-6 space-y-6 w-full print:p-0 print:m-0 print:bg-white">
      
      {/* 1. Global Print Styles specifically scoped for the admin dashboard */}
      <style>
        {`
          @media print {
            @page { size: A4; margin: 10mm; }
            body * { visibility: hidden; }
            #printable-bill, #printable-bill * { visibility: visible; }
            
            #printable-bill {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
              background: white !important;
            }

            body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-hide { display: none !important; }
            .print-force-break { page-break-before: always; }
          }
        `}
      </style>

      {/* Hide controls when printing */}
      <div className="print-hide">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Bill Generation</h1>
            <p className="text-sm text-slate-400">Official DAVV remuneration bill</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-end shadow-sm mb-6">
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
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#004DD2]"
              />
            </div>
            
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
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#004DD2]"
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
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#004DD2]"
            >
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
              <option value="2026-27">2026-27</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#004DD2] text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            <Search size={16} /> {generating ? "Generating..." : "Generate"}
          </button>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mb-6">{error}</p>}
        {generating && <div className="py-12 flex justify-center text-slate-500">Generating official document preview...</div>}
      </div>

      {/* RENDER ANNEXURE IV PREVIEW IF GENERATED */}
      {!generating && bill && (
        <div className="mb-8">
          <BillPreview bill={bill} onDownload={() => handleDownloadPDF(bill.billNo)} />
        </div>
      )}

      {/* BILL HISTORY TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col print-hide">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#004DD2]" />
            <h2 className="font-semibold text-slate-800">Bill History</h2>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search bills..."
              className="pl-9 pr-3 py-2 rounded-md border border-slate-200 text-sm w-full sm:w-56 focus:outline-none focus:border-[#004DD2]"
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
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                    Loading bill history...
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
                  p === page ? "bg-[#004DD2] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
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

// -------------------------------------------------------------
// The Official Annexure IV & Attendance Layout
// -------------------------------------------------------------
function BillPreview({ bill, onDownload }) {
  const [billPage, setBillPage] = useState(1);
  const items = bill.items || [];

  const aggregatedRecords = useMemo(() => {
    const grouped = {};
    items.forEach(r => {
      const key = `${r.course_name}_${r.semester_number}_${r.subject_code}_${r.rate_per_hour}`;
      if (!grouped[key]) {
        grouped[key] = {
          program: r.course_name || bill.program,
          semester: r.semester_number ? `Semester ${r.semester_number}` : bill.semester,
          subject: `${r.subject_name} (${r.subject_code})`,
          rate: parseFloat(r.rate_per_hour || 0),
          dates: [],
          totalHrs: 0,
          amount: 0
        };
      }
      
      const d = new Date(r.attendance_date);
      const formattedDate = isNaN(d.getTime()) ? r.attendance_date : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const hrs = parseFloat(r.hours);
      
      grouped[key].dates.push(`${formattedDate} (${hrs} Hrs)`);
      grouped[key].totalHrs += hrs;
      grouped[key].amount += (hrs * grouped[key].rate);
    });
    return Object.values(grouped);
  }, [items, bill.program, bill.semester]);

  const totalAmount = useMemo(() => {
    return aggregatedRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [aggregatedRecords]);

  const totalHours = useMemo(() => {
    return aggregatedRecords.reduce((sum, r) => sum + r.totalHrs, 0);
  }, [aggregatedRecords]);

  const amountInWords = convertAmountToWords(totalAmount);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row print:block">
      <div id="printable-bill" className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:overflow-visible mx-auto max-w-[210mm]">
        <div className="p-4 sm:p-8 print:p-0">
          
          {/* --- PAGE 1: ANNEXURE IV --- */}
          <div className={`mx-auto w-full min-h-[297mm] bg-white text-black print:block ${billPage === 1 ? 'block' : 'hidden'}`}>
            <div className="text-[13px] leading-relaxed p-6">
              
              <div className="relative mb-6 flex items-center justify-center min-h-[5rem]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-20 w-20">
                  <img src={davvLogo} alt="DAVV Logo" className="h-full w-full object-contain grayscale" />
                </div>
                
                <div className="text-center w-full px-24">
                  <p className="font-bold underline underline-offset-4 text-sm tracking-wide">ANNEXURE -IV</p>
                  <h1 className="mt-2 text-xl font-bold uppercase tracking-tight">DEVI AHILYA VISHWAVIDYALAYA, INDORE</h1>
                  <p className="mt-1 font-semibold text-[15px] leading-relaxed">
                    Department/School/Centre <span className="border-b border-black font-bold px-4 inline-block">International Institute of Professional Studies (IIPS)</span>
                  </p>
                </div>
              </div>

              <div className="mb-4 flex justify-between font-semibold">
                <p>Page No. of Attendance Register ___________________</p>
                <p>S.No. ___________________</p>
              </div>

              <h2 className="mb-4 text-center text-[15px] font-bold underline underline-offset-4">
                Bill For Claiming Remuneration/Honorarium for Visiting Faculty
              </h2>

              <div className="mb-6 flex items-center justify-end gap-2">
                <span className="font-semibold">UVFIN (Unified Visiting Faculty ID No.)</span>
                <UVFINBlocks uvfin={bill.uvfin} />
              </div>

              <div className="mb-6 space-y-4 text-[14px]">
                <div className="flex items-end gap-2">
                  <span className="w-16 shrink-0 font-medium">Name</span>
                  <span className="flex-1 border-b border-black pb-0.5 text-left pl-2 font-semibold">
                    {bill.facultyName}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="w-16 shrink-0 font-medium">Address</span>
                  <span className="flex-1 border-b border-black pb-0.5 text-left pl-2 font-semibold">
                    {bill.address || "\u00A0"}
                  </span>
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex flex-1 items-end gap-2">
                    <span className="shrink-0 font-medium">Mob No.</span>
                    <span className="flex-1 border-b border-black pb-0.5 text-left pl-2 font-semibold">
                      {bill.mobile || "\u00A0"}
                    </span>
                  </div>
                  <div className="flex flex-1 items-end gap-2">
                    <span className="shrink-0 font-medium">Qualification</span>
                    <span className="flex-1 border-b border-black pb-0.5 text-left pl-2 font-semibold">
                      {bill.qualification || "\u00A0"}
                    </span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-2 text-[13px]">
                  <div className="flex items-end gap-2">
                    <span className="font-medium">Month</span>
                    <span className="w-20 border-b border-black pb-0.5 text-center font-bold">{bill.month}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="font-medium">Year</span>
                    <span className="w-16 border-b border-black pb-0.5 text-center font-bold">{bill.year}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="font-medium">Date of Submission</span>
                    <span className="w-24 border-b border-black pb-0.5 text-center font-bold">{bill.submittedOn}</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="font-medium">Theory/Practical</span>
                    <span className="w-20 border-b border-black pb-0.5 text-center font-bold"></span>
                    <span className="font-medium">per week</span>
                  </div>
                </div>
              </div>

              <table className="mb-4 w-full border-collapse border border-black text-center text-sm">
                <thead>
                  <tr>
                    <th className="border border-black p-2 w-[12%]">Program</th>
                    <th className="border border-black p-2 w-[15%]">Semester</th>
                    <th className="border border-black p-2 w-[25%]">Subject</th>
                    <th className="border border-black p-2 w-[20%]">Dates with<br/>Duration (Hrs.)</th>
                    <th className="border border-black p-2 w-[8%]">Total<br/>Hrs.</th>
                    <th className="border border-black p-2 w-[10%]">Rate</th>
                    <th className="border border-black p-2 w-[10%]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedRecords.map((r, index) => (
                    <tr key={index}>
                      <td className="border border-black p-3 font-medium">{r.program}</td>
                      <td className="border border-black p-3 font-medium">{r.semester}</td>
                      <td className="border border-black p-3 font-medium">{r.subject}</td>
                      <td className="border border-black p-2 text-xs leading-relaxed text-slate-700">
                        {r.dates.map((dateStr, i) => (
                          <React.Fragment key={i}>
                            {dateStr}
                            {i < r.dates.length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </td>
                      <td className="border border-black p-3 font-medium">{r.totalHrs}</td>
                      <td className="border border-black p-3 font-medium">{r.rate}</td>
                      <td className="border border-black p-3 font-medium">{r.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mb-4 text-[11px] font-medium">*Total amount should not exceed the maximum limit of remuneration for a month.</p>
              
              <div className="mb-8 flex items-end font-bold text-[14px]">
                <span>Total Hours</span>
                <span className="mx-2 w-16 border-b border-black text-center">{totalHours}</span>
                <span className="ml-4">Total Amount</span>
                <span className="mx-2 w-24 border-b border-black text-center">{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                <span className="ml-4 font-normal">(Amount in Words</span>
                <span className="mx-2 flex-1 border-b border-black text-center">{amountInWords}</span>
                <span className="font-normal">)</span>
              </div>

              <div className="mb-8 text-[12px] font-medium leading-relaxed">
                <p className="font-bold underline text-[14px] mb-1">Note:</p>
                <ol className="list-[upper-alpha] pl-6 space-y-0.5">
                  <li>Rate of Remuneration will be as per university rules.</li>
                  <li>Faculty members are requested to complete all the above entries.</li>
                  <li>Rates to be verified as per visiting faculty attendance register and signed by authorized person.</li>
                  <li>Fill this form for theory/practical classes for every month.</li>
                  <li>Faculty should not be paid excess amount of Rs 30,000/- PM from D.A.V.V.</li>
                  <li>Verified visiting faculty Teaching attendance details should be attached with this bill.</li>
                </ol>
              </div>

              <div className="mb-12 text-center text-[12px]" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <p className="mb-2 font-bold underline text-[15px]">UNDERTAKING</p>
                <p className="text-justify mb-6 font-medium leading-relaxed">
                  I was directed and permitted by the Head to engage the above Classes. For this I have submitted this bill. I therefore, request you to deduct _______% against Income Tax Returns from my payment. Further, I certify that total amount received per month doesn't exceed the maximum permissible limit of remuneration of any amount paid by D.A.V.V. which is Rs. 30,000/- at present.
                </p>
                
                <div className="flex items-start justify-between">
                  <div className="w-72 border-2 border-black p-3 text-left space-y-1.5 font-semibold">
                    <p>Pan Card No. <span className="border-b border-black inline-block w-40">{bill.pan}</span></p>
                    <p>A/c No. <span className="border-b border-black inline-block w-48">{bill.account}</span></p>
                    <p>Bank Name <span className="border-b border-black inline-block w-44">{bill.bankName}</span><br/><span className="text-[10px] font-normal italic">(State bank of India Compulsory)</span></p>
                    <p>IFSC Code <span className="border-b border-black inline-block w-44">{bill.ifsc}</span></p>
                    <p>Aadhaar No. <span className="border-b border-black inline-block w-40">{bill.aadhaar}</span></p>
                  </div>
                  
                  <div className="mt-20 flex flex-col items-center font-bold text-[14px]">
                    <p>_____________________________________</p>
                    <p>Name & Signature of Visiting Faculty</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-14 font-bold text-[14px]" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <div className="text-center">
                  <p>_____________________________________</p>
                  <p>Verified by Coordinator (Name & Signature)</p>
                </div>
                <div className="w-full flex justify-between items-end">
                  <div className="font-semibold space-y-2">
                    <p>Date : {bill.submittedOn}</p>
                    <p>Received Payments of Rs. ____________</p>
                    <p>Cheque No. ____________</p>
                  </div>
                  <div className="text-center">
                    <p>_____________________________________</p>
                    <p>Signature Director/Head (Name & Seal)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- PAGE 2: ATTENDANCE REGISTER --- */}
          <div className={`mx-auto w-full min-h-[297mm] bg-white text-black print:block print-force-break ${billPage === 2 ? 'block' : 'hidden'}`}>
            <div className="text-[13px] leading-relaxed p-6 pt-12">
              <div className="mb-8 flex items-center justify-end gap-2">
                <span className="font-bold text-sm">UVFIN</span>
                <UVFINBlocks uvfin={bill.uvfin} />
              </div>

              <div className="relative mb-8 flex items-center justify-center min-h-[5rem]">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-20 w-20">
                  <img src={davvLogo} alt="DAVV Logo" className="h-full w-full object-contain grayscale" />
                </div>
                <div className="text-center w-full px-24">
                  <h1 className="text-xl font-bold uppercase tracking-tight">DEVI AHILYA VISHWAVIDYALAYA,</h1>
                  <h1 className="text-xl font-bold uppercase tracking-tight">INDORE</h1>
                  <p className="mt-3 text-[15px] font-semibold leading-relaxed">
                    Department/School/Centre <span className="border-b border-black font-bold px-12 inline-block">International Institute of Professional Studies (IIPS)</span>
                  </p>
                </div>
              </div>

              <h2 className="mb-6 text-center text-[15px] font-bold underline underline-offset-4">
                VISITING FACULTY TEACHING ATTENDANCE
              </h2>

              <table className="w-full border-collapse border-2 border-black font-semibold text-sm mb-0">
                <tbody>
                  <tr>
                    <td className="border border-black p-2.5 w-1/2">Name: {bill.facultyName}</td>
                    <td className="border border-black p-2.5 w-1/2">Designation : Visiting Faculty</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2.5">Month and Year : {bill.month} {bill.year}</td>
                    <td className="border border-black p-2.5">Semester and Session : {bill.semester} ({bill.session})</td>
                  </tr>
                </tbody>
              </table>

              <table className="mb-24 w-full border-collapse border-2 border-t-0 border-black text-center text-sm">
                <thead>
                  <tr>
                    <th className="border border-black p-2.5 w-[15%]">Date</th>
                    <th className="border border-black p-2.5 w-[20%]">Subject Code</th>
                    <th className="border border-black p-2.5 text-left pl-4 w-[35%]">Subject Name</th>
                    <th className="border border-black p-2.5 w-[15%]">Theory / Practice</th>
                    <th className="border border-black p-2.5 w-[15%]">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, i) => (
                    <tr key={i}>
                      <td className="border border-black p-2.5">{formatDate(r.attendance_date)}</td>
                      <td className="border border-black p-2.5 font-semibold">{r.subject_code}</td>
                      <td className="border border-black p-2.5 text-left pl-4 font-semibold">{r.subject_name}</td>
                      <td className="border border-black p-2.5">{r.session_type || 'Theory'}</td>
                      <td className="border border-black p-2.5 font-bold">{parseFloat(r.hours)}</td>
                    </tr>
                  ))}
                  {[...Array(Math.max(0, 5 - items.length))].map((_, i) => (
                    <tr key={`empty-att-${i}`}>
                      <td className="border border-black p-3.5"></td><td className="border border-black p-3.5"></td>
                      <td className="border border-black p-3.5"></td><td className="border border-black p-3.5"></td><td className="border border-black p-3.5"></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between font-bold text-[14px] mt-16 px-4" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <p>Name & Sign. of Faculty</p>
                <div className="text-right flex flex-col gap-16">
                  <p>Name & Sign. of Coordinator</p>
                  <p>Name & Sign. of Head</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="flex flex-row lg:flex-col gap-2 shrink-0 justify-center print-hide">
        <button 
          onClick={onDownload}
          className="flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-xl border border-slate-900 bg-slate-900 text-white shadow-sm hover:bg-slate-800 transition-all mb-4"
        >
          <Download className="h-6 w-6" />
          <span className="text-xs font-semibold">Print</span>
        </button>
        <button 
          onClick={() => setBillPage(1)}
          className={`flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-xl border transition-all ${
            billPage === 1 
              ? "border-[#004DD2] bg-blue-50 text-[#004DD2] shadow-sm" 
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          <FileText className="h-6 w-6" />
          <span className="text-xs font-semibold">Page 1</span>
        </button>
        <button 
          onClick={() => setBillPage(2)}
          className={`flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-xl border transition-all ${
            billPage === 2 
              ? "border-[#004DD2] bg-blue-50 text-[#004DD2] shadow-sm" 
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          }`}
        >
          <TableProperties className="h-6 w-6" />
          <span className="text-xs font-semibold">Page 2</span>
        </button>
      </div>
    </div>
  );
}