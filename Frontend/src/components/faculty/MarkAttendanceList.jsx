import React, { useState, useEffect } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function MarkAttendanceList() {
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [selectedAllocationId, setSelectedAllocationId] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [remarks, setRemarks] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
        const targetId = session.userId;
        
        if (!targetId) return;
        setUserId(targetId);

        const response = await axios.get(`http://localhost:5000/api/attendance/my-allocations/${targetId}`, {
          headers: { 'Authorization': `Bearer ${session.token}` }
        });

        if (response.data.success) {
          setAllocations(response.data.allocations || []);
        }
      } catch (error) {
        console.error("Error fetching allocations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllocations();
  }, []);

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
        status: "Pending", // Default as per API rules
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
        setRemarks(""); // Clear remarks on success
        setTimeout(() => setSuccessMessage(""), 4000); // Hide after 4 seconds
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
          {/* Date Picker */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
            />
          </div>

          {/* Allocation Selection (Smart Dropdown replaces 4 individual dropdowns) */}
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

          {/* Time Pickers */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2]"
              />
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