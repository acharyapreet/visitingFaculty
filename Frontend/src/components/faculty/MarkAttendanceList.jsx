import React, { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
import axios from "axios";

export default function MarkAttendanceList() {
  const [allocations, setAllocations] = useState([]);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // --- PREVIOUS MONTH OPEN LOGIC ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDateNum = now.getDate();

  // The minimum allowed date is now the 1st of the previous month, regardless of what day today is.
  let minYear = currentYear;
  let minMonth = currentMonth - 1;

  // Handle January (0) wrapping back to December (11) of the previous year
  if (minMonth < 0) {
    minMonth = 11;
    minYear -= 1;
  }

  const minDate = `${minYear}-${String(minMonth + 1).padStart(2, '0')}-01`;
  const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDateNum).padStart(2, '0')}`;
  const maxDate = todayStr; // Cannot select future dates!

  // Form State
  const [date, setDate] = useState(todayStr); // YYYY-MM-DD
  const [selectedAllocationId, setSelectedAllocationId] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [remarks, setRemarks] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
        const targetId = session.userId;
        
        if (!targetId) return;
        setUserId(targetId);

        const headers = { 'Authorization': `Bearer ${session.token}` };

        // Fetch allocations AND current month's history simultaneously
        const monthName = now.toLocaleString('default', { month: 'long' });
        const [allocationsRes, monthlyRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/attendance/my-allocations/${targetId}`, { headers }),
          axios.get(`http://localhost:5000/api/attendance/monthly/${targetId}?month=${monthName}&year=${currentYear}`, { headers }).catch(() => ({ data: { data: [] } }))
        ]);

        if (allocationsRes.data.success) {
          setAllocations(allocationsRes.data.allocations || []);
        }
        
        if (monthlyRes.data.success) {
          setMonthlyRecords(monthlyRes.data.data || []);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- NEW: CUSTOM WHOLE-HOUR TIME HANDLER ---
  const handleTimeChange = (type, direction) => {
    const currentTime = type === 'start' ? startTime : endTime;
    let hour = parseInt(currentTime.split(':')[0], 10);
    
    if (direction === 'up') {
      hour = hour === 23 ? 0 : hour + 1;
    } else if (direction === 'down') {
      hour = hour === 0 ? 23 : hour - 1;
    }
    
    const newTime = `${String(hour).padStart(2, '0')}:00`;
    if (type === 'start') setStartTime(newTime);
    if (type === 'end') setEndTime(newTime);
  };

  // Auto-calculate hours
  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const [sHours, sMinutes] = startTime.split(':').map(Number);
    const [eHours, eMinutes] = endTime.split(':').map(Number);
    
    const start = new Date(0, 0, 0, sHours, sMinutes, 0);
    const end = new Date(0, 0, 0, eHours, eMinutes, 0);
    
    let diff = (end.getTime() - start.getTime()) / 1000 / 60 / 60;
    return diff > 0 ? diff.toFixed(2) : 0;
  };

  const hours = calculateHours();

  // Find the currently selected allocation to auto-fill the display data
  const activeAlloc = allocations.find(a => a.allocation_id.toString() === selectedAllocationId);

  const handleSubmit = async () => {
    if (!selectedAllocationId || hours <= 0 || !date) {
      alert("Please ensure all fields are filled correctly and End Time is after Start Time.");
      return;
    }

    // --- DATE VALIDATION (Future Block & Previous Month check) ---
    const selectedDateObj = new Date(date);
    selectedDateObj.setHours(0, 0, 0, 0);
    const todayObj = new Date(now);
    todayObj.setHours(0, 0, 0, 0);

    if (selectedDateObj > todayObj) {
      alert("You cannot mark attendance for future dates.");
      return;
    }

    const isCurrentMonthRec = selectedDateObj.getMonth() === now.getMonth() && selectedDateObj.getFullYear() === now.getFullYear();
    const isPreviousMonthRec = 
      (selectedDateObj.getFullYear() === now.getFullYear() && selectedDateObj.getMonth() === now.getMonth() - 1) ||
      (selectedDateObj.getFullYear() === now.getFullYear() - 1 && selectedDateObj.getMonth() === 11 && now.getMonth() === 0);

    if (!isCurrentMonthRec && !isPreviousMonthRec) {
        alert("You can only mark attendance for the current and previous month.");
        return;
    }
    // -----------------------------------------------------

    // --- MAX PAY CONSTRAINT LOGIC ---
    const MAX_MONTHLY_PAY = 30000; // Update this to your actual maximum allowed pay

    const rate = parseFloat(activeAlloc.rate_per_hour) || 0;
    const potentialEarnings = parseFloat(hours) * rate;

    // Calculate how much they have already made this month
    const currentMonthlyEarnings = monthlyRecords.reduce((sum, record) => {
      return sum + (parseFloat(record.hours || 0) * parseFloat(record.rate_per_hour || 0));
    }, 0);

    if (currentMonthlyEarnings + potentialEarnings > MAX_MONTHLY_PAY) {
      alert(`Adding this session (₹${potentialEarnings}) exceeds the maximum monthly limit of ₹${MAX_MONTHLY_PAY.toLocaleString('en-IN')}.\n\nCurrent earnings: ₹${currentMonthlyEarnings.toLocaleString('en-IN')}.`);
      return;
    }
    // -------------------------------------

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
      const d = new Date(date);
      const monthName = d.toLocaleString('default', { month: 'long' });
      const yearStr = d.getFullYear();

      const payload = {
        user_id: userId,
        course_id: activeAlloc.course_id,
        semester_id: activeAlloc.semester_id,
        subject_id: activeAlloc.subject_id,
        attendance_date: date,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        hours: parseFloat(hours),
        month: monthName,
        year: yearStr,
        status: "Pending",
        remarks: remarks
      };

      const response = await axios.post("http://localhost:5000/api/attendance/", payload, {
        headers: { 
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json' 
        }
      });

      if (response.data.success) {
        setSuccessMessage("Attendance submitted successfully!");
        setRemarks(""); 
        // Add the new record to local state so the limit check updates immediately
        setMonthlyRecords(prev => [...prev, response.data.data]);
        setTimeout(() => setSuccessMessage(""), 4000); 
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert(error.response?.data?.message || "Failed to submit attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="animate-spin h-8 w-8 text-[#004DD2] mb-3" />
        <p>Loading attendance form...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">Class Details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Please fill in all required fields for the academic record.
        </p>

        {successMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700 border border-green-200">
            <CheckCircle2 className="h-5 w-5" />
            {successMessage}
          </div>
        )}

        <div className="mt-6 space-y-5">
          {/* Date Picker Restricted by New Rules */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
            />
          </div>

          {/* Allocation Selection */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject & Class</label>
            <select 
              value={selectedAllocationId}
              onChange={(e) => setSelectedAllocationId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
            >
              <option value="">-- Select Allocated Subject --</option>
              {allocations.map(alloc => (
                <option key={alloc.allocation_id} value={alloc.allocation_id}>
                  {alloc.subject_code} - {alloc.subject_name} ({alloc.course_name}, Sem {alloc.semester_number})
                </option>
              ))}
            </select>
          </div>

          {/* CUSTOM Time Pickers (Whole Hours Only) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Start Time</label>
              <div className="flex items-center w-full rounded-lg border border-slate-300 overflow-hidden bg-white focus-within:border-[#004DD2] focus-within:ring-1 focus-within:ring-[#004DD2]">
                <input
                  type="text"
                  readOnly
                  value={startTime}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-700 bg-transparent outline-none cursor-default select-none tracking-wider font-medium"
                />
                <div className="flex flex-col border-l border-slate-200 bg-slate-50">
                  <button 
                    type="button" 
                    onClick={() => handleTimeChange('start', 'up')}
                    className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleTimeChange('start', 'down')}
                    className="p-1 hover:bg-slate-200 text-slate-600 transition-colors border-t border-slate-200"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">End Time</label>
              <div className="flex items-center w-full rounded-lg border border-slate-300 overflow-hidden bg-white focus-within:border-[#004DD2] focus-within:ring-1 focus-within:ring-[#004DD2]">
                <input
                  type="text"
                  readOnly
                  value={endTime}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-700 bg-transparent outline-none cursor-default select-none tracking-wider font-medium"
                />
                <div className="flex flex-col border-l border-slate-200 bg-slate-50">
                  <button 
                    type="button" 
                    onClick={() => handleTimeChange('end', 'up')}
                    className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleTimeChange('end', 'down')}
                    className="p-1 hover:bg-slate-200 text-slate-600 transition-colors border-t border-slate-200"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Calculated Hours */}
          <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 text-sm border border-blue-100">
            <span className="font-medium text-[#004DD2]">Total Hours (Auto Calculated)</span>
            <span className="font-bold text-[#004DD2]">{hours} hrs</span>
          </div>

          {/* Remarks */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Remarks (Optional)</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Extra class, Guest lecture, Test conducted..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
            />
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedAllocationId}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004DD2] py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isSubmitting ? "Submitting..." : "Submit Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}