import { Download, Calendar, Clock, IndianRupee, ChevronDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "./shared/PageHeader";
import { currentFaculty, attendanceHistory, attendanceSummary } from "./data/FacultyData";

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
  return (
    <div>
      <PageHeader
        title="Attendance History"
        right={
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export
          </button>
        }
      />

      <div className="px-4 py-6 sm:px-8">
        <h2 className="text-2xl font-bold text-slate-900">{currentFaculty.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {currentFaculty.month} · Session {currentFaculty.session}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Calendar} label="Classes Submitted" value={attendanceSummary.classesSubmitted} />
          <StatCard icon={Clock} label="Total Hours" value={attendanceSummary.totalHours} />
          <StatCard icon={IndianRupee} label="Total Earnings" value={attendanceSummary.totalEarnings} />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-600">
                Select Subject <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-600">
                Select Day <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
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
                {attendanceHistory.map((r) => (
                  <tr key={r.sn} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4 text-slate-500">{r.sn}</td>
                    <td className="px-4 py-4 text-slate-700">{r.date}</td>
                    <td className="px-4 py-4 font-semibold text-brand-600">{r.code}</td>
                    <td className="px-4 py-4 text-slate-800">{r.name}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeStyles[r.type]}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{r.time}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{r.hours}</td>
                    <td className="px-4 py-4 text-slate-600">₹{r.rate}</td>
                    <td className="px-4 py-4 font-bold text-brand-600">₹{r.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {attendanceHistory.map((r) => (
              <div key={r.sn} className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-600">{r.code}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeStyles[r.type]}`}>
                    {r.type}
                  </span>
                </div>
                <p className="mt-1 font-medium text-slate-800">{r.name}</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{r.date}</span>
                  <span>{r.time}</span>
                  <span>{r.hours}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Rate ₹{r.rate}</span>
                  <span className="font-bold text-brand-600">₹{r.amount}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4">
            <p className="text-xs text-slate-500">Showing 10 records</p>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-slate-200 p-1.5 text-slate-400">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-xs font-semibold text-white">
                1
              </span>
              <button className="rounded-md border border-slate-200 p-1.5 text-slate-400">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
