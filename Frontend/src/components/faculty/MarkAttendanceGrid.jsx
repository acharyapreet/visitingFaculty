import { useState } from "react";
import { ChevronLeft, ChevronRight, Info, CheckCircle2, Plus } from "lucide-react";
import { decemberEvents } from "./data/FacultyData";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
// December 2024 starts on a Sunday
const DAYS_IN_MONTH = 31;
const START_OFFSET = 0;

function buildCells() {
  const cells = [];
  for (let i = 0; i < START_OFFSET; i++) cells.push(null);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function MarkAttendanceGrid() {
  const [selectedDay, setSelectedDay] = useState(5);
  const cells = buildCells();

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 xl:flex-row">
      {/* Calendar */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">December 2024</h2>
            <button className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded-md p-1 text-slate-400 hover:bg-slate-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
            32 Sessions Scheduled
          </span>
        </div>

        <div className="mt-4 grid grid-cols-7 overflow-hidden rounded-xl border border-slate-200 text-xs">
          {days.map((d) => (
            <div
              key={d}
              className="border-b border-slate-200 bg-slate-50 py-2 text-center font-semibold tracking-wide text-slate-500"
            >
              {d}
            </div>
          ))}

          {cells.map((day, idx) => {
            const events = day ? decemberEvents[day] : null;
            const isSelected = day === selectedDay;
            return (
              <div
                key={idx}
                onClick={() => day && setSelectedDay(day)}
                className={`min-h-[70px] cursor-pointer border-b border-r border-slate-100 p-1.5 last:border-r-0 sm:min-h-[92px] sm:p-2 ${
                  isSelected ? "bg-brand-50" : "bg-white hover:bg-slate-50"
                }`}
              >
                {day && (
                  <>
                    <span
                      className={`text-xs font-medium ${
                        isSelected ? "text-brand-700" : "text-slate-700"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {events?.map((ev, i) => (
                        <div
                          key={i}
                          className={`rounded-md border-l-2 px-1.5 py-1 text-[10px] leading-tight ${
                            ev.status === "Cancelled"
                              ? "border-slate-300 bg-slate-50 text-slate-400 line-through"
                              : "border-brand-500 bg-brand-50 text-brand-700"
                          }`}
                        >
                          <p className="font-semibold">
                            {ev.code} | {ev.time}
                          </p>
                          <p>{ev.status}</p>
                        </div>
                      ))}
                      {isSelected && !events && (
                        <button className="flex items-center gap-1 rounded-md bg-brand-600 px-1.5 py-1 text-[10px] font-medium text-white">
                          <Plus className="h-2.5 w-2.5" /> Add Class
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

      {/* Side panel */}
      <div className="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:w-80">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Month Attendance</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Mark your whole month attendance by creating a event on the calendar and submit that day attendance.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Course</label>
          <select className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option>Master of Computer Applications (MCA)</option>
          </select>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Semester</label>
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white">Sem V</button>
            <button className="rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Sem III
            </button>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Section</label>
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white">Section A</button>
            <button className="rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Section B
            </button>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
          <select className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option>Software Engineering (CS-502)</option>
          </select>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Session Duration</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase text-slate-400">Start Time</p>
              <input
                type="text"
                placeholder="--:-- -"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase text-slate-400">End Time</p>
              <input
                type="text"
                placeholder="--:-- -"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
          <select className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option>Marked</option>
            <option>Cancelled</option>
          </select>
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
          <CheckCircle2 className="h-4 w-4" />
          Submit Attendance
        </button>
      </div>
    </div>
  );
}
