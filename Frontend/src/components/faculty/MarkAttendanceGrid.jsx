import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Info, CheckCircle2, Plus, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function MarkAttendanceGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  
  // Data States
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [userId, setUserId] = useState(null);
  
  // Form States
  const [selectedAllocationId, setSelectedAllocationId] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success", // 'success' or 'error'
    title: "",
    message: ""
  });

  const year = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const monthIndex = currentDate.getMonth();

  // Check if the viewed month is the actual current month
  const actualCurrentDate = new Date();
  const isCurrentMonth = 
    year === actualCurrentDate.getFullYear() && 
    monthIndex === actualCurrentDate.getMonth();

  // Helper to trigger the modal
  const showModal = (type, title, message) => {
    setModalConfig({ isOpen: true, type, title, message });
  };

  // Load Initial Data
  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
    if (session.userId) setUserId(session.userId);
    
    // Fetch Allocations
    if (session.userId) {
      axios.get(`http://localhost:5000/api/attendance/my-allocations/${session.userId}`, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      }).then(res => {
        if (res.data.success) setAllocations(res.data.allocations || []);
      }).catch(err => console.error("Error fetching allocations:", err));
    }
  }, []);

  // Fetch Monthly Data whenever Month/Year changes
  useEffect(() => {
    if (!userId) return;
    const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
    
    axios.get(`http://localhost:5000/api/attendance/monthly/${userId}?month=${monthName}&year=${year}`, {
      headers: { 'Authorization': `Bearer ${session.token}` }
    }).then(res => {
      if (res.data.success) setMonthlyRecords(res.data.data || []);
    }).catch(err => console.error("Error fetching monthly attendance:", err));
  }, [userId, monthName, year]);

  // Calendar Logic
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();

  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Group records by day
  const eventsByDay = useMemo(() => {
    const grouped = {};
    monthlyRecords.forEach(record => {
      const d = new Date(record.attendance_date).getDate();
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push({
        id: record.attendance_id,
        code: record.subject_code,
        time: `${record.start_time.substring(0,5)} - ${record.end_time.substring(0,5)}`,
        status: record.status
      });
    });
    return grouped;
  }, [monthlyRecords]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
    setSelectedDay(1); // Reset selected day to 1st when changing months
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
    setSelectedDay(1);
  };

  // Form Submission
  const handleSubmit = async () => {
    if (!isCurrentMonth) {
      return showModal("error", "Action Not Allowed", "Attendance can only be marked for the current month.");
    }
    if (!selectedAllocationId) {
      return showModal("error", "Missing Information", "Please select a subject before submitting.");
    }
    
    const sTime = new Date(`1970-01-01T${startTime}`);
    const eTime = new Date(`1970-01-01T${endTime}`);
    const diffHours = (eTime - sTime) / 1000 / 60 / 60;
    
    if (diffHours <= 0) {
      return showModal("error", "Invalid Time", "End time must be after the start time.");
    }

    setIsSubmitting(true);
    try {
      const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
      const activeAlloc = allocations.find(a => a.allocation_id.toString() === selectedAllocationId);
      
      // Format the selected date
      const submitDate = new Date(year, monthIndex, selectedDay);
      const dateString = submitDate.getFullYear() + "-" + 
        String(submitDate.getMonth() + 1).padStart(2, '0') + "-" + 
        String(submitDate.getDate()).padStart(2, '0');

      const payload = {
        user_id: userId,
        course_id: activeAlloc.course_id,
        semester_id: activeAlloc.semester_id,
        subject_id: activeAlloc.subject_id,
        attendance_date: dateString,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        hours: diffHours.toFixed(2),
        month: monthName,
        year: year,
        status: "Pending",
        remarks: remarks
      };

      const res = await axios.post("http://localhost:5000/api/attendance/", payload, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });

      if (res.data.success) {
        showModal("success", "Record Saved", `Attendance successfully submitted for ${dateString}.`);
        // Add it directly to UI without refreshing the whole API
        setMonthlyRecords(prev => [...prev, res.data.data]);
        setRemarks("");
      }
    } catch (error) {
      console.error(error);
      showModal("error", "Submission Failed", error.response?.data?.message || "Failed to submit attendance. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 xl:flex-row">
        {/* Calendar View */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{monthName} {year}</h2>
              <button onClick={handlePrevMonth} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={handleNextMonth} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#004DD2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#004DD2]" />
              {monthlyRecords.length} Sessions Logged
            </span>
          </div>

          <div className="mt-4 grid grid-cols-7 overflow-hidden rounded-xl border border-slate-200 text-xs">
            {daysOfWeek.map((d) => (
              <div key={d} className="border-b border-slate-200 bg-slate-50 py-2 text-center font-semibold tracking-wide text-slate-500">
                {d}
              </div>
            ))}

            {cells.map((day, idx) => {
              const events = day ? eventsByDay[day] : null;
              const isSelected = day === selectedDay;
              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDay(day)}
                  className={`min-h-[70px] border-b border-r border-slate-100 p-1.5 last:border-r-0 sm:min-h-[92px] sm:p-2 transition-colors ${
                    !day 
                      ? "bg-slate-50/50" 
                      : isSelected 
                        ? "bg-blue-50 border-blue-200 cursor-pointer" 
                        : "bg-white hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-medium ${isSelected ? "text-[#004DD2]" : "text-slate-700"}`}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {events?.map((ev, i) => (
                          <div
                            key={i}
                            className={`rounded-md border-l-2 px-1.5 py-1 text-[10px] leading-tight ${
                              ev.status === "Cancelled"
                                ? "border-slate-300 bg-slate-50 text-slate-400 line-through"
                                : "border-green-500 bg-green-50 text-green-700"
                            }`}
                          >
                            <p className="font-semibold truncate">{ev.code}</p>
                            <p className="truncate">{ev.status === "Cancelled" ? "Cancelled" : "Marked"}</p>
                          </div>
                        ))}
                        {isSelected && isCurrentMonth && (
                          <button className="flex w-full justify-center items-center gap-1 rounded-md bg-[#004DD2] px-1.5 py-1 text-[10px] font-medium text-white shadow-sm mt-1">
                            <Plus className="h-2.5 w-2.5" /> Select
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Side Panel */}
        <div className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:w-80">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#004DD2]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isCurrentMonth ? `Add Record for ${selectedDay} ${monthName}` : `Viewing ${monthName} ${year}`}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {isCurrentMonth 
                  ? "Select a day on the calendar, fill the details below, and submit the attendance."
                  : "You are viewing a past or future month. Attendance marking is disabled."}
              </p>
            </div>
          </div>

          {!isCurrentMonth && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-orange-50 p-3 text-xs font-medium text-orange-700 border border-orange-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Attendance can only be marked for the current ongoing month.
            </div>
          )}

          <div className="mt-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Allocated Subject</label>
            <select 
              value={selectedAllocationId}
              onChange={(e) => setSelectedAllocationId(e.target.value)}
              disabled={!isCurrentMonth}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2] disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">Select a Subject...</option>
              {allocations.map(alloc => (
                <option key={alloc.allocation_id} value={alloc.allocation_id}>
                  {alloc.subject_code} - {alloc.course_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Session Duration</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase text-slate-400">Start</p>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={!isCurrentMonth}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2] disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase text-slate-400">End</p>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!isCurrentMonth}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2] disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional notes..."
              disabled={!isCurrentMonth}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#004DD2] focus:outline-none focus:ring-1 focus:ring-[#004DD2] disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedAllocationId || !isCurrentMonth}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#004DD2] py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {isSubmitting ? "Submitting..." : "Submit Attendance"}
          </button>
        </div>
      </div>

      {/* --- CUSTOM MODAL FOR ALERTS --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm scale-100 overflow-hidden rounded-2xl bg-white shadow-xl animate-in zoom-in-95 duration-200 text-center">
            <div className="p-6 text-center">
              <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                modalConfig.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {modalConfig.type === 'success' ? (
                  <CheckCircle2 size={28} strokeWidth={2.5} />
                ) : (
                  <AlertCircle size={28} strokeWidth={2.5} />
                )}
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-800">{modalConfig.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-2">
                {modalConfig.message}
              </p>
            </div>
            
            <div className="border-t border-slate-100 bg-slate-50 p-4">
              <button
                onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                className={`w-full rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors ${
                  modalConfig.type === 'success' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}