import { useMemo, useState } from "react";
import { registeredFaculty, initialAllocations } from "../../data/mockData";
import { IconClipboardCheck, IconChevronLeft, IconChevronRight, IconSave, IconHelp } from "../../components/admin/icons";

const SEMESTERS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SUBJECT_TYPES = ["THEORY", "PRACTICAL", "TUTORIAL"];
const PAGE_SIZE = 2;

const emptyForm = {
  facultyId: "",
  courseName: "",
  semester: "3rd",
  session: "2024-25",
  subjectCode: "",
  subjectName: "",
  type: "",
  rate: "",
};

export default function SubjectAllocation() {
  const [form, setForm] = useState(emptyForm);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [page, setPage] = useState(1);
  const [errors, setErrors] = useState({});

  const totalPages = Math.max(1, Math.ceil(allocations.length / PAGE_SIZE));
  const pageRows = useMemo(
    () => allocations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allocations, page]
  );

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.facultyId) next.facultyId = "Select a faculty member.";
    if (!form.courseName.trim()) next.courseName = "Course name is required.";
    if (!form.subjectCode.trim()) next.subjectCode = "Subject code is required.";
    if (!form.subjectName.trim()) next.subjectName = "Subject name is required.";
    if (!form.type) next.type = "Select a type.";
    if (!form.rate || Number(form.rate) <= 0) next.rate = "Enter a valid per-hour rate.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAssign = () => {
    if (!validate()) return;
    const faculty = registeredFaculty.find((f) => f.uvfin === form.facultyId);
    const newAllocation = {
      id: `a${Date.now()}`,
      facultyId: form.facultyId,
      facultyName: faculty?.name ?? form.facultyId,
      course: form.courseName,
      semester: `${form.semester} Sem`,
      session: form.session,
      subjectCode: form.subjectCode,
      subjectName: form.subjectName,
      type: form.type,
    };
    setAllocations((list) => [newAllocation, ...list]);
    setForm(emptyForm);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Subject Allocation</h1>
          <p className="text-sm text-slate-500">Assign courses and subjects to faculty members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-slate-900">
            <IconClipboardCheck className="text-blue-600" /> Assign New Subject
          </h2>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Select Faculty (Name or ID)
            </label>
            <select
              value={form.facultyId}
              onChange={update("facultyId")}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 ${
                errors.facultyId ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
            >
              <option value="">Select...</option>
              {registeredFaculty.map((f) => (
                <option key={f.uvfin} value={f.uvfin}>
                  {f.name} ({f.uvfin})
                </option>
              ))}
            </select>
            {errors.facultyId ? <p className="mt-1 text-xs text-red-500">{errors.facultyId}</p> : null}
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Course Name</label>
            <input
              type="text"
              value={form.courseName}
              onChange={update("courseName")}
              placeholder="e.g. B.Tech Computer Science"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 ${
                errors.courseName ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
            />
            {errors.courseName ? <p className="mt-1 text-xs text-red-500">{errors.courseName}</p> : null}
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Semester</label>
              <select
                value={form.semester}
                onChange={update("semester")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Academic Session</label>
              <input
                type="text"
                value={form.session}
                onChange={update("session")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject Code</label>
            <input
              type="text"
              value={form.subjectCode}
              onChange={update("subjectCode")}
              placeholder="e.g. CS501"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 ${
                errors.subjectCode ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
            />
            {errors.subjectCode ? <p className="mt-1 text-xs text-red-500">{errors.subjectCode}</p> : null}
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject Name</label>
            <input
              type="text"
              value={form.subjectName}
              onChange={update("subjectName")}
              placeholder="Full subject name"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 ${
                errors.subjectName ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
            />
            {errors.subjectName ? <p className="mt-1 text-xs text-red-500">{errors.subjectName}</p> : null}
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
            <select
              value={form.type}
              onChange={update("type")}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 ${
                errors.type ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
            >
              <option value="">Select...</option>
              {SUBJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {errors.type ? <p className="mt-1 text-xs text-red-500">{errors.type}</p> : null}
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Per Hour Rate (₹)</label>
            <input
              type="number"
              min="0"
              value={form.rate}
              onChange={update("rate")}
              placeholder="e.g. 500"
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 ${
                errors.rate ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
            />
            {errors.rate ? <p className="mt-1 text-xs text-red-500">{errors.rate}</p> : null}
          </div>

          <button
            type="button"
            onClick={handleAssign}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <IconSave /> Assign Subject
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
            <IconClipboardCheck className="text-blue-600" /> Current Allocations ({allocations.length})
          </h2>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-medium tracking-wide text-slate-400">
                <th className="pb-3 font-medium">FACULTY</th>
                <th className="pb-3 font-medium">COURSE / SEMESTER</th>
                <th className="pb-3 font-medium">SUBJECT</th>
                <th className="pb-3 font-medium">TYPE</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="py-4 pr-4 text-sm">
                    <p className="font-medium text-slate-900">{a.facultyName}</p>
                    <p className="text-xs text-slate-400">{a.facultyId}</p>
                  </td>
                  <td className="py-4 pr-4 text-sm">
                    <p className="font-medium text-slate-800">{a.course}</p>
                    <p className="text-xs text-slate-400">
                      {a.semester} • {a.session}
                    </p>
                  </td>
                  <td className="py-4 pr-4 text-sm">
                    <p className="text-xs text-slate-400">{a.subjectCode}</p>
                    <p className="font-medium text-slate-800">{a.subjectName}</p>
                  </td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        a.type === "THEORY"
                          ? "bg-blue-50 text-blue-600"
                          : a.type === "PRACTICAL"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {a.type}
                    </span>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-slate-400">
                    No allocations yet. Assign a subject to get started.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
            >
              <IconChevronLeft />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i + 1)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                  page === i + 1 ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="fixed bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800"
        aria-label="Help"
      >
        <IconHelp />
      </button>
    </div>
  );
}