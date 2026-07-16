import { IconShieldCheck, IconX, IconUser, IconGraduationCap } from "./icons";

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default function FacultyInfoModal({ faculty, onClose, onApprove, onReject, onEditSection }) {
  if (!faculty) return null;
  const { personal, academic } = faculty;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <IconShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Approve Faculty Registration</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <IconX />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-5 grid grid-cols-2 gap-y-3 rounded-xl bg-slate-50 px-4 py-4">
            <div className="col-span-2">
              <p className="text-[11px] font-medium tracking-wide text-slate-400">FACULTY MEMBER</p>
              <p className="text-base font-semibold text-slate-900">{faculty.name}</p>
            </div>
            <InfoRow label="QUALIFICATION" value={faculty.qualification} />
            <InfoRow label="DEPARTMENT" value={faculty.department} />
            <InfoRow label="REG. DATE" value={faculty.regDate} />
            <div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">STATUS</p>
              <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                {faculty.status}
              </span>
            </div>
          </div>

          <section className="mb-5 rounded-xl border border-slate-100 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <IconUser className="text-slate-500" /> Personal Information
              </h3>
              <button
                type="button"
                onClick={() => onEditSection?.("personal")}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow label="Full Name" value={personal.fullName} />
              <InfoRow label="Phone Number" value={personal.phone} />
              <InfoRow label="Email Address" value={personal.email} />
              <InfoRow label="Date of Birth" value={personal.dob} />
              <div className="col-span-2">
                <InfoRow label="Residential Address" value={personal.address} />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-100 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <IconGraduationCap className="text-slate-500" /> Academic &amp; Professional
              </h3>
              <button
                type="button"
                onClick={() => onEditSection?.("academic")}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow label="Highest Qualification" value={academic.highestQualification} />
              <InfoRow label="Department" value={academic.department} />
              <InfoRow label="Teaching Experience" value={academic.experience} />
              <InfoRow label="Specialization" value={academic.specialization} />
              <div className="col-span-2">
                <InfoRow label="Previous Institution" value={academic.previousInstitution} />
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex items-center gap-3 border-t border-slate-100 bg-white px-6 py-5">
          <button
            type="button"
            onClick={() => onApprove(faculty)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <IconShieldCheck className="h-4 w-4" /> Approve Profile
          </button>
          <button
            type="button"
            onClick={() => onReject(faculty)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <IconX className="h-4 w-4" /> Reject &amp; Feedback
          </button>
        </div>
      </div>
    </div>
  );
}