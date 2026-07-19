import React, { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, ListChecks, Save } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import adminApi from "../../api/adminApi";

const PAGE_SIZE = 6;
const SEMESTERS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const TYPES = ["Theory", "Practical"];

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
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [loadingAllocations, setLoadingAllocations] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadFaculty = async () => {
    setLoadingFaculty(true);
    try {
      const data = await adminApi.getApprovedFaculty();
      setFacultyOptions(Array.isArray(data) ? data : data?.faculty ?? []);
    } catch {
      setFacultyOptions([]);
    } finally {
      setLoadingFaculty(false);
    }
  };

  const loadAllocations = async () => {
    setLoadingAllocations(true);
    try {
      const data = await adminApi.getSubjectAllocations();
      setAllocations(Array.isArray(data) ? data : data?.allocations ?? []);
    } catch {
      setAllocations([]);
    } finally {
      setLoadingAllocations(false);
    }
  };

  useEffect(() => {
    loadFaculty();
    loadAllocations();
  }, []);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.facultyId || !form.subjectCode || !form.subjectName || !form.type || !form.rate) {
      setFormError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.allocateSubject({
        facultyId: form.facultyId,
        courseName: form.courseName,
        semester: form.semester,
        session: form.session,
        subjectCode: form.subjectCode,
        subjectName: form.subjectName,
        type: form.type,
        ratePerHour: Number(form.rate),
      });
      setForm(emptyForm);
      loadAllocations();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to assign subject.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAllocations = useMemo(() => {
    if (!search.trim()) return allocations;
    const q = search.toLowerCase();
    return allocations.filter(
      (a) =>
        a.facultyName?.toLowerCase().includes(q) ||
        a.subjectName?.toLowerCase().includes(q) ||
        a.subjectCode?.toLowerCase().includes(q)
    );
  }, [allocations, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAllocations.length / PAGE_SIZE));
  const paginated = filteredAllocations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search]);

  return (
    <main className="p-4 sm:p-6 w-full">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Subject Allocation</h1>
        <p className="text-sm text-slate-400">Assign courses and subjects to faculty members</p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Assign form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <ClipboardCheck size={18} className="text-blue-600" />
            <h2 className="font-semibold text-slate-800">Assign New Subject</h2>
          </div>

          <div className="space-y-4">
            <Field label="Select Faculty (Name or ID)">
              <select
                value={form.facultyId}
                onChange={handleChange("facultyId")}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
                disabled={loadingFaculty}
              >
                <option value="">{loadingFaculty ? "Loading..." : "Select..."}</option>
                {facultyOptions.map((f) => (
                  <option key={f.id || f.user_id} value={f.id || f.user_id}>
                    {f.name} ({f.uvfin || f.uvfinId})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Course Name">
              <input
                value={form.courseName}
                onChange={handleChange("courseName")}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Semester">
                <select
                  value={form.semester}
                  onChange={handleChange("semester")}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Academic Session">
                <input
                  value={form.session}
                  onChange={handleChange("session")}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
                />
              </Field>
            </div>

            <Field label="Subject Code">
              <input
                value={form.subjectCode}
                onChange={handleChange("subjectCode")}
                placeholder="e.g. CS501"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </Field>

            <Field label="Subject Name">
              <input
                value={form.subjectName}
                onChange={handleChange("subjectName")}
                placeholder="Full subject name"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </Field>

            <Field label="Type">
              <select
                value={form.type}
                onChange={handleChange("type")}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="">Select...</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Per Hour Rate (₹)">
              <input
                type="number"
                value={form.rate}
                onChange={handleChange("rate")}
                placeholder="e.g. 500"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </Field>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              <Save size={16} />
              {submitting ? "Assigning..." : "Assign Subject"}
            </button>
          </div>
        </form>

        {/* Current allocations */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <ListChecks size={18} className="text-blue-600" />
            <h2 className="font-semibold text-slate-800">
              Current Allocations ({filteredAllocations.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-3">Faculty</th>
                  <th className="px-6 py-3">Course / Semester</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Type</th>
                </tr>
              </thead>
              <tbody>
                {loadingAllocations && (
                  <tr>
                    <td colSpan={4} className="py-10">
                      <LoadingSpinner label="Loading allocations..." />
                    </td>
                  </tr>
                )}

                {!loadingAllocations && paginated.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                      No subject allocations yet.
                    </td>
                  </tr>
                )}

                {!loadingAllocations &&
                  paginated.map((a, idx) => (
                    <tr key={a.id || idx} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{a.facultyName}</p>
                        <p className="text-xs text-slate-400">{a.uvfin || a.uvfinId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">{a.courseName}</p>
                        <p className="text-xs text-slate-400">
                          {a.semester} Sem • {a.session}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-400">{a.subjectCode}</p>
                        <p className="font-medium text-slate-700">{a.subjectName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            a.type?.toLowerCase() === "practical"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {a.type?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-1 px-6 py-4 border-t border-slate-100">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                  p === page ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}