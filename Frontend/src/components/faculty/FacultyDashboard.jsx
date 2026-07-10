import { FileText } from "lucide-react";
import PageHeader from "./shared/PageHeader";
import { currentFaculty, allocatedSubjects } from "./data/FacultyData";

const typeStyles = {
  Theory: "bg-purple-100 text-purple-700",
  Practical: "bg-emerald-100 text-emerald-700",
};

export default function FacultyDashboard() {
  return (
    <div>
      <PageHeader title="Unified Visiting Faculty Management,IIPS,DAVV" />

      <div className="px-4 py-6 sm:px-8">
        <h2 className="text-2xl font-bold text-slate-900">{currentFaculty.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {currentFaculty.month} · Session {currentFaculty.session}
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">My Allocated Subjects</h3>
            <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-medium text-slate-600">
              Session {currentFaculty.session}
            </span>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3 font-semibold">Subject Code</th>
                  <th className="px-6 py-3 font-semibold">Subject Name</th>
                  <th className="px-6 py-3 font-semibold">Course</th>
                  <th className="px-6 py-3 font-semibold">Semester</th>
                  <th className="px-6 py-3 font-semibold">Section</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {allocatedSubjects.map((s, i) => (
                  <tr key={s.code} className={i !== allocatedSubjects.length - 1 ? "border-b border-slate-100" : ""}>
                    <td className="px-6 py-5 font-semibold text-brand-600">{s.code}</td>
                    <td className="px-6 py-5 font-medium text-slate-800">{s.name}</td>
                    <td className="px-6 py-5 text-slate-600">{s.course}</td>
                    <td className="px-6 py-5 text-slate-600">{s.semester}</td>
                    <td className="px-6 py-5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600">
                        {s.section}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeStyles[s.type]}`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button className="rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50">
                        Mark Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {allocatedSubjects.map((s) => (
              <div key={s.code} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-600">{s.code}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${typeStyles[s.type]}`}>
                    {s.type}
                  </span>
                </div>
                <p className="mt-1 font-medium text-slate-800">{s.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {s.course} · {s.semester} · Section {s.section}
                </p>
                <button className="mt-3 w-full rounded-lg border border-brand-600 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50">
                  Mark Attendance
                </button>
              </div>
            ))}
          </div>
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-4 text-sm font-semibold text-brand-700 hover:bg-brand-100">
          <FileText className="h-4 w-4" />
          Download Schedule PDF
        </button>
      </div>
    </div>
  );
}
