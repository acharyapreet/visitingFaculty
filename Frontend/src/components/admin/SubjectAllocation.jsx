import React, { useEffect, useMemo, useState, useRef } from "react";
import { ClipboardCheck, ListChecks, Save, Trash2 } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import axios from "axios";

const PAGE_SIZE = 6;
const TYPES = ["Theory", "Practical"];
const RATES = ["200", "400", "800"];

const emptyForm = {
  user_id: "",
  course_id: "",
  section_id: "",
  semester_id: "",
  subject_id: "",
  session_type: "",
  rate_per_hour: "",
  academic_year: "2024-25",
};

export default function SubjectAllocation() {
  // --- STATE: Data from APIs ---
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allocations, setAllocations] = useState([]);

  // --- STATE: UI & Form ---
  const [loadingAllocations, setLoadingAllocations] = useState(true);
  const [facultySearch, setFacultySearch] = useState(""); 
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const dropdownRef = useRef(null);

  const getAxiosConfig = () => {
    const session = JSON.parse(localStorage.getItem('iipsCurrentSession') || '{}');
    return {
      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json"
      }
    };
  };

  // ==========================================
  // 1. DATA FETCHING: INITIAL LOAD
  // ==========================================
  useEffect(() => {
    fetchCourses();
    fetchAllocations();

    // Click outside handler for Faculty Dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFacultyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/courses", getAxiosConfig());
      setCourses(res.data.data || []);
    } catch (err) {
      console.error("Failed to load courses", err);
    }
  };

  const fetchAllocations = async () => {
    setLoadingAllocations(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/allocations", getAxiosConfig());
      setAllocations(res.data.data || []);
    } catch (err) {
      console.error("Failed to load allocations", err);
    } finally {
      setLoadingAllocations(false);
    }
  };

  // ==========================================
  // 2. LIVE FACULTY SEARCH (DEBOUNCED)
  // ==========================================
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!facultySearch.trim()) {
        setFacultyOptions([]);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:5000/api/admin/search-faculty?q=${facultySearch}`, 
          getAxiosConfig()
        );
        setFacultyOptions(res.data.data || []);
      } catch (err) {
        setFacultyOptions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [facultySearch]);

  // ==========================================
  // 3. CASCADING DROPDOWNS LOGIC
  // ==========================================
  useEffect(() => {
    if (form.course_id) {
      axios.get(`http://localhost:5000/api/admin/courses/${form.course_id}/sections`, getAxiosConfig())
        .then(res => setSections(res.data.data || []))
        .catch(() => setSections([]));

      axios.get(`http://localhost:5000/api/admin/courses/${form.course_id}/semesters`, getAxiosConfig())
        .then(res => setSemesters(res.data.data || []))
        .catch(() => setSemesters([]));
    } else {
      setSections([]);
      setSemesters([]);
    }
    setForm(prev => ({ ...prev, section_id: "", semester_id: "", subject_id: "" }));
    setSubjects([]);
  }, [form.course_id]);

  useEffect(() => {
    if (form.course_id && form.semester_id) {
      axios.get(
        `http://localhost:5000/api/admin/courses/${form.course_id}/semesters/${form.semester_id}/subjects`, 
        getAxiosConfig()
      )
        .then(res => setSubjects(res.data.data || []))
        .catch(() => setSubjects([]));
    } else {
      setSubjects([]);
    }
    setForm(prev => ({ ...prev, subject_id: "" }));
  }, [form.semester_id, form.course_id]);

  // ==========================================
  // 4. FORM SUBMISSION
  // ==========================================
  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.user_id || !form.course_id || !form.semester_id || !form.subject_id || !form.session_type || !form.rate_per_hour) {
      setFormError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form, section_id: form.section_id || null };
      await axios.post("http://localhost:5000/api/admin/allocations", payload, getAxiosConfig());
      
      alert("Subject allocated successfully!");
      setForm(emptyForm);
      setFacultySearch("");
      fetchAllocations();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to assign subject.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (allocationId) => {
    if (!window.confirm("Are you sure you want to remove this allocation?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/allocations/${allocationId}`, getAxiosConfig());
      fetchAllocations();
    } catch (err) {
      alert("Failed to delete allocation.");
    }
  };

  // ==========================================
  // 5. TABLE FILTERING
  // ==========================================
  const filteredAllocations = useMemo(() => {
    if (!search.trim()) return allocations;
    const q = search.toLowerCase();
    return allocations.filter((a) =>
      a.User?.full_name?.toLowerCase().includes(q) ||
      a.Subject?.subject_name?.toLowerCase().includes(q) ||
      a.Subject?.subject_code?.toLowerCase().includes(q)
    );
  }, [allocations, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAllocations.length / PAGE_SIZE));
  const paginated = filteredAllocations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search]);

  return (
    <main className="p-4 sm:p-6 w-full">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Subject Allocation</h1>
          <p className="text-sm text-slate-400">Assign courses and subjects to faculty members</p>
        </div>
      </div>

      <div className="grid xl:grid-cols-[400px_1fr] gap-6 items-start">
        
        {/* ASSIGNMENT FORM */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ClipboardCheck size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Assign New Subject</h2>
          </div>

          <div className="space-y-4">
            
            {/* Faculty Smart Dropdown */}
            <div ref={dropdownRef}>
              <Field label="Select Faculty (Name or ID)">
                <div className="relative">
                  <input
                    type="text"
                    value={facultySearch}
                    onChange={(e) => {
                      setFacultySearch(e.target.value);
                      setShowFacultyDropdown(true);
                      setForm((prev) => ({ ...prev, user_id: "" })); 
                    }}
                    onFocus={() => setShowFacultyDropdown(true)}
                    placeholder="Select..."
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                  {showFacultyDropdown && facultyOptions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {facultyOptions.map((f) => (
                        <li
                          key={f.user_id}
                          onClick={() => {
                            setForm((prev) => ({ ...prev, user_id: f.user_id }));
                            setFacultySearch(`${f.full_name} (${f.email})`);
                            setShowFacultyDropdown(false);
                          }}
                          className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                        >
                          {f.full_name} ({f.email})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Field>
            </div>

            {/* Form Fields matching the old layout order */}
            <Field label="Course Name">
              <select
                value={form.course_id}
                onChange={handleChange("course_id")}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Semester">
                <select
                  value={form.semester_id}
                  onChange={handleChange("semester_id")}
                  disabled={!form.course_id || semesters.length === 0}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-400 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Sem</option>
                  {semesters.map((s) => (
                    <option key={s.semester_id} value={s.semester_id}>Semester {s.semester_number}</option>
                  ))}
                </select>
              </Field>

              <Field label="Academic Session">
                <input
                  value={form.academic_year}
                  onChange={handleChange("academic_year")}
                  placeholder="2024-25"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </Field>
            </div>

            <Field label="Subject Code">
              <select
                value={form.subject_id}
                onChange={handleChange("subject_id")}
                disabled={!form.semester_id || subjects.length === 0}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white disabled:bg-slate-50 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Code</option>
                {subjects.map((sub) => (
                  <option key={`code-${sub.subject_id}`} value={sub.subject_id}>{sub.subject_code}</option>
                ))}
              </select>
            </Field>

            <Field label="Subject Name">
              <select
                value={form.subject_id}
                onChange={handleChange("subject_id")}
                disabled={!form.semester_id || subjects.length === 0}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white disabled:bg-slate-50 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((sub) => (
                  <option key={`name-${sub.subject_id}`} value={sub.subject_id}>{sub.subject_name}</option>
                ))}
              </select>
            </Field>

            <Field label="Type">
              <select
                value={form.session_type}
                onChange={handleChange("session_type")}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select...</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <Field label="Per Hour Rate (₹)">
              <select
                value={form.rate_per_hour}
                onChange={handleChange("rate_per_hour")}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Rate...</option>
                {RATES.map((r) => (
                  <option key={r} value={r}>₹ {r}</option>
                ))}
              </select>
            </Field>

            {formError && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0b57d0] text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              <Save size={16} />
              {submitting ? "Assigning..." : "Assign Subject"}
            </button>
          </div>
        </form>

        {/* ALLOCATIONS HISTORY TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-blue-600" />
              <h2 className="font-semibold text-slate-800">
                Current Allocations ({filteredAllocations.length})
              </h2>
            </div>
            <input
              type="text"
              placeholder="Search allocations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 w-48"
            />
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-400 border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3">Faculty</th>
                  <th className="px-5 py-3">Course Details</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Details</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingAllocations && (
                  <tr>
                    <td colSpan={5} className="py-10">
                      <LoadingSpinner label="Loading allocations..." />
                    </td>
                  </tr>
                )}

                {!loadingAllocations && paginated.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      No subject allocations match your search.
                    </td>
                  </tr>
                )}

                {!loadingAllocations &&
                  paginated.map((a) => (
                    <tr key={a.allocation_id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-0">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{a.User?.full_name}</p>
                        <p className="text-xs text-slate-400">{a.User?.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-700">{a.Course?.course_name}</p>
                        <p className="text-xs text-slate-400">
                          Sem {a.Semester?.semester_number} {a.Section ? `• Sec ${a.Section.section_name}` : ''}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-xs text-slate-400">{a.Subject?.subject_code}</p>
                        <p className="font-medium text-slate-700">{a.Subject?.subject_name}</p>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${
                              a.session_type?.toLowerCase() === "practical"
                                ? "bg-purple-50 text-purple-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {a.session_type?.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">₹{a.rate_per_hour}/hr</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button 
                          onClick={() => handleDelete(a.allocation_id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                          title="Revoke Allocation"
                        >
                          <Trash2 size={16} />
                        </button>
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
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium ${
                  p === page ? "bg-[#0b57d0] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

// Reverted Field component back to original style
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}