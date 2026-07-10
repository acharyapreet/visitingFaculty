import { Download, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "./shared/PageHeader";
import { billData, currentFaculty } from "./data/FacultyData";

export default function ViewBill() {
  return (
    <div>
      <PageHeader
        title="View Bill"
        subtitle="Official DAVV remuneration bill"
        right={
          <>
            <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" /> PREVIEW MODE
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              Dec {currentFaculty.session.split("-")[0]}
            </span>
          </>
        }
      />

      <div className="px-4 py-6 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Bill Preview</h2>
            <p className="mt-0.5 text-sm text-slate-500">Review the generated document before finalizing.</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            <ChevronDown className="h-4 w-4" /> Filter
          </button>
        </div>

        {/* Bill document */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <div className="mx-auto max-w-3xl border border-slate-200 p-5 sm:p-10">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">देवी अहिल्या विश्वविद्यालय, इंदौर</p>
              <p className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                DEVI AHILYA VISHWAVIDYALAYA, INDORE
              </p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Established by M.P. Govt. Act No. 22/1964 · NAAC Grade A+ · Category I University
              </p>
            </div>

            <div className="mt-5 flex justify-center">
              <span className="border border-slate-400 px-4 py-1.5 text-sm font-bold tracking-wide text-slate-900">
                VISITING FACULTY REMUNERATION BILL
              </span>
            </div>

            <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-300 pt-4 text-xs sm:flex-row sm:text-sm">
              <p>
                <span className="font-semibold">Bill No.:</span> {billData.billNo}
              </p>
              <p>
                <span className="font-semibold">Month / Year:</span> {billData.monthYear}
              </p>
              <p>
                <span className="font-semibold">Date of Submission:</span> {billData.dateOfSubmission}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-slate-300 pt-6 text-sm sm:grid-cols-2">
              <p><span className="inline-block w-28 font-semibold text-slate-600">UVFIN :</span> {billData.uvfin}</p>
              <p><span className="inline-block w-28 font-semibold text-slate-600">Name :</span> {billData.name}</p>
              <p><span className="inline-block w-28 align-top font-semibold text-slate-600">Address :</span> {billData.address}</p>
              <p><span className="inline-block w-28 font-semibold text-slate-600">Qualification :</span> {billData.qualification}</p>
              <p><span className="inline-block w-28 font-semibold text-slate-600">Experience :</span> {billData.experience}</p>
              <p><span className="inline-block w-28 font-semibold text-slate-600">Program :</span> {billData.program}</p>
              <p><span className="inline-block w-28 font-semibold text-slate-600">Semester :</span> {billData.semester}</p>
              <p><span className="inline-block w-28 font-semibold text-slate-600">Session :</span> {billData.session}</p>
            </div>

            <div className="mt-6 overflow-x-auto border-t border-slate-300 pt-6">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border border-slate-300 bg-slate-50">
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Sr.</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Date</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Code</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Subject Name</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold">T/P</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Hrs</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Rate (₹)</th>
                    <th className="border border-slate-300 px-3 py-2 text-left font-semibold">Amt (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {billData.rows.map((r) => (
                    <tr key={r.sr}>
                      <td className="border border-slate-300 px-3 py-2">{r.sr}</td>
                      <td className="border border-slate-300 px-3 py-2">{r.date}</td>
                      <td className="border border-slate-300 px-3 py-2">{r.code}</td>
                      <td className="border border-slate-300 px-3 py-2">{r.subject}</td>
                      <td className="border border-slate-300 px-3 py-2">{r.tp}</td>
                      <td className="border border-slate-300 px-3 py-2">{r.hrs}</td>
                      <td className="border border-slate-300 px-3 py-2">{r.rate}</td>
                      <td className="border border-slate-300 px-3 py-2">{r.amount}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-brand-50">
                    <td colSpan={7} className="border border-slate-300 px-3 py-2 text-right font-semibold">
                      TOTAL AMOUNT (₹)
                    </td>
                    <td className="border border-slate-300 px-3 py-2 font-bold text-brand-700">
                      {billData.totalAmount}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="mt-6 text-sm font-semibold text-slate-800">
              Amount in words: {billData.amountInWords}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 border border-dashed border-slate-300 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Bank Name</p>
                <p className="font-semibold text-slate-800">{billData.bank.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">A/C Number</p>
                <p className="font-semibold text-slate-800">{billData.bank.account}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">IFSC Code</p>
                <p className="font-semibold text-slate-800">{billData.bank.ifsc}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">PAN Number</p>
                <p className="font-semibold text-slate-800">{billData.bank.pan}</p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 sm:grid-cols-3">
              <p className="border-t border-slate-400 pt-2">Sign of Faculty</p>
              <p className="border-t border-slate-400 pt-2">Head of Dept.</p>
              <p className="border-t border-slate-400 pt-2">Finance Officer</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <button className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-semibold text-white">
              1
            </span>
            <button className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
