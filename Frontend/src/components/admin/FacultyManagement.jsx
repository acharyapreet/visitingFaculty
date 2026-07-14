import { useMemo, useState } from "react";
import { registeredFaculty } from "../../data/mockData";
import StatusBadge from "../../components/admin/StatusBadge";
import {
  IconSearch,
  IconDownload,
  IconPlus,
  IconFilter,
  IconDots,
  IconChevronLeft,
  IconChevronRight,
} from "../../components/admin/icons";

const DEPARTMENTS = ["Computer Science", "Electronics", "Mathematics", "Physics", "Chemistry"];
const STATUSES = ["Active", "Inactive"];
const PAGE_SIZE = 5;

export default function FacultyManagement() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);

  const filtered = useMemo(() => {
    return registeredFaculty.filter((f) => {
      const matchesQuery =
        !query ||
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.uvfin.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = !status || f.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    const header = "UVFIN,Faculty Name,Qualification,Status,Allocate Subject\n";
    const rows = filtered
      .map((f) => [f.uvfin, f.name, f.qualification, f.status, f.allocateSubject].join(","))
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "faculty-management.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Faculty Management</h1>
          <p className="text-sm text-slate-500">All registered visiting faculty members</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <IconDownload /> Export
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <IconPlus /> Register New
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or UVFIN..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400"
        >
          <option value="">Select Department</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400"
        >
          <option value="">Select Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <IconFilter /> Filter
        </button>
      </div>

      <div className="overflow-visible rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-medium tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">UVFIN</th>
              <th className="px-6 py-3 font-medium">FACULTY NAME</th>
              <th className="px-6 py-3 font-medium">QUALIFICATION</th>
              <th className="px-6 py-3 font-medium">STATUS</th>
              <th className="px-6 py-3 font-medium">ALLOCATE SUBJECT</th>
              <th className="px-6 py-3 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((f) => (
              <tr key={f.uvfin} className="border-t border-slate-100">
                <td className="px-6 py-4 text-sm text-slate-600">{f.uvfin}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {f.name.replace(/^(Prof\.|Dr\.|Mr\.)\s*/, "").charAt(0)}
                    </div>
                    <p className="text-sm font-medium text-slate-900">{f.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{f.qualification}</td>
                <td className="px-6 py-4">
                  <StatusBadge label={f.status} />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge label={f.allocateSubject} />
                </td>
                <td className="relative px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === f.uvfin ? null : f.uvfin)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="More actions"
                  >
                    <IconDots />
                  </button>
                  {openMenuId === f.uvfin ? (
                    <div className="absolute right-6 top-12 z-10 w-40 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg">
                      <button
                        type="button"
                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setOpenMenuId(null)}
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setOpenMenuId(null)}
                      >
                        Edit Details
                      </button>
                      <button
                        type="button"
                        className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                        onClick={() => setOpenMenuId(null)}
                      >
                        Deactivate
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                  No faculty match your search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-sm text-slate-500">
            Showing {pageRows.length} of {filtered.length} records
          </p>
          <div className="flex items-center gap-2">
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
    </div>
  );
}