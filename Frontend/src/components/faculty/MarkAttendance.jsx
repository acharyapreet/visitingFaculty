import { useState } from "react";
import { List, LayoutGrid } from "lucide-react";
import PageHeader from "./shared/PageHeader";
import MarkAttendanceList from "./MarkAttendanceList";
import MarkAttendanceGrid from "./MarkAttendanceGrid";

export default function MarkAttendance() {
  const [view, setView] = useState("list"); // "list" | "grid"

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        subtitle={
          view === "list"
            ? "Submit your daily class teaching record"
            : undefined
        }
        right={
          <div className="flex overflow-hidden rounded-lg border border-slate-300">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white text-slate-900"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <List className="h-4 w-4" /> List
              {view === "list" ? " View" : ""}
            </button>
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                view === "grid"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <LayoutGrid className="h-4 w-4" /> Grid
              {view === "grid" ? " View" : ""}
            </button>
          </div>
        }
      />

      {view === "list" ? <MarkAttendanceList /> : <MarkAttendanceGrid />}
    </div>
  );
}
