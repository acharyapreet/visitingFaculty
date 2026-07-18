import React, { useEffect, useState } from "react";
import { X, Mail, Phone, BadgeCheck, MapPin } from "lucide-react";
import adminApi from "../../api/adminApi";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Modal that fetches and displays complete faculty information via getFacultyById().
 * Props:
 *  userId: id of faculty to display
 *  onClose: close handler
 */
export default function FacultyModal({ userId, onClose }) {
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!userId) return;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await adminApi.getFacultyById(userId);
        if (active) setFaculty(data?.faculty ?? data);
      } catch (err) {
        if (active) setError(err?.response?.data?.message || "Failed to load faculty profile.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Faculty Profile</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {loading && <LoadingSpinner label="Loading profile..." />}

          {!loading && error && (
            <p className="text-sm text-red-500 text-center py-8">{error}</p>
          )}

          {!loading && !error && faculty && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-semibold">
                  {faculty.name?.charAt(0) ?? "F"}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800">{faculty.name}</p>
                  <p className="text-sm text-slate-400">{faculty.uvfin || faculty.uvfinId || "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="Qualification" value={faculty.qualification} />
                <InfoRow label="Department" value={faculty.department} />
                <InfoRow label="Status" value={faculty.status} />
                <InfoRow label="Registration Date" value={faculty.regDate || faculty.createdAt} />
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                {faculty.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail size={15} className="text-slate-400" /> {faculty.email}
                  </div>
                )}
                {faculty.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={15} className="text-slate-400" /> {faculty.phone}
                  </div>
                )}
                {faculty.address && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={15} className="text-slate-400" /> {faculty.address}
                  </div>
                )}
                {faculty.uvfin && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BadgeCheck size={15} className="text-slate-400" /> UVFIN: {faculty.uvfin}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}
