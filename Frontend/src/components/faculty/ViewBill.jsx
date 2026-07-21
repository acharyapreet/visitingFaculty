import React, { useState, useEffect, useMemo } from "react";
import { Download, ChevronDown, ChevronLeft, ChevronRight, Loader2, Calendar } from "lucide-react";
import axios from "axios";
import PageHeader from "./shared/PageHeader";

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

export default function ViewBill() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  
  // Date selection states
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Faculty info extracted from session / records
  const [facultyInfo, setFacultyInfo] = useState({
    name: "Visiting Faculty",
    uvfin: "N/A",
    email: "",
    course: "N/A",
    semester: "N/A",
    session: "2026-27"
  });

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2024, 2025, 2026, 2027];

  const fetchMonthlyBill = async () => {
    setIsLoading(true);
    setShowFilter(false);
    try {
      const sessionStr = localStorage.getItem('iipsCurrentSession');
      if (!sessionStr) return;
      
      const session = JSON.parse(sessionStr);
      const targetId = session.userId;

      // Set basic info from session
      setFacultyInfo(prev => ({ 
        ...prev, 
        name: session.fullName || session.name || "Visiting Faculty",
        uvfin: session.uvfin || "Pending",
        email: session.email || ""
      }));

      const response = await axios.get(`http://localhost:5000/api/attendance/monthly/${targetId}?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });

      if (response.data.success) {
        const data = response.data.data || [];
        setRecords(data);
        
        // Extract dynamically from the first record if available
        if (data.length > 0) {
          setFacultyInfo(prev => ({
            ...prev,
            course: data[0].course_name || prev.course,
            semester: data[0].semester_number ? `Semester ${data[0].semester_number}` : prev.semester,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching bill data:", error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyBill();
  }, [selectedMonth, selectedYear]);

  // Derived calculations
  const totalAmount = useMemo(() => {
    return records.reduce((sum, r) => {
      const hrs = parseFloat(r.hours) || 0;
      const rate = parseFloat(r.rate_per_hour) || 0;
      return sum + (hrs * rate);
    }, 0);
  }, [records]);

  const amountInWords = convertAmountToWords(totalAmount);

  // Formatting helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Generate a mock bill number based on month/year/id for preview consistency
  const billNo = `IIPS/VF/${selectedYear}/${selectedMonth.substring(0,3).toUpperCase()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const submissionDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="pb-12">
      <PageHeader
        title="View Bill"
        subtitle="Official DAVV remuneration bill"
        right={
          <>
            <span className="flex items-center gap-1.5 rounded-full bg-[#004DD2]/10 px-3 py-1.5 text-xs font-semibold text-[#004DD2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#004DD2]" /> PREVIEW MODE
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              {selectedMonth.substring(0, 3)} {selectedYear}
            </span>
          </>
        }
      />

      <div className="px-4 py-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 relative">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Bill Preview</h2>
            <p className="mt-0.5 text-sm text-slate-500">Review the generated document before downloading.</p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <Calendar className="h-4 w-4" /> 
              {selectedMonth} {selectedYear}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showFilter && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-10">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Month</label>
                    <select 
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-[#004DD2] focus:ring-1 focus:ring-[#004DD2] outline-none"
                    >
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Year</label>
                    <select 
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-[#004DD2] focus:ring-1 focus:ring-[#004DD2] outline-none"
                    >
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={fetchMonthlyBill}
                    className="w-full rounded-lg bg-[#004DD2] py-2 text-sm font-semibold text-white hover:bg-blue-800"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bill document */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin h-8 w-8 text-[#004DD2] mb-3" />
              <p>Generating bill document...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-900">No Attendance Records Found</p>
              <p className="mt-1">You have no marked attendance for {selectedMonth} {selectedYear}.</p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl border border-slate-200 p-5 sm:p-10">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900">देवी अहिल्या विश्वविद्यालय, इंदौर</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                  DEVI AHILYA VISHWAVIDYALAYA, INDORE
                </p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Established by M.P. Govt. Act No. 22/1964 · NAAC Grade A+ · Category I University
                </p>
              </div>

              <div className="mt-5 flex justify-center">
                <span className="border border-slate-400 px-4 py-1.5 text-sm font-bold tracking-wide text-slate-900">
                  VISITING FACULTY REMUNERATION BILL
                </span>
              </div>

              <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-300 pt-4 text-xs sm:flex-row sm:text-sm">
                <p>
                  <span className="font-semibold">Bill No.:</span> {billNo}
                </p>
                <p>
                  <span className="font-semibold">Month / Year:</span> {selectedMonth} {selectedYear}
                </p>
                <p>
                  <span className="font-semibold">Date of Submission:</span> {submissionDate}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-slate-300 pt-6 text-sm sm:grid-cols-2">
                <p><span className="inline-block w-28 font-semibold text-slate-600">UVFIN :</span> {facultyInfo.uvfin}</p>
                <p><span className="inline-block w-28 font-semibold text-slate-600">Name :</span> {facultyInfo.name}</p>
                <p><span className="inline-block w-28 align-top font-semibold text-slate-600">Email :</span> {facultyInfo.email}</p>
                <p><span className="inline-block w-28 font-semibold text-slate-600">Program :</span> {facultyInfo.course}</p>
                <p><span className="inline-block w-28 font-semibold text-slate-600">Semester :</span> {facultyInfo.semester}</p>
                <p><span className="inline-block w-28 font-semibold text-slate-600">Session :</span> {facultyInfo.session}</p>
              </div>

              <div className="mt-6 overflow-x-auto border-t border-slate-300 pt-6">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="border border-slate-300 bg-slate-50">
                      <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Sr.</th>
                      <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Date</th>
                      <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Code</th>
                      <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Subject Name</th>
                      <th className="border border-slate-300 px-3 py-2 text-left font-semibold">T/P</th>
                      <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Hrs</th>
                      <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Rate (₹)</th>
                      <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Amt (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, index) => {
                      const amount = (parseFloat(r.hours) || 0) * (parseFloat(r.rate_per_hour) || 0);
                      return (
                        <tr key={r.attendance_id}>
                          <td className="border border-slate-300 px-3 py-2">{index + 1}</td>
                          <td className="border border-slate-300 px-3 py-2">{formatDate(r.attendance_date)}</td>
                          <td className="border border-slate-300 px-3 py-2">{r.subject_code}</td>
                          <td className="border border-slate-300 px-3 py-2">{r.subject_name}</td>
                          <td className="border border-slate-300 px-3 py-2">{r.session_type || 'Theory'}</td>
                          <td className="border border-slate-300 px-3 py-2">{parseFloat(r.hours)}</td>
                          <td className="border border-slate-300 px-3 py-2">{parseFloat(r.rate_per_hour || 0)}</td>
                          <td className="border border-slate-300 px-3 py-2 font-medium">{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-50/50">
                      <td colSpan={7} className="border border-slate-300 px-3 py-2 text-right font-semibold text-slate-800">
                        TOTAL AMOUNT (₹)
                      </td>
                      <td className="border border-slate-300 px-3 py-2 font-bold text-[#004DD2]">
                        {totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="mt-6 text-sm font-semibold text-slate-800">
                Amount in words: <span className="font-bold underline decoration-slate-300 underline-offset-4">{amountInWords}</span>
              </p>

              <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 border border-dashed border-slate-300 p-4 text-sm sm:grid-cols-2 bg-slate-50/30">
                <div>
                  <p className="text-xs text-slate-500">Bank Name</p>
                  <p className="font-semibold text-slate-800">Update Profile</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">A/C Number</p>
                  <p className="font-semibold text-slate-800">Update Profile</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">IFSC Code</p>
                  <p className="font-semibold text-slate-800">Update Profile</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">PAN Number</p>
                  <p className="font-semibold text-slate-800">Update Profile</p>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-8 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 sm:grid-cols-3">
                <p className="border-t border-slate-400 pt-2">Sign of Faculty</p>
                <p className="border-t border-slate-400 pt-2">Head of Dept.</p>
                <p className="border-t border-slate-400 pt-2">Finance Officer</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-2">
            <button className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#004DD2] text-sm font-semibold text-white shadow-sm">
              1
            </span>
            <button className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button 
            disabled={records.length === 0}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}