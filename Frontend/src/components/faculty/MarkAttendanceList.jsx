import { useState } from "react";
import { Send } from "lucide-react";

export default function MarkAttendanceList() {
  const [start, setStart] = useState("09:00 AM");
  const [end, setEnd] = useState("10:00 AM");

  return (
    <div className="px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-slate-900">Class Details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Please fill in all required fields for the academic record.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
            <input
              type="text"
              defaultValue="12/24/2024"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Course</label>
              <select className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option>Select Course</option>
                <option>B.Tech (CS)</option>
                <option>MCA</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Semester</label>
              <select className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option>Select Semester</option>
                <option>5th Semester</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Section <span className="text-slate-400">(if applicable)</span>
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option>Select Section</option>
                <option>A</option>
                <option>B</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
            <select className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option>Select Subject</option>
              <option>CS501 - Data Structures & Algorithms</option>
              <option>CS502L - DSA Laboratory</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Start Time</label>
              <input
                type="text"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">End Time</label>
              <input
                type="text"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-brand-50 px-4 py-3 text-sm">
            <span className="font-medium text-brand-700">Total Hours (Auto Calculated)</span>
            <span className="font-bold text-brand-700">1.0 hrs</span>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Remarks (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Extra class, Guest lecture, Test conducted..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
            <Send className="h-4 w-4" />
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
